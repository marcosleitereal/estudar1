import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Migration {
  id: string
  filename: string
  sql: string
}

export async function runMigrations() {
  console.log('🔄 Starting database migrations...')

  // Create migrations table if it doesn't exist
  await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Get list of executed migrations
  const { data: executedMigrations, error: migrationError } = await supabase
    .from('migrations')
    .select('id')

  if (migrationError) {
    throw new Error(`Failed to fetch migrations: ${migrationError.message}`)
  }

  const executedIds = new Set(executedMigrations?.map(m => m.id) || [])

  // Read migration files
  const migrationsDir = join(process.cwd(), 'db', 'migrations')
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  const migrations: Migration[] = migrationFiles.map(filename => {
    const id = filename.replace('.sql', '')
    const sql = readFileSync(join(migrationsDir, filename), 'utf-8')
    return { id, filename, sql }
  })

  // Execute pending migrations
  for (const migration of migrations) {
    if (executedIds.has(migration.id)) {
      console.log(`⏭️  Skipping ${migration.filename} (already executed)`)
      continue
    }

    console.log(`🔄 Executing ${migration.filename}...`)

    try {
      // Execute migration SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: migration.sql
      })

      if (error) {
        throw new Error(`Migration failed: ${error.message}`)
      }

      // Record migration as executed
      const { error: recordError } = await supabase
        .from('migrations')
        .insert({
          id: migration.id,
          filename: migration.filename
        })

      if (recordError) {
        throw new Error(`Failed to record migration: ${recordError.message}`)
      }

      console.log(`✅ Completed ${migration.filename}`)
    } catch (error) {
      console.error(`❌ Failed to execute ${migration.filename}:`, error)
      throw error
    }
  }

  console.log('✅ All migrations completed successfully!')
}

export async function resetDatabase() {
  console.log('🔄 Resetting database...')
  
  const resetSql = `
    -- Drop all tables in correct order (respecting foreign keys)
    DROP TABLE IF EXISTS migrations CASCADE;
    DROP TABLE IF EXISTS citations CASCADE;
    DROP TABLE IF EXISTS imports CASCADE;
    DROP TABLE IF EXISTS sessions CASCADE;
    DROP TABLE IF EXISTS quiz_attempts CASCADE;
    DROP TABLE IF EXISTS quiz_sets CASCADE;
    DROP TABLE IF EXISTS questions CASCADE;
    DROP TABLE IF EXISTS srs_reviews CASCADE;
    DROP TABLE IF EXISTS flashcards CASCADE;
    DROP TABLE IF EXISTS decks CASCADE;
    DROP TABLE IF EXISTS highlights CASCADE;
    DROP TABLE IF EXISTS notes CASCADE;
    DROP TABLE IF EXISTS juris CASCADE;
    DROP TABLE IF EXISTS enunciados CASCADE;
    DROP TABLE IF EXISTS sumulas CASCADE;
    DROP TABLE IF EXISTS law_chunks CASCADE;
    DROP TABLE IF EXISTS laws CASCADE;
    DROP TABLE IF EXISTS sources CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    
    -- Drop functions
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
  `

  const { error } = await supabase.rpc('exec_sql', { sql: resetSql })
  
  if (error) {
    throw new Error(`Failed to reset database: ${error.message}`)
  }

  console.log('✅ Database reset completed!')
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2]

  async function main() {
    try {
      switch (command) {
        case 'migrate':
          await runMigrations()
          break
        case 'reset':
          await resetDatabase()
          await runMigrations()
          break
        default:
          console.log('Usage: npm run db:migrate | npm run db:reset')
          process.exit(1)
      }
    } catch (error) {
      console.error('Database operation failed:', error)
      process.exit(1)
    }
  }

  main()
}

