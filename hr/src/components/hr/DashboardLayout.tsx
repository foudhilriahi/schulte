import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import CommandRail from "./CommandRail";
import StatTray from "./StatTray";
import CommandPalette from "./CommandPalette";
import StatTraySkeleton from "./StatTraySkeleton";
import ErrorState from "./ErrorState";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

const DashboardLayout = ({ title, children }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const isOverviewTab = location.pathname === "/overview" || location.pathname === "/admin";
  const isApplicationsTab = location.pathname === "/applications" || location.pathname.startsWith("/applications/");
  const shouldShowTray = isOverviewTab || isApplicationsTab;
  const trayOpen = isOverviewTab ? true : (isApplicationsTab ? statsOpen : false);

  const fetchStats = async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const endpoint = isAdmin ? "/admin/overview" : "/admin/hr-overview";
      const { data } = await api.get(endpoint);
      setStatsData(data);
      setStatsError(false);
    } catch {
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!trayOpen || statsLoading || statsData) return;
    fetchStats();
  }, [trayOpen, statsLoading, statsData, user?.role]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setStatsOpen(false);
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const statItems = useMemo(() => {
    const missing = !statsData;
    if (isAdmin) {
      const avgScore =
        typeof statsData?.averageAIScore === "number"
          ? Math.round(statsData.averageAIScore)
          : null;
      return [
        {
          id: "offers",
          label: "Offres actives",
          value: missing ? "-" : statsData.activeOffers ?? 0,
          sub: missing
            ? "Indisponible"
            : `Total: ${statsData.totalOffers ?? 0}`,
          accentClass: "bg-v",
        },
        {
          id: "applications",
          label: "Candidatures",
          value: missing ? "-" : statsData.totalApplications ?? 0,
          sub: missing
            ? "Indisponible"
            : `Mois: ${statsData.applicationsMonth ?? 0}`,
          accentClass: "bg-bou",
        },
        {
          id: "interviews",
          label: "Entretiens",
          value: missing ? "-" : statsData.interviewsWeek ?? 0,
          sub: missing ? "Indisponible" : "Cette semaine",
          accentClass: "bg-tan",
        },
        {
          id: "ai",
          label: "Taux IA",
          value: missing ? "-" : avgScore !== null ? `${avgScore}` : "-",
          sub: missing
            ? "Indisponible"
            : avgScore !== null
              ? "Moyenne"
              : "-",
          accentClass: "bg-ok",
        },
      ];
    }

    return [
      {
        id: "offers",
        label: "Offres actives",
        value: missing ? "-" : statsData.activeOffers ?? 0,
        sub: missing ? "Indisponible" : `Total: ${statsData.totalOffers ?? 0}`,
        accentClass: "bg-v",
      },
      {
        id: "applications",
        label: "Candidatures",
        value: missing ? "-" : statsData.totalApplications ?? 0,
        sub: missing ? "Indisponible" : `Mois: ${statsData.applicationsMonth ?? 0}`,
        accentClass: "bg-bou",
      },
      {
        id: "interviews",
        label: "Entretiens",
        value: missing ? "-" : statsData.interviewsWeek ?? 0,
        sub: missing ? "Indisponible" : "Cette semaine",
        accentClass: "bg-tan",
      },
      {
        id: "month",
        label: "Ce mois",
        value: missing ? "-" : statsData.applicationsMonth ?? 0,
        sub: missing ? "Indisponible" : "Candidatures",
        accentClass: "bg-ok",
      },
    ];
  }, [isAdmin, statsData]);

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <TopBar title={title} />
      <CommandRail
        statsOpen={statsOpen}
        onToggleStats={() => setStatsOpen((prev) => !prev)}
        onOpenCommand={() => {
          setStatsOpen(false);
          setCommandOpen(true);
        }}
      />
      {shouldShowTray && (
        statsLoading ? (
          <div className={`overflow-hidden transition-all duration-200 ease-out ${trayOpen ? "h-[82px]" : "h-0"}`}>
            <StatTraySkeleton />
          </div>
        ) : (
          <StatTray open={trayOpen} items={statItems} />
        )
      )}
      <main className="flex-1 overflow-hidden px-6 py-6 flex flex-col">
        <h1 className="sr-only">{title}</h1>
        {statsError && trayOpen && (
          <div className="mb-3">
            <ErrorState variant="server" onRetry={fetchStats} className="bg-card py-4" />
          </div>
        )}
        {children}
      </main>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
};

export default DashboardLayout;
