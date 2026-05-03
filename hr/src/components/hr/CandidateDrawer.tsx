import { useEffect, useRef, useState } from "react";
import { Star, X, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { authSession } from "@/lib/authSession";
import { toast } from "sonner";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DecisionConfidenceStrip from "./DecisionConfidenceStrip";
import RecruiterReasoningPanel from "./RecruiterReasoningPanel";
import ErrorState from "./ErrorState";
import InterviewPrepPacket from "./InterviewPrepPacket";
import DecisionTimeline from "./DecisionTimeline";
import {
  runDualAnalysis,
  persistDualAnalysis,
  normalizeStoredDualAnalysis,
  type DualAnalysisResult,
} from "@/lib/dual-ai-analysis";
import { recommendationToFrench } from "@/lib/recommendation-labels";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

interface CandidateDrawerProps {
  candidate: any;
  open: boolean;
  onClose: () => void;
  onQuickStatusChange?: (candidate: any, status: "new" | "review" | "interview" | "accepted" | "rejected") => void;
}

const statusToBackend: Record<string, string> = {
  new: "new",
  review: "reviewing",
  interview: "interview",
  accepted: "accepted",
  rejected: "rejected",
};

const CandidateDrawer = ({
  candidate,
  open,
  onClose,
  onQuickStatusChange,
}: CandidateDrawerProps) => {
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [analysis, setAnalysis] = useState<DualAnalysisResult | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("review");
  const [statusSaving, setStatusSaving] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open || !candidate) return;
    setNotes(candidate.notes || "");
    setRating(candidate.starRating || 0);
    setAnalysis(normalizeStoredDualAnalysis(candidate.aiAnalysis));
    setSelectedStatus(candidate.status || "review");
  }, [candidate, open]);

  if (!open || !candidate) return null;

  const saveNotes = async () => {
    try {
      await api.patch(`/applications/${candidate.id}/notes`, { notes });
      toast.success("Enregistré.");
    } catch {
      toast.error("Échec — réessaie.");
    }
  };

  const saveRating = async (r: number) => {
    setRating(r);
    try {
      await api.patch(`/applications/${candidate.id}/rating`, { rating: r });
      toast.success("Enregistré.");
    } catch {
      toast.error("Échec — réessaie.");
    }
  };

  const saveStatus = async (nextStatus?: string) => {
    const statusToSave = nextStatus || selectedStatus;
    if (!statusToSave || statusToSave === candidate.status) return;

    setStatusSaving(true);
    try {
      await api.patch(`/applications/${candidate.id}/status`, {
        status: statusToBackend[statusToSave] ?? statusToSave,
      });
      toast.success("Enregistré.");
      onQuickStatusChange?.(candidate, statusToSave as any);
      if (nextStatus) {
        setSelectedStatus(statusToSave);
      }
    } catch {
      toast.error("Échec — réessaie.");
    } finally {
      setStatusSaving(false);
    }
  };

  const acceptCandidate = () => {
    saveStatus("accepted");
  };

  const runDualAI = async () => {
    setAnalysing(true);
    setAiError(false);
    
    try {
      const dualResult = await runDualAnalysis(candidate.id, {
        cvText: candidate.analysisText || "",
        offerTitle: candidate.jobTitle || "",
        requiredSkills: candidate.requiredSkills || [],
        experienceYears: candidate.experienceYears || 0,
        description: candidate.description || "",
      }, candidate.aiAnalysis);

      await persistDualAnalysis(candidate.id, dualResult);
      setAnalysis(dualResult);

      if (dualResult.providers.length === 1) {
        toast.success(`Analyse double terminee (un seul fournisseur reussi: ${dualResult.providers[0].name})`);
      } else {
        toast.success("Analyse double terminee et enregistree.");
      }
    } catch (error: any) {
      console.error("Dual AI analysis error:", error);
      setAiError(true);
      const errorMsg = error?.response?.data?.error || error?.message || "Analyse IA double indisponible";
      toast.error(errorMsg);
    } finally {
      setAnalysing(false);
    }
  };

  const confidenceLevel = analysis?.mergedConfidence || "";

  return (
    <>
      <div className="flex h-full w-full flex-col border-l border-border bg-card shadow-modal animate-slideIn">
        <DecisionConfidenceStrip 
          score={analysis?.mergedScore} 
          recommendation={analysis?.mergedRecommendation} 
          providers={analysis?.providers?.map(p => ({ name: p.name, score: p.score }))} 
        />
        <div className="flex h-[54px] items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vl text-[12px] font-semibold text-v">
              {candidate.name
                ? candidate.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                : "?"}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">{candidate.name}</p>
              <p className="text-[11px] text-ink3">{candidate.jobTitle || "Candidat"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => notesRef.current?.focus()}
              className="h-8 px-3 text-[11px]"
            >
              Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScheduleModalOpen(true)}
              className="h-8 px-3 text-[11px]"
            >
              Entretien
            </Button>
            <Button
              onClick={acceptCandidate}
              disabled={statusSaving}
              className="h-8 px-3 text-[11px]"
            >
              Accepter
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-5 border-r border-border p-4">
            <section>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                Profil
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-ink3">Telephone</p>
                  <p className="text-[12px] font-mono text-ink2">{candidate.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink3">Email</p>
                  <p className="text-[12px] text-ink">{candidate.email || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink3">Site</p>
                  <p className="text-[12px] text-ink">{candidate.city || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink3">Contrat</p>
                  <p className="text-[12px] text-ink">{candidate.contractType || "-"}</p>
                </div>
              </div>
            </section>

            {candidate.skills?.length > 0 && (
              <section>
                <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                  Competences
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                Actions RH
              </p>
              <div className="mt-3 space-y-4">
                <div className="space-y-2 rounded-md border border-border bg-card2 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                    Statut
                  </p>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9 rounded-lg bg-card text-[11px]">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review">En lecture</SelectItem>
                      <SelectItem value="interview">Convoqué</SelectItem>
                      <SelectItem value="accepted">Retenu</SelectItem>
                      <SelectItem value="rejected">Non retenu</SelectItem>
                      <SelectItem value="new">À trier</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="h-8 w-full bg-card text-[11px]"
                    onClick={() => saveStatus()}
                    disabled={statusSaving || selectedStatus === candidate.status}
                  >
                    {statusSaving ? "Mise a jour..." : "Appliquer le statut"}
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col flex-1 min-h-0 bg-card2 border-l border-border">
            {candidate.status === "interview" ? (
              <InterviewPrepPacket candidate={candidate} analysis={analysis} />
            ) : (
              <div className="space-y-5 p-4 overflow-y-auto h-full">
                <DecisionTimeline application={candidate} />
                
                <section>
                  <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                    Analyse IA double
                  </p>
              <div className="mt-2 rounded-md border border-[var(--vb)] bg-vl p-3">
                {aiError ? (
                  <ErrorState variant="ai-failure" onRetry={runDualAI} className="py-2" />
                ) : !analysis ? (
                  <Button
                    onClick={runDualAI}
                    disabled={analysing}
                    className="w-full gap-2 text-[11px]"
                  >
                    {analysing ? (
                      <>
                        <Bot className="h-4 w-4 animate-pulse" />
                        Analyse en parallele...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Lancer l'analyse double (Puter + Gemini)
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-semibold ${
                          analysis.mergedScore >= 70
                            ? "bg-okl text-ok"
                            : analysis.mergedScore >= 40
                              ? "bg-warnl text-warn"
                              : "bg-errl text-err"
                        }`}
                      >
                        {analysis.mergedScore}
                      </span>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`${
                            analysis.mergedRecommendation === "Hire"
                              ? "bg-okl text-ok"
                              : analysis.mergedRecommendation === "Interview"
                                ? "bg-warnl text-warn"
                              : analysis.mergedRecommendation === "Request More Info"
                                ? "bg-boul text-[#1a5fcc]"
                                : "bg-errl text-err"
                          }`}
                        >
                          {recommendationToFrench(analysis.mergedRecommendation)}
                        </Badge>
                        {confidenceLevel ? (
                          <Badge variant="outline" className="text-[10px]">
                            Confiance : {confidenceLevel}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {analysis.providers.length > 1 && (analysis.agreement ? (
                      <div className="rounded-md border border-ok/30 bg-ok/10 p-2 text-[11px] text-ok">
                        Les deux IA ont abouti a la meme recommandation.
                      </div>
                    ) : (
                      <div className="rounded-md border border-warn/30 bg-warn/10 p-2 text-[11px] text-warn">
                        <p className="font-semibold">Les deux evaluations divergent.</p>
                        <p>{analysis.disagreementNote}</p>
                        <p className="mt-1">Lisez les deux justifications et tranchez vous-meme.</p>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 gap-3">
                      {analysis.providers.map((provider) => (
                        <div key={provider.name} className="rounded-md border border-border bg-card p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-ink">{provider.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {provider.score}/100 • {recommendationToFrench(provider.recommendation)}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-ink3">
                            {provider.reasoning}
                          </p>

                          <details className="mt-2">
                            <summary className="cursor-pointer text-[10px] font-semibold text-ink3">
                              Afficher le raisonnement
                            </summary>
                            <p className="mt-1 text-[11px] leading-relaxed text-ink3">
                              {provider.thinking}
                            </p>
                          </details>
                        </div>
                      ))}
                    </div>

                    {analysis.mergedTips.length > 0 && (
                      <div className="rounded-md border border-border bg-card p-3">
                        <p className="text-[11px] font-semibold text-ink">Conseils fusionnes</p>
                        <ul className="mt-1 space-y-1 text-[11px] text-ink3">
                          {analysis.mergedTips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-[10px] text-ink4">
                      L'IA est une aide. La decision finale vous appartient.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runDualAI}
                      disabled={analysing}
                      className="text-[11px]"
                    >
                      {analysing ? "Nouvelle analyse..." : "Relancer l'analyse"}
                    </Button>
                  </div>
                )}
              </div>
            </section>

            <RecruiterReasoningPanel
              candidateId={candidate.id}
              currentHrRating={rating}
              currentHrNotes={notes}
            />

            <section>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                CV / Donnees
              </p>
              <div className="mt-2">
                {candidate.cvUrl ? (
                  <div className="flex min-h-[240px] items-center justify-center rounded-md border border-border bg-card2 p-4 text-center">
                    <div className="space-y-2">
                      <p className="text-[12px] text-ink3">PDF televerse</p>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const token = authSession.getAccessToken()
                            const filename = candidate.cvUrl?.replace('/uploads/', '') || ''
                            const response = await fetch(`${API_BASE}/uploads/${filename}`, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            })
                            if (!response.ok) throw new Error('Failed to download')
                            const blob = await response.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `CV_${candidate.name}.pdf`
                            a.click()
                            window.URL.revokeObjectURL(url)
                          } catch (err) {
                            console.error('Download error:', err)
                            alert('Echec du telechargement du CV')
                          }
                        }}
                        className="text-[11px]"
                      >
                        Voir / Telecharger le PDF
                      </Button>
                    </div>
                  </div>
                ) : candidate.formData ? (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-md bg-card2 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Personnel</p>
                      <p className="mt-1 text-ink">
                        {candidate.formData.personal?.name} - {candidate.formData.personal?.city}
                      </p>
                    </div>
                    {candidate.formData.education?.length > 0 && (
                      <div className="rounded-md bg-card2 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Formation</p>
                        {candidate.formData.education.map((e: any, i: number) => (
                          <p key={i} className="mt-1 text-ink">
                            {e.degree} - {e.institution} ({e.year})
                          </p>
                        ))}
                      </div>
                    )}
                    {candidate.formData.experience?.length > 0 && (
                      <div className="rounded-md bg-card2 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Experience</p>
                        {candidate.formData.experience.map((e: any, i: number) => (
                          <p key={i} className="mt-1 text-ink">
                            {e.title} chez {e.company}
                          </p>
                        ))}
                      </div>
                    )}
                    {candidate.formData.skills?.length > 0 && (
                      <div className="rounded-md bg-card2 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Competences</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {candidate.formData.skills.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {candidate.formData.languages?.length > 0 && (
                      <div className="rounded-md bg-card2 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Langues</p>
                        {candidate.formData.languages.map((l: any, i: number) => (
                          <p key={i} className="mt-1 text-ink">
                            {l.name} ({l.level})
                          </p>
                        ))}
                      </div>
                    )}
                    {candidate.formData.links?.length > 0 && (
                      <div className="rounded-md bg-card2 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Liens</p>
                        {candidate.formData.links.map((l: any, i: number) => {
                          let href = l.url;
                          try {
                            const urlObj = new URL(href);
                            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                              href = '#';
                            }
                          } catch (e) {
                            href = '#';
                          }
                          return (
                            <a key={i} href={href} target={href !== '#' ? '_blank' : '_self'} rel="noopener noreferrer" className="mt-1 block text-[11px] text-v hover:underline">
                              {l.name}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-[160px] items-center justify-center rounded-md bg-card2">
                    <p className="text-[12px] text-ink3">
                      Aucune donnee CV/formulaire disponible
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        applicationId={candidate.id}
        candidateName={candidate.name}
        onSuccess={() => {
          setScheduleModalOpen(false);
          toast.success("RDV fixé — rappel J-1 programmé.");
        }}
      />
    </>
  );
};

export default CandidateDrawer;
