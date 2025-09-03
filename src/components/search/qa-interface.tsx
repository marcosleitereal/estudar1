'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react'

interface QAResponse {
  answer: string
  sources: Array<{
    id: string
    title: string
    content: string
    type: string
    source: string
    metadata?: {
      article_number?: string
      court?: string
    }
  }>
  confidence: number
  query: string
  citations: string[]
  timestamp: string
}

interface QAInterfaceProps {
  onAsk?: (question: string) => Promise<QAResponse>
}

export function QAInterface({ onAsk }: QAInterfaceProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<QAResponse | null>(null)
  const [history, setHistory] = useState<QAResponse[]>([])

  const handleAsk = async () => {
    if (!question.trim() || loading) return

    setLoading(true)
    
    try {
      let result: QAResponse
      
      if (onAsk) {
        result = await onAsk(question.trim())
      } else {
        // Mock response for demonstration
        const mockResponse = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question.trim() })
        })
        result = await mockResponse.json()
      }
      
      setResponse(result)
      setHistory(prev => [result, ...prev])
      setQuestion('')
      
    } catch (error) {
      console.error('Error asking question:', error)
      setResponse({
        answer: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
        sources: [],
        confidence: 0,
        query: question,
        citations: [],
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const copyAnswer = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 60) return <AlertCircle className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Pergunte sobre Direito
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Faça perguntas sobre legislação, jurisprudência e doutrina jurídica brasileira
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: O que são direitos fundamentais? Qual a diferença entre direitos individuais e coletivos?"
            className="min-h-[100px] resize-none"
            disabled={loading}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </div>
            
            <Button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Perguntar
                </>
              )}
            </Button>
          </div>
          
          {/* Quick Questions */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Perguntas sugeridas:</div>
            <div className="flex flex-wrap gap-2">
              {[
                'O que são direitos fundamentais?',
                'Quais são os direitos sociais?',
                'Art. 5º da Constituição',
                'Diferença entre lei e decreto',
                'O que é uma súmula vinculante?'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestion(suggestion)}
                  disabled={loading}
                  className="text-xs h-8"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Response */}
      {response && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resposta</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getConfidenceColor(response.confidence)} border`}>
                  {getConfidenceIcon(response.confidence)}
                  <span className="ml-1">{response.confidence}% confiança</span>
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Pergunta: "{response.query}"
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Answer */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {response.answer}
              </div>
            </div>
            
            {/* Sources */}
            {response.sources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Fontes consultadas ({response.sources.length})
                </div>
                
                <div className="grid gap-3">
                  {response.sources.map((source, index) => (
                    <div 
                      key={source.id}
                      className="bg-muted/30 p-3 rounded-lg border text-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">{source.title}</div>
                        <Badge variant="outline" className="text-xs">
                          [{index + 1}]
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs mb-2">
                        {source.source}
                        {source.metadata?.article_number && 
                          ` - Art. ${source.metadata.article_number}`
                        }
                        {source.metadata?.court && 
                          ` - ${source.metadata.court}`
                        }
                      </div>
                      <div className="text-xs leading-relaxed">
                        {source.content.length > 200 
                          ? source.content.substring(0, 200) + '...'
                          : source.content
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Útil
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Não útil
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyAnswer(response.answer)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {new Date(response.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Perguntas</span>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(1, 4).map((item, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setResponse(item)}
                >
                  <div className="font-medium text-sm mb-1">
                    {item.query}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString('pt-BR')} • 
                    {item.confidence}% confiança • 
                    {item.sources.length} fontes
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

