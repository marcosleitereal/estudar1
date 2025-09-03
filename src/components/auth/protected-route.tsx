'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/auth-provider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePremium?: boolean
  adminOnly?: boolean
}

export function ProtectedRoute({ 
  children, 
  requirePremium = false, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Não autenticado - redirecionar para login
      if (!isAuthenticated) {
        router.push('/auth/whatsapp')
        return
      }

      // Verificar se requer admin
      if (adminOnly && user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Verificar se requer premium
      if (requirePremium && !user?.is_premium) {
        // Se trial expirado, redirecionar para pagamento
        if (user?.is_trial_expired) {
          router.push('/payment')
          return
        }
        // Se ainda em trial, permitir acesso mas mostrar banner
      }
    }
  }, [user, loading, isAuthenticated, requirePremium, adminOnly, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não mostrar conteúdo se não autenticado
  if (!isAuthenticated) {
    return null
  }

  // Não mostrar conteúdo se requer admin e usuário não é admin
  if (adminOnly && user?.role !== 'admin') {
    return null
  }

  // Mostrar conteúdo protegido
  return <>{children}</>
}

