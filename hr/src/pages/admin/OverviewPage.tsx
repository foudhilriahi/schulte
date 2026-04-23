import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import StatCard from '@/components/hr/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ClipboardList, CalendarDays, TrendingUp, UserCheck } from 'lucide-react'
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

  if (loading) return <DashboardLayout title="Vue d'ensemble"><p>Chargement...</p></DashboardLayout>

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
        <p className="text-xs text-muted-foreground">
          {lastUpdated
            ? `Dernière mise à jour: ${lastUpdated.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Dernière mise à jour: —'}
        </p>
        <Button variant="outline" size="sm" onClick={retryFetch}>
          Recharger
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retryFetch}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total candidats" value={stats?.totalCandidates ?? 0} icon={Users} iconColor="text-primary" />
        <StatCard label="Comptes RH" value={stats?.hrAccounts ?? 0} icon={UserCheck} iconColor="text-primary" />
        <StatCard label="Offres actives" value={stats?.activeOffers ?? 0} icon={Briefcase} iconColor="text-warn" />
        <StatCard label="Total candidatures" value={stats?.totalApplications ?? 0} icon={ClipboardList} iconColor="text-ok" />
        <StatCard label="Candidatures (mois)" value={stats?.applicationsMonth ?? 0} icon={TrendingUp} iconColor="text-primary" />
        <StatCard label="Entretiens (semaine)" value={stats?.interviewsWeek ?? 0} icon={CalendarDays} iconColor="text-ok" />
      </div>

      {/* Mini messagerie (admin → RH) */}
      <Card className="rounded-md shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Mini messagerie (admin vers RH)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Audience</label>
            <select
              value={broadcastSite}
              onChange={e => setBroadcastSite(e.target.value as 'all' | 'Bouarada' | 'Zaghouan')}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-card"
            >
              <option value="all">Tous les sites RH</option>
              <option value="Bouarada">Bouarada uniquement</option>
              <option value="Zaghouan">Zaghouan uniquement</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <input
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Écrire un court message aux équipes RH"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="bg-primary">
            {sendingBroadcast ? 'Envoi...' : 'Envoyer la diffusion'}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default AdminOverviewPage
