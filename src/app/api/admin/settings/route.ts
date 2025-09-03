import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in admin settings API. Using fallback values.')
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

// Verificar se é admin (implementação simplificada)
function isAdmin(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_session_token')?.value
  return !!adminToken // Implementação básica
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar configurações do sistema
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }

    // Converter array em objeto para facilitar uso
    const settingsObj = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>) || {}

    return NextResponse.json({
      success: true,
      settings: settingsObj
    })

  } catch (error) {
    console.error('[Admin Settings API] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Configurações inválidas' },
        { status: 400 }
      )
    }

    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Database not configured'
      })
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Atualizar cada configuração
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      return supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        })
    })

    const results = await Promise.all(updatePromises)
    
    // Verificar se houve erros
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Errors updating settings:', errors)
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar algumas configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    })

  } catch (error) {
    console.error('[Admin Settings API] Error updating settings:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

