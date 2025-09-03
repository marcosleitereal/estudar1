#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dados jurídicos a serem populados
const legalData = {
  laws: [
    { title: 'Constituição Federal', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 250 },
    { title: 'Código Civil', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 2046 },
    { title: 'Código Penal', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 361 },
    { title: 'Código de Processo Civil', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 1072 },
    { title: 'Código de Processo Penal', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 811 },
    { title: 'Código de Defesa do Consumidor', source_id: '2e8b6399-1d2e-4a2e-92c1-f455817763fe', total_articles: 119 },
  ],
  jurisprudence: [
    { law_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', content: 'STF - RE 123456/SP - Rel. Min. Fulano de Tal - Julgamento: 01/01/2025' },
    { law_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', content: 'STJ - REsp 654321/RJ - Rel. Min. Ciclano de Tal - Julgamento: 02/02/2025' },
  ]
};

/**
 * Popular dados jurídicos completos
 */
async function populateFullLegalData(): Promise<void> {
  console.log('⚖️ Iniciando população de dados jurídicos completos...');

  try {
    // Popular leis
    console.log('📚 Populando leis...');
    for (const law of legalData.laws) {
      const { data, error } = await supabase
        .from('laws')
        .upsert(law, { onConflict: 'title' });

      if (error) {
        console.error(`❌ Erro ao popular lei "${law.title}":`, error);
      } else {
        console.log(`✅ Lei "${law.title}" populada com sucesso`);
      }
    }

    // Popular jurisprudência
    console.log('⚖️ Populando jurisprudência...');
    for (const juris of legalData.jurisprudence) {
      const { data, error } = await supabase
        .from('law_chunks')
        .insert(juris);

      if (error) {
        console.error('❌ Erro ao popular jurisprudência:', error);
      } else {
        console.log('✅ Jurisprudência populada com sucesso');
      }
    }

    console.log('🎉 População de dados jurídicos concluída!');

  } catch (error) {
    console.error('❌ Erro durante população:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await populateFullLegalData();
  } catch (error) {
    console.error('❌ Erro na execução:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

