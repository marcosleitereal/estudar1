import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAuthWasender } from '../../../../../../lib/auth/whatsapp-auth-wasender'

const whatsappAuth = new WhatsAppAuthWasender()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Obter informações do dispositivo
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`[WasenderAPI] Tentativa de login admin: ${email} - IP: ${clientIP}`)

    const result = await whatsappAuth.adminLogin(email, password, userAgent, clientIP)

    if (result.success && result.user && result.session_token) {
      // Criar resposta com cookie de sessão
      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.user,
        provider: 'admin'
      })

      // Definir cookie de sessão admin (menor duração)
      response.cookies.set('admin_session_token', result.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('[WasenderAPI] Erro na API login admin:', error)
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

