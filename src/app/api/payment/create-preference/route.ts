import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPaymentPreference, defaultPlans } from '../../../../../lib/mercadopago/client'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in payment API. Using fallback values.')
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

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    // Validações básicas
    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Plan ID e User ID são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const plan = defaultPlans.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plano não encontrado' },
        { status: 404 }
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

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar preferência de pagamento
    const preferenceResult = await createPaymentPreference(
      planId,
      userId,
      user.email,
      user.name
    )

    if (!preferenceResult.success) {
      return NextResponse.json(
        { success: false, message: preferenceResult.error },
        { status: 500 }
      )
    }

    // Salvar transação pendente no banco
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount: plan.price,
        currency: 'BRL',
        status: 'pending',
        payment_method: 'mercadopago',
        external_reference: `${userId}_${planId}_${Date.now()}`,
        preference_id: preferenceResult.preferenceId,
        metadata: {
          plan_name: plan.name,
          plan_duration: plan.duration
        }
      })

    if (transactionError) {
      console.error('Error saving transaction:', transactionError)
      // Não retornar erro aqui, pois a preferência já foi criada
    }

    return NextResponse.json({
      success: true,
      preferenceId: preferenceResult.preferenceId,
      initPoint: preferenceResult.initPoint,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration
      }
    })

  } catch (error) {
    console.error('[MercadoPago] Erro na API create-preference:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Retornar planos disponíveis
  return NextResponse.json({
    success: true,
    plans: defaultPlans
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

