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

let refreshPromise: Promise<string> | null = null

const requestTokenRefresh = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const newAccessToken = res.data?.accessToken
        if (typeof newAccessToken !== 'string' || newAccessToken.length === 0) {
          throw new Error('Refresh token response missing accessToken')
        }
        authSession.setAccessToken(newAccessToken)
        return newAccessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// On auth failures: attempt refresh on 401, clear session on 403 and force re-login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 403 && typeof original?.url === 'string' && original.url.startsWith('/admin')) {
      authSession.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/login' && original.url !== '/auth/refresh') {
      original._retry = true

      try {
        const newAccessToken = await requestTokenRefresh()
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch (refreshError) {
        authSession.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401 && original.url === '/auth/login') {
      // Login attempt failed, don't refresh
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
