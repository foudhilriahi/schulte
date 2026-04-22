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

interface RawNotification {
  id: string
  type?: string
  payload?: unknown
  title?: string
  message?: string
  link?: string
  read?: boolean
  readAt?: string | null
  createdAt: string
}

interface NotificationState {
  notifications: CandidateNotification[]
  unreadCount: number
  isLoading: boolean
  lastFetchedAt: number | null
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAllRead: () => Promise<void>
  markOneRead: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (n: CandidateNotification) => void
  incrementUnread: () => void
  reset: () => void
}

const STATUS_LABELS: Record<string, string> = {
  reviewing: "Candidature en cours d'examen",
  interview: 'Entretien planifie',
  accepted: 'Candidature acceptee',
  rejected: 'Candidature non retenue',
}

const DEFAULT_TITLE_BY_TYPE: Record<string, string> = {
  success: 'Mise a jour positive',
  warning: 'Mise a jour importante',
  info: 'Notification',
}

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const pickString = (...values: Array<unknown>): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return null
}

const normalizeNotification = (raw: RawNotification): CandidateNotification => {
  const payload = asObject(raw.payload)
  const status = pickString(payload.status)?.toLowerCase()
  const offerTitle = pickString(payload.offerTitle)
  const statusTitle = status ? STATUS_LABELS[status] : null
  const fallbackTitle = statusTitle ?? DEFAULT_TITLE_BY_TYPE[raw.type ?? 'info'] ?? 'Notification'

  const title = pickString(raw.title, payload.title, fallbackTitle) ?? fallbackTitle

  const fallbackMessage = offerTitle
    ? `${statusTitle ?? 'Mise a jour'} pour le poste ${offerTitle}.`
    : statusTitle
      ? `Le statut de votre candidature est passe a: ${statusTitle}.`
      : 'Une nouvelle mise a jour est disponible.'

  const message = pickString(raw.message, payload.message, fallbackMessage) ?? fallbackMessage
  const link = pickString(raw.link, payload.link) ?? undefined
  const read = typeof raw.read === 'boolean' ? raw.read : !!raw.readAt

  return {
    id: raw.id,
    title,
    message,
    type: pickString(raw.type, payload.type) ?? 'info',
    read,
    link,
    createdAt: raw.createdAt,
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetchedAt: null,

  fetchNotifications: async () => {
    const { lastFetchedAt, notifications } = get()
    const now = Date.now()

    if (lastFetchedAt && now - lastFetchedAt < 15 * 1000 && notifications.length > 0) {
      return
    }

    set({ isLoading: true })
    try {
      const res = await api.get('/notifications')
      const rawNotifications = Array.isArray(res.data) ? (res.data as RawNotification[]) : []
      const notifications = rawNotifications.map(normalizeNotification)
      const unreadCount = notifications.filter((n) => !n.read).length
      set({ notifications, unreadCount, lastFetchedAt: now })
    } catch {
      // fail silently
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    const { lastFetchedAt } = get()
    if (lastFetchedAt && Date.now() - lastFetchedAt < 15 * 1000) {
      return
    }

    try {
      const res = await api.get('/notifications/unread-count')
      set({ unreadCount: res.data.count, lastFetchedAt: Date.now() })
    } catch {
      // fail silently
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/mark-all-read')
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
      await api.patch(`/notifications/${id}/read`)
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
      await api.delete(`/notifications/${id}`)
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
    const normalized = normalizeNotification(n as unknown as RawNotification)
    set((state) => ({
      notifications: [normalized, ...state.notifications],
      unreadCount: normalized.read ? state.unreadCount : state.unreadCount + 1,
    }))
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }))
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      lastFetchedAt: null,
    })
  },
}))
