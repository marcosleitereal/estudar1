'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  BookOpen, 
  Target,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Settings,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react'

interface AdminStats {
  users: {
    total: number
    active: number
    newThisMonth: number
    premium: number
  }
  content: {
    laws: number
    articles: number
    questions: number
    flashcards: number
  }
  activity: {
    quizzes: number
    studySessions: number
    searches: number
    avgSessionTime: number
  }
  system: {
    storage: number
    apiCalls: number
    uptime: number
    errors: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'quiz_completed' | 'content_added' | 'error' | 'import'
  description: string
  timestamp: Date
  user?: string
  status: 'success' | 'warning' | 'error'
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Clean data for new platform
      const mockStats: AdminStats = {
        users: {
          total: 1,
          active: 1,
          newThisMonth: 1,
          premium: 1
        },
        content: {
          laws: 17,
          articles: 13,
          questions: 0,
          flashcards: 0
        },
        activity: {
          quizzes: 0,
          studySessions: 0,
          searches: 0,
          avgSessionTime: 0
        },
        system: {
          storage: 5, // percentage
          apiCalls: 0,
          uptime: 100,
          errors: 0
        }
      }

      const mockActivities: RecentActivity[] = []

      setStats(mockStats)
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return <Users className="h-4 w-4" />
      case 'quiz_completed': return <Target className="h-4 w-4" />
      case 'content_added': return <BookOpen className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'import': return <Upload className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 60) {
      return `${minutes}min atrás`
    } else if (hours < 24) {
      return `${hours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-2xl font-bold text-primary">
                Estudar.Pro
              </a>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>/</span>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-2xl font-bold text-primary">
                Estudar.Pro
              </a>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>/</span>
                <span>Painel Administrativo</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie usuários, conteúdo e monitore o sistema
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.users.newThisMonth} este mês
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-green-600">
                    {stats.users.active} ativos
                  </span>
                  <span className="text-purple-600">
                    {stats.users.premium} premium
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conteúdo Total
                </CardTitle>
                <BookOpen className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.content.laws}</div>
                <p className="text-xs text-muted-foreground">
                  leis e códigos
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <span>{stats.content.articles.toLocaleString()} artigos</span>
                  <span>{stats.content.questions.toLocaleString()} questões</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Atividade Hoje
                </CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activity.quizzes}</div>
                <p className="text-xs text-muted-foreground">
                  quizzes realizados
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span>{stats.activity.studySessions} sessões</span>
                  <span>{stats.activity.searches} buscas</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status do Sistema
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.system.uptime}%
                </div>
                <p className="text-xs text-muted-foreground">
                  uptime
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-blue-600">
                    {stats.system.storage}% storage
                  </span>
                  <span className="text-red-600">
                    {stats.system.errors} erros
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activity.description}
                            </p>
                            {activity.user && (
                              <p className="text-xs text-muted-foreground">
                                por {activity.user}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Importar Conteúdo</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <Download className="h-6 w-6" />
                        <span className="text-sm">Exportar Dados</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <Users className="h-6 w-6" />
                        <span className="text-sm">Gerenciar Usuários</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Ver Relatórios</span>
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Sistema</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Uso de Storage</span>
                          <span className="font-medium">{stats.system.storage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stats.system.storage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <span>API Calls (hoje)</span>
                          <span className="font-medium">{stats.system.apiCalls.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Tempo Médio de Sessão</span>
                          <span className="font-medium">{stats.activity.avgSessionTime}min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funcionalidade de gestão de usuários será implementada aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Conteúdo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funcionalidade de gestão de conteúdo será implementada aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoramento do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funcionalidade de monitoramento será implementada aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios e Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funcionalidade de relatórios será implementada aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

