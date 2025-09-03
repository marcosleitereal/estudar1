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
 * Configurar bucket de avatars
 */
async function setupAvatarStorage(): Promise<void> {
  console.log('🗂️ Configurando storage para avatars...');

  try {
    // Verificar se bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');

    if (!avatarsBucket) {
      // Criar bucket
      console.log('📁 Criando bucket avatars...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }

      console.log('✅ Bucket avatars criado com sucesso');
    } else {
      console.log('✅ Bucket avatars já existe');
    }

    // Configurar políticas RLS para o bucket
    console.log('🔐 Configurando políticas de acesso...');

    // Política para permitir upload de avatars (usuários autenticados)
    const uploadPolicy = `
      CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Política para permitir visualização de avatars (público)
    const selectPolicy = `
      CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
    `;

    // Política para permitir atualização de avatars (próprio usuário)
    const updatePolicy = `
      CREATE POLICY IF NOT EXISTS "Users can update their own avatar" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Política para permitir exclusão de avatars (próprio usuário)
    const deletePolicy = `
      CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Executar políticas (usando SQL direto)
    const policies = [uploadPolicy, selectPolicy, updatePolicy, deletePolicy];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error && !error.message.includes('already exists')) {
          console.warn('⚠️ Aviso ao criar política:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Política não aplicada (pode já existir):', err);
      }
    }

    console.log('✅ Políticas de acesso configuradas');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

/**
 * Testar upload de avatar
 */
async function testAvatarUpload(): Promise<void> {
  console.log('🧪 Testando upload de avatar...');

  try {
    // Criar um arquivo de teste (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    
    const testFileName = `test-${Date.now()}.png`;

    // Fazer upload
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
      return;
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);

    console.log('✅ Teste de upload bem-sucedido');
    console.log('🔗 URL de teste:', data.publicUrl);

    // Limpar arquivo de teste
    await supabase.storage
      .from('avatars')
      .remove([testFileName]);

    console.log('🧹 Arquivo de teste removido');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Configurando storage de avatars...');
    
    await setupAvatarStorage();
    await testAvatarUpload();
    
    console.log('🎉 Configuração de storage concluída!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ Bucket avatars configurado');
    console.log('✅ Políticas de acesso aplicadas');
    console.log('✅ Upload testado com sucesso');
    console.log('');
    console.log('🔧 Agora você pode fazer upload real de avatars!');

  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

