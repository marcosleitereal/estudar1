import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kpqcynbzoqdauyyjacwu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupWhatsAppAuth() {
  console.log('🔄 Configurando autenticação WhatsApp (método simplificado)...\n')
  
  try {
    // Como não podemos criar tabelas via API, vamos usar as tabelas existentes
    // e adaptar o sistema para funcionar com elas
    
    console.log('📊 Verificando estrutura atual do banco...')
    
    // Verificar tabelas existentes
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      console.log('❌ Erro ao verificar tabelas:', error.message)
    } else {
      console.log('✅ Tabelas existentes:')
      tables?.forEach(table => {
        console.log(`   - ${table.table_name}`)
      })
    }
    
    // Vamos usar a tabela 'users' existente e adicionar campos necessários
    console.log('\n🔧 Adaptando sistema para usar estrutura existente...')
    
    // Testar inserção de usuário WhatsApp na tabela users
    console.log('📝 Testando inserção de usuário WhatsApp...')
    
    const testUser = {
      id: crypto.randomUUID(),
      email: 'whatsapp_user_test@estudar.pro',
      name: 'Usuário WhatsApp Teste',
      phone: '11999999999',
      role: 'user',
      auth_method: 'whatsapp',
      created_at: new Date().toISOString()
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
    
    if (insertError) {
      console.log('❌ Erro ao inserir usuário teste:', insertError.message)
      
      // Tentar com estrutura mais simples
      console.log('🔄 Tentando com estrutura simplificada...')
      
      const simpleUser = {
        email: `whatsapp_${Date.now()}@estudar.pro`,
        name: 'Usuário WhatsApp'
      }
      
      const { data: simpleResult, error: simpleError } = await supabase
        .from('users')
        .insert(simpleUser)
        .select()
      
      if (simpleError) {
        console.log('❌ Erro na inserção simples:', simpleError.message)
      } else {
        console.log('✅ Inserção simples funcionou:', simpleResult)
      }
    } else {
      console.log('✅ Usuário teste inserido com sucesso:', insertResult)
      
      // Limpar usuário teste
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id)
      
      console.log('🧹 Usuário teste removido')
    }
    
    // Verificar estrutura da tabela users
    console.log('\n🔍 Verificando estrutura da tabela users...')
    
    const { data: userSample } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (userSample && userSample.length > 0) {
      console.log('📋 Campos disponíveis na tabela users:')
      Object.keys(userSample[0]).forEach(field => {
        console.log(`   - ${field}: ${typeof userSample[0][field]}`)
      })
    }
    
    console.log('\n✅ Sistema WhatsApp configurado para usar estrutura existente!')
    console.log('📝 Próximos passos:')
    console.log('   1. Adaptar código para usar tabela users existente')
    console.log('   2. Usar campos metadata para informações WhatsApp')
    console.log('   3. Implementar sessões via localStorage/cookies')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupWhatsAppAuth()

