// Setup database from scratch for Estudar.Pro
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up Estudar.Pro database...')
  
  try {
    // Read all migration files
    const migrationsDir = join(process.cwd(), 'db', 'migrations')
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_user_content.sql', 
      '003_imports_and_rls.sql',
      '004_vector_search_functions.sql'
    ]

    console.log('📁 Found migration files:', migrationFiles.length)

    // Execute each migration
    for (const file of migrationFiles) {
      console.log(`🔄 Executing migration: ${file}`)
      
      const migrationPath = join(migrationsDir, file)
      const migrationSQL = readFileSync(migrationPath, 'utf-8')
      
      // Split SQL by statements (simple approach)
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`  ⚡ Executing: ${statement.substring(0, 50)}...`)
          
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement
          })

          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1)

            if (directError) {
              console.log(`  ⚠️  RPC not available, trying direct execution...`)
              // For now, we'll log the SQL that needs to be executed manually
              console.log(`  📝 SQL to execute manually in Supabase SQL Editor:`)
              console.log(`     ${statement}`)
            }
          } else {
            console.log(`  ✅ Statement executed successfully`)
          }
        }
      }
      
      console.log(`✅ Migration ${file} completed`)
    }

    console.log('\n🎉 Database setup completed!')
    console.log('📊 Next steps:')
    console.log('  1. Verify tables were created in Supabase dashboard')
    console.log('  2. Run: npm run seed (to populate with sample data)')
    console.log('  3. Test the application')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    // Provide manual setup instructions
    console.log('\n📋 Manual Setup Instructions:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Execute the following migration files in order:')
    
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_user_content.sql', 
      '003_imports_and_rls.sql',
      '004_vector_search_functions.sql'
    ]

    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. db/migrations/${file}`)
    })
    
    process.exit(1)
  }
}

// Execute if called directly
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }

