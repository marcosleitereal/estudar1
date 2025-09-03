import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas...\n')

  try {
    // Verificar estrutura da tabela law_chunks
    console.log('📄 Estrutura da tabela law_chunks:')
    const { data: lawChunksStructure, error: structureError } = await supabase
      .rpc('get_table_columns', { table_name: 'law_chunks' })

    if (structureError) {
      console.log('Tentando método alternativo...')
      // Método alternativo - buscar um registro para ver as colunas
      const { data: sampleData, error: sampleError } = await supabase
        .from('law_chunks')
        .select('*')
        .limit(1)

      if (sampleError) {
        console.error('❌ Erro ao verificar estrutura:', sampleError)
      } else {
        console.log('✅ Colunas encontradas:', Object.keys(sampleData[0] || {}))
        if (sampleData && sampleData.length > 0) {
          console.log('📋 Exemplo de dados:')
          console.log(JSON.stringify(sampleData[0], null, 2))
        }
      }
    } else {
      console.log('✅ Estrutura da tabela:', lawChunksStructure)
    }

    // Verificar dados na tabela law_chunks
    console.log('\n📊 Contando registros:')
    const { count: chunksCount, error: countError } = await supabase
      .from('law_chunks')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao contar chunks:', countError)
    } else {
      console.log(`✅ Total de chunks: ${chunksCount}`)
    }

    // Verificar dados na tabela laws
    const { count: lawsCount, error: lawsCountError } = await supabase
      .from('laws')
      .select('*', { count: 'exact', head: true })

    if (lawsCountError) {
      console.error('❌ Erro ao contar laws:', lawsCountError)
    } else {
      console.log(`✅ Total de laws: ${lawsCount}`)
    }

    // Tentar busca simples
    console.log('\n🔍 Testando busca simples:')
    const { data: simpleSearch, error: simpleError } = await supabase
      .from('law_chunks')
      .select('*')
      .limit(3)

    if (simpleError) {
      console.error('❌ Erro na busca simples:', simpleError)
    } else {
      console.log(`✅ Registros encontrados: ${simpleSearch?.length || 0}`)
      if (simpleSearch && simpleSearch.length > 0) {
        console.log('📋 Primeiro registro:')
        console.log(JSON.stringify(simpleSearch[0], null, 2))
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkTableStructure()

