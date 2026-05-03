import { useMemo } from "react";

interface SiteWorkloadHeatlineProps {
  applications: Array<{ appliedAt?: string; createdAt?: string; site?: string }>;
}

const SiteWorkloadHeatline = ({ applications }: SiteWorkloadHeatlineProps) => {
  const data = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      weeks.push({
        label: i === 0 ? "Cette sem." : `S-${i}`,
        date: d,
        bouarada: 0,
        zaghouan: 0,
      });
    }

    applications.forEach((app) => {
      const d = new Date(app.appliedAt || app.createdAt || new Date());
      const diffTime = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = 3 - Math.floor(diffDays / 7);
      
      if (weekIndex >= 0 && weekIndex < 4) {
        if (app.site === "Bouarada") weeks[weekIndex].bouarada++;
        else if (app.site === "Zaghouan") weeks[weekIndex].zaghouan++;
      }
    });

    return weeks;
  }, [applications]);

  const maxCount = Math.max(1, ...data.map((w) => Math.max(w.bouarada + w.zaghouan, 10)));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card2 px-4 py-3">
        <p className="text-[11px] font-semibold text-ink">Charge de travail par site (4 sem)</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {data.map((w, i) => {
          const total = w.bouarada + w.zaghouan;
          const wBouarada = (w.bouarada / maxCount) * 100;
          const wZaghouan = (w.zaghouan / maxCount) * 100;
          
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-16 text-[10px] text-ink4 font-mono text-right">{w.label}</span>
              <div className="flex-1 h-3 flex rounded-full overflow-hidden bg-card2">
                {wBouarada > 0 && <div className="h-full bg-bou transition-all" style={{ width: `${wBouarada}%` }} title={`Bouarada: ${w.bouarada}`} />}
                {wZaghouan > 0 && <div className="h-full bg-zag transition-all" style={{ width: `${wZaghouan}%` }} title={`Zaghouan: ${w.zaghouan}`} />}
              </div>
              <span className="w-8 text-right text-[10px] font-mono text-ink3">{total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteWorkloadHeatline;
