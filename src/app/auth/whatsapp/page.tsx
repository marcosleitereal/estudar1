'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WhatsAppLogin } from '@/components/auth/whatsapp-login'
import { AdminLogin } from '@/components/auth/admin-login'
import { Button } from '@/components/ui/button'
import { Shield, MessageCircle } from 'lucide-react'

export default function WhatsAppAuthPage() {
  const [mode, setMode] = useState<'whatsapp' | 'admin'>('whatsapp')
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Verificar se já está logado
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (data.authenticated) {
        // Já está logado, redirecionar
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.log('Não logado, continuando...')
    }
  }

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    
    // Redirecionar baseado no tipo de usuário
    setTimeout(() => {
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header com opções de login */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex space-x-2">
          <Button
            variant={mode === 'whatsapp' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('whatsapp')}
            className={mode === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant={mode === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('admin')}
            className={mode === 'admin' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </div>

      {/* Logo/Título da aplicação */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-2xl font-bold text-gray-800">Estudar.Pro</h1>
        <p className="text-sm text-gray-600">Plataforma de Estudos Jurídicos</p>
      </div>

      {/* Componente de login baseado no modo selecionado */}
      {mode === 'whatsapp' ? (
        <WhatsAppLogin onSuccess={handleLoginSuccess} />
      ) : (
        <AdminLogin 
          onSuccess={handleLoginSuccess}
          onBackToWhatsApp={() => setMode('whatsapp')}
        />
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-gray-500">
          © 2025 Estudar.Pro - Todos os direitos reservados
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === 'whatsapp' 
            ? 'Login seguro via WhatsApp - Sem necessidade de senha'
            : 'Área administrativa - Acesso restrito'
          }
        </p>
      </div>
    </div>
  )
}

