'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/auth-provider'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Usuário logado, redirecionar baseado no role
        if (user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Usuário não logado, redirecionar para login
        router.push('/auth/whatsapp')
      }
    }
  }, [user, loading, router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Estudar.Pro</h1>
          <p className="text-lg text-gray-600">Plataforma de Estudos Jurídicos</p>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">
            {loading ? 'Verificando autenticação...' : 'Redirecionando...'}
          </p>
        </div>
      </div>
    </div>
  )
}

