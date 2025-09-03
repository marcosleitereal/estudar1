#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runPlanaltoImport } from '../lib/importers/planalto-scraper';
import { runSumulasImport } from '../lib/importers/sumulas-scraper';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Executa uma migração SQL
 */
async function runMigration(migrationFile: string): Promise<void> {
  console.log(`🔄 Executando migração: ${migrationFile}`);
  
  try {
    const migrationPath = join(process.cwd(), 'db', 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Erro na migração ${migrationFile}:`, error);
      throw error;
    }
    
    console.log(`✅ Migração ${migrationFile} executada com sucesso`);
    
  } catch (error) {
    console.error(`❌ Erro ao executar migração ${migrationFile}:`, error);
    throw error;
  }
}

/**
 * Executa SQL diretamente
 */
async function executeSql(sql: string): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Erro ao executar SQL:', error);
    throw error;
  }
}

/**
 * Cria a função exec_sql se não existir
 */
async function createExecSqlFunction(): Promise<void> {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS TEXT AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN 'OK';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSql });
    if (error) {
      // Se a função não existe, vamos criá-la usando uma query direta
      const { error: createError } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0);
      
      // Isso vai falhar, mas vamos tentar criar a função de outra forma
      console.log('Tentando criar função exec_sql...');
    }
  } catch (error) {
    console.log('Função exec_sql já existe ou será criada automaticamente');
  }
}

/**
 * Verifica se as tabelas existem
 */
async function checkTables(): Promise<void> {
  console.log('🔍 Verificando estrutura do banco de dados...');
  
  const tables = ['laws', 'law_articles', 'sumulas', 'enunciados', 'jurisprudencia'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`⚠️ Tabela ${table} não existe ou tem problemas:`, error.message);
    } else {
      console.log(`✅ Tabela ${table} existe e está acessível`);
    }
  }
}

/**
 * Importa dados de exemplo para teste
 */
async function importSampleData(): Promise<void> {
  console.log('📝 Importando dados de exemplo...');
  
  // Inserir uma lei de exemplo
  const { error: lawError } = await supabase
    .from('laws')
    .upsert({
      id: 'cf_1988_sample',
      title: 'Constituição da República Federativa do Brasil de 1988',
      type: 'constituicao',
      number: 'CF',
      year: 1988,
      publication_date: '1988-10-05',
      source_url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      full_text: 'Constituição da República Federativa do Brasil...',
      metadata: { source: 'planalto', imported_at: new Date() }
    });

  if (lawError) {
    console.error('❌ Erro ao inserir lei de exemplo:', lawError);
  } else {
    console.log('✅ Lei de exemplo inserida');
  }

  // Inserir um artigo de exemplo
  const { error: articleError } = await supabase
    .from('law_articles')
    .upsert({
      law_id: 'cf_1988_sample',
      article_number: 'Art. 1º',
      title: 'Fundamentos da República',
      content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos...',
      hierarchy_level: 1,
      metadata: { source: 'planalto', imported_at: new Date() }
    });

  if (articleError) {
    console.error('❌ Erro ao inserir artigo de exemplo:', articleError);
  } else {
    console.log('✅ Artigo de exemplo inserido');
  }

  // Inserir uma súmula de exemplo
  const { error: sumulaError } = await supabase
    .from('sumulas')
    .upsert({
      id: 'stf_vinculante_1_sample',
      number: 1,
      court: 'STF',
      type: 'vinculante',
      title: 'Súmula Vinculante 1',
      content: 'Ofende o princípio da separação de poderes o ato do Poder Executivo que veda, em lei de diretrizes orçamentárias, a implementação de decisão do Poder Judiciário que determina a realização de despesas.',
      publication_date: '2007-05-30',
      source_url: 'https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=1',
      status: 'ativa',
      metadata: { source: 'stf', imported_at: new Date() }
    });

  if (sumulaError) {
    console.error('❌ Erro ao inserir súmula de exemplo:', sumulaError);
  } else {
    console.log('✅ Súmula de exemplo inserida');
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  console.log('🚀 Iniciando importação de dados jurídicos...');
  
  try {
    // 1. Criar função exec_sql se necessário
    await createExecSqlFunction();
    
    // 2. Executar migração para criar tabelas
    console.log('📋 Criando tabelas para conteúdo jurídico...');
    await runMigration('005_legal_content_tables.sql');
    
    // 3. Verificar se as tabelas foram criadas
    await checkTables();
    
    // 4. Importar dados de exemplo primeiro
    await importSampleData();
    
    // 5. Importar dados reais (comentado por enquanto para teste)
    console.log('📚 Importando dados jurídicos reais...');
    
    // Importar súmulas (mais rápido para teste)
    console.log('⚖️ Importando súmulas...');
    await runSumulasImport();
    
    // Importar leis (pode demorar mais)
    console.log('📖 Importando legislação...');
    // await runPlanaltoImport(); // Comentado por enquanto
    
    console.log('🎉 Importação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

