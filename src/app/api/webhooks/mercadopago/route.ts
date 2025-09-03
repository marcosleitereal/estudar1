import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const payment = new Payment(client)

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in webhook API. Using fallback values.')
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
    const body = await request.json()
    
    console.log('[MercadoPago Webhook] Received notification:', JSON.stringify(body, null, 2))

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ success: true, message: 'Notification type not handled' })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ success: false, message: 'Payment ID not found' })
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar detalhes do pagamento no Mercado Pago
    const paymentDetails = await payment.get({ id: paymentId })
    
    console.log('[MercadoPago Webhook] Payment details:', JSON.stringify(paymentDetails, null, 2))

    if (!paymentDetails.external_reference) {
      console.error('[MercadoPago Webhook] External reference not found')
      return NextResponse.json({ success: false, message: 'External reference not found' })
    }

    // Extrair informações da referência externa
    const [userId, planId] = paymentDetails.external_reference.split('_')

    // Buscar transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (transactionError || !transaction) {
      console.error('[MercadoPago Webhook] Transaction not found:', transactionError)
      return NextResponse.json({ success: false, message: 'Transaction not found' })
    }

    // Atualizar status da transação baseado no status do pagamento
    let newStatus = 'pending'
    let subscriptionStatus = 'trial'
    let subscriptionEndDate = null

    switch (paymentDetails.status) {
      case 'approved':
        newStatus = 'completed'
        subscriptionStatus = 'active'
        
        // Calcular data de vencimento baseada no plano
        const now = new Date()
        if (planId === 'monthly') {
          subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        } else if (planId === 'yearly') {
          subscriptionEndDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 dias
        }
        break
      
      case 'rejected':
      case 'cancelled':
        newStatus = 'failed'
        break
      
      case 'in_process':
      case 'pending':
        newStatus = 'pending'
        break
      
      default:
        newStatus = 'pending'
    }

    // Atualizar transação
    const { error: updateTransactionError } = await supabase
      .from('transactions')
      .update({
        status: newStatus,
        payment_id: paymentId.toString(),
        payment_status: paymentDetails.status,
        payment_method_details: {
          payment_method_id: paymentDetails.payment_method_id,
          payment_type_id: paymentDetails.payment_type_id,
          issuer_id: paymentDetails.issuer_id
        },
        processed_at: new Date().toISOString()
      })
      .eq('id', transaction.id)

    if (updateTransactionError) {
      console.error('[MercadoPago Webhook] Error updating transaction:', updateTransactionError)
    }

    // Se pagamento aprovado, atualizar usuário
    if (newStatus === 'completed' && subscriptionEndDate) {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          subscription_status: subscriptionStatus,
          subscription_plan: planId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          is_trial_expired: false
        })
        .eq('id', userId)

      if (updateUserError) {
        console.error('[MercadoPago Webhook] Error updating user:', updateUserError)
      } else {
        console.log(`[MercadoPago Webhook] User ${userId} subscription activated with plan ${planId}`)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })

  } catch (error) {
    console.error('[MercadoPago Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { success: false, message: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'MercadoPago webhook endpoint is active' 
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

