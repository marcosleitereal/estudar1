'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  BookOpen, 
  Star,
  Eye,
  ChevronRight,
  Scale,
  FileText,
  Bookmark,
  Filter,
  SortAsc,
  Calendar,
  Tag
} from 'lucide-react'

interface Law {
  id: string
  title: string
  number: string
  year: number
  type: 'constituicao' | 'codigo' | 'lei' | 'decreto' | 'sumula'
  subject: string
  description: string
  articles: number
  lastUpdated: Date
  isFavorite: boolean
  readProgress: number
  tags: string[]
  popularity: number
}

interface LawArticle {
  id: string
  lawId: string
  number: string
  title?: string
  content: string
  paragraphs?: Array<{
    number: string
    content: string
  }>
  items?: Array<{
    number: string
    content: string
  }>
}

export default function LeisPage() {
  const [laws, setLaws] = useState<Law[]>([])
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null)
  const [articles, setArticles] = useState<LawArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<LawArticle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLaws()
  }, [])

  const fetchLaws = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockLaws: Law[] = [
        {
          id: 'cf88',
          title: 'Constituição Federal',
          number: 'CF/88',
          year: 1988,
          type: 'constituicao',
          subject: 'Direito Constitucional',
          description: 'Constituição da República Federativa do Brasil de 1988',
          articles: 250,
          lastUpdated: new Date('2023-12-15'),
          isFavorite: true,
          readProgress: 45,
          tags: ['constituição', 'direitos fundamentais', 'organização do estado'],
          popularity: 95
        },
        {
          id: 'cc02',
          title: 'Código Civil',
          number: 'Lei 10.406/02',
          year: 2002,
          type: 'codigo',
          subject: 'Direito Civil',
          description: 'Código Civil Brasileiro',
          articles: 2046,
          lastUpdated: new Date('2023-11-20'),
          isFavorite: false,
          readProgress: 12,
          tags: ['código civil', 'personalidade', 'contratos', 'família'],
          popularity: 88
        },
        {
          id: 'cp40',
          title: 'Código Penal',
          number: 'Decreto-Lei 2.848/40',
          year: 1940,
          type: 'codigo',
          subject: 'Direito Penal',
          description: 'Código Penal Brasileiro',
          articles: 361,
          lastUpdated: new Date('2023-10-10'),
          isFavorite: true,
          readProgress: 78,
          tags: ['código penal', 'crimes', 'penas', 'medidas de segurança'],
          popularity: 92
        },
        {
          id: 'cpp41',
          title: 'Código de Processo Penal',
          number: 'Decreto-Lei 3.689/41',
          year: 1941,
          type: 'codigo',
          subject: 'Direito Processual Penal',
          description: 'Código de Processo Penal Brasileiro',
          articles: 811,
          lastUpdated: new Date('2023-09-05'),
          isFavorite: false,
          readProgress: 23,
          tags: ['processo penal', 'inquérito', 'ação penal', 'recursos'],
          popularity: 76
        },
        {
          id: 'cpc15',
          title: 'Código de Processo Civil',
          number: 'Lei 13.105/15',
          year: 2015,
          type: 'codigo',
          subject: 'Direito Processual Civil',
          description: 'Código de Processo Civil de 2015',
          articles: 1072,
          lastUpdated: new Date('2023-12-01'),
          isFavorite: false,
          readProgress: 5,
          tags: ['processo civil', 'procedimentos', 'recursos', 'execução'],
          popularity: 82
        },
        {
          id: 'clt43',
          title: 'Consolidação das Leis do Trabalho',
          number: 'Decreto-Lei 5.452/43',
          year: 1943,
          type: 'codigo',
          subject: 'Direito do Trabalho',
          description: 'Consolidação das Leis do Trabalho',
          articles: 922,
          lastUpdated: new Date('2023-08-15'),
          isFavorite: false,
          readProgress: 0,
          tags: ['trabalho', 'contrato', 'salário', 'jornada'],
          popularity: 71
        },
        {
          id: 'lei8069',
          title: 'Estatuto da Criança e do Adolescente',
          number: 'Lei 8.069/90',
          year: 1990,
          type: 'lei',
          subject: 'Direito da Criança e Adolescente',
          description: 'Estatuto da Criança e do Adolescente',
          articles: 267,
          lastUpdated: new Date('2023-07-20'),
          isFavorite: false,
          readProgress: 0,
          tags: ['criança', 'adolescente', 'proteção', 'direitos'],
          popularity: 68
        }
      ]

      setLaws(mockLaws)
    } catch (error) {
      console.error('Error fetching laws:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async (lawId: string) => {
    try {
      // Mock articles for demonstration
      const mockArticles: LawArticle[] = [
        {
          id: 'art1',
          lawId,
          number: 'Art. 1º',
          content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',
          items: [
            { number: 'I', content: 'a soberania' },
            { number: 'II', content: 'a cidadania' },
            { number: 'III', content: 'a dignidade da pessoa humana' },
            { number: 'IV', content: 'os valores sociais do trabalho e da livre iniciativa' },
            { number: 'V', content: 'o pluralismo político' }
          ]
        },
        {
          id: 'art2',
          lawId,
          number: 'Art. 2º',
          content: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
        },
        {
          id: 'art3',
          lawId,
          number: 'Art. 3º',
          content: 'Constituem objetivos fundamentais da República Federativa do Brasil:',
          items: [
            { number: 'I', content: 'construir uma sociedade livre, justa e solidária' },
            { number: 'II', content: 'garantir o desenvolvimento nacional' },
            { number: 'III', content: 'erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais' },
            { number: 'IV', content: 'promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação' }
          ]
        }
      ]

      setArticles(mockArticles)
      setSelectedArticle(mockArticles[0])
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const handleSelectLaw = (law: Law) => {
    setSelectedLaw(law)
    fetchArticles(law.id)
  }

  const toggleFavorite = (lawId: string) => {
    setLaws(prev => prev.map(law => 
      law.id === lawId ? { ...law, isFavorite: !law.isFavorite } : law
    ))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'constituicao': return 'bg-red-100 text-red-800 border-red-200'
      case 'codigo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'lei': return 'bg-green-100 text-green-800 border-green-200'
      case 'decreto': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'sumula': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'constituicao': return 'Constituição'
      case 'codigo': return 'Código'
      case 'lei': return 'Lei'
      case 'decreto': return 'Decreto'
      case 'sumula': return 'Súmula'
      default: return type
    }
  }

  const filteredLaws = laws.filter(law => {
    const matchesSearch = law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         law.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         law.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || law.type === selectedType
    
    return matchesSearch && matchesType
  })

  if (loading) {
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
                <span>Leis</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="text-2xl font-bold text-primary">
              Estudar.Pro
            </a>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>/</span>
              <span>Estudar Lei Seca</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Estudar Lei Seca
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acesse a Constituição Federal, códigos e leis atualizadas 
              com interface otimizada para estudos
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar leis, códigos ou constituição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedType('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={selectedType === 'constituicao' ? 'default' : 'outline'}
                onClick={() => setSelectedType('constituicao')}
                size="sm"
              >
                Constituição
              </Button>
              <Button
                variant={selectedType === 'codigo' ? 'default' : 'outline'}
                onClick={() => setSelectedType('codigo')}
                size="sm"
              >
                Códigos
              </Button>
              <Button
                variant={selectedType === 'lei' ? 'default' : 'outline'}
                onClick={() => setSelectedType('lei')}
                size="sm"
              >
                Leis
              </Button>
            </div>
          </div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Laws List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Legislação ({filteredLaws.length})
                </h2>
                <Button variant="ghost" size="sm">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredLaws.map((law) => (
                    <Card 
                      key={law.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedLaw?.id === law.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSelectLaw(law)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(law.type)}>
                                {getTypeLabel(law.type)}
                              </Badge>
                              {law.isFavorite && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <CardTitle className="text-sm leading-tight">
                              {law.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {law.number} • {law.year}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(law.id)
                            }}
                          >
                            <Star className={`h-4 w-4 ${
                              law.isFavorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                            }`} />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {law.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span>{law.articles} artigos</span>
                            <span className="text-muted-foreground">
                              {law.readProgress}% lido
                            </span>
                          </div>
                          
                          {law.readProgress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${law.readProgress}%` }}
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {law.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {law.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{law.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Reading Area */}
            <div className="lg:col-span-2">
              {selectedLaw ? (
                <div className="space-y-6">
                  {/* Law Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{selectedLaw.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">
                            {selectedLaw.number} • {selectedLaw.year}
                          </p>
                          <p className="text-sm mt-2">{selectedLaw.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Bookmark className="h-4 w-4 mr-2" />
                            Marcar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Notas
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Articles Navigation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Articles List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Artigos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-1">
                            {articles.map((article) => (
                              <Button
                                key={article.id}
                                variant={selectedArticle?.id === article.id ? 'default' : 'ghost'}
                                className="w-full justify-start text-sm"
                                onClick={() => setSelectedArticle(article)}
                              >
                                {article.number}
                                <ChevronRight className="h-3 w-3 ml-auto" />
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Article Content */}
                    <div className="md:col-span-2">
                      {selectedArticle ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Scale className="h-5 w-5" />
                              {selectedArticle.number}
                              {selectedArticle.title && ` - ${selectedArticle.title}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              <p className="leading-relaxed text-justify">
                                {selectedArticle.content}
                              </p>
                              
                              {selectedArticle.items && (
                                <div className="mt-4 space-y-2">
                                  {selectedArticle.items.map((item) => (
                                    <div key={item.number} className="flex gap-3">
                                      <span className="font-medium text-primary min-w-[2rem]">
                                        {item.number} -
                                      </span>
                                      <span className="text-justify">
                                        {item.content}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {selectedArticle.paragraphs && (
                                <div className="mt-4 space-y-2">
                                  {selectedArticle.paragraphs.map((paragraph) => (
                                    <div key={paragraph.number} className="flex gap-3">
                                      <span className="font-medium text-primary min-w-[2rem]">
                                        {paragraph.number}
                                      </span>
                                      <span className="text-justify">
                                        {paragraph.content}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between mt-6 pt-4 border-t">
                              <Button variant="outline" size="sm">
                                ← Artigo Anterior
                              </Button>
                              <Button variant="outline" size="sm">
                                Próximo Artigo →
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              Selecione um artigo
                            </h3>
                            <p className="text-muted-foreground">
                              Escolha um artigo na lista ao lado para começar a leitura
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-medium mb-4">
                      Selecione uma lei para estudar
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Escolha uma lei, código ou a Constituição Federal na lista ao lado 
                      para começar seus estudos
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => handleSelectLaw(laws[0])}>
                        <Scale className="h-4 w-4 mr-2" />
                        Constituição Federal
                      </Button>
                      <Button variant="outline" onClick={() => handleSelectLaw(laws[1])}>
                        <FileText className="h-4 w-4 mr-2" />
                        Código Civil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

