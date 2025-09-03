'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MessageCircle, ArrowRight, User, Mail, Phone } from 'lucide-react'

type AuthStep = 'choice' | 'register' | 'login' | 'verify'

interface FormData {
  name: string
  email: string
  phone: string
  code: string
}

export default function WhatsAppAuthPage() {
  const [step, setStep] = useState<AuthStep>('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    code: ''
  })
  const [isNewUser, setIsNewUser] = useState(false)
  const router = useRouter()

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, '')
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Código enviado para seu WhatsApp!')
        setStep('verify')
      } else {
        setError(data.error || 'Erro ao enviar código')
      }
    } catch (error) {
      setError('Erro ao processar cadastro')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/whatsapp/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone.replace(/\D/g, '')
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Código enviado para seu WhatsApp!')
        setStep('verify')
      } else {
        setError(data.error || 'Erro ao enviar código')
      }
    } catch (error) {
      setError('Erro ao processar login')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isNewUser ? '/api/auth/verify-registration' : '/api/auth/whatsapp/verify'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: formData.phone.replace(/\D/g, ''),
          code: formData.code
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Login realizado com sucesso!')
        // Redirecionar após sucesso
        setTimeout(() => {
          if (data.user?.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }, 1000)
      } else {
        setError(data.error || 'Código inválido')
      }
    } catch (error) {
      setError('Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  const renderChoice = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-600" />
          Estudar.Pro
        </CardTitle>
        <CardDescription>
          Acesse sua conta ou crie uma nova usando WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => {
            setIsNewUser(true)
            setStep('register')
          }}
          className="w-full"
          size="lg"
        >
          <User className="h-4 w-4 mr-2" />
          Criar Nova Conta
        </Button>
        
        <Button 
          onClick={() => {
            setIsNewUser(false)
            setStep('login')
          }}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Já Tenho Conta
        </Button>
      </CardContent>
    </Card>
  )

  const renderRegister = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Nova Conta</CardTitle>
        <CardDescription>
          Preencha seus dados para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta e Enviar Código
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => setStep('choice')}
          >
            Voltar
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderLogin = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar na Conta</CardTitle>
        <CardDescription>
          Digite seu WhatsApp para receber o código de acesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Código WhatsApp
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => setStep('choice')}
          >
            Voltar
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderVerify = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verificar Código</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos enviado para seu WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar e Entrar
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => setStep(isNewUser ? 'register' : 'login')}
          >
            Voltar
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {step === 'choice' && renderChoice()}
        {step === 'register' && renderRegister()}
        {step === 'login' && renderLogin()}
        {step === 'verify' && renderVerify()}
      </div>
    </div>
  )
}

