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
 * Popular dados jurídicos com estrutura correta
 */
async function populateFinalLegalData(): Promise<void> {
  console.log('⚖️ Populando dados jurídicos finais...');

  try {
    // Buscar source_id
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

    console.log(`📖 Usando fonte: ${constitutionSource.name}`);

    // Dados das leis com estrutura correta (baseado nas colunas reais)
    const lawsToInsert = [
      {
        source_id: constitutionSource.id,
        title: 'Constituição Federal de 1988',
        number: 'CF/88',
        article: 'Preâmbulo',
        content: 'Nós, representantes do povo brasileiro, reunidos em Assembleia Nacional Constituinte...',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Código Civil',
        number: 'Lei 10.406/2002',
        article: 'Art. 1º',
        content: 'Toda pessoa é capaz de direitos e deveres na ordem civil.',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Código Penal',
        number: 'Decreto-Lei 2.848/1940',
        article: 'Art. 1º',
        content: 'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Código de Processo Civil',
        number: 'Lei 13.105/2015',
        article: 'Art. 1º',
        content: 'O processo civil será ordenado, disciplinado e interpretado conforme os valores e as normas fundamentais estabelecidos na Constituição da República Federativa do Brasil.',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Código de Processo Penal',
        number: 'Decreto-Lei 3.689/1941',
        article: 'Art. 1º',
        content: 'O processo penal reger-se-á, em todo o território brasileiro, por este Código.',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Código de Defesa do Consumidor',
        number: 'Lei 8.078/1990',
        article: 'Art. 1º',
        content: 'O presente código estabelece normas de proteção e defesa do consumidor.',
        hierarchy_level: 1,
        order_index: 1
      }
    ];

    // Inserir leis
    for (const law of lawsToInsert) {
      const { data, error } = await supabase
        .from('laws')
        .insert(law)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao inserir lei "${law.title}":`, error);
      } else {
        console.log(`✅ Lei "${law.title}" inserida com sucesso`);

        // Inserir chunk correspondente
        const { error: chunkError } = await supabase
          .from('law_chunks')
          .insert({
            law_id: data.id,
            content: `${law.title} - ${law.article}: ${law.content}`,
            metadata: {
              law_title: law.title,
              article: law.article,
              number: law.number
            }
          });

        if (chunkError) {
          console.warn(`⚠️ Erro ao inserir chunk:`, chunkError);
        } else {
          console.log(`  ✅ Chunk inserido para "${law.title}"`);
        }
      }
    }

    // Inserir mais artigos da Constituição
    console.log('📜 Inserindo artigos constitucionais...');
    
    const constitutionalArticles = [
      {
        source_id: constitutionSource.id,
        title: 'Constituição Federal de 1988',
        number: 'CF/88',
        article: 'Art. 1º',
        content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito.',
        hierarchy_level: 2,
        order_index: 1
      },
      {
        source_id: constitutionSource.id,
        title: 'Constituição Federal de 1988',
        number: 'CF/88',
        article: 'Art. 5º',
        content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
        hierarchy_level: 2,
        order_index: 5
      },
      {
        source_id: constitutionSource.id,
        title: 'Constituição Federal de 1988',
        number: 'CF/88',
        article: 'Art. 18',
        content: 'A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos.',
        hierarchy_level: 2,
        order_index: 18
      }
    ];

    for (const article of constitutionalArticles) {
      const { data, error } = await supabase
        .from('laws')
        .insert(article)
        .select()
        .single();

      if (error) {
        console.warn(`⚠️ Erro ao inserir artigo ${article.article}:`, error);
      } else {
        console.log(`✅ Artigo ${article.article} inserido`);

        // Inserir chunk
        await supabase
          .from('law_chunks')
          .insert({
            law_id: data.id,
            content: `${article.article} - ${article.content}`,
            metadata: {
              law_title: article.title,
              article: article.article,
              number: article.number
            }
          });
      }
    }

    // Inserir jurisprudência se fonte disponível
    if (jurisprudenceSource) {
      console.log('⚖️ Inserindo jurisprudência...');

      const jurisprudenceItems = [
        {
          source_id: jurisprudenceSource.id,
          title: 'STF - ADI 4277',
          number: 'ADI 4277',
          article: 'Decisão',
          content: 'UNIÃO HOMOAFETIVA. RECONHECIMENTO. Ante a possibilidade de interpretação em sentido preconceituoso ou discriminatório do art. 1.723 do Código Civil, não resolúvel à luz dele próprio, faz-se necessária a utilização da técnica de "interpretação conforme à Constituição".',
          hierarchy_level: 1,
          order_index: 1
        },
        {
          source_id: jurisprudenceSource.id,
          title: 'STJ - REsp 1.657.156',
          number: 'REsp 1.657.156',
          article: 'Acórdão',
          content: 'RESPONSABILIDADE CIVIL. DANO MORAL. A reparação do dano moral tem dupla finalidade: compensatória, para a vítima, e pedagógica, para o ofensor.',
          hierarchy_level: 1,
          order_index: 1
        }
      ];

      for (const juris of jurisprudenceItems) {
        const { data, error } = await supabase
          .from('laws')
          .insert(juris)
          .select()
          .single();

        if (error) {
          console.warn(`⚠️ Erro ao inserir jurisprudência ${juris.title}:`, error);
        } else {
          console.log(`✅ Jurisprudência ${juris.title} inserida`);

          // Inserir chunk
          await supabase
            .from('law_chunks')
            .insert({
              law_id: data.id,
              content: `${juris.title} - ${juris.content}`,
              metadata: {
                court: juris.title.includes('STF') ? 'STF' : 'STJ',
                number: juris.number,
                type: 'jurisprudence'
              }
            });
        }
      }
    }

    console.log('🎉 População de dados jurídicos concluída!');

    // Verificar resultado final
    const { count: lawsCount } = await supabase
      .from('laws')
      .select('*', { count: 'exact', head: true });

    const { count: chunksCount } = await supabase
      .from('law_chunks')
      .select('*', { count: 'exact', head: true });

    console.log('');
    console.log('📊 Resultado final:');
    console.log(`📚 Total de leis: ${lawsCount || 0}`);
    console.log(`📄 Total de chunks: ${chunksCount || 0}`);

    if ((lawsCount || 0) >= 10 && (chunksCount || 0) >= 10) {
      console.log('✅ Dados jurídicos: COMPLETOS');
    } else {
      console.log('⚠️ Dados jurídicos: Básicos inseridos, pode expandir mais');
    }

  } catch (error) {
    console.error('❌ Erro durante população:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Populando dados jurídicos finais...');
    console.log('');
    
    await populateFinalLegalData();
    
    console.log('');
    console.log('✅ Processo concluído!');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('1. Testar busca na plataforma');
    console.log('2. Verificar se os dados aparecem nos resultados');
    console.log('3. Testar criação de flashcards');
    console.log('4. Verificar sistema de quiz');

  } catch (error) {
    console.error('❌ Erro na execução:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

