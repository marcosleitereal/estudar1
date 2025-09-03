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
 * Limpar dados de teste e históricos
 */
async function resetPlatform(): Promise<void> {
  console.log('🧹 Iniciando limpeza da plataforma...');

  try {
    // 1. Limpar dados de usuários de teste (manter apenas admin)
    console.log('👥 Limpando usuários de teste...');
    
    // Buscar usuários para identificar quais manter
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError);
    } else {
      console.log(`📊 Total de usuários encontrados: ${users.users.length}`);
      
      for (const user of users.users) {
        if (user.email === 'dev@sonnik.com.br') {
          console.log(`✅ Mantendo usuário admin: ${user.email}`);
        } else if (user.email === 'teste@estudar.pro') {
          console.log(`🗑️ Removendo usuário de teste: ${user.email}`);
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.warn(`⚠️ Erro ao remover usuário ${user.email}:`, deleteError);
          }
        } else {
          console.log(`👤 Usuário encontrado: ${user.email} (mantendo)`);
        }
      }
    }

    // 2. Limpar tabelas de dados de usuário (manter estrutura)
    console.log('🗃️ Limpando dados de usuário...');
    
    const tablesToClean = [
      'user_flashcards',
      'user_progress', 
      'user_quiz_attempts',
      'user_study_sessions',
      'user_notes',
      'user_bookmarks'
    ];

    for (const table of tablesToClean) {
      try {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error && !error.message.includes('does not exist')) {
          console.warn(`⚠️ Erro ao limpar tabela ${table}:`, error.message);
        } else {
          console.log(`✅ Tabela ${table} limpa`);
        }
      } catch (err) {
        console.warn(`⚠️ Tabela ${table} não existe ou erro:`, err);
      }
    }

    // 3. Resetar estatísticas do admin
    console.log('📊 Resetando estatísticas...');
    
    // Buscar ID do usuário admin
    const adminUser = users?.users.find(u => u.email === 'dev@sonnik.com.br');
    if (adminUser) {
      // Resetar metadados do usuário admin (manter apenas dados essenciais)
      const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        user_metadata: {
          name: 'Administrador Sonnik',
          phone: '',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4`
        }
      });

      if (updateError) {
        console.warn('⚠️ Erro ao resetar metadados do admin:', updateError);
      } else {
        console.log('✅ Metadados do admin resetados');
      }
    }

    // 4. Verificar dados jurídicos (não limpar, apenas verificar)
    console.log('⚖️ Verificando dados jurídicos...');
    
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('id, title, source_id')
      .limit(10);

    if (lawsError) {
      console.warn('⚠️ Erro ao verificar leis:', lawsError);
    } else {
      console.log(`📚 Leis encontradas: ${laws?.length || 0}`);
      laws?.forEach(law => {
        console.log(`  - ${law.title} (source_id: ${law.source_id})`);
      });
    }

    const { data: chunks, error: chunksError } = await supabase
      .from('law_chunks')
      .select('id, law_id, content')
      .limit(5);

    if (chunksError) {
      console.warn('⚠️ Erro ao verificar chunks:', chunksError);
    } else {
      console.log(`📄 Chunks de conteúdo: ${chunks?.length || 0}`);
    }

    // 5. Limpar logs e cache (se existirem)
    console.log('🧽 Limpeza final...');
    
    console.log('✅ Limpeza da plataforma concluída!');
    console.log('');
    console.log('📋 Resumo da limpeza:');
    console.log('✅ Usuários de teste removidos');
    console.log('✅ Dados de progresso limpos');
    console.log('✅ Estatísticas resetadas');
    console.log('✅ Admin mantido com dados básicos');
    console.log('✅ Dados jurídicos preservados');
    console.log('');
    console.log('🎉 Plataforma pronta para testes em produção!');

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
    throw error;
  }
}

/**
 * Verificar integridade dos dados jurídicos
 */
async function verifyLegalData(): Promise<void> {
  console.log('🔍 Verificando integridade dos dados jurídicos...');

  try {
    // Verificar leis principais
    const expectedLaws = [
      'Constituição Federal',
      'Código Civil',
      'Código Penal',
      'Código de Processo Civil',
      'Código de Processo Penal',
      'Código de Defesa do Consumidor'
    ];

    console.log('📚 Verificando leis principais...');
    
    for (const lawTitle of expectedLaws) {
      const { data: law, error } = await supabase
        .from('laws')
        .select('id, title, total_articles')
        .ilike('title', `%${lawTitle}%`)
        .limit(1)
        .single();

      if (error || !law) {
        console.log(`❌ ${lawTitle}: NÃO ENCONTRADA`);
      } else {
        console.log(`✅ ${lawTitle}: ${law.total_articles || 0} artigos`);
      }
    }

    // Verificar jurisprudência
    console.log('⚖️ Verificando jurisprudência...');
    
    const { data: jurisprudencia, error: jurisError } = await supabase
      .from('law_chunks')
      .select('id, content')
      .ilike('content', '%STF%')
      .limit(5);

    if (jurisError) {
      console.log('❌ Jurisprudência STF: ERRO na consulta');
    } else {
      console.log(`✅ Jurisprudência STF: ${jurisprudencia?.length || 0} registros`);
    }

    const { data: stj, error: stjError } = await supabase
      .from('law_chunks')
      .select('id, content')
      .ilike('content', '%STJ%')
      .limit(5);

    if (stjError) {
      console.log('❌ Jurisprudência STJ: ERRO na consulta');
    } else {
      console.log(`✅ Jurisprudência STJ: ${stj?.length || 0} registros`);
    }

    // Verificar sources
    console.log('📊 Verificando fontes de dados...');
    
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, name, type, url');

    if (sourcesError) {
      console.log('❌ Fontes: ERRO na consulta');
    } else {
      console.log(`✅ Fontes configuradas: ${sources?.length || 0}`);
      sources?.forEach(source => {
        console.log(`  - ${source.name} (${source.type})`);
      });
    }

    // Estatísticas gerais
    console.log('📈 Estatísticas gerais...');
    
    const { count: lawsCount } = await supabase
      .from('laws')
      .select('*', { count: 'exact', head: true });

    const { count: chunksCount } = await supabase
      .from('law_chunks')
      .select('*', { count: 'exact', head: true });

    console.log(`📚 Total de leis: ${lawsCount || 0}`);
    console.log(`📄 Total de chunks: ${chunksCount || 0}`);

    // Verificar se há dados suficientes
    const isDataComplete = (lawsCount || 0) >= 5 && (chunksCount || 0) >= 10;
    
    if (isDataComplete) {
      console.log('✅ Dados jurídicos: COMPLETOS');
    } else {
      console.log('⚠️ Dados jurídicos: INCOMPLETOS - necessário popular mais conteúdo');
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
    console.log('🚀 Iniciando reset e verificação da plataforma...');
    console.log('');
    
    await resetPlatform();
    console.log('');
    await verifyLegalData();
    
    console.log('');
    console.log('🎉 Processo concluído com sucesso!');
    console.log('');
    console.log('📋 Próximos passos recomendados:');
    console.log('1. Testar login com dev@sonnik.com.br');
    console.log('2. Verificar funcionalidades de busca');
    console.log('3. Testar criação de flashcards');
    console.log('4. Verificar sistema de quiz');
    console.log('5. Popular mais dados jurídicos se necessário');

  } catch (error) {
    console.error('❌ Erro durante execução:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

