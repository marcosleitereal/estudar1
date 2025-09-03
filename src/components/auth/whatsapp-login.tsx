'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageCircle, Shield, Smartphone, CheckCircle } from 'lucide-react'

interface WhatsAppLoginProps {
  onSuccess: (user: any) => void
}

export function WhatsAppLogin({ onSuccess }: WhatsAppLoginProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Formatar telefone brasileiro
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Iniciar processo de login
  const handleInitiateLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios')
      return
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Telefone deve ter pelo menos 10 dígitos')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/whatsapp/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, '')
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationId(data.verification_id)
        setMessage(data.message)
        setStep('code')
      } else {
        setError(data.message || 'Erro ao enviar código')
      }
    } catch (error) {
      console.error('Erro ao iniciar login:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Verificar código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim() || code.length !== 6) {
      setError('Código deve ter 6 dígitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/whatsapp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_id: verificationId,
          code: code.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Login realizado com sucesso!')
        setTimeout(() => {
          onSuccess(data.user)
        }, 1000)
      } else {
        setError(data.message || 'Código inválido')
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Voltar para etapa do telefone
  const handleBack = () => {
    setStep('phone')
    setCode('')
    setError('')
    setMessage('')
  }

  // Reenviar código
  const handleResendCode = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/whatsapp/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, '')
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationId(data.verification_id)
        setMessage('Novo código enviado!')
      } else {
        setError(data.message || 'Erro ao reenviar código')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'phone' ? 'Entrar com WhatsApp' : 'Verificar Código'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Digite seu nome e número do WhatsApp para receber o código de acesso'
              : 'Digite o código de 6 dígitos enviado para seu WhatsApp'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Etapa 1: Nome e Telefone */}
          {step === 'phone' && (
            <form onSubmit={handleInitiateLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número do WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Digite o número com DDD (apenas números brasileiros)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Enviar código via WhatsApp
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Etapa 2: Código de Verificação */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="text-sm text-green-700">
                  Código enviado para <strong>{phone}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Verifique seu WhatsApp
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificação</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Digite o código de 6 dígitos recebido no WhatsApp
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar e Entrar
                  </>
                )}
              </Button>

              <div className="flex justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                >
                  ← Voltar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700"
                >
                  Reenviar código
                </Button>
              </div>
            </form>
          )}

          {/* Mensagens de feedback */}
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações de segurança */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Seguro e Privado</p>
                <p className="text-xs">
                  Seus dados são protegidos e o código expira em 5 minutos. 
                  Não compartilhe o código com ninguém.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

