import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateArt5Data() {
  console.log('📚 Populando dados do Art. 5º CF/88...\n')

  try {
    // Primeiro, verificar se já existe uma lei da Constituição
    const { data: existingLaw, error: checkError } = await supabase
      .from('laws')
      .select('id')
      .eq('title', 'Constituição Federal de 1988')
      .eq('article', 'Art. 5º')
      .single()

    let lawId = existingLaw?.id

    if (!lawId) {
      // Criar nova lei para o Art. 5º
      const { data: newLaw, error: lawError } = await supabase
        .from('laws')
        .insert({
          title: 'Constituição Federal de 1988',
          article: 'Art. 5º',
          content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem...',
          type: 'constitutional',
          source: 'Planalto',
          url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'
        })
        .select('id')
        .single()

      if (lawError) {
        console.error('❌ Erro ao criar lei:', lawError)
        return
      }

      lawId = newLaw.id
      console.log('✅ Lei do Art. 5º criada:', lawId)
    } else {
      console.log('✅ Lei do Art. 5º já existe:', lawId)
    }

    // Criar chunks para o Art. 5º
    const art5Chunks = [
      {
        law_id: lawId,
        content: 'Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
        metadata: { article: '5', section: 'caput' }
      },
      {
        law_id: lawId,
        content: 'Art. 5º, I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição.',
        metadata: { article: '5', inciso: 'I' }
      },
      {
        law_id: lawId,
        content: 'Art. 5º, II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.',
        metadata: { article: '5', inciso: 'II' }
      },
      {
        law_id: lawId,
        content: 'Art. 5º, III - ninguém será submetido a tortura nem a tratamento desumano ou degradante.',
        metadata: { article: '5', inciso: 'III' }
      },
      {
        law_id: lawId,
        content: 'Art. 5º, IV - é livre a manifestação do pensamento, sendo vedado o anonimato.',
        metadata: { article: '5', inciso: 'IV' }
      },
      {
        law_id: lawId,
        content: 'Art. 5º, V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem.',
        metadata: { article: '5', inciso: 'V' }
      }
    ]

    // Inserir chunks
    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .insert(art5Chunks)
      .select('id')

    if (chunksError) {
      console.error('❌ Erro ao inserir chunks:', chunksError)
    } else {
      console.log(`✅ ${chunks?.length || 0} chunks do Art. 5º inseridos`)
    }

    // Verificar se a busca funciona agora
    console.log('\n🔍 Testando busca por "Art. 5º CF/88":')
    const { data: searchResults, error: searchError } = await supabase
      .from('law_chunks')
      .select('*')
      .ilike('content', '%Art. 5º%')
      .limit(3)

    if (searchError) {
      console.error('❌ Erro na busca:', searchError)
    } else {
      console.log(`✅ Resultados encontrados: ${searchResults?.length || 0}`)
      searchResults?.forEach(result => {
        console.log(`   - ${result.content?.substring(0, 80)}...`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

populateArt5Data()

