import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in auth me API. Using fallback values.')
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

export async function GET(request: NextRequest) {
  try {
    // Obter tokens dos cookies
    const sessionToken = request.cookies.get('session_token')?.value
    const adminSessionToken = request.cookies.get('admin_session_token')?.value

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        authenticated: false,
        user: null,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Verificar sessão de usuário WhatsApp
    if (sessionToken) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
        
        // Verificar se o token não expirou (30 dias)
        const tokenAge = Date.now() - decoded.timestamp
        const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 dias em ms
        
        if (tokenAge > maxAge) {
          return NextResponse.json({
            authenticated: false,
            user: null,
            message: 'Session expired'
          })
        }

        // Buscar usuário atualizado no banco
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', decoded.userId)
          .single()

        if (userError || !user) {
          return NextResponse.json({
            authenticated: false,
            user: null,
            message: 'User not found'
          })
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

        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            subscriptionStatus: user.subscription_status,
            trialEndDate: user.trial_end_date,
            isTrialExpired: user.is_trial_expired,
            created_at: user.created_at,
            last_login: user.last_login
          },
          provider: 'wasender'
        })

      } catch (error) {
        console.error('Error decoding session token:', error)
        return NextResponse.json({
          authenticated: false,
          user: null,
          message: 'Invalid session token'
        })
      }
    }

    // Verificar sessão admin (implementação simplificada)
    if (adminSessionToken) {
      try {
        const decoded = JSON.parse(Buffer.from(adminSessionToken, 'base64').toString())
        
        // Verificar se o token não expirou
        const tokenAge = Date.now() - decoded.timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 horas em ms
        
        if (tokenAge > maxAge) {
          return NextResponse.json({
            authenticated: false,
            user: null,
            message: 'Admin session expired'
          })
        }

        return NextResponse.json({
          authenticated: true,
          user: {
            id: decoded.userId,
            name: decoded.name,
            role: 'admin'
          },
          provider: 'admin'
        })

      } catch (error) {
        console.error('Error decoding admin session token:', error)
      }
    }

    // Nenhuma sessão válida encontrada
    return NextResponse.json({
      authenticated: false,
      user: null
    })

  } catch (error) {
    console.error('[WasenderAPI] Erro na API me:', error)
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

