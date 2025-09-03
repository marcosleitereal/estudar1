import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createWhatsAppTables() {
  console.log('🔄 Criando tabelas para autenticação WhatsApp...\n')
  
  try {
    // 1. Criar tabela whatsapp_users
    console.log('1. Criando tabela whatsapp_users...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS whatsapp_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        );
      `
    })
    
    if (error1) {
      console.log('❌ Erro:', error1.message)
    } else {
      console.log('✅ Tabela whatsapp_users criada')
    }

    // 2. Criar tabela verification_codes
    console.log('2. Criando tabela verification_codes...')
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS verification_codes (
          id UUID PRIMARY KEY,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          is_new_user BOOLEAN DEFAULT false,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (error2) {
      console.log('❌ Erro:', error2.message)
    } else {
      console.log('✅ Tabela verification_codes criada')
    }

    // 3. Criar tabela login_sessions
    console.log('3. Criando tabela login_sessions...')
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS login_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES whatsapp_users(id) ON DELETE CASCADE,
          device_id TEXT NOT NULL,
          session_token TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_agent TEXT,
          ip_address TEXT
        );
      `
    })
    
    if (error3) {
      console.log('❌ Erro:', error3.message)
    } else {
      console.log('✅ Tabela login_sessions criada')
    }

    // 4. Criar tabela admin_sessions
    console.log('4. Criando tabela admin_sessions...')
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT NOT NULL,
          device_id TEXT NOT NULL,
          session_token TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_agent TEXT,
          ip_address TEXT
        );
      `
    })
    
    if (error4) {
      console.log('❌ Erro:', error4.message)
    } else {
      console.log('✅ Tabela admin_sessions criada')
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
    
    console.log('\n🎉 Tabelas WhatsApp criadas com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createWhatsAppTables()

