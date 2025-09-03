import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing in middleware. Using fallback values.')
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

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/flashcards',
  '/quiz',
  '/simulados',
  '/search'
]

// Rotas que requerem assinatura ativa (após trial)
const premiumRoutes = [
  '/flashcards',
  '/quiz',
  '/simulados'
]

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/',
  '/auth',
  '/payment',
  '/api/auth'
]

// Rotas de admin
const adminRoutes = [
  '/admin'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rotas de API e arquivos estáticos
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar autenticação
  const sessionToken = request.cookies.get('session_token')?.value
  const adminToken = request.cookies.get('admin_session_token')?.value

  // Verificar rotas de admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isAdminRoute) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Verificar se usuário está logado
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verificar se é rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  try {
    const config = getSupabaseConfig()
    
    if (config.url === 'https://placeholder.supabase.co') {
      // Se não há configuração do Supabase, permitir acesso
      return NextResponse.next()
    }

    const supabase = createClient(config.url, config.serviceKey)

    // Buscar dados do usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, subscription_status, trial_end_date, is_trial_expired')
      .eq('session_token', sessionToken)
      .single()

    if (error || !user) {
      // Token inválido, redirecionar para login
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('session_token')
      return response
    }

    // Verificar se é rota premium
    const isPremiumRoute = premiumRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )

    if (isPremiumRoute) {
      // Verificar status da assinatura
      const now = new Date()
      const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null
      const isTrialExpired = trialEndDate ? now > trialEndDate : true

      // Se trial expirado e não tem assinatura ativa
      if (isTrialExpired && user.subscription_status !== 'active') {
        // Redirecionar para página de pagamento
        return NextResponse.redirect(new URL('/payment', request.url))
      }
    }

    // Adicionar headers com informações do usuário
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-name', user.name || '')
    response.headers.set('x-user-subscription', user.subscription_status || 'trial')

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    // Em caso de erro, permitir acesso (fail-safe)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

