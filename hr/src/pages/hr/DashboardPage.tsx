import { useEffect, useState } from "react";
import DashboardLayout from "@/components/hr/DashboardLayout";
import StatCard from "@/components/hr/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  CalendarDays,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { api } from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const statusBadge: Record<string, { label: string; className: string }> = {
  new: { label: "Nouveau", className: "bg-indigo-100 text-indigo-800" },
  reviewing: { label: "En examen", className: "bg-amber-100 text-amber-800" },
  interview: { label: "Entretien", className: "bg-blue-100 text-blue-800" },
  accepted: { label: "Accepté", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejeté", className: "bg-red-100 text-red-800" },
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeOffers: 0,
    totalOffers: 0,
    interviewsThisWeek: 0,
    applicationsMonth: 0,
    applicationsWithAI: 0,
    averageAIScore: null as number | null,
    site: '',
    applicationsByStatus: [] as any[],
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    // Use the new HR-specific overview endpoint
    api
      .get("/admin/hr-overview")
      .then((res) => {
        const data = res.data;
        setStats({
          totalApplications: data.totalApplications || 0,
          activeOffers: data.activeOffers || 0,
          totalOffers: data.totalOffers || 0,
          interviewsThisWeek: data.interviewsWeek || 0,
          applicationsMonth: data.applicationsMonth || 0,
          applicationsWithAI: data.applicationsWithAI || 0,
          averageAIScore: data.averageAIScore,
          site: data.site || '',
          applicationsByStatus: data.applicationsByStatus || [],
        });
        setRecentApps(data.recentApplications || []);
      })
      .catch(() => {});

    // Interviews
    api
      .get("/interviews")
      .then((res) => {
        const list: any[] = res.data || [];
        setInterviews(
          list.filter((i: any) => i.status === "scheduled").slice(0, 5),
        );
      })
      .catch(() => {});
  }, []);

  const chartData = [
    {
      name: "Nouvelles",
      value: stats.applicationsByStatus.find((s: any) => s.status === "new")?.count || 0,
      color: "#6366f1",
    },
    {
      name: "En examen",
      value: stats.applicationsByStatus.find((s: any) => s.status === "reviewing")?.count || 0,
      color: "#F59E0B",
    },
    {
      name: "Entretien",
      value: stats.applicationsByStatus.find((s: any) => s.status === "interview")?.count || 0,
      color: "#3b82f6",
    },
    {
      name: "Acceptées",
      value: stats.applicationsByStatus.find((s: any) => s.status === "accepted")?.count || 0,
      color: "#10b981",
    },
    {
      name: "Rejetées",
      value: stats.applicationsByStatus.find((s: any) => s.status === "rejected")?.count || 0,
      color: "#ef4444",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Site: <span className="text-blue-600">{stats.site}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Candidatures totales"
          value={stats.totalApplications}
          icon={ClipboardList}
        />
        <StatCard
          label="Offres actives"
          value={stats.activeOffers}
          icon={Briefcase}
          iconColor="text-accent"
        />
        <StatCard
          label="Candidatures ce mois"
          value={stats.applicationsMonth}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Entretiens cette semaine"
          value={stats.interviewsThisWeek}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <StatCard
          label="Score IA moyen"
          value={stats.averageAIScore !== null ? `${stats.averageAIScore}%` : 'N/A'}
          icon={UserCheck}
          iconColor="text-success"
        />
      </div>

      {/* ── 3-col grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1 — Recent applications */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Candidatures récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentApps.length === 0 && (
                <p className="px-6 py-4 text-sm text-muted-foreground">
                  Aucune candidature pour le moment.
                </p>
              )}
              {recentApps.map((a: any, i: number) => {
                const badge = statusBadge[a.status] ?? {
                  label: a.status,
                  className: "bg-slate-100 text-slate-700",
                };
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">
                        {a.candidateName || "Candidat"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.offerTitle || ""} • {a.contractType || ""}
                      </p>
                      {a.aiScore && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          IA: {a.aiScore}%
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

        {/* Card 2 — Upcoming interviews */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Prochains entretiens</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {interviews.length === 0 && (
                <p className="px-6 py-4 text-sm text-muted-foreground">
                  Aucun entretien planifié.
                </p>
              )}
              {interviews.map((interview: any, i: number) => {
                const dateLabel = interview.date
                  ? new Date(interview.date).toLocaleDateString("fr-TN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "—";
                const timeLabel = interview.time ?? "";
                return (
                  <div
                    key={interview.id}
                    className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {interview.application?.candidate?.name || "Candidat"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.application?.offer?.title || ""} —{" "}
                        {dateLabel}
                        {timeLabel ? ` à ${timeLabel}` : ""}
                      </p>
                    </div>
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      Planifié
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Application status chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Répartition des candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalApplications === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-sm text-muted-foreground">
                  Aucune donnée disponible.
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(value: number) => [value, "Candidatures"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Analysées par IA:</span>
                    <span className="font-medium">{stats.applicationsWithAI} / {stats.totalApplications}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
