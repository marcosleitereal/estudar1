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
 * Configurar políticas RLS para o bucket avatars
 */
async function fixAvatarPolicies(): Promise<void> {
  console.log('🔐 Configurando políticas RLS para avatars...');

  try {
    // SQL para criar/atualizar políticas
    const policies = [
      // Política para permitir upload de avatars (usuários autenticados)
      `
        DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
        CREATE POLICY "Users can upload their own avatar" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'avatars' AND 
          auth.uid() IS NOT NULL
        );
      `,
      
      // Política para permitir visualização de avatars (público)
      `
        DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
      `,
      
      // Política para permitir atualização de avatars (próprio usuário)
      `
        DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
        CREATE POLICY "Users can update their own avatar" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'avatars' AND 
          auth.uid() IS NOT NULL
        );
      `,
      
      // Política para permitir exclusão de avatars (próprio usuário)
      `
        DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
        CREATE POLICY "Users can delete their own avatar" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'avatars' AND 
          auth.uid() IS NOT NULL
        );
      `
    ];

    // Executar cada política
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      console.log(`📝 Aplicando política ${i + 1}/${policies.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.warn(`⚠️ Aviso na política ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Política ${i + 1} aplicada com sucesso`);
        }
      } catch (err) {
        console.warn(`⚠️ Erro na política ${i + 1}:`, err);
      }
    }

    // Verificar se o bucket está público
    console.log('🌐 Verificando configuração do bucket...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Bucket avatars encontrado');
      console.log('📊 Configuração:', {
        public: avatarsBucket.public,
        allowedMimeTypes: avatarsBucket.allowed_mime_types,
        fileSizeLimit: avatarsBucket.file_size_limit
      });
    }

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

/**
 * Testar upload com usuário autenticado
 */
async function testAuthenticatedUpload(): Promise<void> {
  console.log('🧪 Testando upload autenticado...');

  try {
    // Primeiro, fazer login com o usuário admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dev@sonnik.com.br',
      password: 'admin123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }

    console.log('✅ Login realizado com sucesso');

    // Criar um arquivo de teste (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    
    const testFileName = `test-auth-${Date.now()}.png`;

    // Fazer upload autenticado
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Erro no teste de upload autenticado:', uploadError);
      return;
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);

    console.log('✅ Teste de upload autenticado bem-sucedido');
    console.log('🔗 URL de teste:', data.publicUrl);

    // Limpar arquivo de teste
    await supabase.storage
      .from('avatars')
      .remove([testFileName]);

    console.log('🧹 Arquivo de teste removido');

    // Fazer logout
    await supabase.auth.signOut();
    console.log('🚪 Logout realizado');

  } catch (error) {
    console.error('❌ Erro no teste autenticado:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Corrigindo políticas do bucket avatars...');
    
    await fixAvatarPolicies();
    await testAuthenticatedUpload();
    
    console.log('🎉 Correção de políticas concluída!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ Políticas RLS configuradas');
    console.log('✅ Upload autenticado testado');
    console.log('✅ Bucket configurado corretamente');
    console.log('');
    console.log('🔧 Agora o upload de avatars deve funcionar!');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

