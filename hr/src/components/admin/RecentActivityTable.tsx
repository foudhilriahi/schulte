import { Badge } from "@/components/ui/badge";

interface RecentActivityTableProps {
  stats: any;
}

export function RecentActivityTable({ stats }: RecentActivityTableProps) {
  const statusLabels: Record<string, string> = {
    new: "Nouvelle",
    reviewing: "En examen",
    interview: "Entretien",
    accepted: "Acceptée",
    rejected: "Rejetée",
  };

  const statusBadge = (status: string) => {
    if (status === "accepted") return "bg-okl border-[var(--ok-b)] text-ok";
    if (status === "interview") return "bg-warnl border-[var(--warn-b)] text-warn";
    if (status === "rejected") return "bg-errl border-[var(--err-b)] text-err";
    if (status === "reviewing") return "bg-boul border-[var(--bou-b)] text-primary";
    return "bg-vl border-[var(--v-b)] text-v";
  };

  const recent = stats?.recentApplications || [];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border bg-card2 px-4 py-3">
        <p className="text-[11px] font-semibold text-ink">Activité Récente</p>
        <p className="font-mono text-[10px] text-ink4">20 dernières candidatures</p>
      </div>
      
      {recent.length === 0 ? (
        <div className="p-8 text-center text-[12px] text-ink3 flex-1 flex items-center justify-center">
          Aucune activité récente.
        </div>
      ) : (
        <div className="overflow-auto flex-1 max-h-[400px]">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-card z-10 border-b border-border text-ink3 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2 font-medium">Candidat</th>
                <th className="px-4 py-2 font-medium">Poste</th>
                <th className="px-4 py-2 font-medium">Site</th>
                <th className="px-4 py-2 font-medium">Score IA</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((item: any) => (
                <tr key={item.id} className="hover:bg-card2/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-ink">{item.candidateName}</div>
                    <div className="text-ink4 text-[10px] truncate max-w-[120px]">{item.candidateEmail}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-ink2 truncate max-w-[150px]">{item.offerTitle}</div>
                    <div className="text-ink4 text-[10px]">{item.contractType}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={`text-[9px] font-mono ${item.offerSite === 'Bouarada' ? 'bg-boul text-[#1a5fcc] border-[var(--bou-b)]' : 'bg-zagl text-[#0a8a5a] border-[var(--zag-b)]'}`}>
                      {item.offerSite || '-'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    {item.aiScore !== null ? (
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${
                        item.aiScore >= 75 ? 'bg-okl text-ok' :
                        item.aiScore >= 40 ? 'bg-warnl text-warn' :
                        'bg-errl text-err'
                      }`}>
                        {item.aiScore}
                      </span>
                    ) : (
                      <span className="text-ink4">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${statusBadge(item.status)}`}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[10px] text-ink3">
                    {new Date(item.appliedAt).toLocaleDateString('fr-TN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
