import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/axios'
import { socketService } from '@/lib/socket'
import { toast } from 'sonner'

const AdminOverviewPage = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastSite, setBroadcastSite] = useState<'all' | 'Bouarada' | 'Zaghouan'>('all')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  useEffect(() => {
    const fallback = { 
      hrAccounts: 0, 
      totalCandidates: 0,
      activeOffers: 0, 
      totalOffers: 0,
      totalApplications: 0,
      applicationsMonth: 0, 
      interviewsWeek: 0, 
      applicationsWithAI: 0,
      averageAIScore: null,
      applicationsByStatus: [],
      offersBySite: [],
      recentApplications: [] 
    }

    const fetchOverview = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true)
        const res = await api.get('/admin/overview')
        setStats(res.data)
        setError(null)
        setLastUpdated(new Date())
      } catch {
        setError('Impossible de charger les données en direct. Affichage des dernières valeurs de secours.')
        setStats(fallback)
        setLastUpdated(new Date())
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    fetchOverview(true)

    const socket = socketService.getSocket()
    const refresh = () => fetchOverview(false)
    const watchedEvents = [
      'admin:overview:updated',
      'admin:hr-account:changed',
      'template:updated',
      'offer:new',
      'offer:closed',
      'application:new',
      'application:analysed',
      'application:manual_analysis',
      'interview:scheduled',
    ]

    watchedEvents.forEach((eventName) => socket?.on(eventName, refresh))

    return () => {
      watchedEvents.forEach((eventName) => socket?.off(eventName, refresh))
    }
  }, [])

  if (loading) return <DashboardLayout title="Vue d'ensemble"><p className="text-[12px] text-ink3">Chargement...</p></DashboardLayout>

  const handleBroadcast = async () => {
    const message = broadcastMsg.trim()
    if (message.length < 3) { toast.error('Le message doit contenir au moins 3 caractères'); return }
    setSendingBroadcast(true)
    try {
      const payload: Record<string, any> = { message }
      if (broadcastSite !== 'all') payload.site = broadcastSite
      const { data } = await api.post('/admin/broadcast-hr', payload)
      toast.success(data?.message || 'Diffusion envoyée')
      setBroadcastMsg('')
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) { toast.error(details[0]); return }
      toast.error(err.response?.data?.error || 'Échec de l\'envoi de la diffusion')
    } finally {
      setSendingBroadcast(false)
    }
  }

  const retryFetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/overview')
      setStats(res.data)
      setError(null)
      setLastUpdated(new Date())
    } catch {
      setError('Échec du rechargement. Vérifiez la connexion et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Vue d'ensemble admin">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-ink4">
          {lastUpdated
            ? `Derniere mise a jour: ${lastUpdated.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Derniere mise a jour: -'}
        </p>
        <Button variant="outline" size="sm" onClick={retryFetch} className="text-[11px]">
          Recharger
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-[12px] text-warn">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retryFetch} className="text-[11px]">
            Réessayer
          </Button>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
          Resume activite
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-[11px] text-ink3">Total candidats</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.totalCandidates ?? 0}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink3">Comptes RH</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.hrAccounts ?? 0}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink3">Offres actives</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.activeOffers ?? 0}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink3">Total candidatures</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.totalApplications ?? 0}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink3">Candidatures (mois)</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.applicationsMonth ?? 0}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink3">Entretiens (semaine)</p>
            <p className="text-[12px] font-mono text-ink2">{stats?.interviewsWeek ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Mini messagerie (admin → RH) */}
      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-[16px] font-semibold tracking-[-0.015em] text-ink">
            Mini messagerie (admin vers RH)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="audience-select" className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">
              Audience
            </label>
            <select
              id="audience-select"
              value={broadcastSite}
              onChange={e => setBroadcastSite(e.target.value as 'all' | 'Bouarada' | 'Zaghouan')}
              className="mt-1 h-10 w-full rounded-lg border-[1.5px] border-input bg-card px-3.5 py-2 text-[13px] text-ink focus:outline-none focus:border-v focus:ring-[3px] focus:ring-vl"
            >
              <option value="all">Tous les sites RH</option>
              <option value="Bouarada">Bouarada uniquement</option>
              <option value="Zaghouan">Zaghouan uniquement</option>
            </select>
          </div>
          <div>
            <label htmlFor="broadcast-message" className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">
              Message
            </label>
            <input
              id="broadcast-message"
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Écrire un court message aux équipes RH"
              className="mt-1 flex h-10 w-full rounded-lg border-[1.5px] border-input bg-card px-3.5 py-2 text-[13px] text-ink placeholder:text-ink4 focus-visible:outline-none focus-visible:border-v focus-visible:ring-[3px] focus-visible:ring-vl"
            />
          </div>
          <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="text-[11px]">
            {sendingBroadcast ? 'Envoi...' : 'Envoyer la diffusion'}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default AdminOverviewPage
