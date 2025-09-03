'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RegisterFormProps {
  onSuccess: (data: any) => void
  onHaveAccount: () => void
}

export function RegisterForm({ onSuccess, onHaveAccount }: RegisterFormProps) {
  const { register, loading, error } = useAuthContext()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validações
    if (!formData.name.trim()) {
      setFormError('Nome é obrigatório')
      return
    }
    if (!formData.email.trim()) {
      setFormError('Email é obrigatório')
      return
    }
    if (!formData.phone.trim()) {
      setFormError('WhatsApp é obrigatório')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError('Email inválido')
      return
    }

    // Validar telefone brasileiro
    const phoneRegex = /^(\+55|55)?[\s-]?(\(?[1-9]{2}\)?[\s-]?)?[9]?[0-9]{4}[\s-]?[0-9]{4}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setFormError('WhatsApp deve estar no formato (XX) 9XXXX-XXXX')
      return
    }

    const result = await register(formData.name, formData.email, formData.phone)
    
    if (result.success) {
      onSuccess(result.data)
    } else {
      setFormError(result.error)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    
    // Limitar a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11)
    }
    
    // Formatação automática
    if (value.length >= 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (value.length >= 7) {
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2')
    }
    
    setFormData(prev => ({ ...prev, phone: value }))
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Criar Conta</h1>
        <p className="text-gray-600 mt-2">
          Preencha seus dados para começar seus estudos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome Completo
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            WhatsApp
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handlePhoneChange}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Usaremos este número para enviar seu código de verificação
          </p>
        </div>

        {(error || formError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {formError || error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button
            onClick={onHaveAccount}
            className="text-blue-600 hover:underline font-medium"
          >
            Fazer Login
          </button>
        </p>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>
          🎓 <strong>3 dias grátis</strong> para testar todas as funcionalidades
        </p>
        <p>
          Após o período de teste: R$ 19,90/mês
        </p>
      </div>
    </div>
  )
}

