// ETL Parsers for Legal Content
import { JSDOM } from 'jsdom'

export interface LegalDocument {
  id: string
  title: string
  type: 'constitution' | 'code' | 'law' | 'decree'
  source_url: string
  content: LegalContent[]
  metadata: DocumentMetadata
}

export interface LegalContent {
  id: string
  type: 'title' | 'chapter' | 'section' | 'article' | 'paragraph' | 'item'
  number?: string
  text: string
  parent_id?: string
  children?: string[]
  level: number
}

export interface DocumentMetadata {
  publication_date?: string
  last_modified?: string
  authority: string
  status: 'active' | 'revoked' | 'modified'
  tags: string[]
}

export interface Sumula {
  id: string
  court: 'STF' | 'STJ' | 'TST' | 'TSE'
  number: number
  text: string
  type: 'sumula' | 'sumula_vinculante'
  status: 'active' | 'cancelled' | 'superseded'
  publication_date: string
  subject_areas: string[]
}

export interface Jurisprudence {
  id: string
  court: string
  case_number: string
  decision_date: string
  summary: string
  full_text: string
  judges: string[]
  subject_areas: string[]
  keywords: string[]
}

/**
 * Parser for Brazilian Constitution (CF/88)
 */
export class ConstitutionParser {
  static parse(html: string): LegalDocument {
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    const content: LegalContent[] = []
    let currentId = 1
    
    // Parse titles (Títulos)
    const titles = document.querySelectorAll('h1, .titulo')
    titles.forEach((title, index) => {
      const titleContent: LegalContent = {
        id: `title_${currentId++}`,
        type: 'title',
        number: this.extractNumber(title.textContent || ''),
        text: title.textContent?.trim() || '',
        level: 1,
        children: []
      }
      content.push(titleContent)
    })
    
    // Parse chapters (Capítulos)
    const chapters = document.querySelectorAll('h2, .capitulo')
    chapters.forEach((chapter) => {
      const chapterContent: LegalContent = {
        id: `chapter_${currentId++}`,
        type: 'chapter',
        number: this.extractNumber(chapter.textContent || ''),
        text: chapter.textContent?.trim() || '',
        level: 2,
        children: []
      }
      content.push(chapterContent)
    })
    
    // Parse articles (Artigos)
    const articles = document.querySelectorAll('.artigo, [id^="art"]')
    articles.forEach((article) => {
      const articleContent: LegalContent = {
        id: `article_${currentId++}`,
        type: 'article',
        number: this.extractArticleNumber(article.textContent || ''),
        text: article.textContent?.trim() || '',
        level: 3,
        children: []
      }
      content.push(articleContent)
      
      // Parse paragraphs within article
      const paragraphs = article.querySelectorAll('.paragrafo, [id^="par"]')
      paragraphs.forEach((paragraph) => {
        const paragraphContent: LegalContent = {
          id: `paragraph_${currentId++}`,
          type: 'paragraph',
          number: this.extractParagraphNumber(paragraph.textContent || ''),
          text: paragraph.textContent?.trim() || '',
          parent_id: articleContent.id,
          level: 4
        }
        content.push(paragraphContent)
        articleContent.children?.push(paragraphContent.id)
      })
    })
    
    return {
      id: 'cf88',
      title: 'Constituição Federal de 1988',
      type: 'constitution',
      source_url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      content,
      metadata: {
        publication_date: '1988-10-05',
        authority: 'Assembleia Nacional Constituinte',
        status: 'active',
        tags: ['constituição', 'direitos fundamentais', 'organização do estado']
      }
    }
  }
  
  private static extractNumber(text: string): string {
    const match = text.match(/(\d+)/);
    return match ? match[1] : '';
  }
  
  private static extractArticleNumber(text: string): string {
    const match = text.match(/Art\.?\s*(\d+)/i);
    return match ? match[1] : '';
  }
  
  private static extractParagraphNumber(text: string): string {
    const match = text.match(/§\s*(\d+)/);
    return match ? match[1] : '';
  }
}

/**
 * Parser for Civil Code (CC/2002)
 */
export class CivilCodeParser {
  static parse(html: string): LegalDocument {
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    const content: LegalContent[] = []
    let currentId = 1
    
    // Similar parsing logic for Civil Code
    const articles = document.querySelectorAll('.artigo, [id^="art"]')
    articles.forEach((article) => {
      const articleContent: LegalContent = {
        id: `cc_article_${currentId++}`,
        type: 'article',
        number: this.extractArticleNumber(article.textContent || ''),
        text: article.textContent?.trim() || '',
        level: 1,
        children: []
      }
      content.push(articleContent)
    })
    
    return {
      id: 'cc2002',
      title: 'Código Civil - Lei 10.406/2002',
      type: 'code',
      source_url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm',
      content,
      metadata: {
        publication_date: '2002-01-10',
        authority: 'Presidência da República',
        status: 'active',
        tags: ['código civil', 'direito privado', 'obrigações', 'contratos']
      }
    }
  }
  
  private static extractArticleNumber(text: string): string {
    const match = text.match(/Art\.?\s*(\d+)/i);
    return match ? match[1] : '';
  }
}

/**
 * Parser for STF/STJ Súmulas
 */
export class SumulaParser {
  static parseSTF(html: string): Sumula[] {
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    const sumulas: Sumula[] = []
    const sumulaElements = document.querySelectorAll('.sumula, .enunciado')
    
    sumulaElements.forEach((element, index) => {
      const text = element.textContent?.trim() || ''
      const number = this.extractSumulaNumber(text)
      
      if (number) {
        sumulas.push({
          id: `stf_sumula_${number}`,
          court: 'STF',
          number: parseInt(number),
          text: text,
          type: text.includes('Vinculante') ? 'sumula_vinculante' : 'sumula',
          status: 'active',
          publication_date: new Date().toISOString().split('T')[0],
          subject_areas: this.extractSubjectAreas(text)
        })
      }
    })
    
    return sumulas
  }
  
  static parseSTJ(html: string): Sumula[] {
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    const sumulas: Sumula[] = []
    const sumulaElements = document.querySelectorAll('.sumula, .enunciado')
    
    sumulaElements.forEach((element) => {
      const text = element.textContent?.trim() || ''
      const number = this.extractSumulaNumber(text)
      
      if (number) {
        sumulas.push({
          id: `stj_sumula_${number}`,
          court: 'STJ',
          number: parseInt(number),
          text: text,
          type: 'sumula',
          status: 'active',
          publication_date: new Date().toISOString().split('T')[0],
          subject_areas: this.extractSubjectAreas(text)
        })
      }
    })
    
    return sumulas
  }
  
  private static extractSumulaNumber(text: string): string | null {
    const match = text.match(/Súmula\s*(\d+)/i);
    return match ? match[1] : null;
  }
  
  private static extractSubjectAreas(text: string): string[] {
    const areas: string[] = []
    
    // Simple keyword-based classification
    if (text.toLowerCase().includes('tributário') || text.toLowerCase().includes('imposto')) {
      areas.push('Direito Tributário')
    }
    if (text.toLowerCase().includes('civil') || text.toLowerCase().includes('contrato')) {
      areas.push('Direito Civil')
    }
    if (text.toLowerCase().includes('penal') || text.toLowerCase().includes('crime')) {
      areas.push('Direito Penal')
    }
    if (text.toLowerCase().includes('constitucional') || text.toLowerCase().includes('fundamental')) {
      areas.push('Direito Constitucional')
    }
    if (text.toLowerCase().includes('administrativo') || text.toLowerCase().includes('servidor')) {
      areas.push('Direito Administrativo')
    }
    
    return areas.length > 0 ? areas : ['Geral']
  }
}

/**
 * Text chunking for RAG
 */
export class TextChunker {
  static chunkLegalContent(content: LegalContent[], maxChunkSize: number = 1000): string[] {
    const chunks: string[] = []
    
    content.forEach((item) => {
      const text = `${item.type.toUpperCase()} ${item.number || ''}: ${item.text}`
      
      if (text.length <= maxChunkSize) {
        chunks.push(text)
      } else {
        // Split long content into smaller chunks
        const sentences = text.split(/[.!?]+/)
        let currentChunk = ''
        
        sentences.forEach((sentence) => {
          if ((currentChunk + sentence).length <= maxChunkSize) {
            currentChunk += sentence + '. '
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim())
            }
            currentChunk = sentence + '. '
          }
        })
        
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
      }
    })
    
    return chunks
  }
  
  static chunkSumulas(sumulas: Sumula[], maxChunkSize: number = 500): string[] {
    return sumulas.map(sumula => 
      `SÚMULA ${sumula.number} - ${sumula.court}: ${sumula.text}`
    ).filter(text => text.length <= maxChunkSize)
  }
}

