// Execute database migrations directly via PostgreSQL connection
import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function executeMigrations() {
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

    // Read and execute setup-complete.sql
    console.log('📄 Reading setup-complete.sql...')
    const setupSQL = readFileSync(join(process.cwd(), 'setup-complete.sql'), 'utf-8')
    
    console.log('🔄 Executing database setup...')
    await client.query(setupSQL)
    console.log('✅ Database setup completed successfully')

    // Read and execute populate-data.sql
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

    console.log('\n🎉 Database setup and population completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Laws: ${lawsCount.rows[0].count}`)
    console.log(`   - Súmulas: ${sumulasCount.rows[0].count}`)
    console.log(`   - Questions: ${questionsCount.rows[0].count}`)
    console.log(`   - Flashcards: ${flashcardsCount.rows[0].count}`)
    
    console.log('\n🚀 Next steps:')
    console.log('   1. Update Next.js configuration for full-stack deployment')
    console.log('   2. Test the application with real data')
    console.log('   3. Deploy the complete platform')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      
      // Provide specific guidance based on error type
      if (error.message.includes('permission denied')) {
        console.log('\n💡 Suggestion: Check if the database user has sufficient permissions')
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n💡 Suggestion: Some tables may already exist or there may be dependency issues')
      } else if (error.message.includes('connection')) {
        console.log('\n💡 Suggestion: Check database connection string and network access')
      }
    }
    
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Execute if called directly
if (require.main === module) {
  executeMigrations()
}

export { executeMigrations }

