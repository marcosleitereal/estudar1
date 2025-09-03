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
 * Verifica a estrutura das tabelas
 */
async function checkDatabaseStructure(): Promise<void> {
  console.log('🔍 Verificando estrutura do banco de dados...');
  
  const tables = ['sources', 'laws', 'law_chunks', 'sumulas', 'enunciados'];
  
  for (const table of tables) {
    console.log(`\n📋 Verificando tabela: ${table}`);
    
    try {
      // Tentar fazer uma query simples para ver a estrutura
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro ao acessar ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} existe e está acessível`);
        if (data && data.length > 0) {
          console.log(`📊 Colunas encontradas:`, Object.keys(data[0]));
        } else {
          console.log(`📊 Tabela ${table} está vazia`);
        }
      }
    } catch (err) {
      console.log(`❌ Erro inesperado ao acessar ${table}:`, err);
    }
  }
  
  // Verificar dados existentes
  console.log('\n📊 Verificando dados existentes...');
  
  try {
    const { data: sourcesData } = await supabase.from('sources').select('*');
    console.log(`📚 Sources: ${sourcesData?.length || 0} registros`);
    
    const { data: lawsData } = await supabase.from('laws').select('*');
    console.log(`📖 Laws: ${lawsData?.length || 0} registros`);
    
    const { data: chunksData } = await supabase.from('law_chunks').select('*');
    console.log(`📄 Law chunks: ${chunksData?.length || 0} registros`);
    
    const { data: sumulasData } = await supabase.from('sumulas').select('*');
    console.log(`⚖️ Súmulas: ${sumulasData?.length || 0} registros`);
    
    const { data: enunciadosData } = await supabase.from('enunciados').select('*');
    console.log(`📋 Enunciados: ${enunciadosData?.length || 0} registros`);
    
  } catch (error) {
    console.log('❌ Erro ao verificar dados:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await checkDatabaseStructure();
    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

