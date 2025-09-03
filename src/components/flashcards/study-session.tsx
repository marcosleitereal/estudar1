'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FlashcardViewer } from './flashcard-viewer'
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Home
} from 'lucide-react'

interface StudyCard {
  id: string
  front: string
  back: string
  type: 'basic' | 'cloze' | 'image' | 'audio'
  easinessFactor: number
  repetition: number
  interval: number
  nextReviewDate: Date
  totalReviews: number
  correctReviews: number
  averageQuality: number
}

interface StudySessionProps {
  deckId: string
  deckName: string
  onComplete?: (results: SessionResults) => void
  onExit?: () => void
}

interface SessionResults {
  cardsStudied: number
  cardsCorrect: number
  accuracy: number
  duration: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export function StudySession({ deckId, deckName, onComplete, onExit }: StudySessionProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [cards, setCards] = useState<StudyCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    cardsCorrect: 0,
    startTime: Date.now(),
    responseTime: 0
  })
  const [loading, setLoading] = useState(false)
  const [cardStartTime, setCardStartTime] = useState(Date.now())

  useEffect(() => {
    if (sessionStarted) {
      startSession()
    }
  }, [sessionStarted])

  const startSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          deckId
        })
      })
      
      const data = await response.json()
      setSessionId(data.session.id)
      setCards(data.dueCards || [])
      setCardStartTime(Date.now())
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardRating = async (quality: number) => {
    if (!cards[currentCardIndex]) return

    const responseTime = Date.now() - cardStartTime
    const isCorrect = quality >= 3

    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          sessionId,
          cardId: cards[currentCardIndex].id,
          quality,
          responseTime
        })
      })

      const data = await response.json()
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        cardsCorrect: prev.cardsCorrect + (isCorrect ? 1 : 0),
        responseTime: (prev.responseTime + responseTime) / 2
      }))

      // Move to next card or finish session
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1)
        setShowAnswer(false)
        setCardStartTime(Date.now())
      } else {
        await finishSession()
      }
    } catch (error) {
      console.error('Error rating card:', error)
    }
  }

  const finishSession = async () => {
    try {
      const duration = (Date.now() - sessionStats.startTime) / 1000 / 60 // minutes
      const accuracy = sessionStats.cardsStudied > 0 
        ? (sessionStats.cardsCorrect / sessionStats.cardsStudied) * 100 
        : 0

      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId
        })
      })

      const data = await response.json()
      
      const results: SessionResults = {
        cardsStudied: sessionStats.cardsStudied,
        cardsCorrect: sessionStats.cardsCorrect,
        accuracy,
        duration,
        grade: data.performance?.grade || 'C'
      }

      onComplete?.(results)
    } catch (error) {
      console.error('Error finishing session:', error)
    }
  }

  const handleFlip = () => {
    setShowAnswer(true)
  }

  const handleSkip = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setShowAnswer(false)
      setCardStartTime(Date.now())
    }
  }

  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0
  const currentCard = cards[currentCardIndex]

  // Pre-session screen
  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sessão de Estudo</CardTitle>
            <p className="text-muted-foreground">{deckName}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-muted-foreground">Cartões para revisar</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">5</div>
                <div className="text-sm text-muted-foreground">Novos cartões</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">~15</div>
                <div className="text-sm text-muted-foreground">Minutos estimados</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Como funciona:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Leia a pergunta e tente responder mentalmente
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Clique no cartão para ver a resposta
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Avalie sua resposta de acordo com a dificuldade
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  O algoritmo ajustará quando revisar novamente
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onExit}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={() => setSessionStarted(true)}
                className="flex-1"
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Carregando...' : 'Começar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading || !currentCard) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando cartões...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{deckName}</h1>
          <p className="text-muted-foreground">
            Cartão {currentCardIndex + 1} de {cards.length}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            {Math.round((sessionStats.cardsCorrect / Math.max(sessionStats.cardsStudied, 1)) * 100)}% precisão
          </div>
          
          <Button variant="outline" onClick={onExit}>
            <Home className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso da sessão</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <FlashcardViewer
        flashcard={{
          id: currentCard.id,
          front: currentCard.front,
          back: currentCard.back,
          type: currentCard.type,
          tags: [],
          difficulty: 'medium'
        }}
        showAnswer={showAnswer}
        onFlip={handleFlip}
        onRate={handleCardRating}
        showRating={showAnswer}
        responseTime={Date.now() - cardStartTime}
      />

      {/* Session Controls */}
      {!showAnswer && (
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleSkip}>
            <SkipForward className="h-4 w-4 mr-2" />
            Pular
          </Button>
          
          <Button onClick={handleFlip}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Ver Resposta
          </Button>
        </div>
      )}

      {/* Session Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-lg">{sessionStats.cardsStudied}</div>
              <div className="text-muted-foreground">Estudados</div>
            </div>
            <div>
              <div className="font-medium text-lg text-green-600">{sessionStats.cardsCorrect}</div>
              <div className="text-muted-foreground">Corretos</div>
            </div>
            <div>
              <div className="font-medium text-lg">
                {Math.round((Date.now() - sessionStats.startTime) / 1000 / 60)}min
              </div>
              <div className="text-muted-foreground">Tempo</div>
            </div>
            <div>
              <div className="font-medium text-lg">
                {sessionStats.responseTime > 0 ? `${(sessionStats.responseTime / 1000).toFixed(1)}s` : '-'}
              </div>
              <div className="text-muted-foreground">Tempo médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

