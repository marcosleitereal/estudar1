'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  LogOut,
  Crown,
  Clock,
  BarChart3,
  BookOpen,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuthContext()
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsUpdating(true)

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Perfil atualizado com sucesso!')
        await refreshUser()
      } else {
        setError(data.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      setError('Erro ao atualizar perfil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getSubscriptionBadge = () => {
    if (!user) return null

    if (user.subscription_status === 'active') {
      return <Badge className="bg-green-100 text-green-800"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
    }
    
    if (user.subscription_status === 'trial') {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Trial ({user.days_remaining} dias)</Badge>
    }
    
    if (user.subscription_status === 'expired') {
      return <Badge variant="destructive">Expirado</Badge>
    }

    return <Badge variant="secondary">Gratuito</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-primary">
                Estudar.Pro
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {user?.name || 'Usuário'}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais e acompanhe seu progresso
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                <TabsTrigger value="subscription">Assinatura</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar e Info Básica */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{user?.name}</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSubscriptionBadge()}
                          {user?.role === 'admin' && (
                            <Badge variant="secondary">Administrador</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Formulário de atualização */}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome completo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={isUpdating}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={isUpdating}
                        />
                        <p className="text-xs text-muted-foreground">
                          Usado para login e notificações
                        </p>
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

                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </form>

                    {/* Informações adicionais */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Membro desde: {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Último login: {user?.last_login ? formatDate(user.last_login) : 'Primeiro acesso'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Estatísticas de Estudo
                      </CardTitle>
                      <CardDescription>
                        Acompanhe seu progresso e desempenho
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">
                            {user?.stats?.quizzes_completed || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Quiz Realizados</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">
                            {user?.stats?.flashcards_reviewed || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Flashcards Revisados</div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round((user?.stats?.study_time_minutes || 0) / 60)}h
                          </div>
                          <div className="text-sm text-muted-foreground">Tempo de Estudo</div>
                        </div>
                      </div>
                      
                      {user?.stats?.last_activity && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Última atividade: {formatDate(user.stats.last_activity)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Assinatura
                    </CardTitle>
                    <CardDescription>
                      Gerencie sua assinatura e período de teste
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Status da Assinatura</h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.subscription_status === 'active' && 'Assinatura Premium Ativa'}
                          {user?.subscription_status === 'trial' && `Período de Teste (${user.days_remaining} dias restantes)`}
                          {user?.subscription_status === 'expired' && 'Assinatura Expirada'}
                          {user?.subscription_status === 'cancelled' && 'Assinatura Cancelada'}
                        </p>
                      </div>
                      <div>
                        {getSubscriptionBadge()}
                      </div>
                    </div>

                    {user?.subscription_status === 'trial' && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Você tem {user.days_remaining} dias restantes no seu período de teste gratuito.
                          {user.days_remaining <= 1 && ' Assine agora para continuar usando todas as funcionalidades!'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {user?.subscription_status === 'expired' && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Seu período de teste expirou. Assine agora para continuar usando a plataforma.
                        </AlertDescription>
                      </Alert>
                    )}

                    {(user?.subscription_status === 'trial' || user?.subscription_status === 'expired') && (
                      <Button 
                        onClick={() => router.push('/payment')}
                        className="w-full"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Assinar Premium - R$ 19,90/mês
                      </Button>
                    )}

                    {user?.trial_start_date && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Período de teste iniciado: {formatDate(user.trial_start_date)}</p>
                        {user.trial_end_date && (
                          <p>Período de teste termina: {formatDate(user.trial_end_date)}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

