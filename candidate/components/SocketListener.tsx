'use client'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSocket, useSocketEvent } from '@/hooks/useSocket'
import { useNotificationStore } from '@/store/notifications'
import { useAuthStore } from '@/store/auth'

const STATUS_TOASTS: Record<string, string> = {
  reviewing: "Votre candidature est en cours d'examen",
  interview: "📅 Entretien planifié pour votre candidature !",
  accepted: "🎉 Félicitations ! Votre candidature a été acceptée.",
  rejected: "Votre candidature n'a pas été retenue pour ce poste.",
}

export default function SocketListener() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const fetchNotifications = useNotificationStore(s => s.fetchNotifications)
  const [isMounted, setIsMounted] = useState(false)

  // Only render on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Maintain socket connection
  useSocket()

  // status:changed
  useSocketEvent('status:changed', useCallback((data: { applicationId: string; status: string }) => {
    queryClient.invalidateQueries({ queryKey: ['applications'] })
    queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] })
    const msg = STATUS_TOASTS[data.status]
    if (msg) toast.info(msg)
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  // interview:scheduled
  useSocketEvent('interview:scheduled', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: ['applications'] })
    queryClient.invalidateQueries({ queryKey: ['interviews'] })
    toast.success("📅 Un entretien a été planifié pour vous !")
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  // offer:new
  useSocketEvent('offer:new', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: ['offers'] })
    toast.info("🆕 Nouvelle offre d'emploi disponible !")
  }, [queryClient]))

  // offer:closed
  useSocketEvent('offer:closed', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: ['offers'] })
    // No toast for closed offers to avoid spam
  }, [queryClient]))

  // interview:reminder
  useSocketEvent('interview:reminder', useCallback((_data: any) => {
    toast.warning("⏰ Rappel : vous avez un entretien demain !")
    fetchNotifications()
  }, [fetchNotifications]))

  // ai:analysis_complete - New AI analysis results
  useSocketEvent('ai:analysis_complete', useCallback((data: any) => {
    queryClient.invalidateQueries({ queryKey: ['applications'] })
    queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] })
    
    const scoreEmoji = data.score >= 70 ? '🎉' : data.score >= 50 ? '👍' : '📊'
    toast.success(`${scoreEmoji} Analyse IA terminée : ${data.score}/100 pour ${data.jobTitle}`)
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  // ai:analysis_updated - Updated AI analysis results
  useSocketEvent('ai:analysis_updated', useCallback((data: any) => {
    queryClient.invalidateQueries({ queryKey: ['applications'] })
    queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] })
    
    toast.info(`🔄 Analyse IA mise à jour : ${data.score}/100 pour ${data.jobTitle}`)
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  if (!isMounted || !isAuthenticated) return null
  return null
}
