import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SiteComparisonPanelProps {
  stats: any;
}

export function SiteComparisonPanel({ stats }: SiteComparisonPanelProps) {
  const getSiteCount = (siteName: string) => {
    return stats?.offersBySite?.find((s: any) => s.site === siteName)?.count || 0;
  };

  const bouaradaCount = getSiteCount("Bouarada");
  const zaghouanCount = getSiteCount("Zaghouan");
  const totalOffers = (stats?.totalOffers || 0) || 1; // avoid division by zero

  const bouaradaPct = Math.round((bouaradaCount / totalOffers) * 100);
  const zaghouanPct = Math.round((zaghouanCount / totalOffers) * 100);

  return (
    <Card className="rounded-xl shadow-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold text-ink">Comparaison des Sites</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-ink">Offres d'emploi</span>
              <span className="text-[11px] text-ink3">{totalOffers} au total</span>
            </div>
            
            <div className="h-3 w-full bg-card2 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-bou transition-all duration-500" 
                style={{ width: `${bouaradaPct}%` }}
                title={`Bouarada: ${bouaradaCount}`}
              />
              <div 
                className="h-full bg-zag transition-all duration-500" 
                style={{ width: `${zaghouanPct}%` }}
                title={`Zaghouan: ${zaghouanCount}`}
              />
            </div>
            
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-bou" />
                <span className="text-[12px] text-ink2">Bouarada</span>
                <span className="font-mono text-[11px] text-ink4">{bouaradaCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink4">{zaghouanCount}</span>
                <span className="text-[12px] text-ink2">Zaghouan</span>
                <span className="w-2.5 h-2.5 rounded-full bg-zag" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div className="bg-card2 rounded-lg p-3 text-center border border-border/50">
              <p className="text-[10px] text-ink4 uppercase tracking-wider mb-1">Comptes RH</p>
              <p className="text-xl font-semibold text-ink font-mono">{stats?.hrAccounts || 0}</p>
            </div>
            <div className="bg-card2 rounded-lg p-3 text-center border border-border/50">
              <p className="text-[10px] text-ink4 uppercase tracking-wider mb-1">Candidats Inscrits</p>
              <p className="text-xl font-semibold text-ink font-mono">{stats?.totalCandidates || 0}</p>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
