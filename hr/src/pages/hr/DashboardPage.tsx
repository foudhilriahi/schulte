import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import DashboardLayout from "@/components/hr/DashboardLayout";
import { api } from "@/lib/axios";
import SiteWorkloadHeatline from "@/components/hr/SiteWorkloadHeatline";
import AIAlignmentAggregate from "@/components/hr/AIAlignmentAggregate";

interface ActivityItem {
  id: string;
  candidateName: string;
  offerTitle: string;
  site: string;
  status: string;
  timeAgo: string;
}

const DashboardPage = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    api.get("/applications/by-site")
      .then(res => setApplications(res.data))
      .catch(console.error);
    api
      .get("/admin/hr-overview")
      .then((res) => {
        const data = res.data;
        const recent = Array.isArray(data?.recentApplications)
          ? data.recentApplications.slice(0, 20)
          : [];
        setActivities(
          recent.map((item: any) => ({
            id: String(item.id || `${item.candidateName || "candidate"}-${item.updatedAt || Date.now()}`),
            candidateName: item.candidateName || item.candidate?.name || "Candidat",
            offerTitle: item.offerTitle || item.offer?.title || "Offre",
            site: item.site || item.offer?.site || "-",
            status: item.status || "reviewing",
            timeAgo: item.timeAgo || new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" }),
          })),
        );
      })
      .catch((err) => {
        console.error('Failed to load HR overview:', err);
      });
  }, []);

  const statusBadge = (status: string) => {
    if (status === "accepted") return "bg-okl border-[var(--okb)] text-[#0A8A5A]";
    if (status === "interview") return "bg-warnl border-[var(--warnb)] text-[#9A6210]";
    if (status === "rejected") return "bg-errl border-[var(--errb)] text-[#A02020]";
    return "bg-vl border-[var(--vb)] text-[#3730B8]";
  };

  return (
    <DashboardLayout title={`Vue d'ensemble · ${useAuthStore.getState().user?.site || ''}`}>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-card2 px-4 py-3">
          <p className="text-[11px] font-semibold text-ink">Activité récente</p>
          <p className="font-mono text-[10px] text-ink4">20 dernières actions</p>
        </div>
        {activities.length === 0 && (
          <div className="px-4 py-6 text-[12px] text-ink3">Aucune décision récente.</div>
        )}
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-card2">
            <span className="h-2 w-2 rounded-full bg-v" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-ink">{activity.candidateName}</p>
              <p className="text-[10px] text-ink3">{activity.offerTitle} · {activity.site}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-px text-[10px] font-semibold ${statusBadge(activity.status)}`}>
              {activity.status}
            </span>
            <p className="flex-shrink-0 font-mono text-[10px] text-ink4">{activity.timeAgo}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SiteWorkloadHeatline applications={applications} />
        <AIAlignmentAggregate applications={applications} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
