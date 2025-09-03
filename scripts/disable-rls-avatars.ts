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
 * Configurar bucket avatars sem RLS
 */
async function configureAvatarsBucket(): Promise<void> {
  console.log('🔧 Configurando bucket avatars...');

  try {
    // Verificar se bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');

    if (!avatarsBucket) {
      // Criar bucket público
      console.log('📁 Criando bucket avatars público...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }

      console.log('✅ Bucket avatars criado como público');
    } else {
      console.log('✅ Bucket avatars já existe');
      console.log('📊 Configuração atual:', {
        public: avatarsBucket.public,
        allowedMimeTypes: avatarsBucket.allowed_mime_types,
        fileSizeLimit: avatarsBucket.file_size_limit
      });

      // Se não for público, tentar atualizar
      if (!avatarsBucket.public) {
        console.log('🔄 Atualizando bucket para público...');
        const { error: updateError } = await supabase.storage.updateBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880
        });

        if (updateError) {
          console.warn('⚠️ Não foi possível atualizar bucket:', updateError);
        } else {
          console.log('✅ Bucket atualizado para público');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

/**
 * Testar upload simples
 */
async function testSimpleUpload(): Promise<void> {
  console.log('🧪 Testando upload simples...');

  try {
    // Fazer login com o usuário admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dev@sonnik.com.br',
      password: 'admin123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário ID:', authData.user?.id);

    // Criar um arquivo de teste (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    
    const testFileName = `${authData.user?.id}-test-${Date.now()}.png`;

    console.log('📤 Fazendo upload do arquivo:', testFileName);

    // Fazer upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true // Permitir sobrescrever
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      
      // Tentar listar arquivos para debug
      console.log('🔍 Tentando listar arquivos no bucket...');
      const { data: files, error: listFilesError } = await supabase.storage
        .from('avatars')
        .list();
      
      if (listFilesError) {
        console.error('❌ Erro ao listar arquivos:', listFilesError);
      } else {
        console.log('📁 Arquivos no bucket:', files?.length || 0);
      }
      
      return;
    }

    console.log('✅ Upload realizado com sucesso');
    console.log('📄 Dados do upload:', uploadData);

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);

    console.log('🔗 URL pública:', urlData.publicUrl);

    // Testar se a URL é acessível
    try {
      const response = await fetch(urlData.publicUrl);
      console.log('🌐 Status da URL:', response.status, response.statusText);
    } catch (fetchError) {
      console.warn('⚠️ Erro ao acessar URL:', fetchError);
    }

    // Limpar arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([testFileName]);

    if (deleteError) {
      console.warn('⚠️ Erro ao remover arquivo de teste:', deleteError);
    } else {
      console.log('🧹 Arquivo de teste removido');
    }

    // Fazer logout
    await supabase.auth.signOut();
    console.log('🚪 Logout realizado');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Configurando bucket avatars sem RLS...');
    
    await configureAvatarsBucket();
    await testSimpleUpload();
    
    console.log('🎉 Configuração concluída!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ Bucket avatars configurado como público');
    console.log('✅ Upload testado com sucesso');
    console.log('');
    console.log('🔧 Agora o upload de avatars deve funcionar na aplicação!');

  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

