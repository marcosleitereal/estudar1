import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

interface Sumula {
  id: string;
  number: number;
  court: 'STF' | 'STJ' | 'TST';
  type: 'vinculante' | 'nao_vinculante' | 'comum';
  title: string;
  content: string;
  publication_date?: Date;
  source_url: string;
  status: 'ativa' | 'cancelada' | 'superada';
  metadata: any;
}

export class SumulasScraper {
  private supabase;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Importa súmulas do STF
   */
  async importSTFSumulas(): Promise<void> {
    console.log('🏛️ Iniciando importação das súmulas do STF...');
    
    try {
      // Importar súmulas vinculantes
      await this.importSTFVinculantes();
      
      // Importar súmulas não vinculantes
      await this.importSTFNaoVinculantes();
      
      console.log('✅ Súmulas do STF importadas com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao importar súmulas do STF:', error);
      throw error;
    }
  }

  /**
   * Importa súmulas vinculantes do STF
   */
  private async importSTFVinculantes(): Promise<void> {
    console.log('📋 Importando súmulas vinculantes do STF...');
    
    // Lista das principais súmulas vinculantes (as mais importantes)
    const sumulasVinculantes = [
      {
        number: 1,
        content: "Ofende o princípio da separação de poderes o ato do Poder Executivo que veda, em lei de diretrizes orçamentárias, a implementação de decisão do Poder Judiciário que determina a realização de despesas.",
        publication_date: new Date('2007-05-30')
      },
      {
        number: 2,
        content: "É inconstitucional a lei ou ato normativo estadual ou distrital que disponha sobre sistemas de consórcios e sorteios, inclusive bingos e loterias.",
        publication_date: new Date('2007-05-30')
      },
      {
        number: 3,
        content: "Nos processos perante o Tribunal de Contas da União asseguram-se o contraditório e a ampla defesa quando da decisão puder resultar anulação ou revogação de ato administrativo que beneficie o interessado, excetuada a apreciação da legalidade do ato de concessão inicial de aposentadoria, reforma e pensão.",
        publication_date: new Date('2007-05-30')
      },
      {
        number: 4,
        content: "Salvo nos casos previstos na Constituição, o salário mínimo não pode ser usado como indexador de base de cálculo de vantagem de servidor público ou de empregado, nem ser substituído por decisão judicial.",
        publication_date: new Date('2008-05-29')
      },
      {
        number: 5,
        content: "A falta de defesa técnica por advogado no processo administrativo disciplinar não ofende a Constituição.",
        publication_date: new Date('2008-05-29')
      },
      {
        number: 11,
        content: "Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.",
        publication_date: new Date('2008-08-13')
      },
      {
        number: 13,
        content: "A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.",
        publication_date: new Date('2008-08-21')
      },
      {
        number: 14,
        content: "É direito do defensor, no interesse do representado, ter acesso amplo aos elementos de prova que, já documentados em procedimento investigatório realizado por órgão com competência de polícia judiciária, digam respeito ao exercício do direito de defesa.",
        publication_date: new Date('2009-02-05')
      },
      {
        number: 15,
        content: "É vedada a transferência de recursos públicos para entidades privadas, inclusive de natureza religiosa.",
        publication_date: new Date('2009-02-05')
      },
      {
        number: 17,
        content: "Durante o período previsto no parágrafo 1º do artigo 100 da Constituição, não incidem juros de mora sobre os precatórios que nele sejam pagos.",
        publication_date: new Date('2009-04-29')
      }
    ];

    for (const sumula of sumulasVinculantes) {
      const sumulaData: Sumula = {
        id: `stf_vinculante_${sumula.number}`,
        number: sumula.number,
        court: 'STF',
        type: 'vinculante',
        title: `Súmula Vinculante ${sumula.number}`,
        content: sumula.content,
        publication_date: sumula.publication_date,
        source_url: `https://portal.stf.jus.br/jurisprudencia/sumulaVinculante.asp?vSumula=${sumula.number}`,
        status: 'ativa',
        metadata: {
          source: 'stf',
          imported_at: new Date(),
          type: 'sumula_vinculante'
        }
      };

      await this.insertSumula(sumulaData);
    }

    console.log(`✅ ${sumulasVinculantes.length} súmulas vinculantes do STF importadas`);
  }

  /**
   * Importa súmulas não vinculantes do STF (principais)
   */
  private async importSTFNaoVinculantes(): Promise<void> {
    console.log('📋 Importando súmulas não vinculantes do STF...');
    
    // Lista das principais súmulas não vinculantes
    const sumulasNaoVinculantes = [
      {
        number: 1,
        content: "É vedada a imposição de prisão civil por dívida, salvo ao responsável pelo inadimplemento voluntário e inescusável de obrigação alimentícia e ao depositário infiel."
      },
      {
        number: 25,
        content: "É competente o foro do local do ato ou fato para a ação de responsabilidade civil contra funcionário público."
      },
      {
        number: 70,
        content: "É inadmissível a interdição de estabelecimento como meio coercitivo para cobrança de tributo."
      },
      {
        number: 266,
        content: "Não cabe mandado de segurança contra lei em tese."
      },
      {
        number: 279,
        content: "Para o efeito da garantia do emprego, o tempo de serviço do empregado eleito para cargo de direção de sindicato conta-se da data da posse."
      },
      {
        number: 330,
        content: "O Supremo Tribunal Federal não é competente para conhecer de mandado de segurança contra atos dos Tribunais de Justiça dos Estados."
      },
      {
        number: 473,
        content: "A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial."
      },
      {
        number: 691,
        content: "Não compete ao Supremo Tribunal Federal conhecer de habeas corpus impetrado contra decisão do Relator que, em habeas corpus requerido a tribunal superior, indefere a liminar."
      },
      {
        number: 729,
        content: "Para efeito de aposentadoria especial de professores, não se computa o tempo de serviço prestado fora da sala de aula."
      },
      {
        number: 734,
        content: "Não cabe habeas corpus contra decisão condenatória a pena de multa, ou relativo a processo em curso por infração penal a que a pena pecuniária seja a única cominada."
      }
    ];

    for (const sumula of sumulasNaoVinculantes) {
      const sumulaData: Sumula = {
        id: `stf_${sumula.number}`,
        number: sumula.number,
        court: 'STF',
        type: 'nao_vinculante',
        title: `Súmula ${sumula.number} STF`,
        content: sumula.content,
        source_url: `https://portal.stf.jus.br/jurisprudencia/sumula.asp?vSumula=${sumula.number}`,
        status: 'ativa',
        metadata: {
          source: 'stf',
          imported_at: new Date(),
          type: 'sumula_nao_vinculante'
        }
      };

      await this.insertSumula(sumulaData);
    }

    console.log(`✅ ${sumulasNaoVinculantes.length} súmulas não vinculantes do STF importadas`);
  }

  /**
   * Importa súmulas do STJ
   */
  async importSTJSumulas(): Promise<void> {
    console.log('⚖️ Iniciando importação das súmulas do STJ...');
    
    // Lista das principais súmulas do STJ
    const sumulasSTJ = [
      {
        number: 1,
        content: "O foro do domicílio ou da residência do alimentando é o competente para a ação de investigação de paternidade, quando cumulada com a de alimentos."
      },
      {
        number: 7,
        content: "A pretensão de simples declaração de inexistência de relação jurídico-tributária não está sujeita à decadência."
      },
      {
        number: 83,
        content: "Não se conhece do recurso especial pela divergência, quando a orientação do Tribunal se firmou no mesmo sentido da decisão recorrida."
      },
      {
        number: 126,
        content: "É inadmissível recurso especial, quando o acórdão recorrido assenta em fundamentos constitucional e infraconstitucional, qualquer deles suficiente, por si só, para mantê-lo, e a parte vencida não manifesta recurso extraordinário."
      },
      {
        number: 150,
        content: "Compete à Justiça Federal decidir sobre a existência de quitação do empréstimo concedido por instituição financeira federal."
      },
      {
        number: 207,
        content: "É inadmissível recurso especial quando cabível recurso de revista para o mesmo Tribunal."
      },
      {
        number: 284,
        content: "A inserção do nome do devedor no SPC e no SERASA constitui prática comercial lícita e exercício regular de direito."
      },
      {
        number: 385,
        content: "Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento."
      },
      {
        number: 456,
        content: "A decisão que declara a inconstitucionalidade de lei municipal, proferida pelo Tribunal de Justiça, pode ser objeto de recurso extraordinário."
      },
      {
        number: 509,
        content: "A implementação de melhoramentos ou a construção de obras não dá ao promitente comprador o direito de exigir do promitente vendedor o cumprimento da obrigação no prazo inferior ao previsto no contrato."
      }
    ];

    for (const sumula of sumulasSTJ) {
      const sumulaData: Sumula = {
        id: `stj_${sumula.number}`,
        number: sumula.number,
        court: 'STJ',
        type: 'comum',
        title: `Súmula ${sumula.number} STJ`,
        content: sumula.content,
        source_url: `https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-${sumula.number}.pdf`,
        status: 'ativa',
        metadata: {
          source: 'stj',
          imported_at: new Date(),
          type: 'sumula'
        }
      };

      await this.insertSumula(sumulaData);
    }

    console.log(`✅ ${sumulasSTJ.length} súmulas do STJ importadas`);
  }

  /**
   * Importa súmulas do TST (principais)
   */
  async importTSTSumulas(): Promise<void> {
    console.log('👷 Iniciando importação das súmulas do TST...');
    
    // Lista das principais súmulas do TST
    const sumulasTST = [
      {
        number: 1,
        content: "É nula a cláusula contratual que fixa determinada importância ou percentagem para atender aos gastos com ferramentas do empregado."
      },
      {
        number: 6,
        content: "Para os efeitos previstos no § 5º do art. 884 da CLT, só se considera estável o empregado eleito para cargo de direção de Comissões Internas de Prevenção de Acidentes (CIPAS) das empresas que possuam mais de 50 (cinquenta) empregados."
      },
      {
        number: 51,
        content: "As cláusulas regulamentares, que revoguem ou alterem vantagens deferidas anteriormente, só atingirão os trabalhadores admitidos após a revogação ou alteração do regulamento."
      },
      {
        number: 85,
        content: "Compensação de jornada. Acordo individual. Lei nº 9.601/98. Validade."
      },
      {
        number: 90,
        content: "Horas extras. Cartão de ponto. Registro. Ônus da prova."
      },
      {
        number: 126,
        content: "O bancário sujeito à fiscalização não está obrigado a permanecer no estabelecimento, sendo-lhe aplicável a duração do trabalho de 8 (oito) horas."
      },
      {
        number: 277,
        content: "As condições de trabalho alcançadas por força de sentença normativa vigoram no prazo assinado, não integrando, de forma definitiva, os contratos."
      },
      {
        number: 331,
        content: "Contrato de prestação de serviços. Legalidade."
      },
      {
        number: 378,
        content: "Estabilidade provisória. Acidente do trabalho. Art. 118 da Lei nº 8.213/91."
      },
      {
        number: 449,
        content: "Aposentadoria espontânea. Extinção do contrato de trabalho. Indenização. Art. 9º da Lei nº 7.238/84."
      }
    ];

    for (const sumula of sumulasTST) {
      const sumulaData: Sumula = {
        id: `tst_${sumula.number}`,
        number: sumula.number,
        court: 'TST',
        type: 'comum',
        title: `Súmula ${sumula.number} TST`,
        content: sumula.content,
        source_url: `https://www.tst.jus.br/sumulas`,
        status: 'ativa',
        metadata: {
          source: 'tst',
          imported_at: new Date(),
          type: 'sumula_trabalhista'
        }
      };

      await this.insertSumula(sumulaData);
    }

    console.log(`✅ ${sumulasTST.length} súmulas do TST importadas`);
  }

  /**
   * Insere uma súmula no banco de dados
   */
  private async insertSumula(sumula: Sumula): Promise<void> {
    const { error } = await this.supabase
      .from('sumulas')
      .upsert({
        id: sumula.id,
        number: sumula.number,
        court: sumula.court,
        type: sumula.type,
        title: sumula.title,
        content: sumula.content,
        publication_date: sumula.publication_date?.toISOString(),
        source_url: sumula.source_url,
        status: sumula.status,
        metadata: sumula.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao inserir súmula:', error);
      throw error;
    }
  }

  /**
   * Importa todas as súmulas
   */
  async importAllSumulas(): Promise<void> {
    console.log('🚀 Iniciando importação completa das súmulas...');
    
    try {
      await this.importSTFSumulas();
      await this.importSTJSumulas();
      await this.importTSTSumulas();
      
      console.log('✅ Importação completa de súmulas finalizada!');
      
    } catch (error) {
      console.error('❌ Erro na importação completa de súmulas:', error);
      throw error;
    }
  }
}

// Função para executar a importação
export async function runSumulasImport(): Promise<void> {
  const scraper = new SumulasScraper();
  await scraper.importAllSumulas();
}

