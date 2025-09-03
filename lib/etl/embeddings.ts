// Embeddings System for RAG
import OpenAI from 'openai'

export interface EmbeddingResult {
  text: string
  embedding: number[]
  metadata: {
    source: string
    type: string
    chunk_id: string
    document_id: string
  }
}

export interface VectorSearchResult {
  text: string
  similarity: number
  metadata: {
    source: string
    type: string
    document_id: string
  }
}

/**
 * OpenAI Embeddings Service
 */
export class EmbeddingService {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_BASE
    })
  }
  
  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(
    texts: string[], 
    metadata: Array<{source: string, type: string, document_id: string}>
  ): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = []
    
    // Process in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchMetadata = metadata.slice(i, i + batchSize)
      
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
          encoding_format: 'float'
        })
        
        response.data.forEach((embedding, index) => {
          results.push({
            text: batch[index],
            embedding: embedding.embedding,
            metadata: {
              ...batchMetadata[index],
              chunk_id: `chunk_${i + index}`
            }
          })
        })
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error('Error generating embeddings:', error)
        // Continue with next batch
      }
    }
    
    return results
  }
  
  /**
   * Generate embedding for a single query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      })
      
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating query embedding:', error)
      throw error
    }
  }
}

/**
 * Vector Database Operations
 */
export class VectorDatabase {
  /**
   * Store embeddings in Supabase with pgvector
   */
  static async storeEmbeddings(
    supabase: any,
    embeddings: EmbeddingResult[]
  ): Promise<void> {
    const batchSize = 100
    
    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize)
      
      const records = batch.map((embedding, index) => ({
        id: `${embedding.metadata.document_id}_${embedding.metadata.chunk_id}`,
        content: embedding.text,
        embedding: embedding.embedding,
        source: embedding.metadata.source,
        type: embedding.metadata.type,
        document_id: embedding.metadata.document_id,
        chunk_id: embedding.metadata.chunk_id,
        created_at: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from('document_embeddings')
        .upsert(records)
      
      if (error) {
        console.error('Error storing embeddings batch:', error)
        throw error
      }
    }
  }
  
  /**
   * Semantic search using pgvector
   */
  static async semanticSearch(
    supabase: any,
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<VectorSearchResult[]> {
    try {
      const { data, error } = await supabase.rpc('semantic_search', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      })
      
      if (error) {
        console.error('Semantic search error:', error)
        return []
      }
      
      return data.map((row: any) => ({
        text: row.content,
        similarity: row.similarity,
        metadata: {
          source: row.source,
          type: row.type,
          document_id: row.document_id
        }
      }))
      
    } catch (error) {
      console.error('Error in semantic search:', error)
      return []
    }
  }
  
  /**
   * Hybrid search (BM25 + Vector)
   */
  static async hybridSearch(
    supabase: any,
    query: string,
    queryEmbedding: number[],
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    try {
      const { data, error } = await supabase.rpc('hybrid_search', {
        search_query: query,
        query_embedding: queryEmbedding,
        match_count: limit
      })
      
      if (error) {
        console.error('Hybrid search error:', error)
        return []
      }
      
      return data.map((row: any) => ({
        text: row.content,
        similarity: row.combined_score,
        metadata: {
          source: row.source,
          type: row.type,
          document_id: row.document_id
        }
      }))
      
    } catch (error) {
      console.error('Error in hybrid search:', error)
      return []
    }
  }
}

/**
 * ETL Pipeline for Legal Documents
 */
export class ETLPipeline {
  private embeddingService: EmbeddingService
  
  constructor() {
    this.embeddingService = new EmbeddingService()
  }
  
  /**
   * Process legal document through full ETL pipeline
   */
  async processDocument(
    document: any,
    chunks: string[],
    supabase: any
  ): Promise<void> {
    console.log(`Processing document: ${document.title}`)
    
    // Step 1: Store document metadata
    const { error: docError } = await supabase
      .from('legal_documents')
      .upsert({
        id: document.id,
        title: document.title,
        type: document.type,
        source_url: document.source_url,
        metadata: document.metadata,
        created_at: new Date().toISOString()
      })
    
    if (docError) {
      console.error('Error storing document:', docError)
      throw docError
    }
    
    // Step 2: Store document content
    const contentRecords = document.content.map((item: any) => ({
      id: item.id,
      document_id: document.id,
      type: item.type,
      number: item.number,
      text: item.text,
      parent_id: item.parent_id,
      level: item.level,
      created_at: new Date().toISOString()
    }))
    
    const { error: contentError } = await supabase
      .from('legal_content')
      .upsert(contentRecords)
    
    if (contentError) {
      console.error('Error storing content:', contentError)
      throw contentError
    }
    
    // Step 3: Generate and store embeddings
    const metadata = chunks.map(() => ({
      source: document.source_url,
      type: document.type,
      document_id: document.id
    }))
    
    const embeddings = await this.embeddingService.generateEmbeddings(chunks, metadata)
    await VectorDatabase.storeEmbeddings(supabase, embeddings)
    
    console.log(`Processed ${chunks.length} chunks for document: ${document.title}`)
  }
  
  /**
   * Process súmulas through ETL pipeline
   */
  async processSumulas(
    sumulas: any[],
    chunks: string[],
    supabase: any
  ): Promise<void> {
    console.log(`Processing ${sumulas.length} súmulas`)
    
    // Step 1: Store súmulas
    const sumulaRecords = sumulas.map(sumula => ({
      id: sumula.id,
      court: sumula.court,
      number: sumula.number,
      text: sumula.text,
      type: sumula.type,
      status: sumula.status,
      publication_date: sumula.publication_date,
      subject_areas: sumula.subject_areas,
      created_at: new Date().toISOString()
    }))
    
    const { error: sumulaError } = await supabase
      .from('sumulas')
      .upsert(sumulaRecords)
    
    if (sumulaError) {
      console.error('Error storing súmulas:', sumulaError)
      throw sumulaError
    }
    
    // Step 2: Generate and store embeddings
    const metadata = chunks.map((_, index) => ({
      source: `${sumulas[index].court}_sumula`,
      type: 'sumula',
      document_id: sumulas[index].id
    }))
    
    const embeddings = await this.embeddingService.generateEmbeddings(chunks, metadata)
    await VectorDatabase.storeEmbeddings(supabase, embeddings)
    
    console.log(`Processed embeddings for ${sumulas.length} súmulas`)
  }
}

/**
 * Content Update Jobs
 */
export class ContentUpdateJobs {
  /**
   * Daily update job for legal content
   */
  static async dailyUpdate(supabase: any): Promise<void> {
    console.log('Starting daily content update...')
    
    try {
      // Update document status
      await supabase.rpc('update_document_status')
      
      // Refresh embeddings for modified content
      await supabase.rpc('refresh_modified_embeddings')
      
      console.log('Daily update completed successfully')
    } catch (error) {
      console.error('Error in daily update:', error)
    }
  }
  
  /**
   * Weekly full reindex
   */
  static async weeklyReindex(supabase: any): Promise<void> {
    console.log('Starting weekly reindex...')
    
    try {
      // Clear old embeddings
      await supabase.from('document_embeddings').delete().neq('id', '')
      
      // Trigger full reprocessing
      await supabase.rpc('trigger_full_reindex')
      
      console.log('Weekly reindex completed successfully')
    } catch (error) {
      console.error('Error in weekly reindex:', error)
    }
  }
}

