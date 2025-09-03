import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    // Validar dados
    if (!name || name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres'
      }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido'
      }, { status: 400 })
    }

    // Obter token da sessão
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Não autenticado'
      }, { status: 401 })
    }

    const supabase = createClient()

    // Buscar usuário pela sessão
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({
        success: false,
        error: 'Sessão inválida'
      }, { status: 401 })
    }

    // Verificar se email já existe (se mudou)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .neq('id', sessionData.user_id)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Este email já está em uso'
      }, { status: 400 })
    }

    // Atualizar usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionData.user_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar perfil'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Erro na atualização do perfil:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

