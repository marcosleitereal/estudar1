import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in WhatsApp verify API. Using fallback values.')
    return {
      url: 'https://placeholder.supabase.co',
      serviceKey: 'placeholder-service-key'
    }
  }

  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verification_id, code } = await request.json()

    // Validações básicas
    if (!verification_id || !code) {
      return NextResponse.json(
        { success: false, message: 'ID de verificação e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Código deve ter 6 dígitos' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`[WasenderAPI] Verificando código WhatsApp - ID: ${verification_id}, Code: ${code}`)

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar sessão de verificação válida
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('verification_code', code)
      .gt('expires_at', new Date().toISOString())
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    // Marcar sessão como verificada
    await supabase
      .from('whatsapp_sessions')
      .update({ is_verified: true })
      .eq('id', session.id)

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar status do trial
    const now = new Date()
    const trialEnd = new Date(user.trial_end_date)
    const isTrialExpired = now > trialEnd && user.subscription_status === 'trial'

    if (isTrialExpired) {
      await supabase
        .from('users')
        .update({ 
          subscription_status: 'expired',
          is_trial_expired: true 
        })
        .eq('id', user.id)
      
      user.subscription_status = 'expired'
      user.is_trial_expired = true
    }

    // Criar token de sessão
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscription_status,
      trialEndDate: user.trial_end_date,
      timestamp: Date.now()
    })).toString('base64')

    // Criar resposta com cookie de sessão
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        trialEndDate: user.trial_end_date,
        isTrialExpired: user.is_trial_expired,
        created_at: user.created_at
      },
      provider: 'wasender'
    })

    // Definir cookie de sessão (httpOnly para segurança)
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/'
    })

    return response

  } catch (error) {
    console.error('[WasenderAPI] Erro na API verify WhatsApp:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

