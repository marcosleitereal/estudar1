'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Volume2, 
  Bookmark,
  MoreHorizontal,
  Timer
} from 'lucide-react'

interface Flashcard {
  id: string
  front: string
  back: string
  type: 'basic' | 'cloze' | 'image' | 'audio'
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  source?: {
    type: 'article' | 'sumula' | 'law' | 'custom'
    reference: string
  }
}

interface FlashcardViewerProps {
  flashcard: Flashcard
  showAnswer?: boolean
  onFlip?: () => void
  onRate?: (quality: number) => void
  showRating?: boolean
  responseTime?: number
  onBookmark?: (cardId: string) => void
  isBookmarked?: boolean
}

export function FlashcardViewer({
  flashcard,
  showAnswer = false,
  onFlip,
  onRate,
  showRating = false,
  responseTime,
  onBookmark,
  isBookmarked = false
}: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    setIsFlipped(showAnswer)
    if (!showAnswer) {
      setStartTime(Date.now())
    }
  }, [showAnswer, flashcard.id])

  const handleFlip = () => {
    const newFlipped = !isFlipped
    setIsFlipped(newFlipped)
    onFlip?.()
  }

  const handleRate = (quality: number) => {
    const currentResponseTime = Date.now() - startTime
    onRate?.(quality)
  }

  const formatResponseTime = (time: number): string => {
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(1)}s`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderContent = (content: string, type: string) => {
    if (type === 'cloze' && !isFlipped) {
      // Hide cloze deletions on front side
      return content.replace(/\{\{c\d+::(.*?)\}\}/g, '[...]')
    }
    
    if (type === 'cloze' && isFlipped) {
      // Show answers on back side
      return content.replace(/\{\{c\d+::(.*?)\}\}/g, '<mark class="bg-yellow-200 px-1 rounded font-medium">$1</mark>')
    }
    
    return content
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(flashcard.difficulty)}>
            {flashcard.difficulty === 'easy' ? 'Fácil' : 
             flashcard.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </Badge>
          
          {flashcard.source && (
            <Badge variant="outline" className="text-xs">
              {flashcard.source.reference}
            </Badge>
          )}
          
          <Badge variant="secondary" className="text-xs">
            {flashcard.type === 'basic' ? 'Básico' : 
             flashcard.type === 'cloze' ? 'Lacuna' : flashcard.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {responseTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              {formatResponseTime(responseTime)}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark?.(flashcard.id)}
            className={isBookmarked ? 'text-yellow-600' : ''}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <Card 
        className={`relative min-h-[300px] cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isFlipped ? 'bg-blue-50 border-blue-200' : 'bg-white'
        }`}
        onClick={handleFlip}
      >
        <CardContent className="p-8 flex flex-col justify-center min-h-[300px]">
          {/* Flip Indicator */}
          <div className="absolute top-4 right-4">
            {isFlipped ? (
              <Eye className="h-5 w-5 text-blue-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          {/* Card Content */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground font-medium">
              {isFlipped ? 'RESPOSTA' : 'PERGUNTA'}
            </div>
            
            <div 
              className="text-lg leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderContent(
                  isFlipped ? flashcard.back : flashcard.front,
                  flashcard.type
                )
              }}
            />
          </div>
          
          {/* Flip Instruction */}
          {!isFlipped && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
                Clique para ver a resposta
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Buttons */}
      {showRating && isFlipped && (
        <div className="mt-6 space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Como foi sua resposta?
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              onClick={() => handleRate(1)}
            >
              <span className="text-lg">😰</span>
              <span className="text-xs">Não lembrei</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
              onClick={() => handleRate(2)}
            >
              <span className="text-lg">😕</span>
              <span className="text-xs">Difícil</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700"
              onClick={() => handleRate(3)}
            >
              <span className="text-lg">😐</span>
              <span className="text-xs">Bom</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
              onClick={() => handleRate(4)}
            >
              <span className="text-lg">😊</span>
              <span className="text-xs">Fácil</span>
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            Sua avaliação determina quando este cartão aparecerá novamente
          </div>
        </div>
      )}

      {/* Tags */}
      {flashcard.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {flashcard.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

