'use client'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSocket, useSocketEvent } from '@/hooks/useSocket'
import { useNotificationStore } from '@/store/notifications'
import { useAuthStore } from '@/store/auth'
import { candidateQueryKeys } from '@/lib/queryKeys'
import { messages } from '@/lib/messages'

const STATUS_TOASTS: Record<string, string> = {
  reviewing: "Votre candidature est en cours d'examen",
  interview: "Entretien planifié pour votre candidature",
  accepted: "Votre candidature a été acceptée",
  rejected: "Votre candidature n'a pas été retenue pour ce poste.",
}

const INTERVIEW_OUTCOME_TOASTS: Record<string, string> = {
  pass: "Votre entretien est validé. L'équipe RH poursuit les prochaines étapes.",
  fail: "Votre entretien a été évalué. Consultez vos notifications pour le détail.",
  no_show: "Votre entretien a été marqué absent.",
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
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine })
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.application(data.applicationId) })
    const msg = STATUS_TOASTS[data.status]
    if (msg) toast.info(msg)
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  // interview:scheduled
  useSocketEvent('interview:scheduled', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine })
    toast.success("Un entretien a été planifié pour vous")
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  // offer:new
  useSocketEvent('offer:new', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.offers })
    toast.info("Nouvelle offre d'emploi disponible")
  }, [queryClient]))

  // offer:closed
  useSocketEvent('offer:closed', useCallback((_data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.offers })
    // No toast for closed offers to avoid spam
  }, [queryClient]))

  // interview:reminder
  useSocketEvent('interview:reminder', useCallback((_data: any) => {
    toast.warning("Rappel : vous avez un entretien demain")
    fetchNotifications()
  }, [fetchNotifications]))

  // interview:outcome_updated
  useSocketEvent('interview:outcome_updated', useCallback((data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine })
    if (data?.applicationId) {
      queryClient.invalidateQueries({ queryKey: candidateQueryKeys.application(data.applicationId) })
    }

    const message = INTERVIEW_OUTCOME_TOASTS[data?.outcome] || "Résultat d'entretien mis à jour."
    toast.info(message)
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  useSocketEvent('ai:analysis_complete', useCallback((data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine })
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.application(data.applicationId) })

    toast.success(messages.socket.analysisReady(data.jobTitle))
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  useSocketEvent('ai:analysis_updated', useCallback((data: any) => {
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine })
    queryClient.invalidateQueries({ queryKey: candidateQueryKeys.application(data.applicationId) })
    
    toast.info(messages.socket.analysisReady(data.jobTitle))
    fetchNotifications()
  }, [queryClient, fetchNotifications]))

  if (!isMounted || !isAuthenticated) return null
  return null
}
