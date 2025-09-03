import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runWhatsAppMigration() {
  console.log('🔄 Executando migração para autenticação WhatsApp...\n')
  
  try {
    // Ler arquivo de migração
    const migration = readFileSync('db/migrations/006_whatsapp_auth.sql', 'utf8')
    
    // Dividir em comandos individuais
    const commands = migration
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 Executando ${commands.length} comandos SQL...\n`)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';'
      console.log(`${i + 1}. Executando: ${command.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      
      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message)
        // Continuar mesmo com erros (tabelas podem já existir)
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`)
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...')
    
    const tables = ['whatsapp_users', 'verification_codes', 'login_sessions', 'admin_sessions']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`)
      } else {
        console.log(`✅ Tabela ${table}: OK`)
      }
    }
    
    console.log('\n🎉 Migração WhatsApp concluída!')
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  }
}

runWhatsAppMigration()

