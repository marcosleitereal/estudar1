// Populate database with data only (skip schema creation)
import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function populateData() {
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

    // Read and execute populate-data.sql only
    console.log('📄 Reading populate-data.sql...')
    const populateSQL = readFileSync(join(process.cwd(), 'populate-data.sql'), 'utf-8')
    
    console.log('🔄 Populating database with initial data...')
    await client.query(populateSQL)
    console.log('✅ Database populated successfully')

    // Verify data was inserted
    console.log('🔍 Verifying data insertion...')
    
    const lawsCount = await client.query('SELECT COUNT(*) FROM laws')
    console.log(`📚 Laws inserted: ${lawsCount.rows[0].count}`)
    
    const sumulasCount = await client.query('SELECT COUNT(*) FROM sumulas')
    console.log(`⚖️  Súmulas inserted: ${sumulasCount.rows[0].count}`)
    
    const questionsCount = await client.query('SELECT COUNT(*) FROM questions')
    console.log(`❓ Questions inserted: ${questionsCount.rows[0].count}`)
    
    const flashcardsCount = await client.query('SELECT COUNT(*) FROM flashcards')
    console.log(`🃏 Flashcards inserted: ${flashcardsCount.rows[0].count}`)

    // Test search functionality
    console.log('🔍 Testing search functionality...')
    const searchTest = await client.query(`
      SELECT l.title, l.article, l.content 
      FROM laws l 
      WHERE l.content ILIKE '%organização político-administrativa%' 
      LIMIT 1
    `)
    
    if (searchTest.rows.length > 0) {
      console.log('✅ Search test successful - found Art. 18')
      console.log(`   Title: ${searchTest.rows[0].title}`)
      console.log(`   Article: ${searchTest.rows[0].article}`)
    } else {
      console.log('⚠️  Search test failed - no results found')
    }

    console.log('\n🎉 Database population completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Laws: ${lawsCount.rows[0].count}`)
    console.log(`   - Súmulas: ${sumulasCount.rows[0].count}`)
    console.log(`   - Questions: ${questionsCount.rows[0].count}`)
    console.log(`   - Flashcards: ${flashcardsCount.rows[0].count}`)

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
  populateData()
}

export { populateData }

