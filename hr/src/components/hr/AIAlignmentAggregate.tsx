import { useMemo } from "react";

interface AIAlignmentAggregateProps {
  applications: Array<{ aiScore?: number | null; hrRating?: number | null }>;
}

const AIAlignmentAggregate = ({ applications }: AIAlignmentAggregateProps) => {
  const { total, aligned, percentage } = useMemo(() => {
    let t = 0;
    let a = 0;

    applications.forEach((app) => {
      if (app.aiScore != null && app.hrRating != null && app.hrRating > 0) {
        t++;
        const aiRec = app.aiScore >= 70 ? "Hire" : app.aiScore >= 40 ? "Interview" : "Reject";
        const hrDecision = app.hrRating === 3 ? "Hire" : app.hrRating === 2 ? "Interview" : "Reject";
        if (aiRec === hrDecision) {
          a++;
        }
      }
    });

    return {
      total: t,
      aligned: a,
      percentage: t > 0 ? Math.round((a / t) * 100) : 0,
    };
  }, [applications]);

  if (total === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card2 px-4 py-3">
        <p className="text-[11px] font-semibold text-ink">Alignement IA vs HR</p>
      </div>
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-[3px] border-v text-v bg-vl">
          <span className="text-[18px] font-bold">{percentage}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold text-ink">
            {aligned} / {total} décisions alignées
          </p>
          <p className="text-[10px] text-ink3 leading-relaxed">
            Mesure à quel point vos évaluations RH finales correspondent aux recommandations de l'IA (Retenir/Hésitant/Non).
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAlignmentAggregate;
