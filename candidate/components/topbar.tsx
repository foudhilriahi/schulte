'use client'

import { Bell } from 'lucide-react'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { useNotificationStore } from '@/store/notifications'
import { useAuthStore } from '@/store/auth'
import { useEffect } from 'react'

export function TopBar() {
  const router = useRouterWithLoader()
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    useNotificationStore.getState().fetchUnreadCount()
  }, [isAuthenticated])

  return (
    <header className="fixed top-0 left-0 right-0 h-[52px] bg-card border-b border-solid border-border px-4 flex items-center justify-between z-50 select-none">
      <span 
        onClick={() => router.push('/')}
        className="font-sans font-semibold text-[13px] tracking-tight text-ink cursor-pointer"
      >
        SCHULTE<span className="text-v">&</span><span className="text-ink3">CO</span>
      </span>

      <button 
        onClick={() => router.push('/notifications')}
        className="relative p-1.5 rounded-lg active:bg-card2 transition-colors cursor-pointer touch-manipulation"
      >
        <Bell size={18} className="text-ink3" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-tan border-[1.5px] border-card border-solid" />
        )}
      </button>
    </header>
  )
}
