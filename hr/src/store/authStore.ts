import { create } from 'zustand'
import { api } from '@/lib/axios'

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  loadFromStorage: () => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      const user = JSON.parse(stored)
      // Validate role - only HR and ADMIN allowed
      if (user.role === 'HR' || user.role === 'ADMIN') {
        set({ user, isAuthenticated: true })
      } else {
        // Clear invalid user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false })
      }
    }
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    
    // Validate role - only HR and ADMIN allowed
    if (data.user.role !== 'HR' && data.user.role !== 'ADMIN') {
      throw new Error('Access denied. This app is for HR and Admin users only.')
    }
    
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* ignore */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
}))
