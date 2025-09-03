import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  trial_end_date: string | null
  trial_start_date: string | null
  is_trial_expired: boolean
  days_remaining: number
  is_premium: boolean
  role: string
  stats: {
    quizzes_completed: number
    flashcards_reviewed: number
    study_time_minutes: number
    last_activity: string
  }
  created_at: string
  last_login: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Função para validar sessão atual
  const validateSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setState({
            user: data.user,
            loading: false,
            error: null
          })
          return data.user
        }
      }

      // Sessão inválida
      setState({
        user: null,
        loading: false,
        error: null
      })
      return null

    } catch (error) {
      console.error('Erro ao validar sessão:', error)
      setState({
        user: null,
        loading: false,
        error: 'Erro ao validar sessão'
      })
      return null
    }
  }, [])

  // Função para fazer cadastro
  const register = useCallback(async (name: string, email: string, phone: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: true, data: data.data, message: data.message }
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = 'Erro ao fazer cadastro'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Função para verificar código de cadastro
  const verifyRegistration = useCallback(async (phone: string, code: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ phone, code })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState({
          user: data.user,
          loading: false,
          error: null
        })
        return { success: true, user: data.user, message: data.message }
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = 'Erro ao verificar código'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Função para iniciar login via WhatsApp
  const initiateWhatsAppLogin = useCallback(async (phone: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/whatsapp/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: true, data: data.data, message: data.message }
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return { 
          success: false, 
          error: data.error,
          needsRegistration: data.needsRegistration 
        }
      }
    } catch (error) {
      const errorMessage = 'Erro ao enviar código'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Função para verificar código de login
  const verifyWhatsAppLogin = useCallback(async (phone: string, code: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/whatsapp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ phone, code })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState({
          user: data.user,
          loading: false,
          error: null
        })
        return { success: true, user: data.user, message: data.message }
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = 'Erro ao verificar código'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Função para fazer logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setState({
        user: null,
        loading: false,
        error: null
      })
    }
  }, [])

  // Função para atualizar dados do usuário
  const refreshUser = useCallback(async () => {
    return await validateSession()
  }, [validateSession])

  // Validar sessão ao montar o componente
  useEffect(() => {
    validateSession()
  }, [validateSession])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    register,
    verifyRegistration,
    initiateWhatsAppLogin,
    verifyWhatsAppLogin,
    logout,
    refreshUser
  }
}

