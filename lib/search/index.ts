// Search and RAG System
import OpenAI from 'openai'
import { EmbeddingService, VectorDatabase } from '../etl/embeddings'

export interface SearchQuery {
  query: string
  filters?: {
    type?: string[]
    source?: string[]
    date_range?: {
      start: string
      end: string
    }
  }
  limit?: number
}

export interface SearchResult {
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

export interface RAGResponse {
  answer: string
  sources: SearchResult[]
  confidence: number
  query: string
}

/**
 * Advanced Search Service
 */
export class SearchService {
  private embeddingService: EmbeddingService
  private openai: OpenAI
  
  constructor() {
    this.embeddingService = new EmbeddingService()
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_BASE
    })
  }
  
  /**
   * Full-text search with Portuguese support
   */
  async fullTextSearch(
    supabase: any,
    query: string,
    filters?: SearchQuery['filters'],
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('search_view')
        .select(`
          id,
          title,
          content,
          type,
          source,
          document_id,
          article_number,
          court,
          ts_rank
        `)
        .textSearch('content_tsvector', query, {
          type: 'websearch',
          config: 'portuguese'
        })
        .order('ts_rank', { ascending: false })
        .limit(limit)
      
      // Apply filters
      if (filters?.type) {
        queryBuilder = queryBuilder.in('type', filters.type)
      }
      
      if (filters?.source) {
        queryBuilder = queryBuilder.in('source', filters.source)
      }
      
      if (filters?.date_range) {
        queryBuilder = queryBuilder
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }
      
      const { data, error } = await queryBuilder
      
      if (error) {
        console.error('Full-text search error:', error)
        return []
      }
      
      return data.map((row: any) => ({
        id: row.id,
        title: row.title || 'Sem título',
        content: row.content,
        type: row.type,
        source: row.source,
        highlights: this.extractHighlights(row.content, query),
        metadata: {
          document_id: row.document_id,
          article_number: row.article_number,
          court: row.court
        }
      }))
      
    } catch (error) {
      console.error('Error in full-text search:', error)
      return []
    }
  }
  
  /**
   * Semantic search using embeddings
   */
  async semanticSearch(
    supabase: any,
    query: string,
    filters?: SearchQuery['filters'],
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query)
      
      // Perform vector search
      const results = await VectorDatabase.semanticSearch(
        supabase,
        queryEmbedding,
        limit,
        0.7
      )
      
      // Apply filters if needed
      let filteredResults = results
      
      if (filters?.type) {
        filteredResults = results.filter(r => 
          filters.type!.includes(r.metadata.type)
        )
      }
      
      if (filters?.source) {
        filteredResults = results.filter(r => 
          filters.source!.some(s => r.metadata.source.includes(s))
        )
      }
      
      return filteredResults.map(result => ({
        id: result.metadata.document_id,
        title: this.extractTitle(result.text),
        content: result.text,
        type: result.metadata.type,
        source: result.metadata.source,
        similarity: result.similarity,
        metadata: {
          document_id: result.metadata.document_id
        }
      }))
      
    } catch (error) {
      console.error('Error in semantic search:', error)
      return []
    }
  }
  
  /**
   * Hybrid search combining full-text and semantic
   */
  async hybridSearch(
    supabase: any,
    query: string,
    filters?: SearchQuery['filters'],
    limit: number = 15
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query)
      
      // Perform hybrid search
      const results = await VectorDatabase.hybridSearch(
        supabase,
        query,
        queryEmbedding,
        limit
      )
      
      return results.map(result => ({
        id: result.metadata.document_id,
        title: this.extractTitle(result.text),
        content: result.text,
        type: result.metadata.type,
        source: result.metadata.source,
        similarity: result.similarity,
        highlights: this.extractHighlights(result.text, query),
        metadata: {
          document_id: result.metadata.document_id
        }
      }))
      
    } catch (error) {
      console.error('Error in hybrid search:', error)
      return []
    }
  }
  
  /**
   * Smart search that chooses the best method
   */
  async smartSearch(
    supabase: any,
    searchQuery: SearchQuery
  ): Promise<SearchResult[]> {
    const { query, filters, limit = 15 } = searchQuery
    
    // Determine search strategy based on query characteristics
    const isLegalQuery = this.isLegalQuery(query)
    const isSpecificArticle = this.isSpecificArticleQuery(query)
    
    if (isSpecificArticle) {
      // Use full-text search for specific articles
      return await this.fullTextSearch(supabase, query, filters, limit)
    } else if (isLegalQuery) {
      // Use hybrid search for legal concepts
      return await this.hybridSearch(supabase, query, filters, limit)
    } else {
      // Use semantic search for general questions
      return await this.semanticSearch(supabase, query, filters, limit)
    }
  }
  
  /**
   * Extract highlights from text
   */
  private extractHighlights(text: string, query: string): string[] {
    const words = query.toLowerCase().split(/\s+/)
    const highlights: string[] = []
    
    words.forEach(word => {
      const regex = new RegExp(`(.{0,50}${word}.{0,50})`, 'gi')
      const matches = text.match(regex)
      if (matches) {
        highlights.push(...matches.slice(0, 2))
      }
    })
    
    return highlights
  }
  
  /**
   * Extract title from content
   */
  private extractTitle(text: string): string {
    const firstLine = text.split('\n')[0]
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
  }
  
  /**
   * Check if query is legal-specific
   */
  private isLegalQuery(query: string): boolean {
    const legalTerms = [
      'direito', 'lei', 'artigo', 'código', 'constituição',
      'súmula', 'jurisprudência', 'acórdão', 'decisão',
      'tribunal', 'stf', 'stj', 'processo', 'recurso'
    ]
    
    return legalTerms.some(term => 
      query.toLowerCase().includes(term)
    )
  }
  
  /**
   * Check if query is asking for specific article
   */
  private isSpecificArticleQuery(query: string): boolean {
    return /art\.?\s*\d+|artigo\s*\d+/i.test(query)
  }
}

/**
 * RAG (Retrieval-Augmented Generation) Service
 */
export class RAGService {
  private searchService: SearchService
  private openai: OpenAI
  
  constructor() {
    this.searchService = new SearchService()
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_BASE
    })
  }
  
  /**
   * Generate answer using RAG
   */
  async generateAnswer(
    supabase: any,
    query: string,
    filters?: SearchQuery['filters']
  ): Promise<RAGResponse> {
    try {
      // Step 1: Retrieve relevant documents
      const searchResults = await this.searchService.smartSearch(supabase, {
        query,
        filters,
        limit: 8
      })
      
      if (searchResults.length === 0) {
        return {
          answer: 'Não encontrei informações relevantes para responder sua pergunta. Tente reformular ou ser mais específico.',
          sources: [],
          confidence: 0,
          query
        }
      }
      
      // Step 2: Prepare context for generation
      const context = this.prepareContext(searchResults)
      
      // Step 3: Generate answer
      const answer = await this.generateContextualAnswer(query, context)
      
      // Step 4: Calculate confidence
      const confidence = this.calculateConfidence(searchResults, answer)
      
      return {
        answer,
        sources: searchResults.slice(0, 5), // Top 5 sources
        confidence,
        query
      }
      
    } catch (error) {
      console.error('Error in RAG generation:', error)
      return {
        answer: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
        sources: [],
        confidence: 0,
        query
      }
    }
  }
  
  /**
   * Prepare context from search results
   */
  private prepareContext(results: SearchResult[]): string {
    return results
      .map((result, index) => {
        const source = result.metadata?.article_number 
          ? `Art. ${result.metadata.article_number}` 
          : result.source
        
        return `[${index + 1}] ${source}: ${result.content}`
      })
      .join('\n\n')
  }
  
  /**
   * Generate contextual answer using OpenAI
   */
  private async generateContextualAnswer(query: string, context: string): Promise<string> {
    const prompt = `Você é um assistente especializado em direito brasileiro. Use apenas as informações fornecidas no contexto para responder à pergunta.

CONTEXTO:
${context}

PERGUNTA: ${query}

INSTRUÇÕES:
- Responda de forma clara e precisa
- Use apenas informações do contexto fornecido
- Cite as fontes relevantes (ex: "Conforme o Art. 5º da CF/88...")
- Se não houver informação suficiente, diga isso claramente
- Mantenha um tom profissional mas acessível

RESPOSTA:`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente jurídico especializado em direito brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
      
      return response.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.'
      
    } catch (error) {
      console.error('Error generating answer:', error)
      return 'Erro ao gerar resposta. Tente novamente.'
    }
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(results: SearchResult[], answer: string): number {
    if (results.length === 0) return 0
    
    // Base confidence on search result quality
    const avgSimilarity = results.reduce((sum, r) => sum + (r.similarity || 0), 0) / results.length
    
    // Adjust based on answer characteristics
    let confidence = avgSimilarity * 100
    
    // Boost confidence if answer contains specific legal references
    if (/Art\.?\s*\d+|Lei\s*\d+|CF\/88|STF|STJ/i.test(answer)) {
      confidence += 10
    }
    
    // Reduce confidence if answer is too generic
    if (answer.length < 100) {
      confidence -= 15
    }
    
    return Math.min(Math.max(confidence, 0), 100)
  }
}

/**
 * Citation Service
 */
export class CitationService {
  /**
   * Extract and format citations from search results
   */
  static formatCitations(results: SearchResult[]): string[] {
    return results.map((result, index) => {
      const num = index + 1
      
      if (result.metadata?.article_number) {
        return `[${num}] Art. ${result.metadata.article_number} - ${result.source}`
      }
      
      if (result.metadata?.court) {
        return `[${num}] ${result.metadata.court} - ${result.source}`
      }
      
      return `[${num}] ${result.source}`
    })
  }
  
  /**
   * Generate bibliography from sources
   */
  static generateBibliography(results: SearchResult[]): string {
    const citations = this.formatCitations(results)
    
    return `## Fontes Consultadas\n\n${citations.join('\n')}`
  }
}

