import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Token de sessão não encontrado' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Buscar usuário pelo token de sessão
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_verified', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      )
    }

    // Verificar status do trial
    const now = new Date()
    const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null
    const isTrialExpired = trialEndDate ? now > trialEndDate : false

    // Calcular dias restantes do trial
    const daysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        subscription_status: user.subscription_status,
        trial_end_date: user.trial_end_date,
        trial_start_date: user.trial_start_date,
        is_trial_expired: isTrialExpired,
        days_remaining: daysRemaining,
        is_premium: user.is_premium || user.subscription_status === 'active',
        role: user.role || 'student',
        stats: user.stats || {
          quizzes_completed: 0,
          flashcards_reviewed: 0,
          study_time_minutes: 0,
          last_activity: user.last_login || user.created_at
        },
        created_at: user.created_at,
        last_login: user.last_login
      }
    })

  } catch (error) {
    console.error('Erro ao validar sessão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

