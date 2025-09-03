import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in admin plans API. Using fallback values.')
    return {
      url: 'https://placeholder.supabase.co',
      serviceKey: 'placeholder-service-key'
    }
  }

  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey
  }
}

// Verificar se é admin (implementação simplificada)
function isAdmin(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_session_token')?.value
  return !!adminToken // Implementação básica
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar planos ativos
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar planos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plans: plans || []
    })

  } catch (error) {
    console.error('[Admin Plans API] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { name, description, price, duration, features } = await request.json()

    // Validações
    if (!name || !description || !price || !duration) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: name, description, price, duration' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Preço deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(duration)) {
      return NextResponse.json(
        { success: false, message: 'Duration deve ser monthly ou yearly' },
        { status: 400 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Criar novo plano
    const { data: newPlan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        description,
        price: parseFloat(price),
        duration,
        features: features || [],
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating plan:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao criar plano' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: newPlan,
      message: 'Plano criado com sucesso'
    })

  } catch (error) {
    console.error('[Admin Plans API] Error creating plan:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id, name, description, price, duration, features, is_active } = await request.json()

    // Validações
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do plano é obrigatório' },
        { status: 400 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Preparar dados para atualização
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (duration !== undefined) updateData.duration = duration
    if (features !== undefined) updateData.features = features
    if (is_active !== undefined) updateData.is_active = is_active

    // Atualizar plano
    const { data: updatedPlan, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plan:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar plano' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: 'Plano atualizado com sucesso'
    })

  } catch (error) {
    console.error('[Admin Plans API] Error updating plan:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do plano é obrigatório' },
        { status: 400 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Desativar plano em vez de deletar (soft delete)
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deactivating plan:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao desativar plano' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Plano desativado com sucesso'
    })

  } catch (error) {
    console.error('[Admin Plans API] Error deactivating plan:', error)
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

