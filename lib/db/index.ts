import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (for authenticated users)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database utility functions
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error
    }

    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export async function getTableCounts() {
  const tables = [
    'users', 'sources', 'laws', 'law_chunks', 'sumulas', 
    'enunciados', 'juris', 'notes', 'highlights', 'decks', 
    'flashcards', 'questions', 'quiz_attempts'
  ]

  const counts: Record<string, number> = {}

  for (const table of tables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(table as any)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        counts[table] = count || 0
      }
    } catch (error) {
      counts[table] = 0
    }
  }

  return counts
}

// Vector search utilities
export async function searchLawChunks(query: string, embedding: number[], limit = 10) {
  const { data, error } = await supabase.rpc('search_law_chunks', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit
  })

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`)
  }

  return data
}

export async function searchSumulas(query: string, embedding: number[], limit = 10) {
  const { data, error } = await supabase.rpc('search_sumulas', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit
  })

  if (error) {
    throw new Error(`Sumulas search failed: ${error.message}`)
  }

  return data
}

// Full-text search utilities
export async function fullTextSearchLaws(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('laws')
    .select('id, ref, text_plain, source_id, sources(title, org)')
    .textSearch('text_plain', query, {
      type: 'websearch',
      config: 'portuguese'
    })
    .eq('is_current', true)
    .limit(limit)

  if (error) {
    throw new Error(`Full-text search failed: ${error.message}`)
  }

  return data
}

export async function fullTextSearchSumulas(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('sumulas')
    .select('*')
    .textSearch('texto', query, {
      type: 'websearch',
      config: 'portuguese'
    })
    .limit(limit)

  if (error) {
    throw new Error(`Sumulas full-text search failed: ${error.message}`)
  }

  return data
}

