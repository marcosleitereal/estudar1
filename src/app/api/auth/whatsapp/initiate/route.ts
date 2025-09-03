import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { WasenderAPI } from '../../../../../../lib/auth/wasender-api'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in WhatsApp auth API. Using fallback values.')
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
    const { name, phone } = await request.json()

    // Validações básicas
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do telefone brasileiro
    const phoneRegex = /^(\+55|55)?[\s-]?(\(?[1-9]{2}\)?[\s-]?)?[9]?[0-9]{4}[\s-]?[0-9]{4}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'Formato de telefone inválido' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`[WasenderAPI] Iniciando login WhatsApp para ${name} (${cleanPhone}) - IP: ${clientIP}`)

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Gerar código de verificação
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Verificar se usuário já existe
    let { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      
      // Atualizar último login e nome se necessário
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          name: name.trim() // Atualizar nome caso tenha mudado
        })
        .eq('id', userId)
    } else {
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: `${cleanPhone}@whatsapp.temp`, // Email temporário
          name: name.trim(),
          phone: cleanPhone,
          role: 'student',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
          subscription_status: 'trial'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { success: false, message: 'Falha ao criar usuário' },
          { status: 500 }
        )
      }

      userId = newUser.id
    }

    // Criar sessão de verificação
    await supabase
      .from('whatsapp_sessions')
      .insert({
        user_id: userId,
        phone: cleanPhone,
        verification_code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
      })

    // Enviar código via WhatsApp
    const wasender = new WasenderAPI()
    const messageResult = await wasender.sendMessage(
      cleanPhone,
      `🔐 Seu código de verificação do Estudar.Pro é: *${verificationCode}*\n\nEste código expira em 10 minutos.`
    )

    if (!messageResult.success) {
      console.error('Failed to send WhatsApp message:', messageResult.error)
      return NextResponse.json(
        { success: false, message: 'Falha ao enviar código de verificação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado via WhatsApp',
      verification_id: `${userId}_${Date.now()}`,
      provider: 'wasender'
    })

  } catch (error) {
    console.error('[WasenderAPI] Erro na API initiate WhatsApp:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS
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

