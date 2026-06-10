import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/axios'
import { socketService } from '@/lib/socket'
import { toast } from 'sonner'

// Components
import { AdminKPIStrip } from '@/components/admin/AdminKPIStrip'
import { SiteComparisonPanel } from '@/components/admin/SiteComparisonPanel'
import { PipelineFunnel } from '@/components/admin/PipelineFunnel'
import { RecentActivityTable } from '@/components/admin/RecentActivityTable'
import { ExportExcelButton } from '@/components/admin/ExportExcelButton'

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

  if (loading) return <DashboardLayout title="Vue d'ensemble admin"><p className="text-[12px] text-ink3">Chargement...</p></DashboardLayout>

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
            ? `Dernière mise à jour: ${lastUpdated.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Dernière mise à jour: -'}
        </p>
        <div className="flex items-center gap-2">
          <ExportExcelButton stats={stats} />
          <Button variant="outline" size="sm" onClick={retryFetch} className="text-[11px] h-8">
            Recharger
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-[12px] text-warn">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retryFetch} className="text-[11px]">
            Réessayer
          </Button>
        </div>
      )}

      {/* Main KPI Strip */}
      <AdminKPIStrip stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Comparisons & Funnel */}
        <div className="flex flex-col gap-6">
          <SiteComparisonPanel stats={stats} />
          <PipelineFunnel stats={stats} />
          
          {/* Mini messagerie (admin → RH) */}
          <Card className="rounded-xl shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px] font-semibold text-ink">
                Diffusion RH
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <select
                  value={broadcastSite}
                  onChange={e => setBroadcastSite(e.target.value as 'all' | 'Bouarada' | 'Zaghouan')}
                  className="w-full rounded-md border border-border bg-card2 px-3 py-1.5 text-[11px] text-ink focus:outline-none focus:border-v"
                >
                  <option value="all">Tous les sites</option>
                  <option value="Bouarada">Bouarada uniquement</option>
                  <option value="Zaghouan">Zaghouan uniquement</option>
                </select>
              </div>
              <div>
                <input
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Court message aux RH..."
                  className="w-full rounded-md border border-border bg-card2 px-3 py-1.5 text-[11px] text-ink placeholder:text-ink4 focus:outline-none focus:border-v"
                />
              </div>
              <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="w-full text-[11px] h-8">
                {sendingBroadcast ? 'Envoi...' : 'Envoyer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivityTable stats={stats} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminOverviewPage
