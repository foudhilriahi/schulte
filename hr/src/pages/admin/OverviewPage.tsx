import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import StatCard from '@/components/hr/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ClipboardList, CalendarDays, TrendingUp, UserCheck } from 'lucide-react'
import { api } from '@/lib/axios'
import { socketService } from '@/lib/socket'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const statusBadge: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-indigo-100 text-indigo-800" },
  reviewing: { label: "Reviewing", className: "bg-amber-100 text-amber-800" },
  interview: { label: "Interview", className: "bg-blue-100 text-blue-800" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
};

const AdminOverviewPage = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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

  if (loading) return <DashboardLayout title="Overview"><p>Loading...</p></DashboardLayout>

  const statusChartData = (stats?.applicationsByStatus || []).map((s: any) => ({
    name: statusBadge[s.status]?.label || s.status,
    value: s.count,
    color: s.status === 'new' ? '#6366f1' : 
           s.status === 'reviewing' ? '#F59E0B' :
           s.status === 'interview' ? '#3b82f6' :
           s.status === 'accepted' ? '#10b981' : '#ef4444'
  }));

  const siteChartData = (stats?.offersBySite || []).map((s: any) => ({
    name: s.site,
    value: s.count,
    color: s.site === 'Bouarada' ? '#3b82f6' : '#14b8a6'
  }));

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
    <DashboardLayout title="Admin Overview">
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
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retryFetch}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Candidates" value={stats?.totalCandidates ?? 0} icon={Users} iconColor="text-blue-500" />
        <StatCard label="HR Accounts" value={stats?.hrAccounts ?? 0} icon={UserCheck} iconColor="text-purple-500" />
        <StatCard label="Active Offers" value={stats?.activeOffers ?? 0} icon={Briefcase} iconColor="text-amber-500" />
        <StatCard label="Total Applications" value={stats?.totalApplications ?? 0} icon={ClipboardList} iconColor="text-green-500" />
        <StatCard label="Apps (Month)" value={stats?.applicationsMonth ?? 0} icon={TrendingUp} iconColor="text-blue-500" />
        <StatCard label="Interviews (Week)" value={stats?.interviewsWeek ?? 0} icon={CalendarDays} iconColor="text-emerald-500" />
      </div>

      {/* Sites Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Offers by Site</CardTitle>
          </CardHeader>
          <CardContent>
            {siteChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={siteChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {siteChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Status Chart */}
      <Card className="rounded-2xl shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-base">Application Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={statusChartData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number) => [value, "Applications"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {(stats?.recentApplications || []).length === 0 && (
              <p className="px-6 py-4 text-sm text-muted-foreground">No recent applications.</p>
            )}
            {(stats?.recentApplications || []).map((a: any, i: number) => {
              const badge = statusBadge[a.status] ?? {
                label: a.status,
                className: "bg-slate-100 text-slate-700",
              };
              return (
                <div key={a.id || i} className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.candidateName || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.offerTitle || ''} • {a.offerSite} • {a.contractType}
                    </p>
                  </div>
                  <Badge className={`text-xs ${badge.className}`}>
                    {badge.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default AdminOverviewPage
