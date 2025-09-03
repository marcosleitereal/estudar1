'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  name: string
  phone?: string
  email?: string
  role: 'user' | 'admin'
  created_at: string
  last_login?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar status de autenticação
  const checkAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Fazer login
  const login = (userData: User) => {
    setUser(userData)
  }

  // Fazer logout
  const logout = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setUser(null)
        // Redirecionar para página de login
        window.location.href = '/auth/whatsapp'
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    loading,
    login,
    logout,
    checkAuth
  }
}

