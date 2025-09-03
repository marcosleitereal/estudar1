'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Play, 
  Clock, 
  Users, 
  Target,
  TrendingUp,
  Search,
  Filter,
  Star,
  Award
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

interface QuizListProps {
  onSelectQuiz?: (quiz: Quiz) => void
  showCreateButton?: boolean
}

export function QuizList({ onSelectQuiz, showCreateButton = false }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  useEffect(() => {
    fetchQuizzes()
  }, [subjectFilter, difficultyFilter, typeFilter])

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (subjectFilter && subjectFilter !== 'all') params.append('subject', subjectFilter)
      if (difficultyFilter && difficultyFilter !== 'all') params.append('difficulty', difficultyFilter)
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)

      const response = await fetch(`/api/quiz?${params}`)
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      case 'mixed': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
      case 'mixed': return 'Misto'
      default: return difficulty
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'exam': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'custom': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'practice': return 'Prática'
      case 'exam': return 'Exame'
      case 'custom': return 'Personalizado'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quizzes Disponíveis</h2>
          <p className="text-muted-foreground">
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''} encontrado{filteredQuizzes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={subjectFilter || undefined} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as matérias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as matérias</SelectItem>
            <SelectItem value="Direito Constitucional">Direito Constitucional</SelectItem>
            <SelectItem value="Direito Civil">Direito Civil</SelectItem>
            <SelectItem value="Direito Penal">Direito Penal</SelectItem>
            <SelectItem value="Direito Administrativo">Direito Administrativo</SelectItem>
            <SelectItem value="Misto">Misto</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={difficultyFilter || undefined} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as dificuldades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as dificuldades</SelectItem>
            <SelectItem value="easy">Fácil</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="hard">Difícil</SelectItem>
            <SelectItem value="mixed">Misto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter || undefined} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="practice">Prática</SelectItem>
            <SelectItem value="exam">Exame</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    {quiz.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {quiz.description}
                  </p>
                </div>
                
                {quiz.statistics.averageScore >= 80 && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {getDifficultyLabel(quiz.difficulty)}
                </Badge>
                <Badge className={getTypeColor(quiz.type)}>
                  {getTypeLabel(quiz.type)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {quiz.subject}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Quiz Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.questionCount} questões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.statistics.totalAttempts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.passingScore}% para passar</span>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Média de acertos</span>
                  <span className="font-medium">{quiz.statistics.averageScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${quiz.statistics.averageScore}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{quiz.statistics.completionRate}% completam</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{quiz.statistics.averageTime}min médio</span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              {quiz.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {quiz.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {quiz.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{quiz.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Action Button */}
              <Button 
                className="w-full"
                onClick={() => onSelectQuiz?.(quiz)}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum quiz encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || subjectFilter || difficultyFilter || typeFilter
              ? 'Tente ajustar os filtros de busca'
              : 'Não há quizzes disponíveis no momento'
            }
          </p>
        </div>
      )}
    </div>
  )
}

