import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import StatCard from '@/components/hr/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, ClipboardList, CalendarDays, TrendingUp, UserCheck } from 'lucide-react'
import { api } from '@/lib/axios'
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

  useEffect(() => {
    api.get('/admin/overview').then(res => {
      setStats(res.data)
    }).catch(() => {
      // fallback
      setStats({ 
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
      })
    }).finally(() => setLoading(false))
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

  return (
    <DashboardLayout title="Admin Overview">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Candidates" value={stats?.totalCandidates ?? 0} icon={Users} iconColor="text-blue-500" />
        <StatCard label="HR Accounts" value={stats?.hrAccounts ?? 0} icon={UserCheck} iconColor="text-purple-500" />
        <StatCard label="Active Offers" value={stats?.activeOffers ?? 0} icon={Briefcase} iconColor="text-amber-500" />
        <StatCard label="Total Applications" value={stats?.totalApplications ?? 0} icon={ClipboardList} iconColor="text-green-500" />
        <StatCard label="Apps (Month)" value={stats?.applicationsMonth ?? 0} icon={TrendingUp} iconColor="text-blue-500" />
        <StatCard label="Interviews (Week)" value={stats?.interviewsWeek ?? 0} icon={CalendarDays} iconColor="text-emerald-500" />
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">AI Analysis Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Applications Analyzed:</span>
                <span className="text-lg font-semibold">{stats?.applicationsWithAI ?? 0} / {stats?.totalApplications ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average AI Score:</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats?.averageAIScore !== null ? `${stats.averageAIScore}%` : 'N/A'}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${stats?.averageAIScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {a.aiScore && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        AI Score: {a.aiScore}%
                      </p>
                    )}
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
