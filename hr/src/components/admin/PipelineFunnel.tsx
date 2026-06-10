import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineFunnelProps {
  stats: any;
}

export function PipelineFunnel({ stats }: PipelineFunnelProps) {
  const getStatusCount = (status: string) => {
    return stats?.applicationsByStatus?.find((s: any) => s.status === status)?.count || 0;
  };

  const statusData = [
    { id: "new", label: "Nouvelle", count: getStatusCount("new"), color: "bg-v" },
    { id: "reviewing", label: "En examen", count: getStatusCount("reviewing"), color: "bg-warn" },
    { id: "interview", label: "Entretien", count: getStatusCount("interview"), color: "bg-bou" },
    { id: "accepted", label: "Acceptée", count: getStatusCount("accepted"), color: "bg-ok" },
    { id: "rejected", label: "Rejetée", count: getStatusCount("rejected"), color: "bg-err" },
  ];

  const total = statusData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <Card className="rounded-xl shadow-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold text-ink">Entonnoir de Recrutement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end h-8 w-full gap-1 mb-3">
          {statusData.map((s) => {
            const pct = Math.max((s.count / total) * 100, 2); // min 2% for visibility
            if (s.count === 0) return null;
            return (
              <div 
                key={s.id}
                className={`${s.color} rounded-t-sm transition-all duration-500 flex items-center justify-center`}
                style={{ width: `${pct}%`, height: '100%' }}
                title={`${s.label}: ${s.count}`}
              >
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-5 gap-2 mt-4">
          {statusData.map((s) => (
            <div key={s.id} className="text-center flex flex-col items-center">
              <span className={`w-2 h-2 rounded-full mb-1 ${s.color}`} />
              <span className="text-[10px] text-ink3 mb-1 line-clamp-1">{s.label}</span>
              <span className="font-mono text-[12px] font-medium text-ink">{s.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
