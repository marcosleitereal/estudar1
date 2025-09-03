#!/usr/bin/env npx tsx

import { runJurisprudenciaImport } from '../lib/importers/jurisprudencia-scraper';

/**
 * Script para importar jurisprudência dos tribunais superiores
 */
async function main(): Promise<void> {
  console.log('🚀 Iniciando importação de jurisprudência...');
  
  try {
    await runJurisprudenciaImport();
    console.log('🎉 Importação de jurisprudência concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

