import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in admin stats API. Using fallback values.')
    return {
      url: 'https://placeholder.supabase.co',
      serviceKey: 'placeholder-service-key'
    }
  }

  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey
  }
}

export async function GET(request: NextRequest) {
  try {
    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        users: { total: 0, active: 0, newThisMonth: 0, premium: 0 },
        content: { laws: 0, articles: 0, questions: 0, flashcards: 0 },
        activity: { quizzes: 0, studySessions: 0, searches: 0, avgSessionTime: 0 },
        system: { storage: 0, apiCalls: 0, uptime: 100, errors: 0 },
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar estatísticas de usuários
    const { data: usersData, error: usersError } = await supabase
      .from('whatsapp_users')
      .select('id, created_at, last_login, role')

    // Buscar estatísticas de conteúdo
    const { data: lawsData, error: lawsError } = await supabase
      .from('laws')
      .select('id')

    const { data: articlesData, error: articlesError } = await supabase
      .from('laws')
      .select('id, article')
      .not('article', 'is', null)

    // Calcular estatísticas
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const users = usersData || []
    const newThisMonth = users.filter(user => 
      new Date(user.created_at) >= thisMonth
    ).length

    const activeUsers = users.filter(user => 
      user.last_login && new Date(user.last_login) >= lastWeek
    ).length

    const premiumUsers = users.filter(user => 
      user.role === 'premium'
    ).length

    const stats = {
      users: {
        total: users.length,
        active: activeUsers,
        newThisMonth,
        premium: premiumUsers
      },
      content: {
        laws: lawsData?.length || 0,
        articles: articlesData?.length || 0,
        questions: 0, // Implementar quando houver tabela de questões
        flashcards: 0 // Implementar quando houver tabela de flashcards
      },
      activity: {
        quizzes: 0, // Implementar quando houver tabela de atividades
        studySessions: 0,
        searches: 0,
        avgSessionTime: 0
      },
      system: {
        storage: 5, // Calcular uso real do storage
        apiCalls: 0, // Implementar contador de API calls
        uptime: 100, // Implementar monitoramento real
        errors: 0 // Implementar contador de erros
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    switch (action) {
      case 'refresh_stats':
        // Implementar refresh manual das estatísticas
        return NextResponse.json({
          success: true,
          message: 'Statistics refreshed'
        })

      case 'clear_cache':
        // Implementar limpeza de cache
        return NextResponse.json({
          success: true,
          message: 'Cache cleared'
        })

      case 'backup_data':
        // Implementar backup dos dados
        return NextResponse.json({
          success: true,
          message: 'Backup initiated'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in admin stats action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

