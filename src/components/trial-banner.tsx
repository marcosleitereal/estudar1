'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Clock, CreditCard, X } from 'lucide-react'

export function TrialBanner() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    if (!user) return

    // Verificar se usuário está em trial
    if (user.subscription_status === 'trial' || !user.subscription_status) {
      const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null
      
      if (trialEndDate) {
        const now = new Date()
        const diffTime = trialEndDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        setDaysRemaining(Math.max(0, diffDays))
        setIsVisible(diffDays >= 0) // Mostrar se ainda há dias ou se acabou de expirar
      }
    }
  }, [user])

  if (!isVisible || !user) return null

  const isExpired = daysRemaining <= 0
  const isLastDay = daysRemaining === 1
  const isAlmostExpired = daysRemaining <= 2

  return (
    <Alert className={`mb-4 ${isExpired ? 'border-red-500 bg-red-50' : isAlmostExpired ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isExpired ? (
            <CreditCard className="h-5 w-5 text-red-600" />
          ) : (
            <Clock className="h-5 w-5 text-blue-600" />
          )}
          
          <AlertDescription className="flex-1">
            {isExpired ? (
              <span className="text-red-800">
                <strong>Período de teste expirado!</strong> Assine agora para continuar usando a plataforma.
              </span>
            ) : isLastDay ? (
              <span className="text-yellow-800">
                <strong>Último dia de teste!</strong> Seu período de teste expira hoje. Assine para continuar.
              </span>
            ) : (
              <span className="text-blue-800">
                <strong>Período de teste:</strong> {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}.
              </span>
            )}
          </AlertDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isExpired ? "default" : "outline"}
            onClick={() => window.location.href = '/payment'}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isExpired ? 'Assinar Agora' : 'Ver Planos'}
          </Button>
          
          {!isExpired && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

