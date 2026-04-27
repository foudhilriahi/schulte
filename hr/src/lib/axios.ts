import axios from 'axios'
import { authSession } from '@/lib/authSession'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const isNgrokApi = /https?:\/\/[^/]*\.ngrok(-free)?\.app(\/|$)/i.test(baseURL)

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    ...(isNgrokApi ? { 'ngrok-skip-browser-warning': 'true' } : {}),
  },
})

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = authSession.getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On auth failures: clear this tab session and force re-login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && original.url !== '/auth/login') {
      authSession.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 403 && typeof original?.url === 'string' && original.url.startsWith('/admin')) {
      authSession.clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
