'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchBar } from '@/components/search/search-bar'
import { SearchResults } from '@/components/search/search-results'
import { QAInterface } from '@/components/search/qa-interface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MessageCircle, BookOpen, TrendingUp } from 'lucide-react'

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

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')

  const handleSearch = async (query: string, filters?: any) => {
    setSearchLoading(true)
    setCurrentQuery(query)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=smart&limit=15`)
      const data = await response.json()
      
      if (data.results) {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

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
                <span>Busca Inteligente</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Busca Inteligente
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encontre leis, artigos, súmulas e jurisprudência com busca semântica 
              e inteligência artificial
            </p>
          </div>

          {/* Search Interface */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </TabsTrigger>
              <TabsTrigger value="ask" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Perguntar
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <SearchBar 
                  onSearch={handleSearch}
                  loading={searchLoading}
                  placeholder="Buscar leis, artigos, súmulas, jurisprudência..."
                />
              </div>

              {/* Search Results */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Results */}
                <div className="lg:col-span-3">
                  <SearchResults
                    results={searchResults}
                    loading={searchLoading}
                    query={currentQuery}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Search Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Dicas de Busca
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium mb-1">Busca por artigo:</div>
                        <div className="text-muted-foreground">
                          "Art. 5º CF/88" ou "artigo 5 constituição"
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">Busca conceitual:</div>
                        <div className="text-muted-foreground">
                          "direitos fundamentais" ou "princípio da legalidade"
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">Busca por tribunal:</div>
                        <div className="text-muted-foreground">
                          "STF súmula" ou "STJ jurisprudência"
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Searches */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Buscas Populares
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        'Direitos fundamentais',
                        'Art. 5º CF/88',
                        'Direitos sociais',
                        'Princípio da legalidade',
                        'Súmula vinculante',
                        'Código Civil',
                        'Processo civil',
                        'Direito penal'
                      ].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="ask" className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <QAInterface />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

