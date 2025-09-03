import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { WasenderAPI } from '@/lib/auth/wasender-api'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    // Validar dados obrigatórios
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do telefone (deve começar com +55)
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.startsWith('55') || cleanPhone.length < 12) {
      return NextResponse.json(
        { error: 'Telefone deve estar no formato +55XXXXXXXXXXX' },
        { status: 400 }
      )
    }

    const formattedPhone = `+${cleanPhone}`

    const supabase = createClient()

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone, email')
      .or(`phone.eq.${formattedPhone},email.eq.${email}`)
      .single()

    if (existingUser) {
      if (existingUser.phone === formattedPhone) {
        return NextResponse.json(
          { error: 'WhatsApp já cadastrado' },
          { status: 409 }
        )
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        )
      }
    }

    // Gerar dados do usuário
    const userId = uuidv4()
    const sessionToken = uuidv4()
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Calcular data de fim do trial (3 dias)
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 3)

    // Criar usuário no banco
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        phone: formattedPhone,
        role: 'student',
        is_premium: false,
        subscription_status: 'trial',
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        is_trial_expired: false,
        session_token: sessionToken,
        verification_code: verificationCode,
        is_verified: false,
        stats: {
          quizzes_completed: 0,
          flashcards_reviewed: 0,
          study_time_minutes: 0,
          last_activity: trialStartDate.toISOString()
        },
        created_at: trialStartDate.toISOString(),
        updated_at: trialStartDate.toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Enviar código de verificação via WhatsApp
    try {
      const wasender = new WasenderAPI()
      const message = `🎓 *Estudar.Pro - Código de Verificação*\n\nOlá ${name}!\n\nSeu código de verificação é: *${verificationCode}*\n\nEste código expira em 10 minutos.\n\n✅ Use este código para completar seu cadastro.`
      
      await wasender.sendMessage(formattedPhone, message)
    } catch (smsError) {
      console.error('Erro ao enviar WhatsApp:', smsError)
      // Não falhar o cadastro se o WhatsApp falhar
    }

    return NextResponse.json({
      success: true,
      message: 'Cadastro iniciado! Código de verificação enviado via WhatsApp.',
      data: {
        userId: newUser.id,
        phone: formattedPhone,
        name: newUser.name,
        email: newUser.email,
        trialEndDate: newUser.trial_end_date
      }
    })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

