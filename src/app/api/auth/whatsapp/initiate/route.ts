import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { WasenderAPI } from '@/lib/auth/wasender-api'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Número de telefone é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar e formatar telefone
    const cleanPhone = phone.replace(/\D/g, '')
    let formattedPhone = cleanPhone

    // Adicionar +55 se não tiver
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone
    }
    formattedPhone = '+' + formattedPhone

    const supabase = createClient()

    // Verificar se usuário existe e está verificado
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('is_verified', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { 
          error: 'Usuário não encontrado. Faça seu cadastro primeiro.',
          needsRegistration: true
        },
        { status: 404 }
      )
    }

    // Gerar novo código de verificação para login
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Atualizar código no banco
    await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Enviar código via WhatsApp
    try {
      const wasender = new WasenderAPI()
      const message = `🎓 *Estudar.Pro - Login*\n\nOlá ${user.name}!\n\nSeu código de acesso é: *${verificationCode}*\n\nEste código expira em 10 minutos.\n\n🔐 Use este código para fazer login.`
      
      await wasender.sendMessage(formattedPhone, message)
    } catch (smsError) {
      console.error('Erro ao enviar WhatsApp:', smsError)
      return NextResponse.json(
        { error: 'Erro ao enviar código via WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Código de acesso enviado para ${formattedPhone}`,
      data: {
        phone: formattedPhone,
        userName: user.name
      }
    })

  } catch (error) {
    console.error('Erro ao iniciar login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

