import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function auditLegalData() {
  console.log('📊 AUDITORIA COMPLETA DOS DADOS JURÍDICOS\n')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar tabela laws
    console.log('\n📚 1. TABELA LAWS (Leis Principais)')
    console.log('-'.repeat(40))
    
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('*')
      .order('title', { ascending: true })

    if (lawsError) {
      console.error('❌ Erro ao buscar laws:', lawsError)
    } else {
      console.log(`✅ Total de leis: ${laws?.length || 0}`)
      
      // Agrupar por tipo/fonte
      const lawsByType = {}
      laws?.forEach(law => {
        const type = law.title || 'Sem título'
        if (!lawsByType[type]) {
          lawsByType[type] = []
        }
        lawsByType[type].push(law)
      })

      Object.entries(lawsByType).forEach(([type, lawList]) => {
        console.log(`\n📖 ${type}:`)
        lawList.forEach(law => {
          console.log(`   - ${law.article || 'Sem artigo'} (ID: ${law.id.substring(0, 8)}...)`)
        })
      })
    }

    // 2. Verificar tabela law_chunks
    console.log('\n\n📄 2. TABELA LAW_CHUNKS (Conteúdo Detalhado)')
    console.log('-'.repeat(40))
    
    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('*')
      .order('created_at', { ascending: true })

    if (chunksError) {
      console.error('❌ Erro ao buscar chunks:', chunksError)
    } else {
      console.log(`✅ Total de chunks: ${chunks?.length || 0}`)
      
      // Analisar conteúdo dos chunks
      const chunksByContent = {}
      chunks?.forEach(chunk => {
        const preview = chunk.content?.substring(0, 50) + '...' || 'Sem conteúdo'
        const key = chunk.content?.includes('STF') ? 'Jurisprudência STF' :
                   chunk.content?.includes('STJ') ? 'Jurisprudência STJ' :
                   chunk.content?.includes('Art.') ? 'Artigos Constitucionais' :
                   'Outros'
        
        if (!chunksByContent[key]) {
          chunksByContent[key] = []
        }
        chunksByContent[key].push(preview)
      })

      Object.entries(chunksByContent).forEach(([category, items]) => {
        console.log(`\n📋 ${category} (${items.length} itens):`)
        items.slice(0, 5).forEach(item => {
          console.log(`   - ${item}`)
        })
        if (items.length > 5) {
          console.log(`   ... e mais ${items.length - 5} itens`)
        }
      })
    }

    // 3. Verificar cobertura das leis principais
    console.log('\n\n⚖️ 3. COBERTURA DAS LEIS PRINCIPAIS')
    console.log('-'.repeat(40))
    
    const expectedLaws = [
      'Constituição Federal de 1988',
      'Código Civil',
      'Código Penal', 
      'Código de Processo Civil',
      'Código de Processo Penal',
      'Código de Defesa do Consumidor',
      'Consolidação das Leis do Trabalho',
      'Lei de Execução Penal',
      'Estatuto da Criança e do Adolescente',
      'Lei Maria da Penha'
    ]

    expectedLaws.forEach(expectedLaw => {
      const found = laws?.some(law => 
        law.title?.toLowerCase().includes(expectedLaw.toLowerCase()) ||
        law.content?.toLowerCase().includes(expectedLaw.toLowerCase())
      )
      console.log(`${found ? '✅' : '❌'} ${expectedLaw}`)
    })

    // 4. Verificar artigos constitucionais específicos
    console.log('\n\n📜 4. ARTIGOS CONSTITUCIONAIS ESPECÍFICOS')
    console.log('-'.repeat(40))
    
    const expectedArticles = [
      'Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º',
      'Art. 6º', 'Art. 7º', 'Art. 8º', 'Art. 9º', 'Art. 10',
      'Art. 18', 'Art. 37', 'Art. 93', 'Art. 102', 'Art. 105'
    ]

    for (const article of expectedArticles) {
      const found = await supabase
        .from('law_chunks')
        .select('id')
        .ilike('content', `%${article}%`)
        .limit(1)
        .single()
      
      console.log(`${found.data ? '✅' : '❌'} ${article}`)
    }

    // 5. Verificar jurisprudência
    console.log('\n\n⚖️ 5. JURISPRUDÊNCIA DOS TRIBUNAIS SUPERIORES')
    console.log('-'.repeat(40))
    
    const { data: stfCases } = await supabase
      .from('law_chunks')
      .select('content')
      .ilike('content', '%STF%')
    
    const { data: stjCases } = await supabase
      .from('law_chunks')
      .select('content')
      .ilike('content', '%STJ%')

    console.log(`✅ Casos STF: ${stfCases?.length || 0}`)
    console.log(`✅ Casos STJ: ${stjCases?.length || 0}`)

    // 6. Teste de busca funcional
    console.log('\n\n🔍 6. TESTE DE FUNCIONALIDADE DE BUSCA')
    console.log('-'.repeat(40))
    
    const testQueries = [
      'direitos fundamentais',
      'Art. 5º',
      'STF',
      'código civil',
      'processo penal'
    ]

    for (const query of testQueries) {
      const { data: results } = await supabase
        .from('law_chunks')
        .select('id')
        .ilike('content', `%${query}%`)
        .limit(5)
      
      console.log(`🔍 "${query}": ${results?.length || 0} resultados`)
    }

    // 7. Resumo final
    console.log('\n\n📊 7. RESUMO FINAL')
    console.log('=' .repeat(60))
    console.log(`📚 Total de leis: ${laws?.length || 0}`)
    console.log(`📄 Total de chunks: ${chunks?.length || 0}`)
    console.log(`⚖️ Jurisprudência STF: ${stfCases?.length || 0}`)
    console.log(`⚖️ Jurisprudência STJ: ${stjCases?.length || 0}`)
    
    const completeness = ((laws?.length || 0) / expectedLaws.length) * 100
    console.log(`📈 Completude estimada: ${completeness.toFixed(1)}%`)
    
    if (completeness >= 80) {
      console.log('✅ STATUS: DADOS JURÍDICOS SUFICIENTES PARA PRODUÇÃO')
    } else if (completeness >= 50) {
      console.log('⚠️ STATUS: DADOS PARCIAIS - RECOMENDA-SE EXPANSÃO')
    } else {
      console.log('❌ STATUS: DADOS INSUFICIENTES - NECESSÁRIA POPULAÇÃO COMPLETA')
    }

  } catch (error) {
    console.error('❌ Erro na auditoria:', error)
  }
}

auditLegalData()

