import { recommendationToFrench } from "@/lib/recommendation-labels";

interface DecisionConfidenceStripProps {
  score?: number;
  recommendation?: string;
  providers?: { name: string; score: number }[];
}

const DecisionConfidenceStrip = ({ score, recommendation, providers }: DecisionConfidenceStripProps) => {
  if (score === undefined || recommendation === undefined) {
    return (
      <div className="h-[38px] w-full bg-card2 border-b border-border load-pulse" />
    );
  }

  const colorClass = recommendation === "Hire"
    ? "bg-okl text-ok border-ok/30"
    : recommendation === "Interview"
    ? "bg-warnl text-warn border-warn/30"
    : recommendation === "Reject"
    ? "bg-errl text-err border-err/30"
    : "bg-boul text-[#1a5fcc] border-bou/30";

  return (
    <div className="flex h-[38px] w-full items-center justify-between border-b border-border bg-card2 px-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Recommandation IA</span>
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold ${colorClass}`}>
          {score}% — {recommendationToFrench(recommendation)}
        </span>
      </div>
      {providers && providers.length > 1 && (
        <div className="flex items-center gap-2">
          {providers.map((p, i) => (
            <span key={i} className="text-[10px] font-mono text-ink3">
              {p.name}: {p.score}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionConfidenceStrip;
