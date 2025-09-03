'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/auth/whatsapp' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Usuário não logado
        router.push(redirectTo)
        return
      }

      if (requireAdmin && user.role !== 'admin') {
        // Usuário não é admin mas rota requer admin
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, requireAdmin, router, redirectTo])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não mostrar conteúdo se não estiver autenticado
  if (!user) {
    return null
  }

  // Não mostrar conteúdo se requer admin mas usuário não é admin
  if (requireAdmin && user.role !== 'admin') {
    return null
  }

  // Usuário autenticado e autorizado
  return <>{children}</>
}

