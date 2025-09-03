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
 * Popula o banco com conteúdo jurídico usando as tabelas existentes
 */
async function populateLegalContent(): Promise<void> {
  console.log('🚀 Iniciando população de conteúdo jurídico...');
  
  try {
    // 1. Limpar dados existentes
    await clearExistingData();
    
    // 2. Criar fontes (sources)
    await createSources();
    
    // 3. Criar leis principais
    await createMainLaws();
    
    // 4. Criar artigos da Constituição
    await createConstitutionArticles();
    
    // 5. Criar súmulas
    await createSumulas();
    
    // 6. Criar enunciados
    await createEnunciados();
    
    console.log('✅ População de conteúdo jurídico concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    throw error;
  }
}

/**
 * Limpa dados existentes
 */
async function clearExistingData(): Promise<void> {
  console.log('🧹 Limpando dados existentes...');
  
  // Limpar law_chunks relacionados ao conteúdo jurídico
  await supabase
    .from('law_chunks')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy
    
  // Limpar laws relacionadas
  await supabase
    .from('laws')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  console.log('✅ Dados existentes limpos');
}

/**
 * Cria fontes de dados
 */
async function createSources(): Promise<void> {
  console.log('📚 Criando fontes de dados...');
  
  const sources = [
    {
      id: 'planalto',
      name: 'Planalto - Presidência da República',
      url: 'http://www.planalto.gov.br/',
      type: 'oficial',
      description: 'Portal oficial da legislação brasileira'
    },
    {
      id: 'stf',
      name: 'Supremo Tribunal Federal',
      url: 'https://portal.stf.jus.br/',
      type: 'tribunal',
      description: 'Portal do STF com súmulas e jurisprudência'
    },
    {
      id: 'stj',
      name: 'Superior Tribunal de Justiça',
      url: 'https://www.stj.jus.br/',
      type: 'tribunal',
      description: 'Portal do STJ com súmulas e jurisprudência'
    }
  ];

  for (const source of sources) {
    const { error } = await supabase
      .from('sources')
      .upsert(source);

    if (error) {
      console.error(`❌ Erro ao criar fonte ${source.name}:`, error);
    } else {
      console.log(`✅ Fonte ${source.name} criada`);
    }
  }
}

/**
 * Cria leis principais
 */
async function createMainLaws(): Promise<void> {
  console.log('📖 Criando leis principais...');
  
  const laws = [
    {
      id: 'cf-1988',
      title: 'Constituição da República Federativa do Brasil de 1988',
      type: 'constituicao',
      year: 1988,
      source_id: 'planalto',
      url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      metadata: {
        publication_date: '1988-10-05',
        status: 'vigente',
        scope: 'federal'
      }
    },
    {
      id: 'cc-2002',
      title: 'Código Civil',
      type: 'codigo',
      year: 2002,
      source_id: 'planalto',
      url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm',
      metadata: {
        publication_date: '2002-01-10',
        law_number: '10.406',
        status: 'vigente'
      }
    },
    {
      id: 'cp-1940',
      title: 'Código Penal',
      type: 'codigo',
      year: 1940,
      source_id: 'planalto',
      url: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm',
      metadata: {
        publication_date: '1940-12-07',
        law_number: '2.848',
        status: 'vigente'
      }
    }
  ];

  for (const law of laws) {
    const { error } = await supabase
      .from('laws')
      .upsert(law);

    if (error) {
      console.error(`❌ Erro ao criar lei ${law.title}:`, error);
    } else {
      console.log(`✅ Lei ${law.title} criada`);
    }
  }
}

/**
 * Cria artigos da Constituição Federal
 */
async function createConstitutionArticles(): Promise<void> {
  console.log('🏛️ Criando artigos da Constituição Federal...');
  
  const articles = [
    {
      law_id: 'cf-1988',
      article_number: 'Art. 1º',
      title: 'Fundamentos da República Federativa do Brasil',
      content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
      keywords: ['soberania', 'cidadania', 'dignidade', 'democracia', 'fundamentos']
    },
    {
      law_id: 'cf-1988',
      article_number: 'Art. 2º',
      title: 'Separação dos Poderes',
      content: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
      keywords: ['separação', 'poderes', 'legislativo', 'executivo', 'judiciário']
    },
    {
      law_id: 'cf-1988',
      article_number: 'Art. 3º',
      title: 'Objetivos Fundamentais da República',
      content: 'Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.',
      keywords: ['objetivos', 'sociedade', 'desenvolvimento', 'igualdade', 'discriminação']
    },
    {
      law_id: 'cf-1988',
      article_number: 'Art. 5º',
      title: 'Direitos e Deveres Individuais e Coletivos',
      content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem...',
      keywords: ['direitos fundamentais', 'igualdade', 'liberdade', 'segurança', 'propriedade']
    },
    {
      law_id: 'cf-1988',
      article_number: 'Art. 18',
      title: 'Organização Político-Administrativa',
      content: 'A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos, nos termos desta Constituição.',
      keywords: ['federação', 'união', 'estados', 'municípios', 'autonomia']
    }
  ];

  for (const article of articles) {
    const { error } = await supabase
      .from('law_chunks')
      .upsert({
        law_id: article.law_id,
        chunk_index: parseInt(article.article_number.match(/\d+/)?.[0] || '0'),
        content: `${article.article_number} - ${article.title}\n\n${article.content}`,
        metadata: {
          article_number: article.article_number,
          title: article.title,
          type: 'article',
          keywords: article.keywords
        }
      });

    if (error) {
      console.error(`❌ Erro ao criar ${article.article_number}:`, error);
    } else {
      console.log(`✅ ${article.article_number} criado`);
    }
  }
}

/**
 * Cria súmulas
 */
async function createSumulas(): Promise<void> {
  console.log('⚖️ Criando súmulas...');
  
  const sumulas = [
    {
      law_id: 'stf-sumulas',
      number: 11,
      court: 'STF',
      type: 'vinculante',
      title: 'Uso de Algemas',
      content: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.',
      keywords: ['algemas', 'prisão', 'direitos', 'processo penal']
    },
    {
      law_id: 'stf-sumulas',
      number: 13,
      court: 'STF',
      type: 'vinculante',
      title: 'Nepotismo',
      content: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.',
      keywords: ['nepotismo', 'administração pública', 'nomeação', 'parentes']
    },
    {
      law_id: 'stf-sumulas',
      number: 473,
      court: 'STF',
      type: 'comum',
      title: 'Anulação e Revogação de Atos Administrativos',
      content: 'A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial.',
      keywords: ['atos administrativos', 'anulação', 'revogação', 'legalidade']
    },
    {
      law_id: 'stj-sumulas',
      number: 284,
      court: 'STJ',
      type: 'comum',
      title: 'SPC e SERASA',
      content: 'A inserção do nome do devedor no SPC e no SERASA constitui prática comercial lícita e exercício regular de direito.',
      keywords: ['SPC', 'SERASA', 'proteção ao crédito', 'direito comercial']
    },
    {
      law_id: 'stj-sumulas',
      number: 385,
      court: 'STJ',
      type: 'comum',
      title: 'Dano Moral e Inscrição Irregular',
      content: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento.',
      keywords: ['dano moral', 'cadastro', 'proteção ao crédito', 'indenização']
    }
  ];

  // Primeiro criar as "leis" para as súmulas
  await supabase.from('laws').upsert([
    {
      id: 'stf-sumulas',
      title: 'Súmulas do Supremo Tribunal Federal',
      type: 'sumulas',
      year: 2024,
      source_id: 'stf',
      url: 'https://portal.stf.jus.br/jurisprudencia/',
      metadata: { court: 'STF', type: 'collection' }
    },
    {
      id: 'stj-sumulas',
      title: 'Súmulas do Superior Tribunal de Justiça',
      type: 'sumulas',
      year: 2024,
      source_id: 'stj',
      url: 'https://www.stj.jus.br/',
      metadata: { court: 'STJ', type: 'collection' }
    }
  ]);

  for (const sumula of sumulas) {
    const { error } = await supabase
      .from('law_chunks')
      .upsert({
        law_id: sumula.law_id,
        chunk_index: sumula.number,
        content: `Súmula ${sumula.type === 'vinculante' ? 'Vinculante ' : ''}${sumula.number} ${sumula.court} - ${sumula.title}\n\n${sumula.content}`,
        metadata: {
          number: sumula.number,
          court: sumula.court,
          type: sumula.type,
          title: sumula.title,
          keywords: sumula.keywords,
          content_type: 'sumula'
        }
      });

    if (error) {
      console.error(`❌ Erro ao criar Súmula ${sumula.number} ${sumula.court}:`, error);
    } else {
      console.log(`✅ Súmula ${sumula.number} ${sumula.court} criada`);
    }
  }
}

/**
 * Cria enunciados
 */
async function createEnunciados(): Promise<void> {
  console.log('📋 Criando enunciados...');
  
  // Criar "lei" para enunciados
  await supabase.from('laws').upsert({
    id: 'cjf-enunciados',
    title: 'Enunciados do Conselho da Justiça Federal',
    type: 'enunciados',
    year: 2024,
    source_id: 'planalto',
    url: 'https://www.cjf.jus.br/',
    metadata: { organ: 'CJF', type: 'collection' }
  });

  const enunciados = [
    {
      number: 1,
      title: 'Dignidade da Pessoa Humana',
      content: 'A dignidade da pessoa humana na bioética não coincide com a santidade da vida.',
      keywords: ['dignidade', 'pessoa humana', 'bioética']
    },
    {
      number: 2,
      title: 'Direitos da Personalidade',
      content: 'A disposição gratuita do próprio corpo, no todo ou em parte, para depois da morte, com objetivo científico, ou altruístico, é cláusula geral de tutela e promoção da pessoa humana.',
      keywords: ['personalidade', 'corpo', 'doação', 'altruísmo']
    }
  ];

  for (const enunciado of enunciados) {
    const { error } = await supabase
      .from('law_chunks')
      .upsert({
        law_id: 'cjf-enunciados',
        chunk_index: enunciado.number,
        content: `Enunciado ${enunciado.number} CJF - ${enunciado.title}\n\n${enunciado.content}`,
        metadata: {
          number: enunciado.number,
          organ: 'CJF',
          title: enunciado.title,
          keywords: enunciado.keywords,
          content_type: 'enunciado'
        }
      });

    if (error) {
      console.error(`❌ Erro ao criar Enunciado ${enunciado.number}:`, error);
    } else {
      console.log(`✅ Enunciado ${enunciado.number} criado`);
    }
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await populateLegalContent();
    console.log('🎉 População concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

