import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExportExcelButtonProps {
  stats: any;
}

export function ExportExcelButton({ stats }: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!stats) return;
    setExporting(true);
    
    try {
      const wb = XLSX.utils.book_new();

      // 1. Summary Sheet
      const summaryData = [
        ["Métrique", "Valeur"],
        ["Total candidats", stats.totalCandidates || 0],
        ["Comptes RH", stats.hrAccounts || 0],
        ["Offres actives", stats.activeOffers || 0],
        ["Total offres", stats.totalOffers || 0],
        ["Candidatures totales", stats.totalApplications || 0],
        ["Candidatures (ce mois)", stats.applicationsMonth || 0],
        ["Entretiens (cette semaine)", stats.interviewsWeek || 0],
        ["Score IA moyen", stats.averageAIScore ? `${stats.averageAIScore}%` : "N/A"],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Résumé Global");

      // 2. Applications Sheet
      if (stats.recentApplications && stats.recentApplications.length > 0) {
        const appsData = stats.recentApplications.map((app: any) => ({
          "Candidat": app.candidateName,
          "Email": app.candidateEmail,
          "Poste": app.offerTitle,
          "Type": app.contractType,
          "Site": app.offerSite,
          "Statut": app.status,
          "Score IA": app.aiScore ?? "",
          "Date": new Date(app.appliedAt).toLocaleDateString("fr-TN"),
        }));
        const appsSheet = XLSX.utils.json_to_sheet(appsData);
        XLSX.utils.book_append_sheet(wb, appsSheet, "Candidatures Récentes");
      }

      // 3. Offers by Site
      if (stats.offersBySite && stats.offersBySite.length > 0) {
        const sitesData = stats.offersBySite.map((s: any) => ({
          "Site": s.site,
          "Nombre d'offres": s.count,
        }));
        const sitesSheet = XLSX.utils.json_to_sheet(sitesData);
        XLSX.utils.book_append_sheet(wb, sitesSheet, "Offres par Site");
      }

      // 4. Pipeline Breakdown
      if (stats.applicationsByStatus && stats.applicationsByStatus.length > 0) {
        const statusMap: Record<string, string> = {
          new: "Nouvelle",
          reviewing: "En examen",
          interview: "Entretien",
          accepted: "Acceptée",
          rejected: "Rejetée",
        };
        const pipelineData = stats.applicationsByStatus.map((s: any) => ({
          "Étape": statusMap[s.status] || s.status,
          "Nombre de candidats": s.count,
        }));
        const pipelineSheet = XLSX.utils.json_to_sheet(pipelineData);
        XLSX.utils.book_append_sheet(wb, pipelineSheet, "Entonnoir Recrutement");
      }

      // Save file
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Schulte_Rapport_${dateStr}.xlsx`);
      toast.success("Rapport exporté avec succès");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export Excel");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport} 
      disabled={!stats || exporting}
      className="gap-2 text-[11px] h-8"
    >
      <Download className="w-3.5 h-3.5" />
      {exporting ? "Exportation..." : "Exporter (.xlsx)"}
    </Button>
  );
}
