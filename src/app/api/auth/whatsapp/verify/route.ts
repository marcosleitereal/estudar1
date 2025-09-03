import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAuthWasender } from '../../../../../../lib/auth/whatsapp-auth-wasender'

const whatsappAuth = new WhatsAppAuthWasender()

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

    // Obter informações do dispositivo
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`[WasenderAPI] Verificando código WhatsApp - ID: ${verification_id}, Code: ${code}`)

    const result = await whatsappAuth.verifyCodeAndLogin(
      verification_id,
      code,
      userAgent,
      clientIP
    )

    if (result.success && result.user && result.session_token) {
      // Criar resposta com cookie de sessão
      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          role: result.user.role,
          created_at: result.user.created_at
        },
        provider: 'wasender'
      })

      // Definir cookie de sessão (httpOnly para segurança)
      response.cookies.set('session_token', result.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }

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

