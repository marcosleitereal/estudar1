import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Função para obter configuração do Supabase de forma segura
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing. Using fallback values.')
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-key',
      serviceKey: 'placeholder-service-key'
    }
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey || 'placeholder-service-key'
  }
}

const config = getSupabaseConfig()

// Client-side Supabase client
export const supabase = createBrowserClient(config.url, config.anonKey)

// Server-side Supabase client with service role
export const supabaseAdmin = createSupabaseClient(config.url, config.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Export createClient function for compatibility
export function createClient() {
  return createSupabaseClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          role: 'admin' | 'student'
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          role?: 'admin' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          role?: 'admin' | 'student'
          created_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          kind: 'constituição' | 'código' | 'lei' | 'súmula' | 'enunciado' | 'jurisprudência' | 'doutrina' | 'nota'
          title: string
          org: string
          year: number | null
          url: string | null
          version_label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          kind: 'constituição' | 'código' | 'lei' | 'súmula' | 'enunciado' | 'jurisprudência' | 'doutrina' | 'nota'
          title: string
          org: string
          year?: number | null
          url?: string | null
          version_label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          kind?: 'constituição' | 'código' | 'lei' | 'súmula' | 'enunciado' | 'jurisprudência' | 'doutrina' | 'nota'
          title?: string
          org?: string
          year?: number | null
          url?: string | null
          version_label?: string | null
          created_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}

