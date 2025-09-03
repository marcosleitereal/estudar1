'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Scale, 
  FileText, 
  ExternalLink, 
  Star,
  Copy,
  Share2
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  type: string
  source: string
  similarity?: number
  highlights?: string[]
  metadata?: {
    document_id: string
    article_number?: string
    court?: string
  }
}

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  query?: string
  total?: number
}

export function SearchResults({ results, loading = false, query, total }: SearchResultsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'constitution':
      case 'article':
        return <BookOpen className="h-4 w-4" />
      case 'sumula':
        return <Scale className="h-4 w-4" />
      case 'code':
      case 'law':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'constitution':
      case 'article':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sumula':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'code':
      case 'law':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const highlightText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text
    }

    let highlightedText = text
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi')
      highlightedText = highlightedText.replace(
        regex, 
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      )
    })

    return highlightedText
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground mb-4">
          {query ? `Não encontramos resultados para "${query}"` : 'Tente fazer uma busca'}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Sugestões:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verifique a ortografia das palavras</li>
            <li>Use termos mais gerais</li>
            <li>Tente sinônimos</li>
            <li>Use aspas para busca exata: "direitos fundamentais"</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total ? `${total} resultados` : `${results.length} resultados`}
          {query && ` para "${query}"`}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar busca
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getTypeIcon(result.type)}
                  <CardTitle className="text-lg leading-tight">
                    {result.title}
                  </CardTitle>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {result.similarity && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(result.similarity * 100)}% relevante
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(result.id)}
                    className={favorites.has(result.id) ? 'text-yellow-600' : ''}
                  >
                    <Star className={`h-4 w-4 ${favorites.has(result.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getTypeColor(result.type)}>
                  {result.type === 'article' ? 'Artigo' : 
                   result.type === 'sumula' ? 'Súmula' :
                   result.type === 'constitution' ? 'Constituição' :
                   result.type === 'code' ? 'Código' : result.type}
                </Badge>
                
                <span className="text-sm text-muted-foreground">
                  {result.source}
                </span>
                
                {result.metadata?.article_number && (
                  <Badge variant="outline" className="text-xs">
                    Art. {result.metadata.article_number}
                  </Badge>
                )}
                
                {result.metadata?.court && (
                  <Badge variant="outline" className="text-xs">
                    {result.metadata.court}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(
                      result.content.length > 300 
                        ? result.content.substring(0, 300) + '...'
                        : result.content,
                      result.highlights
                    )
                  }}
                />
                
                {result.highlights && result.highlights.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Trechos relevantes:
                    </div>
                    <div className="space-y-1">
                      {result.highlights.slice(0, 2).map((highlight, i) => (
                        <div 
                          key={i}
                          className="text-xs bg-muted p-2 rounded border-l-2 border-primary"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(highlight, [query || ''])
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver completo
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(result.content)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  
                  <div className="ml-auto text-xs text-muted-foreground">
                    Resultado #{index + 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Load More */}
      {results.length >= 10 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Carregar mais resultados
          </Button>
        </div>
      )}
    </div>
  )
}

