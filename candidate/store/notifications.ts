import { create } from 'zustand'
import { api } from '@/lib/axios'

interface CandidateNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link?: string
  createdAt: string
}

interface NotificationState {
  notifications: CandidateNotification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAllRead: () => Promise<void>
  markOneRead: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (n: CandidateNotification) => void
  incrementUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/api/notifications')
      const notifications: CandidateNotification[] = res.data
      const unreadCount = notifications.filter((n) => !n.read).length
      set({ notifications, unreadCount })
    } catch {
      // fail silently
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      set({ unreadCount: res.data.count })
    } catch {
      // fail silently
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/api/notifications/mark-all-read')
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch {
      // fail silently
    }
  },

  markOneRead: async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
        const wasUnread = state.notifications.find((n) => n.id === id && !n.read)
        const unreadCount = wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount
        return { notifications, unreadCount }
      })
    } catch {
      // fail silently
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`)
      set((state) => {
        const target = state.notifications.find((n) => n.id === id)
        const unreadCount =
          target && !target.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount,
        }
      })
    } catch {
      // fail silently
    }
  },

  addNotification: (n: CandidateNotification) => {
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }))
  },
}))
