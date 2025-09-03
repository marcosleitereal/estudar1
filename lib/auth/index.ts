import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client for Server Components
export function createServerComponentClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Server-side Supabase client for Route Handlers
export function createRouteHandlerClient(request: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options })
      },
    },
  })
}

// Server-side Supabase client for Middleware
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  return { supabase, response }
}

// Auth utilities
export async function getUser(supabase: any) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

export async function getUserProfile(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error(error.message)
  }
}

// Role checking utilities
export function isAdmin(user: any): boolean {
  return user?.role === 'admin'
}

export function isStudent(user: any): boolean {
  return user?.role === 'student'
}

export function hasRole(user: any, role: 'admin' | 'student'): boolean {
  return user?.role === role
}

// Protected route utilities
export function requireAuth(user: any) {
  if (!user) {
    throw new Error('Authentication required')
  }
}

export function requireAdmin(user: any) {
  requireAuth(user)
  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}

export function requireStudent(user: any) {
  requireAuth(user)
  if (!isStudent(user)) {
    throw new Error('Student access required')
  }
}

