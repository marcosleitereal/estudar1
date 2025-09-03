'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const payment_id = searchParams.get('payment_id')
    const payment_status = searchParams.get('status')
    
    setPaymentId(payment_id)
    setStatus(payment_status)
  }, [searchParams])

  const getStatusMessage = (status: string | null) => {
    switch (status) {
      case 'rejected':
        return 'Seu pagamento foi rejeitado. Verifique os dados do cartão e tente novamente.'
      case 'cancelled':
        return 'O pagamento foi cancelado. Você pode tentar novamente quando quiser.'
      default:
        return 'Houve um problema com seu pagamento. Tente novamente ou entre em contato conosco.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Pagamento não Realizado
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {getStatusMessage(status)}
            </p>
            
            {paymentId && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">ID da Tentativa:</p>
                <p className="font-mono text-sm">{paymentId}</p>
              </div>
            )}
            
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/payment'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Precisa de ajuda? Entre em contato via WhatsApp: (55) 99177-8537
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

