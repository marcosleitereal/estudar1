'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface AdminLoginProps {
  onSuccess: (user: any) => void
  onBackToWhatsApp: () => void
}

export function AdminLogin({ onSuccess, onBackToWhatsApp }: AdminLoginProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Email e senha são obrigatórios')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Login admin realizado com sucesso!')
        setTimeout(() => {
          onSuccess(data.user)
        }, 1000)
      } else {
        setError(data.message || 'Credenciais inválidas')
      }
    } catch (error) {
      console.error('Erro no login admin:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Administrativo
          </CardTitle>
          <CardDescription>
            Área restrita para administradores do sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do administrador</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@estudar.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Entrar como Admin
                </>
              )}
            </Button>
          </form>

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

          {/* Botão para voltar ao login WhatsApp */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToWhatsApp}
              className="w-full text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              ← Voltar para login via WhatsApp
            </Button>
          </div>

          {/* Informações de segurança */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Área Restrita</p>
                <p className="text-xs">
                  Este acesso é exclusivo para administradores do sistema. 
                  Todas as ações são registradas e monitoradas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

