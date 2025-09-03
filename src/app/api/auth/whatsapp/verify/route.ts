import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Formatar telefone
    const cleanPhone = phone.replace(/\D/g, '')
    let formattedPhone = cleanPhone
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone
    }
    formattedPhone = '+' + formattedPhone

    const supabase = createClient()

    // Buscar usuário pelo telefone e código
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('verification_code', code)
      .eq('is_verified', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Código inválido ou usuário não encontrado' },
        { status: 400 }
      )
    }

    // Verificar se código não expirou (10 minutos)
    const updatedAt = new Date(user.updated_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60)

    if (diffMinutes > 10) {
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      )
    }

    // Gerar novo token de sessão
    const sessionToken = uuidv4()

    // Atualizar usuário com novo token e último login
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        session_token: sessionToken,
        verification_code: null,
        last_login: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Verificar status do trial
    const trialEndDate = updatedUser.trial_end_date ? new Date(updatedUser.trial_end_date) : null
    const isTrialExpired = trialEndDate ? now > trialEndDate : false

    // Criar resposta com dados do usuário
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        subscription_status: updatedUser.subscription_status,
        trial_end_date: updatedUser.trial_end_date,
        is_trial_expired: isTrialExpired,
        is_premium: updatedUser.is_premium || updatedUser.subscription_status === 'active',
        stats: updatedUser.stats || {
          quizzes_completed: 0,
          flashcards_reviewed: 0,
          study_time_minutes: 0,
          last_activity: now.toISOString()
        }
      }
    })

    // Definir cookie de sessão
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Erro na verificação:', error)
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

