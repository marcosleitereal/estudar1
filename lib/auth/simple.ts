// Simple authentication system for Estudar.Pro
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'student'
  isPremium: boolean
}

// Admin users list - in production, this would come from database
const ADMIN_EMAILS = [
  'admin@estudar.pro',
  'dev@sonnik.com.br'
]

export const authService = {
  // Check if user is authenticated (mock implementation)
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('auth_user') !== null
  },

  // Get current user (mock implementation)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userData = localStorage.getItem('auth_user')
    if (!userData) return null
    
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  },

  // Check if current user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'admin' || false
  },

  // Login user (mock implementation)
  async login(email: string, password: string): Promise<{ user: User; error?: string }> {
    // Mock login - in production, this would validate against Supabase
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())
    
    const mockUser: User = {
      id: isAdmin ? 'admin-' + Date.now() : 'user-' + Date.now(),
      email: email,
      name: isAdmin ? 'Administrador Sonnik' : 'Usuário Demo',
      role: isAdmin ? 'admin' : 'student',
      isPremium: isAdmin ? true : false
    }

    // Store user in localStorage (mock session)
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    
    return { user: mockUser }
  },

  // Register user (mock implementation)
  async register(email: string, password: string, name: string): Promise<{ user: User; error?: string }> {
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())
    
    const mockUser: User = {
      id: 'user-' + Date.now(),
      email: email,
      name: name,
      role: isAdmin ? 'admin' : 'student',
      isPremium: isAdmin ? true : false
    }

    // Store user in localStorage (mock session)
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    
    return { user: mockUser }
  },

  // Logout user
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user')
    }
  },

  // Check if email is admin
  isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase())
  }
}

// Legacy functions for compatibility
export async function signIn(email: string, password: string) {
  return authService.login(email, password)
}

export async function signUp(email: string, password: string, name?: string) {
  return authService.register(email, password, name || 'Usuário')
}

export async function signOut() {
  return authService.logout()
}

export async function resetPassword(email: string) {
  console.log('Mock reset password:', email)
}

export async function updatePassword(password: string) {
  console.log('Mock update password')
}

// Role checking utilities
export function isAdmin(user: any): boolean {
  return user?.role === 'admin' || authService.isAdminEmail(user?.email)
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

