import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAuthWasender } from '../../../../../../lib/auth/whatsapp-auth-wasender'

const whatsappAuth = new WhatsAppAuthWasender()

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

    // Limitar tentativas por IP (anti-spam)
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`[WasenderAPI] Iniciando login WhatsApp para ${name} (${phone}) - IP: ${clientIP}`)

    const result = await whatsappAuth.initiateLogin(name.trim(), phone.replace(/\D/g, ''))

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        verification_id: result.verification_id,
        provider: 'wasender'
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }

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

