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
  new: { label: "Nouveau", className: "bg-card2 text-ink3 border-border" },
  reviewing: { label: "En examen", className: "bg-warnl text-warn border-[var(--warn-b)]" },
  interview: { label: "Entretien", className: "bg-boul text-primary border-[var(--bou-b)]" },
  accepted: { label: "Accepté", className: "bg-okl text-ok border-[var(--ok-b)]" },
  rejected: { label: "Rejeté", className: "bg-errl text-err border-[var(--err-b)]" },
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeOffers: 0,
    totalOffers: 0,
    interviewsThisWeek: 0,
    applicationsMonth: 0,
    site: '',
    applicationsByStatus: [] as any[],
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
          site: data.site || '',
          applicationsByStatus: data.applicationsByStatus || [],
        });
        setRecentApps(data.recentApplications || []);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load HR overview:', err);
        setError('Impossible de charger le dashboard.');
      });

    // Interviews
    api
      .get("/interviews")
      .then((res) => {
        const list: any[] = res.data || [];
        setInterviews(
          list.filter((i: any) => !i.outcome).slice(0, 5),
        );
      })
      .catch((err) => {
        console.error('Failed to load interviews:', err);
      });
  }, []);

  const chartData = [
    {
      name: "Nouvelles",
      value: stats.applicationsByStatus.find((s: any) => s.status === "new")?.count || 0,
      color: "var(--bouarada)",
    },
    {
      name: "En examen",
      value: stats.applicationsByStatus.find((s: any) => s.status === "reviewing")?.count || 0,
      color: "var(--warning)",
    },
    {
      name: "Entretien",
      value: stats.applicationsByStatus.find((s: any) => s.status === "interview")?.count || 0,
      color: "var(--bouarada)",
    },
    {
      name: "Acceptées",
      value: stats.applicationsByStatus.find((s: any) => s.status === "accepted")?.count || 0,
      color: "var(--success)",
    },
    {
      name: "Rejetées",
      value: stats.applicationsByStatus.find((s: any) => s.status === "rejected")?.count || 0,
      color: "var(--destructive)",
    },
  ];

  return (
    <DashboardLayout title="Tableau de bord">
      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">
          Site: <span className="text-primary">{stats.site}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          iconColor="text-primary"
        />
        <StatCard
          label="Entretiens cette semaine"
          value={stats.interviewsThisWeek}
          icon={CalendarDays}
          iconColor="text-primary"
        />
      </div>

      {/* ── 3-col grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1 — Recent applications */}
        <Card className="rounded-md shadow-card">
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
                  className: "bg-card2 text-foreground",
                };
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? "bg-card" : "bg-page"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {a.candidateName || "Candidat"}
                      </p>
                      <p className="text-xs text-ink3">
                        {a.offerTitle || ""} • {a.contractType || ""}
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

        {/* Card 2 — Upcoming interviews */}
        <Card className="rounded-md shadow-card">
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
                const dateLabel = interview.scheduledAt
                  ? new Date(interview.scheduledAt).toLocaleDateString("fr-TN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "—";
                const timeLabel = interview.scheduledAt
                  ? new Date(interview.scheduledAt).toLocaleTimeString("fr-TN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                return (
                  <div
                    key={interview.id}
                    className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? "bg-card" : "bg-page"}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {interview.application?.candidate?.name || "Candidat"}
                      </p>
                      <p className="text-xs text-ink3">
                        {interview.application?.offer?.title || ""} —{" "}
                        {dateLabel}
                        {timeLabel ? ` à ${timeLabel}` : ""}
                        {interview.location ? ` • ${interview.location}` : ""}
                      </p>
                    </div>
                    <Badge className="text-xs bg-boul text-primary border-[var(--bou-b)]">
                      Planifié
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Application status chart */}
        <Card className="rounded-md shadow-card">
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

              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
