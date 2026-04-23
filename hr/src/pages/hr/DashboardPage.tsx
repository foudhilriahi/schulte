import { useEffect, useState } from "react";
import DashboardLayout from "@/components/hr/DashboardLayout";
import StatCard from "@/components/hr/StatCard";
import {
  Users,
  Briefcase,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { api } from "@/lib/axios";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeOffers: 0,
    totalOffers: 0,
    interviewsThisWeek: 0,
    applicationsMonth: 0,
    site: '',
  });

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
        });
      })
      .catch((err) => {
        console.error('Failed to load HR overview:', err);
      });
  }, []);



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
    </DashboardLayout>
  );
};

export default DashboardPage;
