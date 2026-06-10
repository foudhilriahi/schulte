import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Calendar, BrainCircuit } from "lucide-react";

interface AdminKPIStripProps {
  stats: any;
}

export function AdminKPIStrip({ stats }: AdminKPIStripProps) {
  const kpis = [
    {
      title: "Candidatures",
      value: stats?.totalApplications || 0,
      subValue: `+${stats?.applicationsMonth || 0} ce mois`,
      icon: Users,
      colorClass: "text-v",
      bgClass: "bg-vl",
    },
    {
      title: "Offres Actives",
      value: stats?.activeOffers || 0,
      subValue: `Sur ${stats?.totalOffers || 0} au total`,
      icon: Briefcase,
      colorClass: "text-primary",
      bgClass: "bg-boul",
    },
    {
      title: "Entretiens",
      value: stats?.interviewsWeek || 0,
      subValue: "Cette semaine",
      icon: Calendar,
      colorClass: "text-[#9A6210]",
      bgClass: "bg-warnl",
    },
    {
      title: "Score IA Moyen",
      value: stats?.averageAIScore ? `${stats.averageAIScore}%` : "-",
      subValue: `Sur ${stats?.applicationsWithAI || 0} analyses`,
      icon: BrainCircuit,
      colorClass: "text-ok",
      bgClass: "bg-okl",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <Card key={i} className="rounded-xl shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${kpi.bgClass} ${kpi.colorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-ink3 uppercase tracking-wider">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-semibold text-ink font-mono">{kpi.value}</h3>
                </div>
                <p className="text-[11px] text-ink4 mt-0.5">{kpi.subValue}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
