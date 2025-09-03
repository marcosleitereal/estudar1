#!/usr/bin/env tsx
// ETL Import Scripts for Legal Content

import { createClient } from '@supabase/supabase-js'
import { ConstitutionParser, CivilCodeParser, SumulaParser, TextChunker } from '../lib/etl/parsers'
import { ETLPipeline } from '../lib/etl/embeddings'
import fetch from 'node-fetch'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Import Constitution Federal (CF/88)
 */
async function importConstitution() {
  console.log('🏛️ Importing Brazilian Constitution...')
  
  try {
    // Fetch Constitution HTML from Planalto
    const response = await fetch('http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm')
    const html = await response.text()
    
    // Parse document
    const document = ConstitutionParser.parse(html)
    
    // Generate chunks for RAG
    const chunks = TextChunker.chunkLegalContent(document.content, 1000)
    
    // Process through ETL pipeline
    const pipeline = new ETLPipeline()
    await pipeline.processDocument(document, chunks, supabase)
    
    console.log('✅ Constitution imported successfully')
  } catch (error) {
    console.error('❌ Error importing Constitution:', error)
  }
}

/**
 * Import Civil Code (CC/2002)
 */
async function importCivilCode() {
  console.log('📜 Importing Civil Code...')
  
  try {
    // Fetch Civil Code HTML from Planalto
    const response = await fetch('http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm')
    const html = await response.text()
    
    // Parse document
    const document = CivilCodeParser.parse(html)
    
    // Generate chunks for RAG
    const chunks = TextChunker.chunkLegalContent(document.content, 1000)
    
    // Process through ETL pipeline
    const pipeline = new ETLPipeline()
    await pipeline.processDocument(document, chunks, supabase)
    
    console.log('✅ Civil Code imported successfully')
  } catch (error) {
    console.error('❌ Error importing Civil Code:', error)
  }
}

/**
 * Import STF Súmulas
 */
async function importSTFSumulas() {
  console.log('⚖️ Importing STF Súmulas...')
  
  try {
    // Mock data for demonstration (in production, fetch from STF website)
    const mockHTML = `
      <div class="sumula">Súmula 1: É vedada a cobrança de taxa de matrícula nas universidades públicas.</div>
      <div class="sumula">Súmula 2: A taxa de ocupação territorial urbana não pode ter base de cálculo idêntica à do IPTU.</div>
      <div class="sumula">Súmula Vinculante 1: Ofende o princípio da moralidade administrativa a nomeação de cônjuge, companheiro, ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica, investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança, ou, ainda, de função gratificada na Administração Pública direta e indireta, em qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos municípios, compreendido o ajuste mediante designações recíprocas, exceto para os cargos políticos de Ministro de Estado, de Secretário Estadual, de Secretário Municipal ou equivalentes.</div>
    `
    
    // Parse súmulas
    const sumulas = SumulaParser.parseSTF(mockHTML)
    
    // Generate chunks for RAG
    const chunks = TextChunker.chunkSumulas(sumulas, 500)
    
    // Process through ETL pipeline
    const pipeline = new ETLPipeline()
    await pipeline.processSumulas(sumulas, chunks, supabase)
    
    console.log('✅ STF Súmulas imported successfully')
  } catch (error) {
    console.error('❌ Error importing STF Súmulas:', error)
  }
}

/**
 * Import STJ Súmulas
 */
async function importSTJSumulas() {
  console.log('⚖️ Importing STJ Súmulas...')
  
  try {
    // Mock data for demonstration
    const mockHTML = `
      <div class="sumula">Súmula 1: O foro do domicílio ou da residência do alimentando é o competente para a ação de investigação de paternidade, quando cumulada com a de alimentos.</div>
      <div class="sumula">Súmula 2: Não cabe o habeas corpus contra decisão condenatória a pena de multa, ou relativo a processo em curso por infração penal a que a pena pecuniária seja a única cominada.</div>
      <div class="sumula">Súmula 3: A competência para processar e julgar as ações conexas é do juízo prevento, observadas as regras do Código de Processo Civil.</div>
    `
    
    // Parse súmulas
    const sumulas = SumulaParser.parseSTJ(mockHTML)
    
    // Generate chunks for RAG
    const chunks = TextChunker.chunkSumulas(sumulas, 500)
    
    // Process through ETL pipeline
    const pipeline = new ETLPipeline()
    await pipeline.processSumulas(sumulas, chunks, supabase)
    
    console.log('✅ STJ Súmulas imported successfully')
  } catch (error) {
    console.error('❌ Error importing STJ Súmulas:', error)
  }
}

/**
 * Import sample legal documents
 */
async function importSampleDocuments() {
  console.log('📚 Importing sample legal documents...')
  
  try {
    // Sample Constitution articles
    const sampleConstitution = {
      id: 'cf88_sample',
      title: 'Constituição Federal - Artigos Exemplo',
      type: 'constitution' as const,
      source_url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      content: [
        {
          id: 'art5',
          type: 'article' as const,
          number: '5',
          text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
          level: 1,
          children: ['art5_par1', 'art5_inc1']
        },
        {
          id: 'art5_inc1',
          type: 'item' as const,
          number: 'I',
          text: 'homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;',
          parent_id: 'art5',
          level: 2
        },
        {
          id: 'art6',
          type: 'article' as const,
          number: '6',
          text: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.',
          level: 1
        }
      ],
      metadata: {
        publication_date: '1988-10-05',
        authority: 'Assembleia Nacional Constituinte',
        status: 'active' as const,
        tags: ['constituição', 'direitos fundamentais']
      }
    }
    
    // Sample Civil Code articles
    const sampleCivilCode = {
      id: 'cc2002_sample',
      title: 'Código Civil - Artigos Exemplo',
      type: 'code' as const,
      source_url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm',
      content: [
        {
          id: 'cc_art1',
          type: 'article' as const,
          number: '1',
          text: 'Toda pessoa é capaz de direitos e deveres na ordem civil.',
          level: 1
        },
        {
          id: 'cc_art2',
          type: 'article' as const,
          number: '2',
          text: 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
          level: 1
        }
      ],
      metadata: {
        publication_date: '2002-01-10',
        authority: 'Presidência da República',
        status: 'active' as const,
        tags: ['código civil', 'personalidade']
      }
    }
    
    // Process documents
    const pipeline = new ETLPipeline()
    
    // Process Constitution sample
    const constitutionChunks = TextChunker.chunkLegalContent(sampleConstitution.content, 1000)
    await pipeline.processDocument(sampleConstitution, constitutionChunks, supabase)
    
    // Process Civil Code sample
    const civilCodeChunks = TextChunker.chunkLegalContent(sampleCivilCode.content, 1000)
    await pipeline.processDocument(sampleCivilCode, civilCodeChunks, supabase)
    
    console.log('✅ Sample documents imported successfully')
  } catch (error) {
    console.error('❌ Error importing sample documents:', error)
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting ETL Import Process...')
  
  const args = process.argv.slice(2)
  const importType = args[0] || 'all'
  
  try {
    switch (importType) {
      case 'constitution':
        await importConstitution()
        break
      case 'civil-code':
        await importCivilCode()
        break
      case 'stf-sumulas':
        await importSTFSumulas()
        break
      case 'stj-sumulas':
        await importSTJSumulas()
        break
      case 'sample':
        await importSampleDocuments()
        break
      case 'all':
        await importSampleDocuments()
        await importSTFSumulas()
        await importSTJSumulas()
        break
      default:
        console.log('Usage: npm run etl:import [constitution|civil-code|stf-sumulas|stj-sumulas|sample|all]')
    }
    
    console.log('🎉 ETL Import Process completed!')
  } catch (error) {
    console.error('💥 ETL Import Process failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as runETLImport }

