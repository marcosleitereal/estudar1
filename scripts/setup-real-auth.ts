#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Criar tabela de perfis se não existir
 */
async function createProfilesTable(): Promise<void> {
  console.log('📋 Criando tabela de perfis...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
        is_premium BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Criar índices
      CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
      CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

      -- Habilitar RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Políticas RLS
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
      CREATE POLICY "Admins can view all profiles" ON profiles
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `
  });

  if (error) {
    console.error('❌ Erro ao criar tabela de perfis:', error);
  } else {
    console.log('✅ Tabela de perfis criada/atualizada');
  }
}

/**
 * Criar bucket para avatars
 */
async function createAvatarsBucket(): Promise<void> {
  console.log('🗂️ Criando bucket para avatars...');

  // Verificar se bucket já existe
  const { data: buckets } = await supabase.storage.listBuckets();
  const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');

  if (!avatarsBucket) {
    const { error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('❌ Erro ao criar bucket de avatars:', error);
    } else {
      console.log('✅ Bucket de avatars criado');
    }
  } else {
    console.log('✅ Bucket de avatars já existe');
  }
}

/**
 * Criar usuário admin
 */
async function createAdminUser(): Promise<void> {
  console.log('👤 Criando usuário admin...');

  const adminEmail = 'dev@sonnik.com.br';
  const adminPassword = 'admin123456'; // Senha mais segura

  try {
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Administrador Sonnik'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Usuário admin já existe');
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // Criar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: 'Administrador Sonnik',
        email: adminEmail,
        role: 'admin',
        is_premium: true
      });

    if (profileError) {
      console.error('❌ Erro ao criar perfil do admin:', profileError);
    } else {
      console.log('✅ Usuário admin criado com sucesso');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Senha: ${adminPassword}`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

/**
 * Criar usuário de teste
 */
async function createTestUser(): Promise<void> {
  console.log('👤 Criando usuário de teste...');

  const testEmail = 'teste@estudar.pro';
  const testPassword = 'teste123456';

  try {
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Usuário Teste'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Usuário de teste já existe');
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // Criar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: 'Usuário Teste',
        email: testEmail,
        role: 'student',
        is_premium: false
      });

    if (profileError) {
      console.error('❌ Erro ao criar perfil do usuário teste:', profileError);
    } else {
      console.log('✅ Usuário de teste criado com sucesso');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Senha: ${testPassword}`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

/**
 * Verificar configuração
 */
async function verifySetup(): Promise<void> {
  console.log('🔍 Verificando configuração...');

  try {
    // Verificar tabela profiles
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) {
      console.error('❌ Erro ao verificar perfis:', profilesError);
    } else {
      console.log(`✅ Perfis na base de dados: ${profilesCount || 0}`);
    }

    // Verificar bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Bucket de avatars configurado');
    } else {
      console.log('⚠️ Bucket de avatars não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Configurando autenticação real...');
    
    // 1. Criar tabela de perfis
    await createProfilesTable();
    
    // 2. Criar bucket para avatars
    await createAvatarsBucket();
    
    // 3. Criar usuários
    await createAdminUser();
    await createTestUser();
    
    // 4. Verificar configuração
    await verifySetup();
    
    console.log('🎉 Configuração de autenticação concluída!');
    console.log('');
    console.log('📋 Credenciais criadas:');
    console.log('👨‍💼 Admin: dev@sonnik.com.br / admin123456');
    console.log('👨‍🎓 Teste: teste@estudar.pro / teste123456');

  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

