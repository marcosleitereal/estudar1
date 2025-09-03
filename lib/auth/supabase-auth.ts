import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'student'
  isPremium: boolean
  created_at: string
  updated_at: string
}

export interface AuthError {
  message: string
  code?: string
}

export const authService = {
  // Verificar se usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null

      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || 'Usuário',
        phone: session.user.user_metadata?.phone,
        avatar_url: session.user.user_metadata?.avatar_url,
        role: session.user.email === 'dev@sonnik.com.br' ? 'admin' : 'student',
        isPremium: session.user.email === 'dev@sonnik.com.br',
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return null
    }
  },

  // Verificar se usuário é admin
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.role === 'admin' || false
  },

  // Login do usuário
  async login(email: string, password: string): Promise<{ user: User | null; error?: AuthError }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { 
          user: null, 
          error: { 
            message: this.getErrorMessage(error.message),
            code: error.message
          } 
        }
      }

      const user = await this.getCurrentUser()
      return { user }

    } catch (error) {
      console.error('Erro no login:', error)
      return { 
        user: null, 
        error: { message: 'Erro interno do servidor' } 
      }
    }
  },

  // Registro de usuário
  async register(email: string, password: string, name: string): Promise<{ user: User | null; error?: AuthError }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) {
        return { 
          user: null, 
          error: { 
            message: this.getErrorMessage(error.message),
            code: error.message
          } 
        }
      }

      const user = await this.getCurrentUser()
      return { user }

    } catch (error) {
      console.error('Erro no registro:', error)
      return { 
        user: null, 
        error: { message: 'Erro interno do servidor' } 
      }
    }
  },

  // Logout do usuário
  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  // Redefinir senha
  async resetPassword(email: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { 
          error: { 
            message: this.getErrorMessage(error.message),
            code: error.message
          } 
        }
      }

      return {}
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      return { error: { message: 'Erro interno do servidor' } }
    }
  },

  // Atualizar senha
  async updatePassword(password: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        return { 
          error: { 
            message: this.getErrorMessage(error.message),
            code: error.message
          } 
        }
      }

      return {}
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      return { error: { message: 'Erro interno do servidor' } }
    }
  },

  // Atualizar perfil do usuário (usando apenas metadados)
  async updateProfile(updates: {
    name?: string
    phone?: string
    avatar_url?: string
  }): Promise<{ user: User | null; error?: AuthError }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        return { 
          user: null, 
          error: { 
            message: this.getErrorMessage(error.message),
            code: error.message
          } 
        }
      }

      // Retornar usuário atualizado
      const user = await this.getCurrentUser()
      return { user }

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { 
        user: null, 
        error: { message: 'Erro interno do servidor' } 
      }
    }
  },

  // Upload de avatar (conversão para base64 e salvamento direto)
  async uploadAvatar(file: File): Promise<{ url?: string; error?: AuthError }> {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser) {
        return { error: { message: 'Usuário não autenticado' } }
      }

      // Validar tamanho do arquivo (máximo 2MB para base64)
      if (file.size > 2 * 1024 * 1024) {
        return { error: { message: 'Imagem muito grande. Máximo 2MB para upload direto.' } }
      }

      // Converter arquivo para base64
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Salvar base64 diretamente nos metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: base64Url
        }
      })

      if (updateError) {
        console.error('Erro ao atualizar metadados:', updateError)
        return { 
          error: { 
            message: 'Erro ao salvar avatar: ' + updateError.message,
            code: updateError.message
          } 
        }
      }

      return { url: base64Url }

    } catch (error) {
      console.error('Erro no upload:', error)
      return { error: { message: 'Erro interno do servidor' } }
    }
  },

  // Traduzir mensagens de erro
  getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado',
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'Signup is disabled': 'Cadastro desabilitado',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde.',
      'Password is too weak': 'Senha muito fraca. Use uma senha mais forte.',
    }

    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.'
  }
}

// Funções de compatibilidade
export async function signIn(email: string, password: string) {
  const result = await authService.login(email, password)
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result
}

export async function signUp(email: string, password: string, name?: string) {
  const result = await authService.register(email, password, name || 'Usuário')
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result
}

export async function signOut() {
  return authService.logout()
}

export async function resetPassword(email: string) {
  const result = await authService.resetPassword(email)
  if (result.error) {
    throw new Error(result.error.message)
  }
}

export async function updatePassword(password: string) {
  const result = await authService.updatePassword(password)
  if (result.error) {
    throw new Error(result.error.message)
  }
}

// Utilitários de verificação de papel
export function isAdmin(user: any): boolean {
  return user?.role === 'admin'
}

export function isStudent(user: any): boolean {
  return user?.role === 'student'
}

export function hasRole(user: any, role: 'admin' | 'student'): boolean {
  return user?.role === role
}

// Utilitários de rota protegida
export function requireAuth(user: any) {
  if (!user) {
    throw new Error('Autenticação necessária')
  }
}

export function requireAdmin(user: any) {
  requireAuth(user)
  if (!isAdmin(user)) {
    throw new Error('Acesso de administrador necessário')
  }
}

export function requireStudent(user: any) {
  requireAuth(user)
  if (!isStudent(user)) {
    throw new Error('Acesso de estudante necessário')
  }
}

