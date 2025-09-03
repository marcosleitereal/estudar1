'use client'

import { useState } from 'react'
import { QuizList } from '@/components/quiz/quiz-list'
import { QuizSession } from '@/components/quiz/quiz-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp,
  Award,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  type: 'practice' | 'exam' | 'custom'
  subject: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  questionCount: number
  timeLimit: number
  passingScore: number
  isPublic: boolean
  tags: string[]
  statistics: {
    totalAttempts: number
    averageScore: number
    averageTime: number
    completionRate: number
  }
  estimatedTime: string
  createdAt: Date
}

interface QuizResults {
  score: number
  totalQuestions: number
  percentage: number
  passed: boolean
  timeSpent: number
  grade: string
  subjectScores: Array<{
    subject: string
    score: number
    total: number
    percentage: number
  }>
}

export default function QuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowResults(false)
  }

  const handleQuizComplete = (results: QuizResults) => {
    setQuizResults(results)
    setShowResults(true)
    setSelectedQuiz(null)
  }

  const handleExitQuiz = () => {
    setSelectedQuiz(null)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200'
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'F': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // User statistics (empty for new platform)
  const userStats = {
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0, // minutes
    streak: 0,
    recentQuizzes: []
  }

  // Quiz Results Screen
  if (showResults && quizResults) {
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
                <span>Quiz</span>
                <span>/</span>
                <span>Resultados</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Results Header */}
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {quizResults.passed ? '🎉' : '📚'}
              </div>
              <h1 className="text-3xl font-bold">
                {quizResults.passed ? 'Parabéns!' : 'Continue Estudando!'}
              </h1>
              <p className="text-muted-foreground">
                {quizResults.passed 
                  ? 'Você foi aprovado no quiz!'
                  : 'Não desanime, cada tentativa é um aprendizado!'
                }
              </p>
            </div>

            {/* Main Results */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Resultados do Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grade */}
                <div className="text-center">
                  <Badge className={`text-3xl px-6 py-3 ${getGradeColor(quizResults.grade)}`}>
                    Nota: {quizResults.grade}
                  </Badge>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {quizResults.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      de {quizResults.totalQuestions} questões
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {quizResults.percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      de aproveitamento
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.floor(quizResults.timeSpent / 60)}min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      tempo gasto
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className={`text-3xl font-bold ${quizResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {quizResults.passed ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {quizResults.passed ? 'Aprovado' : 'Reprovado'}
                    </div>
                  </div>
                </div>

                {/* Subject Breakdown */}
                {quizResults.subjectScores.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-center">Desempenho por Matéria</h3>
                    <div className="space-y-3">
                      {quizResults.subjectScores.map((subject, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{subject.subject}</span>
                            <span>{subject.score}/{subject.total} ({subject.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                subject.percentage >= 80 ? 'bg-green-500' :
                                subject.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${subject.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Recomendações:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {quizResults.percentage >= 90 ? (
                      <>
                        <li>• Excelente desempenho! Continue praticando para manter o nível</li>
                        <li>• Considere tentar quizzes mais avançados</li>
                      </>
                    ) : quizResults.percentage >= 70 ? (
                      <>
                        <li>• Bom trabalho! Foque nas matérias com menor desempenho</li>
                        <li>• Pratique mais questões similares</li>
                      </>
                    ) : (
                      <>
                        <li>• Revise os conceitos fundamentais das matérias</li>
                        <li>• Use flashcards para fixar o conteúdo</li>
                        <li>• Refaça o quiz em alguns dias</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResults(false)}
                    className="flex-1"
                  >
                    Ver Outros Quizzes
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowResults(false)
                      // TODO: Restart same quiz
                    }}
                    className="flex-1"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Quiz Session Screen
  if (selectedQuiz) {
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
                <span>Quiz</span>
                <span>/</span>
                <span>Sessão</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <QuizSession
            quizId={selectedQuiz.id}
            quizTitle={selectedQuiz.title}
            onComplete={handleQuizComplete}
            onExit={handleExitQuiz}
          />
        </main>
      </div>
    )
  }

  // Main Quiz Page
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
                <span>Quiz</span>
              </div>
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
              Sistema de Quiz
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teste seus conhecimentos com questões práticas e 
              acompanhe seu progresso nos estudos
            </p>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quizzes Realizados
                </CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
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
                  nos últimos quizzes
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
                  Tempo de Estudo
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(userStats.totalTime / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">
                  tempo total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Faça seu primeiro quiz para ver o histórico aqui</p>
              </div>
            </CardContent>
          </Card>

          {/* Quiz List */}
          <QuizList
            onSelectQuiz={handleSelectQuiz}
            showCreateButton={false}
          />
        </div>
      </main>
    </div>
  )
}

