'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  Home,
  AlertTriangle,
  Target,
  Timer
} from 'lucide-react'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false'
  subject: string
  question: string
  options?: string[]
  correctAnswer: number | boolean
  explanation: string
  points: number
  timeLimit: number
}

interface QuizSessionProps {
  quizId: string
  quizTitle: string
  onComplete?: (results: QuizResults) => void
  onExit?: () => void
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

export function QuizSession({ quizId, quizTitle, onComplete, onExit }: QuizSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    startTime: Date.now(),
    questionsAnswered: 0,
    correctAnswers: 0
  })

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Timer effect
  useEffect(() => {
    if (!sessionStarted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionStarted, timeRemaining])

  const startQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          quizId
        })
      })
      
      const data = await response.json()
      setQuestions(data.questions || [])
      setTimeRemaining(data.quiz.timeLimit * 60) // Convert to seconds
      setSessionStarted(true)
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (selectedAnswer: any) => {
    if (!currentQuestion) return

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }))
  }

  const submitAnswer = async () => {
    if (!currentQuestion || answers[currentQuestion.id] === undefined) return

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_answer',
          questionId: currentQuestion.id,
          selectedAnswer: answers[currentQuestion.id]
        })
      })

      const data = await response.json()
      
      // Update stats
      setSessionStats(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (data.isCorrect ? 1 : 0)
      }))

      setShowExplanation(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const nextQuestion = () => {
    if (isLastQuestion) {
      completeQuiz()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowExplanation(false)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowExplanation(false)
    }
  }

  const completeQuiz = async () => {
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          quizId
        })
      })

      const data = await response.json()
      onComplete?.(data.results)
    } catch (error) {
      console.error('Error completing quiz:', error)
    }
  }

  const handleTimeUp = useCallback(() => {
    // Auto-complete quiz when time runs out
    completeQuiz()
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = (seconds: number): string => {
    if (seconds < 300) return 'text-red-600' // Less than 5 minutes
    if (seconds < 600) return 'text-orange-600' // Less than 10 minutes
    return 'text-foreground'
  }

  // Pre-quiz screen
  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Quiz</CardTitle>
            <p className="text-muted-foreground">{quizTitle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-sm text-muted-foreground">Questões</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">30</div>
                <div className="text-sm text-muted-foreground">Minutos</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">70%</div>
                <div className="text-sm text-muted-foreground">Para passar</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Instruções:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Leia cada questão com atenção
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Selecione apenas uma alternativa por questão
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Você pode voltar e alterar suas respostas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Gerencie bem o tempo disponível
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
                onClick={startQuiz}
                className="flex-1"
                disabled={loading}
              >
                <Target className="h-4 w-4 mr-2" />
                {loading ? 'Carregando...' : 'Começar Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando questões...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quizTitle}</h1>
          <p className="text-muted-foreground">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-mono ${getTimeColor(timeRemaining)}`}>
            <Timer className="h-4 w-4" />
            {formatTime(timeRemaining)}
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
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Time Warning */}
      {timeRemaining < 300 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Atenção: Restam apenas {formatTime(timeRemaining)} para completar o quiz!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{currentQuestion.subject}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {Math.floor(currentQuestion.timeLimit / 60)} min
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-lg font-medium leading-relaxed mb-4">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
              disabled={showExplanation}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'true_false' && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) => handleAnswer(value === 'true')}
              disabled={showExplanation}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                    Verdadeiro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <XCircle className="h-4 w-4 inline mr-2 text-red-600" />
                    Falso
                  </Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {/* Explanation */}
          {showExplanation && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Explicação:</h4>
                <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          {sessionStats.questionsAnswered} de {questions.length} respondidas
        </div>

        {!showExplanation ? (
          <Button
            onClick={submitAnswer}
            disabled={answers[currentQuestion.id] === undefined}
          >
            Confirmar Resposta
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            {isLastQuestion ? 'Finalizar Quiz' : 'Próxima'}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </div>

      {/* Stats Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-lg">{sessionStats.questionsAnswered}</div>
              <div className="text-muted-foreground">Respondidas</div>
            </div>
            <div>
              <div className="font-medium text-lg text-green-600">{sessionStats.correctAnswers}</div>
              <div className="text-muted-foreground">Corretas</div>
            </div>
            <div>
              <div className="font-medium text-lg">
                {sessionStats.questionsAnswered > 0 
                  ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100)
                  : 0}%
              </div>
              <div className="text-muted-foreground">Precisão</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

