// Simple script to populate essential data
import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function simplePopulate() {
  console.log('🚀 Connecting to PostgreSQL database...')
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Connected to database successfully')

    // Insert source
    console.log('📚 Inserting Constitution source...')
    await client.query(`
      INSERT INTO sources (name, type, description) 
      VALUES ('Constituicao Federal de 1988', 'constitution', 'Constituicao da Republica Federativa do Brasil de 1988')
      ON CONFLICT DO NOTHING
    `)

    // Get source ID
    const sourceResult = await client.query(`
      SELECT id FROM sources WHERE name = 'Constituicao Federal de 1988' LIMIT 1
    `)
    const sourceId = sourceResult.rows[0]?.id

    if (!sourceId) {
      throw new Error('Could not get source ID')
    }

    // Insert key articles
    console.log('📜 Inserting constitutional articles...')
    
    const articles = [
      {
        article: 'Art. 1º',
        content: 'A Republica Federativa do Brasil, formada pela uniao indissoluvel dos Estados e Municipios e do Distrito Federal, constitui-se em Estado Democratico de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo politico. Paragrafo unico. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituicao.',
        order_index: 1
      },
      {
        article: 'Art. 18',
        content: 'A organizacao politico-administrativa da Republica Federativa do Brasil compreende a Uniao, os Estados, o Distrito Federal e os Municipios, todos autonomos, nos termos desta Constituicao. § 1º Brasilia e a Capital Federal. § 2º Os Territorios Federais integram a Uniao, e sua criacao, transformacao em Estado ou reintegracao ao Estado de origem serao reguladas em lei complementar.',
        order_index: 18
      },
      {
        article: 'Art. 2º',
        content: 'Sao Poderes da Uniao, independentes e harmonicos entre si, o Legislativo, o Executivo e o Judiciario.',
        order_index: 2
      },
      {
        article: 'Art. 5º',
        content: 'Todos sao iguais perante a lei, sem distincao de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no Pais a inviolabilidade do direito a vida, a liberdade, a igualdade, a seguranca e a propriedade.',
        order_index: 5
      }
    ]

    for (const article of articles) {
      await client.query(`
        INSERT INTO laws (source_id, title, article, content, hierarchy_level, order_index)
        VALUES ($1, 'Constituicao Federal de 1988', $2, $3, 1, $4)
        ON CONFLICT DO NOTHING
      `, [sourceId, article.article, article.content, article.order_index])
      
      console.log(`✅ Inserted ${article.article}`)
    }

    // Insert some questions
    console.log('❓ Inserting sample questions...')
    await client.query(`
      INSERT INTO questions (content, type, options, correct_answer, explanation, difficulty, subject, tags)
      VALUES 
      ('Segundo o Art. 18 da CF, qual e a Capital Federal?', 'multiple_choice', 
       '{"a": "Brasilia", "b": "Rio de Janeiro", "c": "Sao Paulo", "d": "Salvador"}', 
       'a', 'O § 1º do Art. 18 estabelece que Brasilia e a Capital Federal.', 'easy', 'Direito Constitucional', 
       '{"brasilia", "capital", "art18"}')
      ON CONFLICT DO NOTHING
    `)

    // Verify data
    console.log('🔍 Verifying data insertion...')
    
    const lawsCount = await client.query('SELECT COUNT(*) FROM laws')
    console.log(`📚 Laws inserted: ${lawsCount.rows[0].count}`)
    
    const questionsCount = await client.query('SELECT COUNT(*) FROM questions')
    console.log(`❓ Questions inserted: ${questionsCount.rows[0].count}`)

    // Test search
    console.log('🔍 Testing search for Art. 18...')
    const searchTest = await client.query(`
      SELECT l.title, l.article, l.content 
      FROM laws l 
      WHERE l.content ILIKE '%organizacao politico-administrativa%' 
      LIMIT 1
    `)
    
    if (searchTest.rows.length > 0) {
      console.log('✅ Search test successful - found Art. 18')
      console.log(`   Article: ${searchTest.rows[0].article}`)
    } else {
      console.log('⚠️  Search test failed - no results found')
    }

    console.log('\n🎉 Database populated successfully!')
    console.log('🚀 The application should now work with real data!')

  } catch (error) {
    console.error('❌ Population failed:', error)
    
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Execute if called directly
if (require.main === module) {
  simplePopulate()
}

export { simplePopulate }

