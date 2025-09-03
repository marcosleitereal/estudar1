import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in search API. Using fallback values.')
    return {
      url: 'https://placeholder.supabase.co',
      serviceKey: 'placeholder-service-key'
    }
  }

  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'smart'
    const limit = parseInt(searchParams.get('limit') || '15')
    
    console.log('🔍 Search API - GET request:', { query, type, limit })
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const config = getSupabaseConfig()
    
    // Verificar se a configuração é válida
    if (config.url === 'https://placeholder.supabase.co') {
      console.log('❌ Supabase not configured')
      return NextResponse.json({
        results: [],
        total: 0,
        query,
        type,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)
    
    // Search in laws table - SINTAXE CORRIGIDA
    console.log('📚 Searching in laws table for:', query)
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('id, title, article, content')
      .or(`content.ilike.%${query}%,article.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(Math.floor(limit / 2))

    console.log('📚 Laws result:', { count: laws?.length, error: lawsError?.message })

    // Search in law_chunks table - SINTAXE CORRIGIDA
    console.log('📄 Searching in law_chunks table for:', query)
    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('id, content, law_id, metadata')
      .textSearch('content', query.replace(/[^\w\s]/g, ' '))
      .limit(Math.floor(limit / 2))

    console.log('📄 Chunks result:', { count: chunks?.length, error: chunksError?.message })

    // Se textSearch falhar, tentar ilike simples
    let chunksBackup = []
    if (!chunks || chunks.length === 0) {
      console.log('🔄 Trying backup search with ilike...')
      const { data: backupChunks, error: backupError } = await supabase
        .from('law_chunks')
        .select('id, content, law_id, metadata')
        .ilike('content', `%${query}%`)
        .limit(Math.floor(limit / 2))
      
      chunksBackup = backupChunks || []
      console.log('🔄 Backup search result:', { count: chunksBackup.length, error: backupError?.message })
    }

    const finalChunks = chunks && chunks.length > 0 ? chunks : chunksBackup

    // Transform results
    const lawResults = (laws || []).map(law => ({
      id: law.id,
      title: law.article || law.title || 'Artigo',
      content: law.content?.substring(0, 300) + (law.content && law.content.length > 300 ? '...' : ''),
      type: 'article',
      source: law.title || 'Constituição Federal',
      similarity: 0.9,
      highlights: extractHighlights(law.content || '', query),
      metadata: {
        document_id: `law_${law.id}`,
        article_number: law.article?.replace(/[^\d]/g, '') || '',
        full_content: law.content
      }
    }))

    const chunkResults = (finalChunks || []).map(chunk => ({
      id: chunk.id,
      title: chunk.content?.substring(0, 50) + '...' || 'Jurisprudência',
      content: chunk.content?.substring(0, 300) + (chunk.content && chunk.content.length > 300 ? '...' : ''),
      type: 'jurisprudence',
      source: 'Jurisprudência',
      similarity: 0.8,
      highlights: extractHighlights(chunk.content || '', query),
      metadata: {
        document_id: `chunk_${chunk.id}`,
        law_id: chunk.law_id,
        full_content: chunk.content,
        ...chunk.metadata
      }
    }))

    const allResults = [...lawResults, ...chunkResults]
    
    console.log(`✅ Found ${allResults.length} results for query: ${query}`)
    
    return NextResponse.json({
      results: allResults,
      total: allResults.length,
      query,
      type,
      debug: {
        lawsFound: laws?.length || 0,
        chunksFound: finalChunks?.length || 0,
        lawsError: lawsError?.message,
        chunksError: chunksError?.message
      }
    })

  } catch (error) {
    console.error('❌ Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type = 'smart', limit = 15 } = body
    
    console.log('🔍 Search API - POST request:', { query, type, limit })
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        results: [],
        total: 0,
        query,
        type,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Search in laws table
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('id, title, article, content')
      .or(`content.ilike.%${query}%,article.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(Math.floor(limit / 2))

    // Search in law_chunks table with fallback
    let chunks = []
    const { data: primaryChunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('id, content, law_id, metadata')
      .textSearch('content', query.replace(/[^\w\s]/g, ' '))
      .limit(Math.floor(limit / 2))

    if (primaryChunks && primaryChunks.length > 0) {
      chunks = primaryChunks
    } else {
      // Fallback to ilike
      const { data: fallbackChunks } = await supabase
        .from('law_chunks')
        .select('id, content, law_id, metadata')
        .ilike('content', `%${query}%`)
        .limit(Math.floor(limit / 2))
      
      chunks = fallbackChunks || []
    }

    // Transform results
    const lawResults = (laws || []).map(law => ({
      id: law.id,
      title: law.article || law.title || 'Artigo',
      content: law.content?.substring(0, 300) + (law.content && law.content.length > 300 ? '...' : ''),
      type: 'article',
      source: law.title || 'Constituição Federal',
      similarity: 0.9,
      highlights: extractHighlights(law.content || '', query),
      metadata: {
        document_id: `law_${law.id}`,
        article_number: law.article?.replace(/[^\d]/g, '') || '',
        full_content: law.content
      }
    }))

    const chunkResults = (chunks || []).map(chunk => ({
      id: chunk.id,
      title: chunk.content?.substring(0, 50) + '...' || 'Jurisprudência',
      content: chunk.content?.substring(0, 300) + (chunk.content && chunk.content.length > 300 ? '...' : ''),
      type: 'jurisprudence',
      source: 'Jurisprudência',
      similarity: 0.8,
      highlights: extractHighlights(chunk.content || '', query),
      metadata: {
        document_id: `chunk_${chunk.id}`,
        law_id: chunk.law_id,
        full_content: chunk.content,
        ...chunk.metadata
      }
    }))

    const allResults = [...lawResults, ...chunkResults]
    
    return NextResponse.json({
      results: allResults,
      total: allResults.length,
      query,
      type,
      debug: {
        lawsFound: laws?.length || 0,
        chunksFound: chunks?.length || 0,
        lawsError: lawsError?.message,
        chunksError: chunksError?.message
      }
    })

  } catch (error) {
    console.error('❌ Search API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function extractHighlights(content: string, query: string): string[] {
  if (!content || !query) return []
  
  const words = query.toLowerCase().split(' ').filter(word => word.length > 2)
  const highlights: string[] = []
  
  words.forEach(word => {
    const regex = new RegExp(`(.{0,50}${word}.{0,50})`, 'gi')
    const matches = content.match(regex)
    if (matches) {
      highlights.push(...matches.slice(0, 2))
    }
  })
  
  return highlights.slice(0, 3)
}

