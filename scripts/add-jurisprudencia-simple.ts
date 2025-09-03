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
 * Adiciona jurisprudência usando a estrutura existente
 */
async function adicionarJurisprudencia(): Promise<void> {
  console.log('🚀 Adicionando jurisprudência...');
  
  try {
    // Primeiro, criar uma fonte para jurisprudência
    const { data: fonte, error: fonteError } = await supabase
      .from('sources')
      .upsert({
        name: 'Jurisprudencia dos Tribunais Superiores',
        type: 'jurisprudence',
        url: 'https://jurisprudencia.stf.jus.br/',
        description: 'Coletanea de jurisprudencia do STF e STJ'
      })
      .select('id')
      .single();

    if (fonteError) {
      console.error('❌ Erro ao criar fonte:', fonteError);
      return;
    }

    console.log(`✅ Fonte criada: ${fonte.id}`);

    // Criar uma "lei" para jurisprudência
    const { data: lei, error: leiError } = await supabase
      .from('laws')
      .upsert({
        source_id: fonte.id,
        title: 'Jurisprudência STF e STJ',
        content: 'Coletânea de decisões dos tribunais superiores',
        hierarchy_level: 1
      })
      .select('id')
      .single();

    if (leiError) {
      console.error('❌ Erro ao criar lei:', leiError);
      return;
    }

    console.log(`✅ Lei criada: ${lei.id}`);

    // Adicionar jurisprudência como law_chunks
    const jurisprudencias = [
      {
        law_id: lei.id,
        ref: 'STF ADI 4277',
        content: 'ADI 4277 - ARGUIÇÃO DE DESCUMPRIMENTO DE PRECEITO FUNDAMENTAL (ADPF). UNIÃO HOMOAFETIVA E SEU RECONHECIMENTO COMO INSTITUTO JURÍDICO. Rel. Min. Ayres Britto. Julgamento: 05/05/2011. Encampação da jurisprudência do Tribunal no sentido da possibilidade de reconhecimento de união estável entre pessoas do mesmo sexo como entidade familiar.'
      },
      {
        law_id: lei.id,
        ref: 'STF RE 898450',
        content: 'RE 898450 - RECURSO EXTRAORDINÁRIO. DIREITO CONSTITUCIONAL E TRIBUTÁRIO. LEGITIMIDADE DA COBRANÇA DE CONTRIBUIÇÃO PREVIDENCIÁRIA DE SERVIDORES PÚBLICOS INATIVOS E PENSIONISTAS. Rel. Min. Luiz Fux. Julgamento: 13/08/2020. Constitucionalidade da cobrança de contribuição previdenciária de servidores públicos inativos e pensionistas, nos termos da EC 41/2003.'
      },
      {
        law_id: lei.id,
        ref: 'STJ REsp 1.657.156',
        content: 'REsp 1.657.156 - DIREITO CIVIL. RESPONSABILIDADE CIVIL. DANO MORAL. INSCRIÇÃO INDEVIDA EM ÓRGÃO DE PROTEÇÃO AO CRÉDITO. Rel. Min. Nancy Andrighi. Julgamento: 15/05/2018. A fixação do valor da indenização por dano moral deve observar os princípios da proporcionalidade e razoabilidade, considerando a gravidade da ofensa, a condição econômica das partes e o caráter pedagógico da sanção.'
      },
      {
        law_id: lei.id,
        ref: 'STJ AgInt no REsp 1.896.175',
        content: 'AgInt no REsp 1.896.175 - PROCESSUAL CIVIL. EXECUÇÃO FISCAL. PENHORA. BEM DE FAMÍLIA. IMPENHORABILIDADE. Rel. Min. Marco Aurélio Bellizze. Julgamento: 23/03/2021. O bem de família é impenhorável, nos termos da Lei nº 8.009/90, não se aplicando a exceção prevista no art. 3º, IV, da referida lei aos créditos tributários.'
      }
    ];

    for (const juris of jurisprudencias) {
      const { error } = await supabase
        .from('law_chunks')
        .upsert(juris);

      if (error) {
        console.error(`❌ Erro ao salvar ${juris.ref}:`, error);
      } else {
        console.log(`✅ ${juris.ref} salvo`);
      }
    }

    console.log('✅ Jurisprudência adicionada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a adição:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await adicionarJurisprudencia();
    console.log('🎉 Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

