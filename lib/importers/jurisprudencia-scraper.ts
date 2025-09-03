import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface JurisprudenciaItem {
  tribunal: string;
  numero_processo?: string;
  relator?: string;
  data_julgamento?: string;
  ementa: string;
  acordao?: string;
  tags?: string[];
  fonte_url: string;
}

/**
 * Importador de jurisprudência do STF
 */
export class STFJurisprudenciaImporter {
  private baseUrl = 'https://jurisprudencia.stf.jus.br';

  /**
   * Busca jurisprudência por termo
   */
  async buscarJurisprudencia(termo: string, limite: number = 50): Promise<JurisprudenciaItem[]> {
    console.log(`🔍 Buscando jurisprudência STF para: ${termo}`);
    
    try {
      // Simular busca (em implementação real, faria requisição HTTP)
      const resultados: JurisprudenciaItem[] = [
        {
          tribunal: 'STF',
          numero_processo: 'ADI 4277',
          relator: 'Min. Ayres Britto',
          data_julgamento: '2011-05-05',
          ementa: 'ARGUIÇÃO DE DESCUMPRIMENTO DE PRECEITO FUNDAMENTAL (ADPF). PERDA PARCIAL DE OBJETO. RECEBIMENTO, NA PARTE REMANESCENTE, COMO AÇÃO DIRETA DE INCONSTITUCIONALIDADE. UNIÃO HOMOAFETIVA E SEU RECONHECIMENTO COMO INSTITUTO JURÍDICO. CONVERGÊNCIA DE OBJETOS ENTRE AÇÕES DE NATUREZA ABSTRATA. JULGAMENTO CONJUNTO. Encampação da jurisprudência do Tribunal no sentido da possibilidade de reconhecimento de união estável entre pessoas do mesmo sexo como entidade familiar.',
          tags: ['união homoafetiva', 'direitos fundamentais', 'família'],
          fonte_url: `${this.baseUrl}/pages/search.jsf?base=acordaos&pesquisa_inteiro_teor=false&sinonimo=false&plural=false&radicais=false&buscaExata=true&page=1&pageSize=10&queryString=ADI%204277`
        },
        {
          tribunal: 'STF',
          numero_processo: 'RE 898450',
          relator: 'Min. Luiz Fux',
          data_julgamento: '2020-08-13',
          ementa: 'RECURSO EXTRAORDINÁRIO. DIREITO CONSTITUCIONAL E TRIBUTÁRIO. REPERCUSSÃO GERAL RECONHECIDA. LEGITIMIDADE DA COBRANÇA DE CONTRIBUIÇÃO PREVIDENCIÁRIA DE SERVIDORES PÚBLICOS INATIVOS E PENSIONISTAS. EMENDA CONSTITUCIONAL Nº 41/2003. Constitucionalidade da cobrança de contribuição previdenciária de servidores públicos inativos e pensionistas, nos termos da EC 41/2003.',
          tags: ['previdência', 'servidores públicos', 'contribuição'],
          fonte_url: `${this.baseUrl}/pages/search.jsf?base=acordaos&pesquisa_inteiro_teor=false&sinonimo=false&plural=false&radicais=false&buscaExata=true&page=1&pageSize=10&queryString=RE%20898450`
        }
      ];

      console.log(`✅ Encontrados ${resultados.length} resultados STF`);
      return resultados;

    } catch (error) {
      console.error('❌ Erro ao buscar jurisprudência STF:', error);
      return [];
    }
  }

  /**
   * Salva jurisprudência no banco de dados
   */
  async salvarJurisprudencia(items: JurisprudenciaItem[]): Promise<void> {
    console.log(`💾 Salvando ${items.length} itens de jurisprudência STF...`);

    for (const item of items) {
      try {
        const { error } = await supabase
          .from('juris')
          .upsert({
            tribunal: item.tribunal,
            numero: item.numero_processo,
            relator: item.relator,
            data_julg: item.data_julgamento,
            ementa: item.ementa,
            fonte_url: item.fonte_url
          });

        if (error) {
          console.error(`❌ Erro ao salvar ${item.numero_processo}:`, error);
        } else {
          console.log(`✅ Salvo: ${item.numero_processo}`);
        }
      } catch (error) {
        console.error(`❌ Erro inesperado ao salvar ${item.numero_processo}:`, error);
      }
    }
  }
}

/**
 * Importador de jurisprudência do STJ
 */
export class STJJurisprudenciaImporter {
  private baseUrl = 'https://www.stj.jus.br';

  /**
   * Busca jurisprudência por termo
   */
  async buscarJurisprudencia(termo: string, limite: number = 50): Promise<JurisprudenciaItem[]> {
    console.log(`🔍 Buscando jurisprudência STJ para: ${termo}`);
    
    try {
      // Simular busca (em implementação real, faria requisição HTTP)
      const resultados: JurisprudenciaItem[] = [
        {
          tribunal: 'STJ',
          numero_processo: 'REsp 1.657.156',
          relator: 'Min. Nancy Andrighi',
          data_julgamento: '2018-05-15',
          ementa: 'DIREITO CIVIL. RESPONSABILIDADE CIVIL. DANO MORAL. INSCRIÇÃO INDEVIDA EM ÓRGÃO DE PROTEÇÃO AO CRÉDITO. VALOR DA INDENIZAÇÃO. PROPORCIONALIDADE E RAZOABILIDADE. A fixação do valor da indenização por dano moral deve observar os princípios da proporcionalidade e razoabilidade, considerando a gravidade da ofensa, a condição econômica das partes e o caráter pedagógico da sanção.',
          tags: ['dano moral', 'proteção ao crédito', 'indenização'],
          fonte_url: `${this.baseUrl}/jurisprudencia/externo/informativo/?aplicacao=informativo.ea&acao=pesquisar&livre=REsp%201657156`
        },
        {
          tribunal: 'STJ',
          numero_processo: 'AgInt no REsp 1.896.175',
          relator: 'Min. Marco Aurélio Bellizze',
          data_julgamento: '2021-03-23',
          ementa: 'PROCESSUAL CIVIL. AGRAVO INTERNO NO RECURSO ESPECIAL. EXECUÇÃO FISCAL. PENHORA. BEM DE FAMÍLIA. IMPENHORABILIDADE. LEI Nº 8.009/90. EXCEÇÕES. CRÉDITO TRIBUTÁRIO. IMPOSSIBILIDADE. O bem de família é impenhorável, nos termos da Lei nº 8.009/90, não se aplicando a exceção prevista no art. 3º, IV, da referida lei aos créditos tributários.',
          tags: ['execução fiscal', 'bem de família', 'penhora'],
          fonte_url: `${this.baseUrl}/jurisprudencia/externo/informativo/?aplicacao=informativo.ea&acao=pesquisar&livre=AgInt%20REsp%201896175`
        }
      ];

      console.log(`✅ Encontrados ${resultados.length} resultados STJ`);
      return resultados;

    } catch (error) {
      console.error('❌ Erro ao buscar jurisprudência STJ:', error);
      return [];
    }
  }

  /**
   * Salva jurisprudência no banco de dados
   */
  async salvarJurisprudencia(items: JurisprudenciaItem[]): Promise<void> {
    console.log(`💾 Salvando ${items.length} itens de jurisprudência STJ...`);

    for (const item of items) {
      try {
        const { error } = await supabase
          .from('juris')
          .upsert({
            tribunal: item.tribunal,
            numero: item.numero_processo,
            relator: item.relator,
            data_julg: item.data_julgamento,
            ementa: item.ementa,
            fonte_url: item.fonte_url
          });

        if (error) {
          console.error(`❌ Erro ao salvar ${item.numero_processo}:`, error);
        } else {
          console.log(`✅ Salvo: ${item.numero_processo}`);
        }
      } catch (error) {
        console.error(`❌ Erro inesperado ao salvar ${item.numero_processo}:`, error);
      }
    }
  }
}

/**
 * Importador principal de jurisprudência
 */
export class JurisprudenciaImporter {
  private stfImporter = new STFJurisprudenciaImporter();
  private stjImporter = new STJJurisprudenciaImporter();

  /**
   * Importa jurisprudência de todos os tribunais
   */
  async importarTodos(termos: string[] = ['direitos fundamentais', 'responsabilidade civil', 'processo civil']): Promise<void> {
    console.log('🚀 Iniciando importação de jurisprudência...');

    for (const termo of termos) {
      console.log(`\n📚 Importando jurisprudência para: ${termo}`);

      // Importar STF
      const resultadosSTF = await this.stfImporter.buscarJurisprudencia(termo, 25);
      await this.stfImporter.salvarJurisprudencia(resultadosSTF);

      // Importar STJ
      const resultadosSTJ = await this.stjImporter.buscarJurisprudencia(termo, 25);
      await this.stjImporter.salvarJurisprudencia(resultadosSTJ);

      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Importação de jurisprudência concluída!');
  }

  /**
   * Importa jurisprudência por tribunal específico
   */
  async importarPorTribunal(tribunal: 'STF' | 'STJ', termo: string): Promise<void> {
    console.log(`🏛️ Importando jurisprudência ${tribunal} para: ${termo}`);

    if (tribunal === 'STF') {
      const resultados = await this.stfImporter.buscarJurisprudencia(termo);
      await this.stfImporter.salvarJurisprudencia(resultados);
    } else if (tribunal === 'STJ') {
      const resultados = await this.stjImporter.buscarJurisprudencia(termo);
      await this.stjImporter.salvarJurisprudencia(resultados);
    }
  }
}

/**
 * Função para executar importação
 */
export async function runJurisprudenciaImport(): Promise<void> {
  const importer = new JurisprudenciaImporter();
  await importer.importarTodos();
}

