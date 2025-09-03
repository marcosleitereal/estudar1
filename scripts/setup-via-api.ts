// Setup database via Supabase REST API
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupViaAPI() {
  console.log('🚀 Setting up database via Supabase API...')
  
  try {
    // Test connection first
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)

    if (testError) {
      console.log('⚠️  Direct table access failed, trying RPC approach...')
    } else {
      console.log('✅ Supabase connection successful')
    }

    // Create essential data directly via API
    console.log('📚 Inserting Constitution Federal data...')
    
    // Insert sources
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .upsert({
        name: 'Constituição Federal de 1988',
        type: 'constitution',
        description: 'Constituição da República Federativa do Brasil de 1988'
      })
      .select()

    if (sourceError) {
      console.log('⚠️  Could not insert sources via API:', sourceError.message)
    } else {
      console.log('✅ Source inserted successfully')
    }

    // Insert some key articles
    const articles = [
      {
        title: 'Constituição Federal de 1988',
        article: 'Art. 1º',
        content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
        hierarchy_level: 1,
        order_index: 1
      },
      {
        title: 'Constituição Federal de 1988',
        article: 'Art. 18',
        content: 'A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos, nos termos desta Constituição. § 1º Brasília é a Capital Federal. § 2º Os Territórios Federais integram a União, e sua criação, transformação em Estado ou reintegração ao Estado de origem serão reguladas em lei complementar. § 3º Os Estados podem incorporar-se entre si, subdividir-se ou desmembrar-se para se anexarem a outros, ou formarem novos Estados ou Territórios Federais, mediante aprovação da população diretamente interessada, através de plebiscito, e do Congresso Nacional, por lei complementar. § 4º A criação, a incorporação, a fusão e o desmembramento de Municípios, far-se-ão por lei estadual, dentro do período determinado por Lei Complementar Federal, e dependerão de consulta prévia, mediante plebiscito, às populações dos Municípios envolvidos, após divulgação dos Estudos de Viabilidade Municipal, apresentados e publicados na forma da lei.',
        hierarchy_level: 1,
        order_index: 18
      }
    ]

    for (const article of articles) {
      const { error: lawError } = await supabase
        .from('laws')
        .upsert(article)

      if (lawError) {
        console.log(`⚠️  Could not insert ${article.article}:`, lawError.message)
      } else {
        console.log(`✅ Inserted ${article.article}`)
      }
    }

    console.log('\n🎯 API Setup Summary:')
    console.log('✅ Attempted to insert key constitutional articles')
    console.log('⚠️  Full schema creation requires manual SQL execution')
    
    console.log('\n📋 Recommended Next Steps:')
    console.log('1. Execute setup-complete.sql manually in Supabase SQL Editor')
    console.log('2. Execute populate-data.sql to add all constitutional data')
    console.log('3. Test the application with full database')

  } catch (error) {
    console.error('❌ API setup failed:', error)
    
    console.log('\n📋 Manual Setup Required:')
    console.log('Please execute the SQL files manually in Supabase dashboard:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Execute setup-complete.sql')
    console.log('5. Execute populate-data.sql')
  }
}

// Execute if called directly
if (require.main === module) {
  setupViaAPI()
}

export { setupViaAPI }

