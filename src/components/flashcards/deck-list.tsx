'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Clock, 
  Users, 
  TrendingUp,
  Play,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

interface DeckListProps {
  onSelectDeck?: (deck: Deck) => void
  onCreateDeck?: () => void
  showCreateButton?: boolean
}

export function DeckList({ onSelectDeck, onCreateDeck, showCreateButton = true }: DeckListProps) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks')
      const data = await response.json()
      setDecks(data.decks || [])
    } catch (error) {
      console.error('Error fetching decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSubject = !subjectFilter || subjectFilter === 'all' || deck.subject === subjectFilter
    const matchesDifficulty = !difficultyFilter || difficultyFilter === 'all' || deck.difficulty === difficultyFilter
    
    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const subjects = Array.from(new Set(decks.map(deck => deck.subject)))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      default: return difficulty
    }
  }

  const calculateProgress = (stats: Deck['stats']) => {
    if (stats.total === 0) return 0
    return Math.round(((stats.learning + stats.review + stats.mastered) / stats.total) * 100)
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
          <h2 className="text-2xl font-bold">Meus Decks</h2>
          <p className="text-muted-foreground">
            {decks.length} deck{decks.length !== 1 ? 's' : ''} disponível{decks.length !== 1 ? 'is' : ''}
          </p>
        </div>
        
        {showCreateButton && (
          <Button onClick={onCreateDeck}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Deck
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar decks..."
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
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={difficultyFilter || undefined} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as dificuldades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as dificuldades</SelectItem>
            <SelectItem value="beginner">Iniciante</SelectItem>
            <SelectItem value="intermediate">Intermediário</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck) => (
          <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    {deck.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {deck.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge className={getDifficultyColor(deck.difficulty)}>
                  {getDifficultyLabel(deck.difficulty)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {deck.subject}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{deck.cardCount} cartões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{deck.estimatedTime}min</span>
                </div>
                {deck.subscribers && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{deck.subscribers}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{deck.stats.averageEF}</span>
                </div>
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{calculateProgress(deck.stats)}%</span>
                </div>
                <Progress value={calculateProgress(deck.stats)} className="h-2" />
                
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-blue-600">{deck.stats.new}</div>
                    <div>Novos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-orange-600">{deck.stats.learning}</div>
                    <div>Aprendendo</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{deck.stats.review}</div>
                    <div>Revisão</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{deck.stats.mastered}</div>
                    <div>Dominados</div>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button 
                className="w-full"
                onClick={() => onSelectDeck?.(deck)}
              >
                <Play className="h-4 w-4 mr-2" />
                Estudar Agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDecks.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum deck encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || subjectFilter || difficultyFilter
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro deck de estudos'
            }
          </p>
          {showCreateButton && !searchTerm && !subjectFilter && !difficultyFilter && (
            <Button onClick={onCreateDeck}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Deck
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

