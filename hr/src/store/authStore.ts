import { create } from 'zustand'
import { api } from '@/lib/axios'
import { authSession } from '@/lib/authSession'

interface User {
  id: string
  name: string
  email: string
  role: string
  site?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  loadFromStorage: () => {
    const stored = authSession.getUserRaw()
    const token = authSession.getAccessToken()
    if (stored && token) {
      const user = JSON.parse(stored)
      // Validate role - only HR and ADMIN allowed
      if (user.role === 'HR' || user.role === 'ADMIN') {
        set({ user, isAuthenticated: true })
      } else {
        // Clear invalid user
        authSession.clear()
        set({ user: null, isAuthenticated: false })
      }
    }
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    
    // Validate role - only HR and ADMIN allowed
    if (data.user.role !== 'HR' && data.user.role !== 'ADMIN') {
      throw new Error('Acces refuse. Cette application est reservee aux utilisateurs RH et administrateurs.')
    }
    
    authSession.setAccessToken(data.accessToken)
    authSession.setUserRaw(JSON.stringify(data.user))
    set({ user: data.user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* ignore */ }
    authSession.clear()
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state
      const nextUser = { ...state.user, ...updates }
      authSession.setUserRaw(JSON.stringify(nextUser))
      return { user: nextUser }
    })
  },
}))
