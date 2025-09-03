import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

interface LawArticle {
  law_id: string;
  article_number: string;
  title: string;
  content: string;
  hierarchy_level: number;
  parent_id?: string;
  metadata: any;
}

interface Law {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  number: string;
  year: number;
  publication_date: Date;
  source_url: string;
  full_text: string;
  metadata: any;
}

export class PlanaltoScraper {
  private supabase;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Importa a Constituição Federal de 1988
   */
  async importConstitution(): Promise<void> {
    console.log('🏛️ Iniciando importação da Constituição Federal...');
    
    const url = 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm';
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Criar registro da lei
      const law: Law = {
        id: 'cf_1988',
        title: 'Constituição da República Federativa do Brasil de 1988',
        type: 'constituicao',
        number: 'CF',
        year: 1988,
        publication_date: new Date('1988-10-05'),
        source_url: url,
        full_text: $.text(),
        metadata: {
          source: 'planalto',
          last_updated: new Date(),
          total_articles: 0
        }
      };

      // Inserir lei no banco
      await this.insertLaw(law);
      
      // Extrair artigos
      const articles = this.extractConstitutionArticles($, law.id);
      
      // Inserir artigos no banco
      for (const article of articles) {
        await this.insertArticle(article);
      }
      
      console.log(`✅ Constituição importada com ${articles.length} artigos`);
      
    } catch (error) {
      console.error('❌ Erro ao importar Constituição:', error);
      throw error;
    }
  }

  /**
   * Importa o Código Civil
   */
  async importCivilCode(): Promise<void> {
    console.log('📚 Iniciando importação do Código Civil...');
    
    const url = 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm';
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const law: Law = {
        id: 'cc_2002',
        title: 'Código Civil',
        subtitle: 'Lei nº 10.406, de 10 de janeiro de 2002',
        type: 'codigo',
        number: '10.406',
        year: 2002,
        publication_date: new Date('2002-01-10'),
        source_url: url,
        full_text: $.text(),
        metadata: {
          source: 'planalto',
          last_updated: new Date(),
          total_articles: 0
        }
      };

      await this.insertLaw(law);
      
      const articles = this.extractCodeArticles($, law.id, 'Código Civil');
      
      for (const article of articles) {
        await this.insertArticle(article);
      }
      
      console.log(`✅ Código Civil importado com ${articles.length} artigos`);
      
    } catch (error) {
      console.error('❌ Erro ao importar Código Civil:', error);
      throw error;
    }
  }

  /**
   * Importa o Código Penal
   */
  async importPenalCode(): Promise<void> {
    console.log('⚖️ Iniciando importação do Código Penal...');
    
    const url = 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm';
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const law: Law = {
        id: 'cp_1940',
        title: 'Código Penal',
        subtitle: 'Decreto-Lei nº 2.848, de 7 de dezembro de 1940',
        type: 'codigo',
        number: '2.848',
        year: 1940,
        publication_date: new Date('1940-12-07'),
        source_url: url,
        full_text: $.text(),
        metadata: {
          source: 'planalto',
          last_updated: new Date(),
          total_articles: 0
        }
      };

      await this.insertLaw(law);
      
      const articles = this.extractCodeArticles($, law.id, 'Código Penal');
      
      for (const article of articles) {
        await this.insertArticle(article);
      }
      
      console.log(`✅ Código Penal importado com ${articles.length} artigos`);
      
    } catch (error) {
      console.error('❌ Erro ao importar Código Penal:', error);
      throw error;
    }
  }

  /**
   * Extrai artigos da Constituição Federal
   */
  private extractConstitutionArticles($: cheerio.CheerioAPI, lawId: string): LawArticle[] {
    const articles: LawArticle[] = [];
    
    // Buscar por padrões de artigos na CF
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      
      // Padrão: "Art. 1º" ou "Art. 1°" ou "Artigo 1º"
      const articleMatch = text.match(/^Art\.?\s*(\d+)[º°]?\s*[-–]?\s*(.*)/i);
      
      if (articleMatch) {
        const articleNumber = articleMatch[1];
        const content = text;
        
        // Extrair título se houver
        const titleMatch = content.match(/^Art\.?\s*\d+[º°]?\s*[-–]?\s*([^.]+)\./);
        const title = titleMatch ? titleMatch[1].trim() : `Artigo ${articleNumber}`;
        
        articles.push({
          law_id: lawId,
          article_number: `Art. ${articleNumber}`,
          title: title,
          content: content,
          hierarchy_level: 1,
          metadata: {
            source: 'planalto',
            extracted_at: new Date(),
            type: 'article'
          }
        });
      }
    });
    
    return articles;
  }

  /**
   * Extrai artigos de códigos em geral
   */
  private extractCodeArticles($: cheerio.CheerioAPI, lawId: string, lawName: string): LawArticle[] {
    const articles: LawArticle[] = [];
    
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      
      // Padrões mais flexíveis para diferentes códigos
      const articleMatch = text.match(/^Art\.?\s*(\d+)[º°]?\s*[-–]?\s*(.*)/i);
      
      if (articleMatch) {
        const articleNumber = articleMatch[1];
        const content = text;
        
        articles.push({
          law_id: lawId,
          article_number: `Art. ${articleNumber}`,
          title: `${lawName} - Artigo ${articleNumber}`,
          content: content,
          hierarchy_level: 1,
          metadata: {
            source: 'planalto',
            extracted_at: new Date(),
            type: 'article',
            law_name: lawName
          }
        });
      }
    });
    
    return articles;
  }

  /**
   * Insere uma lei no banco de dados
   */
  private async insertLaw(law: Law): Promise<void> {
    const { error } = await this.supabase
      .from('laws')
      .upsert({
        id: law.id,
        title: law.title,
        subtitle: law.subtitle,
        type: law.type,
        number: law.number,
        year: law.year,
        publication_date: law.publication_date.toISOString(),
        source_url: law.source_url,
        full_text: law.full_text,
        metadata: law.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao inserir lei:', error);
      throw error;
    }
  }

  /**
   * Insere um artigo no banco de dados
   */
  private async insertArticle(article: LawArticle): Promise<void> {
    const { error } = await this.supabase
      .from('law_articles')
      .upsert({
        law_id: article.law_id,
        article_number: article.article_number,
        title: article.title,
        content: article.content,
        hierarchy_level: article.hierarchy_level,
        parent_id: article.parent_id,
        metadata: article.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao inserir artigo:', error);
      throw error;
    }
  }

  /**
   * Importa todas as leis principais
   */
  async importAllMainLaws(): Promise<void> {
    console.log('🚀 Iniciando importação completa das leis principais...');
    
    try {
      await this.importConstitution();
      await this.importCivilCode();
      await this.importPenalCode();
      
      // Adicionar mais códigos conforme necessário
      console.log('✅ Importação completa finalizada!');
      
    } catch (error) {
      console.error('❌ Erro na importação completa:', error);
      throw error;
    }
  }
}

// Função para executar a importação
export async function runPlanaltoImport(): Promise<void> {
  const scraper = new PlanaltoScraper();
  await scraper.importAllMainLaws();
}

