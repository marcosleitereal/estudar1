import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Buscar usuário pelo telefone e código
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('verification_code', code)
      .eq('is_verified', false)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se código não expirou (10 minutos)
    const createdAt = new Date(user.created_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

    if (diffMinutes > 10) {
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo cadastro.' },
        { status: 400 }
      )
    }

    // Marcar usuário como verificado
    const { data: verifiedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_code: null,
        updated_at: now.toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao verificar usuário:', updateError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Criar resposta com cookie de sessão
    const response = NextResponse.json({
      success: true,
      message: 'Cadastro concluído com sucesso!',
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        phone: verifiedUser.phone,
        subscription_status: verifiedUser.subscription_status,
        trial_end_date: verifiedUser.trial_end_date,
        is_premium: verifiedUser.is_premium
      }
    })

    // Definir cookie de sessão
    response.cookies.set('session_token', user.session_token, {
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

