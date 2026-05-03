import { Calendar, Download, AlertCircle, FileText, Target, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterviewPrepPacketProps {
  candidate: any;
  analysis: any;
}

const InterviewPrepPacket = ({ candidate, analysis }: InterviewPrepPacketProps) => {
  const keyPoints = analysis?.providers?.[0]?.justification
    ? analysis.providers[0].justification.split(". ").slice(0, 3).filter(Boolean)
    : [
        "Profil globalement pertinent pour le poste.",
        "Expérience à clarifier lors de l'entretien.",
        "Soft skills à valider en situation."
      ];

  const questions = [
    {
      q: `Parlez-moi de votre expérience en tant que ${candidate.jobTitle || "professionnel"} ?`,
      purpose: "Valider les acquis de base et la communication."
    },
    {
      q: "Quel a été votre plus grand défi professionnel récent ?",
      purpose: "Évaluer la résolution de problèmes et la résilience."
    },
    {
      q: "Comment vous adaptez-vous à de nouveaux outils ou environnements ?",
      purpose: "Tester l'agilité et l'apprentissage continu."
    }
  ];

  const risks = analysis?.providers?.[0]?.justification
    ? ["Vérifier la stabilité dans les expériences précédentes."]
    : ["Aucun risque critique détecté, validation standard requise."];

  return (
    <div className="flex h-full flex-col bg-card animate-slideIn">
      <div className="sticky top-0 z-10 border-b border-border bg-card2 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-ink">Dossier d'entretien</h2>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink3">
              <Calendar className="h-3 w-3" />
              <span>{candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleString("fr-TN", { dateStyle: "long", timeStyle: "short" }) : "Date à planifier"}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[10px]">
            <Download className="h-3 w-3" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-v" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink2">Points clés du profil</h3>
          </div>
          <div className="rounded-md border border-border bg-page p-3.5">
            <ul className="space-y-2 text-[12px] leading-relaxed text-ink">
              {keyPoints.map((pt: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-v font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-bou" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink2">Questions recommandées</h3>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-3 shadow-sm">
                <p className="text-[12px] font-medium text-ink">{q.q}</p>
                <p className="mt-1.5 text-[10px] text-ink3">
                  <span className="font-semibold text-ink2">Objectif : </span>{q.purpose}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-warn" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink2">Points de vigilance</h3>
          </div>
          <div className="rounded-md border border-warnb bg-warnl p-3.5">
            <ul className="space-y-2 text-[12px] leading-relaxed text-warn">
              {risks.map((rf: string, i: number) => (
                <li key={i} className="flex gap-2 items-start">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{rf}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterviewPrepPacket;
