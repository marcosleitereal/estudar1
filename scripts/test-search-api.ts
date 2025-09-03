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
 * Testa a API de busca
 */
async function testarBusca(): Promise<void> {
  console.log('🔍 Testando API de busca...');
  
  try {
    // Testar busca simples por texto
    console.log('\n📝 Testando busca por texto simples...');
    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('*')
      .ilike('content', '%STF%')
      .limit(5);
    
    if (chunksError) {
      console.error('❌ Erro na busca por chunks:', chunksError);
    } else {
      console.log(`✅ Encontrados ${chunks.length} chunks com STF`);
      chunks.forEach((chunk, i) => {
        console.log(`  ${i + 1}. ${chunk.content?.substring(0, 100)}...`);
      });
    }
    
    // Testar busca em laws
    console.log('\n📚 Testando busca em laws...');
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('*')
      .ilike('content', '%constituição%')
      .limit(5);
    
    if (lawsError) {
      console.error('❌ Erro na busca por laws:', lawsError);
    } else {
      console.log(`✅ Encontradas ${laws.length} laws com constituição`);
      laws.forEach((law, i) => {
        console.log(`  ${i + 1}. ${law.title} - ${law.content?.substring(0, 100)}...`);
      });
    }
    
    // Testar API de busca via HTTP
    console.log('\n🌐 Testando API de busca via HTTP...');
    const response = await fetch('http://localhost:3002/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'STF ADI 4277',
        limit: 5
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de busca funcionando');
      console.log('📊 Resultados:', data.results?.length || 0);
      if (data.results && data.results.length > 0) {
        data.results.forEach((result: any, i: number) => {
          console.log(`  ${i + 1}. ${result.content?.substring(0, 100)}...`);
        });
      }
    } else {
      console.error('❌ Erro na API de busca:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await testarBusca();
    console.log('\n🎉 Teste concluído!');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

