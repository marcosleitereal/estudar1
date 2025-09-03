'use client'

import { useAuthContext } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrialBanner } from '@/components/trial-banner'
import { BookOpen, Brain, FileText, Users, Search, TrendingUp, User, LogOut, Target, Clock, Crown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, logout } = useAuthContext()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Check if user is admin
  const isAdminUser = user?.role === 'admin'

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
                onClick={() => router.push('/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              {isAdminUser && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Trial Banner */}
        {user && !user.is_premium && (
          <TrialBanner />
        )}

        {/* Main Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo, {user?.name || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              {user?.subscription_status === 'trial' 
                ? `Continue seus estudos. Você tem ${user.days_remaining} dias restantes no período gratuito.`
                : user?.subscription_status === 'active'
                ? 'Continue seus estudos de onde parou ou explore novos conteúdos.'
                : 'Assine para continuar seus estudos e acessar todo o conteúdo.'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flashcards Pendentes</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.stats?.flashcards_reviewed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Para revisar hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notas Criadas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Total de anotações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quiz Realizados</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.stats?.quizzes_completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.stats?.study_time_minutes ? Math.round(user.stats.study_time_minutes / 60) : 0}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de estudo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Estudar Lei Seca
                </CardTitle>
                <CardDescription>
                  Acesse a Constituição Federal, códigos e leis atualizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/search')}
                >
                  Estudar Leis
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quiz & Simulados
                </CardTitle>
                <CardDescription>
                  Teste seus conhecimentos com questões práticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push('/quiz')}
                  >
                    Fazer Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/simulados')}
                  >
                    Simulados
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Revisar Flashcards
                </CardTitle>
                <CardDescription>
                  Continue sua revisão com o sistema de repetição espaçada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/flashcards')}
                >
                  Revisar Cards
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Conteúdo
              </CardTitle>
              <CardDescription>
                Encontre leis, súmulas e jurisprudência rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/search')}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Agora
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Suas últimas ações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.stats?.last_activity ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Última atividade</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.stats.last_activity).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {user.subscription_status === 'trial' && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Crown className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Período de teste ativo</p>
                        <p className="text-xs text-blue-700">
                          {user.days_remaining} dias restantes para aproveitar gratuitamente
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma atividade recente</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comece estudando para ver suas atividades aqui
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

