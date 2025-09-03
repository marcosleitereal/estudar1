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
    // 1. Criar fontes (sources)
    await createSources();
    
    // 2. Criar leis principais
    await createMainLaws();
    
    // 3. Criar artigos da Constituição
    await createConstitutionArticles();
    
    // 4. Criar súmulas
    await createSumulas();
    
    // 5. Criar enunciados
    await createEnunciados();
    
    console.log('✅ População de conteúdo jurídico concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    throw error;
  }
}

/**
 * Cria fontes de dados
 */
async function createSources(): Promise<void> {
  console.log('📚 Criando fontes de dados...');
  
  const sources = [
    {
      kind: 'constituição',
      title: 'Constituição da República Federativa do Brasil de 1988',
      org: 'Planalto',
      year: 1988,
      url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      version_label: 'Texto consolidado'
    },
    {
      kind: 'código',
      title: 'Código Civil',
      org: 'Planalto',
      year: 2002,
      url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm',
      version_label: 'Lei nº 10.406/2002'
    },
    {
      kind: 'código',
      title: 'Código Penal',
      org: 'Planalto',
      year: 1940,
      url: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm',
      version_label: 'Decreto-Lei nº 2.848/1940'
    },
    {
      kind: 'súmula',
      title: 'Súmulas do Supremo Tribunal Federal',
      org: 'STF',
      year: 2024,
      url: 'https://portal.stf.jus.br/jurisprudencia/',
      version_label: 'Coletânea atualizada'
    },
    {
      kind: 'súmula',
      title: 'Súmulas do Superior Tribunal de Justiça',
      org: 'STJ',
      year: 2024,
      url: 'https://www.stj.jus.br/',
      version_label: 'Coletânea atualizada'
    },
    {
      kind: 'enunciado',
      title: 'Enunciados do Conselho da Justiça Federal',
      org: 'CJF',
      year: 2024,
      url: 'https://www.cjf.jus.br/',
      version_label: 'Jornadas de Direito Civil'
    }
  ];

  for (const source of sources) {
    const { data, error } = await supabase
      .from('sources')
      .upsert(source)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Erro ao criar fonte ${source.title}:`, error);
    } else {
      console.log(`✅ Fonte ${source.title} criada com ID: ${data.id}`);
      // Armazenar IDs para uso posterior
      if (source.kind === 'constituição') {
        (global as any).cfSourceId = data.id;
      } else if (source.kind === 'código' && source.title.includes('Civil')) {
        (global as any).ccSourceId = data.id;
      } else if (source.kind === 'código' && source.title.includes('Penal')) {
        (global as any).cpSourceId = data.id;
      } else if (source.org === 'STF') {
        (global as any).stfSourceId = data.id;
      } else if (source.org === 'STJ') {
        (global as any).stjSourceId = data.id;
      } else if (source.org === 'CJF') {
        (global as any).cjfSourceId = data.id;
      }
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
      source_id: (global as any).cfSourceId,
      ref: 'CF/88',
      hierarchy: { tipo: 'constituição', titulo: 'Constituição Federal' },
      text_plain: 'Constituição da República Federativa do Brasil de 1988',
      effective_from: '1988-10-05',
      is_current: true
    },
    {
      source_id: (global as any).ccSourceId,
      ref: 'CC/2002',
      hierarchy: { tipo: 'código', titulo: 'Código Civil' },
      text_plain: 'Código Civil - Lei nº 10.406, de 10 de janeiro de 2002',
      effective_from: '2003-01-11',
      is_current: true
    },
    {
      source_id: (global as any).cpSourceId,
      ref: 'CP/1940',
      hierarchy: { tipo: 'código', titulo: 'Código Penal' },
      text_plain: 'Código Penal - Decreto-Lei nº 2.848, de 7 de dezembro de 1940',
      effective_from: '1942-01-01',
      is_current: true
    }
  ];

  for (const law of laws) {
    const { data, error } = await supabase
      .from('laws')
      .upsert(law)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Erro ao criar lei ${law.ref}:`, error);
    } else {
      console.log(`✅ Lei ${law.ref} criada com ID: ${data.id}`);
      // Armazenar IDs para uso posterior
      if (law.ref === 'CF/88') {
        (global as any).cfLawId = data.id;
      } else if (law.ref === 'CC/2002') {
        (global as any).ccLawId = data.id;
      } else if (law.ref === 'CP/1940') {
        (global as any).cpLawId = data.id;
      }
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
      law_id: (global as any).cfLawId,
      ref: 'CF/88 art. 1º',
      content: 'Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
      meta: {
        article_number: 'Art. 1º',
        title: 'Fundamentos da República Federativa do Brasil',
        keywords: ['soberania', 'cidadania', 'dignidade', 'democracia', 'fundamentos']
      }
    },
    {
      law_id: (global as any).cfLawId,
      ref: 'CF/88 art. 2º',
      content: 'Art. 2º São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
      meta: {
        article_number: 'Art. 2º',
        title: 'Separação dos Poderes',
        keywords: ['separação', 'poderes', 'legislativo', 'executivo', 'judiciário']
      }
    },
    {
      law_id: (global as any).cfLawId,
      ref: 'CF/88 art. 3º',
      content: 'Art. 3º Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.',
      meta: {
        article_number: 'Art. 3º',
        title: 'Objetivos Fundamentais da República',
        keywords: ['objetivos', 'sociedade', 'desenvolvimento', 'igualdade', 'discriminação']
      }
    },
    {
      law_id: (global as any).cfLawId,
      ref: 'CF/88 art. 5º',
      content: 'Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem...',
      meta: {
        article_number: 'Art. 5º',
        title: 'Direitos e Deveres Individuais e Coletivos',
        keywords: ['direitos fundamentais', 'igualdade', 'liberdade', 'segurança', 'propriedade']
      }
    },
    {
      law_id: (global as any).cfLawId,
      ref: 'CF/88 art. 18',
      content: 'Art. 18. A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos, nos termos desta Constituição.',
      meta: {
        article_number: 'Art. 18',
        title: 'Organização Político-Administrativa',
        keywords: ['federação', 'união', 'estados', 'municípios', 'autonomia']
      }
    }
  ];

  for (const article of articles) {
    const { error } = await supabase
      .from('law_chunks')
      .upsert(article);

    if (error) {
      console.error(`❌ Erro ao criar ${article.meta.article_number}:`, error);
    } else {
      console.log(`✅ ${article.meta.article_number} criado`);
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
      tribunal: 'STF',
      numero: 11,
      texto: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=11'
    },
    {
      tribunal: 'STF',
      numero: 13,
      texto: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=13'
    },
    {
      tribunal: 'STF',
      numero: 473,
      texto: 'A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial.',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumula.asp?vSumula=473'
    },
    {
      tribunal: 'STJ',
      numero: 284,
      texto: 'A inserção do nome do devedor no SPC e no SERASA constitui prática comercial lícita e exercício regular de direito.',
      fonte_url: 'https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-284.pdf'
    },
    {
      tribunal: 'STJ',
      numero: 385,
      texto: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento.',
      fonte_url: 'https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-385.pdf'
    }
  ];

  for (const sumula of sumulas) {
    const { error } = await supabase
      .from('sumulas')
      .upsert(sumula);

    if (error) {
      console.error(`❌ Erro ao criar Súmula ${sumula.numero} ${sumula.tribunal}:`, error);
    } else {
      console.log(`✅ Súmula ${sumula.numero} ${sumula.tribunal} criada`);
    }
  }
}

/**
 * Cria enunciados
 */
async function createEnunciados(): Promise<void> {
  console.log('📋 Criando enunciados...');
  
  const enunciados = [
    {
      org: 'CJF',
      numero: 1,
      texto: 'A dignidade da pessoa humana na bioética não coincide com a santidade da vida.',
      fonte_url: 'https://www.cjf.jus.br/enunciados/enunciado/142'
    },
    {
      org: 'CJF',
      numero: 2,
      texto: 'A disposição gratuita do próprio corpo, no todo ou em parte, para depois da morte, com objetivo científico, ou altruístico, é cláusula geral de tutela e promoção da pessoa humana.',
      fonte_url: 'https://www.cjf.jus.br/enunciados/enunciado/277'
    },
    {
      org: 'CJF',
      numero: 3,
      texto: 'O direito à inviolabilidade da intimidade e da vida privada não impede a divulgação de dados sobre a pessoa quando necessários à segurança da sociedade e do Estado.',
      fonte_url: 'https://www.cjf.jus.br/enunciados/enunciado/404'
    }
  ];

  for (const enunciado of enunciados) {
    const { error } = await supabase
      .from('enunciados')
      .upsert(enunciado);

    if (error) {
      console.error(`❌ Erro ao criar Enunciado ${enunciado.numero} ${enunciado.org}:`, error);
    } else {
      console.log(`✅ Enunciado ${enunciado.numero} ${enunciado.org} criado`);
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

