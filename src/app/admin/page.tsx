'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Shield,
  Search,
  Edit,
  Trash2,
  UserPlus,
  MoreHorizontal,
  CreditCard,
  DollarSign,
  Save,
  Plus,
  LogOut
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
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: 'monthly' | 'yearly'
  features: string[]
  is_active: boolean
}

interface SystemSettings {
  trial_period_days: number
  monthly_plan_price: number
  yearly_plan_price: number
  platform_name: string
  support_whatsapp: string
}

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

interface User {
  id: string
  name: string
  phone: string
  role: 'user' | 'admin' | 'premium'
  created_at: string
  last_login: string | null
  is_active: boolean
}

// Componente de Gestão de Usuários
function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
      } else {
        console.error('Error fetching users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        const data = await response.json()
        alert('Erro ao deletar usuário: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao deletar usuário')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      premium: 'bg-purple-100 text-purple-800',
      user: 'bg-gray-100 text-gray-800'
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestão de Usuários
          </CardTitle>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {formatDate(user.created_at)}
                      {user.last_login && ` • Último login: ${formatDate(user.last_login)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja sair?')) {
                    window.location.href = '/api/auth/logout'
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sair
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
              <UsersManagement />
            </TabsContent>

            <TabsContent value="content">
              <PlansManagement />
            </TabsContent>

            <TabsContent value="system">
              <SystemSettings />
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

// Componente de Gestão de Planos
function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showNewPlanForm, setShowNewPlanForm] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/plans')
      const data = await response.json()

      if (data.success) {
        setPlans(data.plans || [])
      } else {
        console.error('Error fetching plans:', data.message)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async (planData: Partial<Plan>) => {
    try {
      const method = editingPlan ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/plans', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      const data = await response.json()

      if (data.success) {
        fetchPlans()
        setEditingPlan(null)
        setShowNewPlanForm(false)
        alert(data.message)
      } else {
        alert('Erro: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Erro interno. Tente novamente.')
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja desativar este plano?')) return

    try {
      const response = await fetch(`/api/admin/plans?id=${planId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchPlans()
        alert(data.message)
      } else {
        alert('Erro: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Erro interno. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando planos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestão de Planos
          </CardTitle>
          <Button onClick={() => setShowNewPlanForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{plan.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span>
                        {plan.duration === 'monthly' ? 'Mensal' : 'Anual'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form para novo plano ou edição */}
      {(showNewPlanForm || editingPlan) && (
        <PlanForm
          plan={editingPlan}
          onSave={handleSavePlan}
          onCancel={() => {
            setEditingPlan(null)
            setShowNewPlanForm(false)
          }}
        />
      )}
    </div>
  )
}

// Componente de Configurações do Sistema
function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    trial_period_days: 3,
    monthly_plan_price: 19.90,
    yearly_plan_price: 199.90,
    platform_name: 'Estudar.Pro',
    support_whatsapp: '5553991778537'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success) {
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()

      if (data.success) {
        alert('Configurações salvas com sucesso!')
      } else {
        alert('Erro: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro interno. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando configurações...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="trial_period">Período de Teste (dias)</Label>
              <Input
                id="trial_period"
                type="number"
                value={settings.trial_period_days}
                onChange={(e) => setSettings({
                  ...settings,
                  trial_period_days: parseInt(e.target.value) || 3
                })}
              />
            </div>

            <div>
              <Label htmlFor="monthly_price">Preço Plano Mensal (R$)</Label>
              <Input
                id="monthly_price"
                type="number"
                step="0.01"
                value={settings.monthly_plan_price}
                onChange={(e) => setSettings({
                  ...settings,
                  monthly_plan_price: parseFloat(e.target.value) || 19.90
                })}
              />
            </div>

            <div>
              <Label htmlFor="yearly_price">Preço Plano Anual (R$)</Label>
              <Input
                id="yearly_price"
                type="number"
                step="0.01"
                value={settings.yearly_plan_price}
                onChange={(e) => setSettings({
                  ...settings,
                  yearly_plan_price: parseFloat(e.target.value) || 199.90
                })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="platform_name">Nome da Plataforma</Label>
              <Input
                id="platform_name"
                value={settings.platform_name}
                onChange={(e) => setSettings({
                  ...settings,
                  platform_name: e.target.value
                })}
              />
            </div>

            <div>
              <Label htmlFor="support_whatsapp">WhatsApp de Suporte</Label>
              <Input
                id="support_whatsapp"
                value={settings.support_whatsapp}
                onChange={(e) => setSettings({
                  ...settings,
                  support_whatsapp: e.target.value
                })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de formulário para planos
function PlanForm({ plan, onSave, onCancel }: {
  plan: Plan | null
  onSave: (planData: Partial<Plan>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    duration: plan?.duration || 'monthly' as 'monthly' | 'yearly',
    features: plan?.features?.join('\n') || '',
    is_active: plan?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const planData: Partial<Plan> = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim()),
      ...(plan && { id: plan.id })
    }

    onSave(planData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {plan ? 'Editar Plano' : 'Novo Plano'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duração</Label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value as 'monthly' | 'yearly' })}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div>
            <Label htmlFor="features">Recursos (um por linha)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={5}
              placeholder="Digite um recurso por linha"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Label htmlFor="is_active">Plano ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

