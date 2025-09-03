import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAuthWasender } from '../../../../../lib/auth/whatsapp-auth-wasender'

const whatsappAuth = new WhatsAppAuthWasender()

export async function GET(request: NextRequest) {
  try {
    // Obter tokens dos cookies
    const sessionToken = request.cookies.get('session_token')?.value
    const adminSessionToken = request.cookies.get('admin_session_token')?.value

    // Verificar sessão de usuário WhatsApp
    if (sessionToken) {
      const validation = await whatsappAuth.validateSession(sessionToken)
      
      if (validation.valid && validation.user) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: validation.user.id,
            name: validation.user.name,
            phone: validation.user.phone,
            role: validation.user.role,
            created_at: validation.user.created_at,
            last_login: validation.user.last_login
          },
          provider: 'wasender'
        })
      }
    }

    // Verificar sessão admin
    if (adminSessionToken) {
      const validation = await whatsappAuth.validateAdminSession(adminSessionToken)
      
      if (validation.valid && validation.user) {
        return NextResponse.json({
          authenticated: true,
          user: validation.user,
          provider: 'admin'
        })
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

