import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Configuração do OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gerador de embeddings para conteúdo jurídico
 */
export class EmbeddingsGenerator {
  private readonly model = 'text-embedding-3-small';
  private readonly batchSize = 10;

  /**
   * Gera embedding para um texto
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.model,
        input: text.substring(0, 8000), // Limitar tamanho do texto
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      throw error;
    }
  }

  /**
   * Gera embeddings para múltiplos textos em lote
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const cleanTexts = texts.map(text => text.substring(0, 8000));
      
      const response = await openai.embeddings.create({
        model: this.model,
        input: cleanTexts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Erro ao gerar embeddings em lote:', error);
      throw error;
    }
  }

  /**
   * Processa embeddings para law_chunks
   */
  async processLawChunks(): Promise<void> {
    console.log('🚀 Iniciando processamento de embeddings para law_chunks...');

    try {
      // Buscar chunks sem embeddings
      const { data: chunks, error } = await supabase
        .from('law_chunks')
        .select('id, content')
        .is('embedding', null)
        .limit(100);

      if (error) {
        console.error('Erro ao buscar chunks:', error);
        return;
      }

      if (!chunks || chunks.length === 0) {
        console.log('✅ Todos os chunks já possuem embeddings');
        return;
      }

      console.log(`📄 Processando ${chunks.length} chunks...`);

      // Processar em lotes
      for (let i = 0; i < chunks.length; i += this.batchSize) {
        const batch = chunks.slice(i, i + this.batchSize);
        console.log(`🔄 Processando lote ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(chunks.length / this.batchSize)}`);

        try {
          // Gerar embeddings para o lote
          const texts = batch.map(chunk => chunk.content || '');
          const embeddings = await this.generateBatchEmbeddings(texts);

          // Atualizar no banco
          for (let j = 0; j < batch.length; j++) {
            const chunk = batch[j];
            const embedding = embeddings[j];

            const { error: updateError } = await supabase
              .from('law_chunks')
              .update({ 
                embedding: embedding,
                tokens: this.countTokens(chunk.content || '')
              })
              .eq('id', chunk.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar chunk ${chunk.id}:`, updateError);
            } else {
              console.log(`✅ Chunk ${chunk.id} atualizado`);
            }
          }

          // Aguardar um pouco entre lotes para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Erro no lote ${Math.floor(i / this.batchSize) + 1}:`, error);
        }
      }

      console.log('🎉 Processamento de law_chunks concluído!');

    } catch (error) {
      console.error('❌ Erro durante processamento:', error);
      throw error;
    }
  }

  /**
   * Processa embeddings para laws
   */
  async processLaws(): Promise<void> {
    console.log('🚀 Iniciando processamento de embeddings para laws...');

    try {
      // Buscar laws sem embeddings
      const { data: laws, error } = await supabase
        .from('laws')
        .select('id, content, title, article')
        .limit(50);

      if (error) {
        console.error('Erro ao buscar laws:', error);
        return;
      }

      if (!laws || laws.length === 0) {
        console.log('✅ Nenhuma law encontrada');
        return;
      }

      console.log(`⚖️ Processando ${laws.length} laws...`);

      // Processar em lotes
      for (let i = 0; i < laws.length; i += this.batchSize) {
        const batch = laws.slice(i, i + this.batchSize);
        console.log(`🔄 Processando lote ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(laws.length / this.batchSize)}`);

        try {
          // Preparar textos para embedding (combinar título, artigo e conteúdo)
          const texts = batch.map(law => {
            const parts = [
              law.title || '',
              law.article || '',
              law.content || ''
            ].filter(part => part.trim().length > 0);
            return parts.join(' - ');
          });

          const embeddings = await this.generateBatchEmbeddings(texts);

          // Criar chunks para as laws
          for (let j = 0; j < batch.length; j++) {
            const law = batch[j];
            const embedding = embeddings[j];
            const text = texts[j];

            // Verificar se já existe chunk para esta law
            const { data: existingChunk } = await supabase
              .from('law_chunks')
              .select('id')
              .eq('law_id', law.id)
              .single();

            if (!existingChunk) {
              // Criar novo chunk
              const { error: insertError } = await supabase
                .from('law_chunks')
                .insert({
                  law_id: law.id,
                  content: text,
                  embedding: embedding,
                  tokens: this.countTokens(text)
                });

              if (insertError) {
                console.error(`❌ Erro ao criar chunk para law ${law.id}:`, insertError);
              } else {
                console.log(`✅ Chunk criado para law ${law.id}`);
              }
            }
          }

          // Aguardar um pouco entre lotes
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Erro no lote ${Math.floor(i / this.batchSize) + 1}:`, error);
        }
      }

      console.log('🎉 Processamento de laws concluído!');

    } catch (error) {
      console.error('❌ Erro durante processamento:', error);
      throw error;
    }
  }

  /**
   * Conta tokens aproximadamente
   */
  private countTokens(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  /**
   * Processa todos os embeddings
   */
  async processAll(): Promise<void> {
    console.log('🚀 Iniciando processamento completo de embeddings...');
    
    try {
      await this.processLawChunks();
      await this.processLaws();
      console.log('🎉 Processamento completo concluído!');
    } catch (error) {
      console.error('❌ Erro durante processamento completo:', error);
      throw error;
    }
  }
}

/**
 * Busca semântica usando embeddings
 */
export class SemanticSearch {
  private embeddingsGenerator = new EmbeddingsGenerator();

  /**
   * Realiza busca semântica
   */
  async search(query: string, limit: number = 10): Promise<any[]> {
    try {
      console.log(`🔍 Realizando busca semântica para: "${query}"`);

      // Gerar embedding da query
      const queryEmbedding = await this.embeddingsGenerator.generateEmbedding(query);

      // Buscar chunks similares usando similaridade de cosseno
      const { data: results, error } = await supabase.rpc('search_chunks_by_similarity', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        console.error('Erro na busca semântica:', error);
        // Fallback para busca textual
        return await this.fallbackTextSearch(query, limit);
      }

      console.log(`✅ Encontrados ${results?.length || 0} resultados semânticos`);
      return results || [];

    } catch (error) {
      console.error('Erro na busca semântica:', error);
      // Fallback para busca textual
      return await this.fallbackTextSearch(query, limit);
    }
  }

  /**
   * Busca textual como fallback
   */
  private async fallbackTextSearch(query: string, limit: number): Promise<any[]> {
    console.log('🔄 Usando busca textual como fallback...');

    const { data: chunks, error } = await supabase
      .from('law_chunks')
      .select('id, content, law_id, laws(title)')
      .ilike('content', `%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Erro na busca textual:', error);
      return [];
    }

    return chunks?.map(chunk => ({
      ...chunk,
      similarity: 0.5 // Similaridade padrão para busca textual
    })) || [];
  }
}

/**
 * Função para executar processamento de embeddings
 */
export async function runEmbeddingsGeneration(): Promise<void> {
  const generator = new EmbeddingsGenerator();
  await generator.processAll();
}

