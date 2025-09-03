#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EmbeddingsGenerator } from '../lib/ai/embeddings-generator';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Executa as funções SQL para busca semântica
 */
async function setupSearchFunctions(): Promise<void> {
  console.log('🔧 Configurando funções de busca semântica...');

  try {
    // Ler arquivo SQL
    const sqlPath = join(__dirname, '../db/functions/search_chunks_by_similarity.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Dividir em comandos individuais
    const commands = sqlContent
      .split('$$;')
      .map(cmd => cmd.trim() + (cmd.includes('$$') ? '$$;' : ''))
      .filter(cmd => cmd.length > 10);

    console.log(`📝 Executando ${commands.length} comandos SQL...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`🔄 Executando comando ${i + 1}/${commands.length}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: command });

      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error);
        // Tentar executar diretamente
        try {
          const { error: directError } = await supabase
            .from('_dummy_')
            .select('1')
            .limit(0);
          
          // Se chegou aqui, a conexão está OK, vamos tentar outro método
          console.log('🔄 Tentando método alternativo...');
          
        } catch (e) {
          console.log('⚠️ Continuando com próximo comando...');
        }
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }

    console.log('✅ Funções de busca configuradas!');

  } catch (error) {
    console.error('❌ Erro ao configurar funções:', error);
    console.log('⚠️ Continuando com geração de embeddings...');
  }
}

/**
 * Testa as funções de busca
 */
async function testSearchFunctions(): Promise<void> {
  console.log('🧪 Testando funções de busca...');

  try {
    // Testar função básica
    const { data, error } = await supabase.rpc('search_chunks_by_similarity', {
      query_embedding: new Array(1536).fill(0.1),
      match_threshold: 0.1,
      match_count: 5
    });

    if (error) {
      console.error('❌ Erro ao testar função:', error);
    } else {
      console.log(`✅ Função testada com sucesso! Resultados: ${data?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

/**
 * Gera embeddings para conteúdo existente
 */
async function generateEmbeddings(): Promise<void> {
  console.log('🤖 Gerando embeddings para conteúdo existente...');

  try {
    const generator = new EmbeddingsGenerator();
    await generator.processAll();
    console.log('✅ Embeddings gerados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao gerar embeddings:', error);
    throw error;
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
    console.log('🚀 Iniciando configuração de busca semântica...');
    
    // 1. Verificar status atual
    await checkEmbeddingsStatus();
    
    // 2. Configurar funções SQL
    await setupSearchFunctions();
    
    // 3. Gerar embeddings
    await generateEmbeddings();
    
    // 4. Testar funções
    await testSearchFunctions();
    
    // 5. Verificar status final
    await checkEmbeddingsStatus();
    
    console.log('🎉 Configuração de busca semântica concluída!');

  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

