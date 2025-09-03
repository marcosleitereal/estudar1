'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Check, Clock, CreditCard, Shield, Star } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: 'monthly' | 'yearly'
  features: string[]
}

export default function PaymentPage() {
  const { user, loading } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payment/create-preference')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handlePayment = async (planId: string) => {
    if (!user) return

    setProcessingPayment(planId)

    try {
      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          userId: user.id
        })
      })

      const data = await response.json()

      if (data.success) {
        // Redirecionar para o Mercado Pago
        window.location.href = data.initPoint
      } else {
        alert('Erro ao processar pagamento: ' + data.message)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Erro interno. Tente novamente.')
    } finally {
      setProcessingPayment(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getTrialDaysRemaining = () => {
    if (!user?.trialEndDate) return 0
    
    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
              <p className="text-gray-600 mb-4">
                Você precisa estar logado para acessar os planos de assinatura.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trialDaysRemaining = getTrialDaysRemaining()
  const isTrialExpired = user.isTrialExpired || trialDaysRemaining <= 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Continue seus estudos com acesso completo à plataforma Estudar.Pro
          </p>
          
          {/* Status do Trial */}
          <div className="mt-6">
            {isTrialExpired ? (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Período de teste expirado
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {trialDaysRemaining} dia{trialDaysRemaining !== 1 ? 's' : ''} restante{trialDaysRemaining !== 1 ? 's' : ''} no período de teste
              </Badge>
            )}
          </div>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.id === 'yearly' ? 'border-blue-500 border-2' : ''}`}
            >
              {plan.id === 'yearly' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-lg">{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{plan.duration === 'monthly' ? 'mês' : 'ano'}
                  </span>
                  
                  {plan.id === 'yearly' && (
                    <div className="mt-2">
                      <Badge variant="secondary">
                        Economia de R$ 39,80
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full text-lg py-6"
                  onClick={() => handlePayment(plan.id)}
                  disabled={processingPayment === plan.id}
                  variant={plan.id === 'yearly' ? 'default' : 'outline'}
                >
                  {processingPayment === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Assinar Agora
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Garantia */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Pagamento 100% seguro via Mercado Pago
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

