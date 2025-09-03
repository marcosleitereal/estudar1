'use client'

import { useState } from 'react'
import { DeckList } from '@/components/flashcards/deck-list'
import { StudySession } from '@/components/flashcards/study-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react'

interface Deck {
  id: string
  name: string
  description: string
  subject: string
  isPublic: boolean
  cardCount: number
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  subscribers?: number
  stats: {
    total: number
    new: number
    learning: number
    review: number
    mastered: number
    averageEF: number
  }
}

interface SessionResults {
  cardsStudied: number
  cardsCorrect: number
  accuracy: number
  duration: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [showSessionResults, setShowSessionResults] = useState(false)
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null)

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setShowSessionResults(false)
  }

  const handleSessionComplete = (results: SessionResults) => {
    setSessionResults(results)
    setShowSessionResults(true)
    setSelectedDeck(null)
  }

  const handleExitSession = () => {
    setSelectedDeck(null)
  }

  const handleCreateDeck = () => {
    // TODO: Implement deck creation
    console.log('Create deck')
  }

  // Clean study statistics for new platform
  const studyStats = {
    totalCards: 0,
    cardsLearned: 0,
    cardsMastered: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0, // minutes
    averageAccuracy: 0,
    weeklyGoal: 0,
    weeklyProgress: 0,
    dueToday: 0
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

  // Session Results Modal
  if (showSessionResults && sessionResults) {
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
                <span>Flashcards</span>
                <span>/</span>
                <span>Resultados</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Results Header */}
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h1 className="text-3xl font-bold">Sessão Concluída!</h1>
              <p className="text-muted-foreground">
                Parabéns por completar sua sessão de estudos
              </p>
            </div>

            {/* Results Card */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Award className="h-6 w-6" />
                  Resultados da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grade */}
                <div className="text-center">
                  <Badge className={`text-2xl px-4 py-2 ${getGradeColor(sessionResults.grade)}`}>
                    Nota: {sessionResults.grade}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-blue-600">
                      {sessionResults.cardsStudied}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cartões estudados
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionResults.cardsCorrect}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Respostas corretas
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(sessionResults.accuracy)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Precisão
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(sessionResults.duration)}min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tempo total
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Feedback:</h3>
                  <p className="text-sm text-muted-foreground">
                    {sessionResults.accuracy >= 90 
                      ? 'Excelente desempenho! Você domina bem este conteúdo.'
                      : sessionResults.accuracy >= 75
                      ? 'Bom trabalho! Continue praticando para melhorar ainda mais.'
                      : sessionResults.accuracy >= 60
                      ? 'Você está no caminho certo. Considere revisar o material antes da próxima sessão.'
                      : 'Não desanime! O aprendizado é um processo. Tente revisar o conteúdo e pratique mais.'
                    }
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSessionResults(false)}
                    className="flex-1"
                  >
                    Ver Decks
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowSessionResults(false)
                      // TODO: Start new session with same deck
                    }}
                    className="flex-1"
                  >
                    Estudar Mais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Study Session View
  if (selectedDeck) {
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
                <span>Flashcards</span>
                <span>/</span>
                <span>Sessão</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <StudySession
            deckId={selectedDeck.id}
            deckName={selectedDeck.name}
            onComplete={handleSessionComplete}
            onExit={handleExitSession}
          />
        </main>
      </div>
    )
  }

  // Main Flashcards Page
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
                <span>Flashcards</span>
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
              Sistema de Flashcards
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aprenda com repetição espaçada usando o algoritmo SM-2 para 
              otimizar sua retenção de conhecimento
            </p>
          </div>

          {/* Study Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sequência Atual
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studyStats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  dias consecutivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Para Revisar Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{studyStats.dueToday}</div>
                <p className="text-xs text-muted-foreground">
                  cartões pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Precisão Média
                </CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{studyStats.averageAccuracy}%</div>
                <p className="text-xs text-muted-foreground">
                  nas últimas sessões
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
                  {Math.round(studyStats.totalStudyTime / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">
                  tempo total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-16 flex-col gap-2" disabled>
                  <Calendar className="h-6 w-6" />
                  <span>Revisar Hoje ({studyStats.dueToday})</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex-col gap-2" disabled>
                  <BookOpen className="h-6 w-6" />
                  <span>Estudar Novos</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex-col gap-2" disabled>
                  <TrendingUp className="h-6 w-6" />
                  <span>Ver Estatísticas</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deck List */}
          <DeckList
            onSelectDeck={handleSelectDeck}
            onCreateDeck={handleCreateDeck}
            showCreateButton={true}
          />
        </div>
      </main>
    </div>
  )
}

