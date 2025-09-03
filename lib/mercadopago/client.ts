import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

export const preference = new Preference(client)

// Tipos para os planos
export interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: 'monthly' | 'yearly'
  features: string[]
}

// Planos padrão
export const defaultPlans: Plan[] = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    description: 'Acesso completo por 30 dias',
    price: 19.90,
    duration: 'monthly',
    features: [
      'Acesso a todo conteúdo jurídico',
      'Quiz e simulados ilimitados',
      'Flashcards personalizados',
      'Busca avançada com IA',
      'Suporte via WhatsApp'
    ]
  },
  {
    id: 'yearly',
    name: 'Plano Anual',
    description: 'Acesso completo por 12 meses',
    price: 199.90,
    duration: 'yearly',
    features: [
      'Acesso a todo conteúdo jurídico',
      'Quiz e simulados ilimitados',
      'Flashcards personalizados',
      'Busca avançada com IA',
      'Suporte via WhatsApp',
      '2 meses grátis (economia de R$ 39,80)'
    ]
  }
]

// Função para criar preferência de pagamento
export async function createPaymentPreference(
  planId: string,
  userId: string,
  userEmail: string,
  userName: string
) {
  const plan = defaultPlans.find(p => p.id === planId)
  
  if (!plan) {
    throw new Error('Plano não encontrado')
  }

  const preferenceData = {
    items: [
      {
        id: plan.id,
        title: plan.name,
        description: plan.description,
        quantity: 1,
        unit_price: plan.price,
        currency_id: 'BRL'
      }
    ],
    payer: {
      email: userEmail,
      name: userName
    },
    external_reference: `${userId}_${planId}_${Date.now()}`,
    notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending`
    },
    auto_return: 'approved',
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: plan.duration === 'yearly' ? 12 : 1
    },
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
  }

  try {
    const response = await preference.create({ body: preferenceData })
    return {
      success: true,
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    }
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error)
    return {
      success: false,
      error: 'Falha ao criar preferência de pagamento'
    }
  }
}

export { client }

