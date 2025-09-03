'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrialBanner } from '@/components/trial-banner'
import { BookOpen, Brain, FileText, Users, Search, TrendingUp, User, LogOut, Target } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  // Mock user for demonstration
  const mockUser = {
    id: '1',
    name: 'Usuário Demo',
    email: 'demo@estudar.pro',
    role: 'student' as const
  }

  // Check if user is admin
  const isAdminUser = mockUser.email === 'dev@sonnik.com.br' || mockUser.email === 'admin@estudar.pro'

  return (
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
              {mockUser.name}
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
              onClick={() => router.push('/')}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Trial Banner */}
        <TrialBanner />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {mockUser.name}!
          </h1>
          <p className="text-muted-foreground">
            Continue seus estudos de onde parou ou explore novos conteúdos.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flashcards Pendentes
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Para revisar hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notas Criadas
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Quiz Realizados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progresso
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Meta mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Estudar Lei Seca</CardTitle>
              <CardDescription>
                Acesse a Constituição Federal, códigos e leis atualizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/leis">
                <Button className="w-full">
                  Estudar Leis
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Quiz & Simulados</CardTitle>
              <CardDescription>
                Teste seus conhecimentos com questões práticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/quiz">
                  <Button className="w-full">
                    Fazer Quiz
                  </Button>
                </Link>
                <Link href="/simulados">
                  <Button className="w-full" variant="outline">
                    Simulados
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Revisar Flashcards</CardTitle>
              <CardDescription>
                Continue sua revisão com o sistema de repetição espaçada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/flashcards">
                <Button className="w-full">
                  Revisar Cards
                </Button>
              </Link>
            </CardContent>
          </Card>

          {isAdminUser && (
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Painel Administrativo</CardTitle>
                <CardDescription>
                  Gerencie usuários, conteúdo e monitore o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full" variant="outline">
                    Acessar Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Buscar Conteúdo</CardTitle>
              <CardDescription>
                Encontre leis, súmulas e jurisprudência rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/search">
                <Button className="w-full">
                  Buscar Agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Comece estudando para ver suas atividades aqui</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

