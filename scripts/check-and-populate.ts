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

/**
 * Verificar estrutura das tabelas
 */
async function checkTableStructure(): Promise<void> {
  console.log('🔍 Verificando estrutura das tabelas...');

  try {
    // Verificar tabela laws
    const { data: lawsData, error: lawsError } = await supabase
      .from('laws')
      .select('*')
      .limit(1);

    if (lawsError) {
      console.error('❌ Erro ao verificar tabela laws:', lawsError);
    } else {
      console.log('✅ Estrutura da tabela laws:');
      if (lawsData && lawsData.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(lawsData[0]));
      } else {
        console.log('📋 Tabela laws vazia, verificando com insert de teste...');
      }
    }

    // Verificar tabela law_chunks
    const { data: chunksData, error: chunksError } = await supabase
      .from('law_chunks')
      .select('*')
      .limit(1);

    if (chunksError) {
      console.error('❌ Erro ao verificar tabela law_chunks:', chunksError);
    } else {
      console.log('✅ Estrutura da tabela law_chunks:');
      if (chunksData && chunksData.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(chunksData[0]));
      } else {
        console.log('📋 Tabela law_chunks vazia');
      }
    }

    // Verificar tabela sources
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('sources')
      .select('*');

    if (sourcesError) {
      console.error('❌ Erro ao verificar tabela sources:', sourcesError);
    } else {
      console.log('✅ Sources disponíveis:');
      sourcesData?.forEach(source => {
        console.log(`  - ${source.id}: ${source.name} (${source.type})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

/**
 * Popular dados jurídicos com estrutura correta
 */
async function populateCorrectData(): Promise<void> {
  console.log('📚 Populando dados jurídicos com estrutura correta...');

  try {
    // Buscar source_id da Constituição
    const { data: sources } = await supabase
      .from('sources')
      .select('id, name')
      .limit(5);

    const constitutionSource = sources?.find(s => s.name.includes('Constituicao')) || sources?.[0];
    const jurisprudenceSource = sources?.find(s => s.name.includes('Jurisprudencia')) || sources?.[1];

    if (!constitutionSource) {
      console.error('❌ Nenhuma fonte encontrada');
      return;
    }

    console.log(`📖 Usando fonte: ${constitutionSource.name} (${constitutionSource.id})`);

    // Dados das leis principais (estrutura simplificada)
    const lawsToInsert = [
      {
        title: 'Constituição Federal de 1988',
        description: 'Constituição da República Federativa do Brasil de 1988',
        source_id: constitutionSource.id,
        year: 1988,
        status: 'active'
      },
      {
        title: 'Código Civil Brasileiro',
        description: 'Lei nº 10.406, de 10 de janeiro de 2002',
        source_id: constitutionSource.id,
        year: 2002,
        status: 'active'
      },
      {
        title: 'Código Penal Brasileiro',
        description: 'Decreto-Lei nº 2.848, de 7 de dezembro de 1940',
        source_id: constitutionSource.id,
        year: 1940,
        status: 'active'
      },
      {
        title: 'Código de Processo Civil',
        description: 'Lei nº 13.105, de 16 de março de 2015',
        source_id: constitutionSource.id,
        year: 2015,
        status: 'active'
      },
      {
        title: 'Código de Processo Penal',
        description: 'Decreto-Lei nº 3.689, de 3 de outubro de 1941',
        source_id: constitutionSource.id,
        year: 1941,
        status: 'active'
      },
      {
        title: 'Código de Defesa do Consumidor',
        description: 'Lei nº 8.078, de 11 de setembro de 1990',
        source_id: constitutionSource.id,
        year: 1990,
        status: 'active'
      }
    ];

    // Inserir leis
    for (const law of lawsToInsert) {
      const { data, error } = await supabase
        .from('laws')
        .upsert(law, { onConflict: 'title' })
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao inserir lei "${law.title}":`, error);
      } else {
        console.log(`✅ Lei "${law.title}" inserida com sucesso (ID: ${data.id})`);

        // Inserir alguns chunks de exemplo para cada lei
        const chunks = [
          {
            law_id: data.id,
            content: `Art. 1º - ${law.title} - Disposições gerais sobre ${law.description}`,
            article_number: 1,
            chapter: 'Disposições Gerais',
            embedding: null
          },
          {
            law_id: data.id,
            content: `Art. 2º - ${law.title} - Princípios fundamentais aplicáveis`,
            article_number: 2,
            chapter: 'Princípios Fundamentais',
            embedding: null
          }
        ];

        for (const chunk of chunks) {
          const { error: chunkError } = await supabase
            .from('law_chunks')
            .insert(chunk);

          if (chunkError) {
            console.warn(`⚠️ Erro ao inserir chunk para "${law.title}":`, chunkError);
          } else {
            console.log(`  ✅ Chunk inserido para "${law.title}"`);
          }
        }
      }
    }

    // Inserir jurisprudência adicional
    if (jurisprudenceSource) {
      console.log('⚖️ Inserindo jurisprudência adicional...');

      const jurisprudenceData = [
        {
          title: 'STF - ADI 4277 - União Homoafetiva',
          description: 'Ação Direta de Inconstitucionalidade sobre união homoafetiva',
          source_id: jurisprudenceSource.id,
          year: 2011,
          status: 'active'
        },
        {
          title: 'STJ - REsp 1.657.156 - Dano Moral',
          description: 'Recurso Especial sobre dano moral e responsabilidade civil',
          source_id: jurisprudenceSource.id,
          year: 2020,
          status: 'active'
        }
      ];

      for (const juris of jurisprudenceData) {
        const { data, error } = await supabase
          .from('laws')
          .upsert(juris, { onConflict: 'title' })
          .select()
          .single();

        if (error) {
          console.error(`❌ Erro ao inserir jurisprudência "${juris.title}":`, error);
        } else {
          console.log(`✅ Jurisprudência "${juris.title}" inserida`);

          // Inserir conteúdo da jurisprudência
          const { error: chunkError } = await supabase
            .from('law_chunks')
            .insert({
              law_id: data.id,
              content: `${juris.title} - ${juris.description}. Decisão proferida pelo tribunal superior.`,
              article_number: 1,
              chapter: 'Decisão',
              embedding: null
            });

          if (chunkError) {
            console.warn(`⚠️ Erro ao inserir conteúdo da jurisprudência:`, chunkError);
          }
        }
      }
    }

    console.log('🎉 População de dados concluída!');

  } catch (error) {
    console.error('❌ Erro durante população:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Verificando e populando dados jurídicos...');
    console.log('');
    
    await checkTableStructure();
    console.log('');
    await populateCorrectData();
    
    console.log('');
    console.log('✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro na execução:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

