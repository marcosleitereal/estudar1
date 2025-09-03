'use client'

import { useState } from 'react'
import { Search, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void
  loading?: boolean
  placeholder?: string
}

interface SearchFilters {
  type?: string[]
  source?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export function SearchBar({ onSearch, loading = false, placeholder = "Buscar leis, artigos, súmulas..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), filters)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-4 h-12 text-base"
            disabled={loading}
          />
        </div>
        
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="lg"
          className="h-12 px-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        
        <Button
          onClick={handleSearch}
          size="lg"
          className="h-12 px-6"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Buscar
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filtros Avançados</h3>
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
            >
              Limpar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Document Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Documento</label>
              <Select
                value={filters.type?.[0] || ''}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    type: value ? [value] : undefined 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="constitution">Constituição</SelectItem>
                  <SelectItem value="code">Códigos</SelectItem>
                  <SelectItem value="law">Leis</SelectItem>
                  <SelectItem value="sumula">Súmulas</SelectItem>
                  <SelectItem value="jurisprudence">Jurisprudência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fonte</label>
              <Select
                value={filters.source?.[0] || ''}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    source: value ? [value] : undefined 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as fontes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fontes</SelectItem>
                  <SelectItem value="cf88">Constituição Federal</SelectItem>
                  <SelectItem value="cc2002">Código Civil</SelectItem>
                  <SelectItem value="cpc2015">Código de Processo Civil</SelectItem>
                  <SelectItem value="stf">STF</SelectItem>
                  <SelectItem value="stj">STJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtros Rápidos</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.type?.includes('constitution') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => 
                    setFilters(prev => ({
                      ...prev,
                      type: prev.type?.includes('constitution') 
                        ? prev.type.filter(t => t !== 'constitution')
                        : [...(prev.type || []), 'constitution']
                    }))
                  }
                >
                  CF/88
                </Button>
                <Button
                  variant={filters.source?.includes('stf') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => 
                    setFilters(prev => ({
                      ...prev,
                      source: prev.source?.includes('stf') 
                        ? prev.source.filter(s => s !== 'stf')
                        : [...(prev.source || []), 'stf']
                    }))
                  }
                >
                  STF
                </Button>
                <Button
                  variant={filters.source?.includes('stj') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => 
                    setFilters(prev => ({
                      ...prev,
                      source: prev.source?.includes('stj') 
                        ? prev.source.filter(s => s !== 'stj')
                        : [...(prev.source || []), 'stj']
                    }))
                  }
                >
                  STJ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Sugestões:</span>
        {[
          'direitos fundamentais',
          'art. 5º CF/88',
          'direitos sociais',
          'súmula STF',
          'código civil'
        ].map((suggestion) => (
          <Button
            key={suggestion}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setQuery(suggestion)
              onSearch(suggestion, filters)
            }}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}

