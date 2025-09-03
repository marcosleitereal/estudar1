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
 * Importa dados jurídicos essenciais
 */
async function importEssentialLegalData(): Promise<void> {
  console.log('🚀 Iniciando importação de dados jurídicos essenciais...');
  
  try {
    // 1. Importar Constituição Federal (artigos principais)
    await importConstitutionArticles();
    
    // 2. Importar Súmulas STF/STJ (principais)
    await importMainSumulas();
    
    // 3. Importar Códigos principais (artigos selecionados)
    await importMainCodes();
    
    console.log('✅ Importação de dados jurídicos essenciais concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    throw error;
  }
}

/**
 * Importa artigos principais da Constituição Federal
 */
async function importConstitutionArticles(): Promise<void> {
  console.log('🏛️ Importando artigos da Constituição Federal...');
  
  const constitutionArticles = [
    {
      article_number: 'Art. 1º',
      title: 'Fundamentos da República Federativa do Brasil',
      content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.'
    },
    {
      article_number: 'Art. 2º',
      title: 'Separação dos Poderes',
      content: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
    },
    {
      article_number: 'Art. 3º',
      title: 'Objetivos Fundamentais da República',
      content: 'Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.'
    },
    {
      article_number: 'Art. 4º',
      title: 'Princípios das Relações Internacionais',
      content: 'A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios: I - independência nacional; II - prevalência dos direitos humanos; III - autodeterminação dos povos; IV - não-intervenção; V - igualdade entre os Estados; VI - defesa da paz; VII - solução pacífica dos conflitos; VIII - repúdio ao terrorismo e ao racismo; IX - cooperação entre os povos para o progresso da humanidade; X - concessão de asilo político.'
    },
    {
      article_number: 'Art. 5º',
      title: 'Direitos e Deveres Individuais e Coletivos',
      content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem...'
    }
  ];

  for (const article of constitutionArticles) {
    const { error } = await supabase
      .from('law_articles')
      .upsert({
        law_id: 'cf_1988',
        article_number: article.article_number,
        title: article.title,
        content: article.content,
        hierarchy_level: 1,
        metadata: {
          source: 'manual_import',
          law_name: 'Constituição Federal',
          imported_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error(`❌ Erro ao inserir ${article.article_number}:`, error);
    } else {
      console.log(`✅ ${article.article_number} inserido`);
    }
  }
}

/**
 * Importa súmulas principais do STF e STJ
 */
async function importMainSumulas(): Promise<void> {
  console.log('⚖️ Importando súmulas principais...');
  
  const sumulas = [
    // STF Vinculantes
    {
      id: 'stf_vinculante_11',
      number: 11,
      court: 'STF',
      type: 'vinculante',
      title: 'Súmula Vinculante 11 - Uso de Algemas',
      content: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.',
      source_url: 'https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=11'
    },
    {
      id: 'stf_vinculante_13',
      number: 13,
      court: 'STF',
      type: 'vinculante',
      title: 'Súmula Vinculante 13 - Nepotismo',
      content: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.',
      source_url: 'https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=13'
    },
    // STF Não Vinculantes
    {
      id: 'stf_473',
      number: 473,
      court: 'STF',
      type: 'nao_vinculante',
      title: 'Súmula 473 STF - Anulação e Revogação de Atos Administrativos',
      content: 'A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial.',
      source_url: 'https://portal.stf.jus.br/jurisprudencia/sumula.asp?vSumula=473'
    },
    // STJ
    {
      id: 'stj_284',
      number: 284,
      court: 'STJ',
      type: 'comum',
      title: 'Súmula 284 STJ - SPC e SERASA',
      content: 'A inserção do nome do devedor no SPC e no SERASA constitui prática comercial lícita e exercício regular de direito.',
      source_url: 'https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-284.pdf'
    },
    {
      id: 'stj_385',
      number: 385,
      court: 'STJ',
      type: 'comum',
      title: 'Súmula 385 STJ - Dano Moral e Inscrição Irregular',
      content: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento.',
      source_url: 'https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-385.pdf'
    }
  ];

  for (const sumula of sumulas) {
    const { error } = await supabase
      .from('sumulas')
      .upsert({
        id: sumula.id,
        number: sumula.number,
        court: sumula.court,
        type: sumula.type,
        title: sumula.title,
        content: sumula.content,
        source_url: sumula.source_url,
        status: 'ativa',
        metadata: {
          source: 'manual_import',
          imported_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error(`❌ Erro ao inserir ${sumula.title}:`, error);
    } else {
      console.log(`✅ ${sumula.title} inserida`);
    }
  }
}

/**
 * Importa artigos principais dos códigos
 */
async function importMainCodes(): Promise<void> {
  console.log('📚 Importando artigos principais dos códigos...');
  
  const codeArticles = [
    // Código Civil
    {
      law_id: 'cc_2002',
      article_number: 'Art. 1º',
      title: 'Capacidade Civil',
      content: 'Toda pessoa é capaz de direitos e deveres na ordem civil.'
    },
    {
      law_id: 'cc_2002',
      article_number: 'Art. 2º',
      title: 'Início da Personalidade Civil',
      content: 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.'
    },
    // Código Penal
    {
      law_id: 'cp_1940',
      article_number: 'Art. 1º',
      title: 'Anterioridade da Lei',
      content: 'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.'
    },
    {
      law_id: 'cp_1940',
      article_number: 'Art. 2º',
      title: 'Lei Penal no Tempo',
      content: 'Ninguém pode ser punido por fato que lei posterior deixa de considerar crime, cessando em virtude dela a execução e os efeitos penais da sentença condenatória.'
    }
  ];

  for (const article of codeArticles) {
    const { error } = await supabase
      .from('law_articles')
      .upsert({
        law_id: article.law_id,
        article_number: article.article_number,
        title: article.title,
        content: article.content,
        hierarchy_level: 1,
        metadata: {
          source: 'manual_import',
          imported_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error(`❌ Erro ao inserir ${article.article_number}:`, error);
    } else {
      console.log(`✅ ${article.article_number} inserido`);
    }
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    await importEssentialLegalData();
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

