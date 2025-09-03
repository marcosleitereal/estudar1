import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAuthWasender } from '../../../../../lib/auth/whatsapp-auth-wasender'

const whatsappAuth = new WhatsAppAuthWasender()

export async function POST(request: NextRequest) {
  try {
    // Obter tokens dos cookies
    const sessionToken = request.cookies.get('session_token')?.value
    const adminSessionToken = request.cookies.get('admin_session_token')?.value

    let logoutSuccess = false

    // Logout usuário WhatsApp
    if (sessionToken) {
      logoutSuccess = await whatsappAuth.logout(sessionToken)
      console.log(`[WasenderAPI] Logout usuário: ${logoutSuccess ? 'sucesso' : 'falha'}`)
    }

    // Logout admin
    if (adminSessionToken) {
      // Para admin, apenas removemos o cookie (sessão já expira automaticamente)
      logoutSuccess = true
      console.log('[WasenderAPI] Logout admin realizado')
    }

    // Criar resposta removendo cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
      provider: 'wasender'
    })

    // Remover cookies de sessão
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('admin_session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('[WasenderAPI] Erro na API logout:', error)
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

