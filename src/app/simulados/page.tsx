'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  Users, 
  Target,
  Trophy,
  Calendar,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Award,
  Play,
  History,
  BarChart3
} from 'lucide-react'

interface ExamTemplate {
  id: string
  name: string
  description: string
  type: 'oab' | 'concurso' | 'vestibular' | 'custom'
  totalQuestions: number
  timeLimit: number
  passingScore: number
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard'
  subjects: string[]
  statistics: {
    totalAttempts: number
    averageScore: number
    averageTime: number
    passRate: number
  }
  isActive: boolean
  estimatedTime: string
  nextAvailable: Date
}

interface ExamSession {
  id: string
  examTitle: string
  status: 'completed' | 'in_progress'
  score?: number
  totalQuestions: number
  percentage?: number
  passed?: boolean
  timeSpent?: number
  completedAt?: Date
  grade?: string
  currentQuestion?: number
  timeRemaining?: number
  startedAt?: Date
}

export default function SimuladosPage() {
  const [templates, setTemplates] = useState<ExamTemplate[]>([])
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch templates
      const templatesResponse = await fetch('/api/exams?type=templates')
      const templatesData = await templatesResponse.json()
      setTemplates(templatesData.templates || [])

      // Fetch user sessions
      const sessionsResponse = await fetch('/api/exams?type=sessions')
      const sessionsData = await sessionsResponse.json()
      setSessions(sessionsData.sessions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startExam = async (templateId: string) => {
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_exam',
          templateId
        })
      })

      const data = await response.json()
      if (data.exam) {
        // Redirect to exam session (would be implemented)
        console.log('Exam started:', data.exam.title)
      }
    } catch (error) {
      console.error('Error starting exam:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'oab': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'concurso': return 'bg-green-100 text-green-800 border-green-200'
      case 'vestibular': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'oab': return 'OAB'
      case 'concurso': return 'Concurso'
      case 'vestibular': return 'Vestibular'
      default: return type
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      case 'mixed': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': case 'A+': return 'text-green-600 bg-green-50'
      case 'B': case 'B+': return 'text-blue-600 bg-blue-50'
      case 'C': case 'C+': return 'text-yellow-600 bg-yellow-50'
      case 'D': return 'text-orange-600 bg-orange-50'
      case 'F': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredTemplates = selectedType === 'all' 
    ? templates 
    : templates.filter(t => t.type === selectedType)

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress')

  // Mock user statistics
  const userStats = {
    totalExams: completedSessions.length,
    averageScore: completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSessions.length)
      : 0,
    bestScore: completedSessions.length > 0 
      ? Math.max(...completedSessions.map(s => s.percentage || 0))
      : 0,
    passRate: completedSessions.length > 0
      ? Math.round((completedSessions.filter(s => s.passed).length / completedSessions.length) * 100)
      : 0
  }

  if (loading) {
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
                <span>Simulados</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="text-2xl font-bold text-primary">
              Estudar.Pro
            </a>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>/</span>
              <span>Simulados</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Simulados e Provas
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Prepare-se para exames reais com simulados completos 
              baseados em provas oficiais
            </p>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Simulados Realizados
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalExams}</div>
                <p className="text-xs text-muted-foreground">
                  total completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Média de Acertos
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{userStats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  nos simulados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Melhor Resultado
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{userStats.bestScore}%</div>
                <p className="text-xs text-muted-foreground">
                  recorde pessoal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Aprovação
                </CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{userStats.passRate}%</div>
                <p className="text-xs text-muted-foreground">
                  aprovações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* In Progress Sessions */}
          {inProgressSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Simulados em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{session.examTitle}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Questão {session.currentQuestion} de {session.totalQuestions}</span>
                          <span>•</span>
                          <span>Tempo restante: {Math.floor((session.timeRemaining || 0) / 60)}min</span>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={((session.currentQuestion || 0) / session.totalQuestions) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      <Button>
                        Continuar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Results */}
          {completedSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Resultados Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          (session.percentage || 0) >= 70 ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">{session.examTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.completedAt ? new Date(session.completedAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getGradeColor(session.grade || 'F')}>
                          {session.grade}
                        </Badge>
                        <span className="text-sm font-medium">
                          {session.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedType === 'oab' ? 'default' : 'outline'}
              onClick={() => setSelectedType('oab')}
            >
              OAB
            </Button>
            <Button
              variant={selectedType === 'concurso' ? 'default' : 'outline'}
              onClick={() => setSelectedType('concurso')}
            >
              Concursos
            </Button>
            <Button
              variant={selectedType === 'vestibular' ? 'default' : 'outline'}
              onClick={() => setSelectedType('vestibular')}
            >
              Vestibular
            </Button>
          </div>

          {/* Exam Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{template.name}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                    <Badge className={getTypeColor(template.type)}>
                      {getTypeLabel(template.type)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Exam Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{template.totalQuestions} questões</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{template.statistics.totalAttempts} tentativas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{template.passingScore}% para passar</span>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de aprovação</span>
                      <span className="font-medium">{template.statistics.passRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${template.statistics.passRate}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Média: {template.statistics.averageScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.floor(template.statistics.averageTime / 60)}h médio</span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Matérias:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.subjects.slice(0, 4).map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {template.subjects.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.subjects.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Availability */}
                  {new Date() < template.nextAvailable ? (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Disponível em {template.nextAvailable.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => startExam(template.id)}
                      disabled={!template.isActive}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Simulado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum simulado encontrado</h3>
              <p className="text-muted-foreground">
                Não há simulados disponíveis para o filtro selecionado
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

