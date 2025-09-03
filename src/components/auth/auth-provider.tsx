'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth, User } from '@/hooks/useAuth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  register: (name: string, email: string, phone: string) => Promise<any>
  verifyRegistration: (phone: string, code: string) => Promise<any>
  initiateWhatsAppLogin: (phone: string) => Promise<any>
  verifyWhatsAppLogin: (phone: string, code: string) => Promise<any>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

