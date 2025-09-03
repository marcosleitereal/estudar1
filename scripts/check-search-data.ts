import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NTc2NzQsImV4cCI6MjA3MjQzMzY3NH0.js7yainSICtdl7QSFya9oIcsCRL29O-3WTpwgUbBlEk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSearchData() {
  console.log('🔍 Verificando dados para busca...\n')

  try {
    // Verificar tabela laws
    console.log('📚 Verificando tabela laws:')
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('*')
      .limit(5)

    if (lawsError) {
      console.error('❌ Erro ao buscar laws:', lawsError)
    } else {
      console.log(`✅ Total de leis encontradas: ${laws?.length || 0}`)
      if (laws && laws.length > 0) {
        laws.forEach(law => {
          console.log(`   - ${law.title} (${law.type})`)
        })
      }
    }

    // Verificar tabela law_chunks
    console.log('\n📄 Verificando tabela law_chunks:')
    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('*')
      .limit(5)

    if (chunksError) {
      console.error('❌ Erro ao buscar law_chunks:', chunksError)
    } else {
      console.log(`✅ Total de chunks encontrados: ${chunks?.length || 0}`)
      if (chunks && chunks.length > 0) {
        chunks.forEach(chunk => {
          console.log(`   - ${chunk.title?.substring(0, 50)}...`)
        })
      }
    }

    // Verificar busca específica por Art. 5º
    console.log('\n🔍 Testando busca por "Art. 5º CF/88":')
    const { data: searchResults, error: searchError } = await supabase
      .from('law_chunks')
      .select('*')
      .or('title.ilike.%art. 5%,content.ilike.%art. 5%')
      .limit(3)

    if (searchError) {
      console.error('❌ Erro na busca:', searchError)
    } else {
      console.log(`✅ Resultados encontrados: ${searchResults?.length || 0}`)
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach(result => {
          console.log(`   - ${result.title}`)
          console.log(`     ${result.content?.substring(0, 100)}...`)
        })
      }
    }

    // Verificar se há dados com "direitos fundamentais"
    console.log('\n🔍 Testando busca por "direitos fundamentais":')
    const { data: fundamentalResults, error: fundamentalError } = await supabase
      .from('law_chunks')
      .select('*')
      .or('title.ilike.%direitos fundamentais%,content.ilike.%direitos fundamentais%')
      .limit(3)

    if (fundamentalError) {
      console.error('❌ Erro na busca:', fundamentalError)
    } else {
      console.log(`✅ Resultados encontrados: ${fundamentalResults?.length || 0}`)
      if (fundamentalResults && fundamentalResults.length > 0) {
        fundamentalResults.forEach(result => {
          console.log(`   - ${result.title}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkSearchData()

