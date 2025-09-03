'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const payment_id = searchParams.get('payment_id')
    const payment_status = searchParams.get('status')
    
    setPaymentId(payment_id)
    setStatus(payment_status)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Pagamento Realizado!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso. Sua assinatura já está ativa!
            </p>
            
            {paymentId && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">ID do Pagamento:</p>
                <p className="font-mono text-sm">{paymentId}</p>
              </div>
            )}
            
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/dashboard'}
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/profile'}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ver Minha Assinatura
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Você receberá um e-mail de confirmação em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

