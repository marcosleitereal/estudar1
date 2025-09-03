#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gera embedding mock para teste
 */
function generateMockEmbedding(): number[] {
  // Gerar embedding mock de 1536 dimensões (mesmo tamanho do OpenAI)
  const embedding = [];
  for (let i = 0; i < 1536; i++) {
    embedding.push(Math.random() * 2 - 1); // Valores entre -1 e 1
  }
  return embedding;
}

/**
 * Testa a adição de embeddings mock
 */
async function testMockEmbeddings(): Promise<void> {
  console.log('🧪 Testando embeddings mock...');

  try {
    // Buscar chunks sem embeddings
    const { data: chunks, error } = await supabase
      .from('law_chunks')
      .select('id, content')
      .is('embedding', null)
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar chunks:', error);
      return;
    }

    if (!chunks || chunks.length === 0) {
      console.log('✅ Todos os chunks já possuem embeddings');
      return;
    }

    console.log(`📄 Processando ${chunks.length} chunks com embeddings mock...`);

    for (const chunk of chunks) {
      const mockEmbedding = generateMockEmbedding();
      
      const { error: updateError } = await supabase
        .from('law_chunks')
        .update({ 
          embedding: mockEmbedding,
          tokens: Math.ceil((chunk.content?.length || 0) / 4)
        })
        .eq('id', chunk.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar chunk ${chunk.id}:`, updateError);
      } else {
        console.log(`✅ Chunk ${chunk.id} atualizado com embedding mock`);
      }
    }

    console.log('🎉 Embeddings mock adicionados com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

/**
 * Testa busca por similaridade mock
 */
async function testMockSimilaritySearch(): Promise<void> {
  console.log('🔍 Testando busca por similaridade mock...');

  try {
    // Gerar embedding de query mock
    const queryEmbedding = generateMockEmbedding();

    // Buscar chunks com embeddings
    const { data: chunks, error } = await supabase
      .from('law_chunks')
      .select('id, content, embedding')
      .not('embedding', 'is', null)
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar chunks:', error);
      return;
    }

    if (!chunks || chunks.length === 0) {
      console.log('⚠️ Nenhum chunk com embedding encontrado');
      return;
    }

    console.log(`📊 Encontrados ${chunks.length} chunks com embeddings`);

    // Calcular similaridade mock (produto escalar simples)
    const results = chunks.map(chunk => {
      const embedding = chunk.embedding as number[];
      let similarity = 0;
      
      if (embedding && embedding.length === queryEmbedding.length) {
        // Produto escalar simples
        for (let i = 0; i < Math.min(100, embedding.length); i++) {
          similarity += embedding[i] * queryEmbedding[i];
        }
        similarity = Math.abs(similarity) / 100; // Normalizar
      }

      return {
        id: chunk.id,
        content: chunk.content?.substring(0, 100) + '...',
        similarity: similarity
      };
    });

    // Ordenar por similaridade
    results.sort((a, b) => b.similarity - a.similarity);

    console.log('🏆 Top 3 resultados por similaridade:');
    results.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i + 1}. Similaridade: ${result.similarity.toFixed(3)}`);
      console.log(`     Conteúdo: ${result.content}`);
    });

  } catch (error) {
    console.error('❌ Erro durante busca:', error);
  }
}

/**
 * Verifica status dos embeddings
 */
async function checkEmbeddingsStatus(): Promise<void> {
  console.log('📊 Verificando status dos embeddings...');

  try {
    // Contar chunks com embeddings
    const { count: chunksWithEmbeddings, error: chunksError } = await supabase
      .from('law_chunks')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (chunksError) {
      console.error('❌ Erro ao contar chunks com embeddings:', chunksError);
    } else {
      console.log(`📄 Chunks com embeddings: ${chunksWithEmbeddings || 0}`);
    }

    // Contar total de chunks
    const { count: totalChunks, error: totalError } = await supabase
      .from('law_chunks')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ Erro ao contar total de chunks:', totalError);
    } else {
      console.log(`📄 Total de chunks: ${totalChunks || 0}`);
    }

    // Calcular porcentagem
    if (totalChunks && chunksWithEmbeddings) {
      const percentage = Math.round((chunksWithEmbeddings / totalChunks) * 100);
      console.log(`📈 Progresso: ${percentage}% dos chunks possuem embeddings`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Iniciando teste de embeddings mock...');
    
    // 1. Verificar status atual
    await checkEmbeddingsStatus();
    
    // 2. Adicionar embeddings mock
    await testMockEmbeddings();
    
    // 3. Testar busca por similaridade
    await testMockSimilaritySearch();
    
    // 4. Verificar status final
    await checkEmbeddingsStatus();
    
    console.log('🎉 Teste de embeddings mock concluído!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

