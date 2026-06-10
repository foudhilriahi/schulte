import { useEffect, useRef, useState } from "react";
import { Star, X, Bot, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { authSession } from "@/lib/authSession";
import { toast } from "sonner";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  /** null = idle, 'accepted' | 'rejected' = waiting for confirm (applying final status) */
  const [pendingFinalStatus, setPendingFinalStatus] = useState<"accepted" | "rejected" | null>(null);
  /** Reverting FROM final status: { from: current status, to: target status } */
  const [revertingStatus, setRevertingStatus] = useState<{ from: string; to: string } | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open || !candidate) return;
    setNotes(candidate.notes || "");
    setRating(candidate.starRating || 0);
    setAnalysis(normalizeStoredDualAnalysis(candidate.aiAnalysis));
    setSelectedStatus(candidate.status || "review");
  }, [candidate, open]);

  useEffect(() => {
    if (!open) {
      setScheduleModalOpen(false);
    }
  }, [open]);

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

  // ── Strict interview guards ──────────────────────────────────────────────
  const interview = candidate.interview ?? null;
  const interviewOutcome: string | null = interview?.outcome ?? null;
  const interviewScheduledAt: Date | null = interview?.scheduledAt
    ? new Date(interview.scheduledAt)
    : null;
  const interviewIsPending = !!interview && !interviewOutcome;
  const interviewIsPastWithoutOutcome =
    interviewIsPending && !!interviewScheduledAt && interviewScheduledAt < new Date();

  /**
   * Returns a blocking reason string if the status change is not allowed,
   * or null if it's fine.
   */
  const getStatusBlockReason = (nextStatus: string): string | null => {
    // Final lock — backend also enforces this
    if (
      (candidate.status === "accepted" || candidate.status === "rejected") &&
      nextStatus !== candidate.status
    ) {
      return "Statut final verrouillé — impossible de revenir en arrière.";
    }
    // Interview pending (no outcome yet) → only "interview" is allowed
    if (interviewIsPending && nextStatus !== "interview") {
      return "Entretien en attente — renseignez le résultat avant de changer le statut.";
    }
    // Outcome already set → only the matching final status is allowed
    if (interviewOutcome === "pass" && nextStatus !== "accepted") {
      return "Résultat fixé (Retenu) — statut verrouillé sur Accepté.";
    }
    if (interviewOutcome === "fail" && nextStatus !== "rejected") {
      return "Résultat fixé (Refusé) — statut verrouillé sur Non retenu.";
    }
    if (interviewOutcome === "no_show") {
      // no_show with count < 2 keeps status at interview; ≥ 2 locks to rejected
      const noShowCount = interview?.noShowCount ?? 0;
      if (noShowCount >= 2 && nextStatus !== "rejected") {
        return "2 absences enregistrées — candidature automatiquement rejetée.";
      }
      if (noShowCount < 2 && nextStatus !== "interview") {
        return "Absence enregistrée — statut verrouillé sur Convoqué jusqu'à replanification.";
      }
    }
    return null;
  };

  const saveStatus = async (nextStatus?: string, allowRevert = false) => {
    const statusToSave = nextStatus || selectedStatus;
    if (!statusToSave || statusToSave === candidate.status) return;

    // Client-side strict guard
    const blockReason = getStatusBlockReason(statusToSave);
    if (blockReason) {
      // Check if this is a revert from final status
      const currentIsFinal = candidate.status === "accepted" || candidate.status === "rejected";
      const targetIsNotFinal = statusToSave !== "accepted" && statusToSave !== "rejected";

      if (currentIsFinal && targetIsNotFinal) {
        // User is trying to revert FROM final status — show confirmation dialog
        setRevertingStatus({ from: candidate.status, to: statusToSave });
        return;
      }

      toast.error(blockReason);
      setSelectedStatus(candidate.status || "review");
      return;
    }

    setStatusSaving(true);
    try {
      const payload: Record<string, any> = {
        status: statusToBackend[statusToSave] ?? statusToSave,
      };
      // Pass allowRevert if this is a revert operation
      if (allowRevert) {
        payload.allowRevert = true;
      }

      await api.patch(`/applications/${candidate.id}/status`, payload);
      toast.success(allowRevert ? "Statut rétabli." : "Enregistré.");
      onQuickStatusChange?.(candidate, statusToSave as any);
      if (nextStatus) {
        setSelectedStatus(statusToSave);
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || "Échec — réessaie.";
      toast.error(message);
      setSelectedStatus(candidate.status || "review");
    } finally {
      setStatusSaving(false);
    }
  };

  const acceptCandidate = () => {
    const blockReason = getStatusBlockReason("accepted");
    if (blockReason) {
      toast.error(blockReason);
      return;
    }
    // Show confirm dialog instead of firing immediately
    setPendingFinalStatus("accepted");
  };

  const confirmFinalStatus = () => {
    if (!pendingFinalStatus) return;
    const status = pendingFinalStatus;
    setPendingFinalStatus(null);
    saveStatus(status);
  };

  const confirmRevert = () => {
    if (!revertingStatus) return;
    const { to } = revertingStatus;
    setRevertingStatus(null);
    saveStatus(to, true); // allowRevert = true
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

  const handleNotesClick = () => {
    if (!notesRef.current) return;
    notesRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    notesRef.current.focus();
  };

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
              onClick={handleNotesClick}
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
                    onClick={() => {
                      if (selectedStatus === "accepted" || selectedStatus === "rejected") {
                        const blockReason = getStatusBlockReason(selectedStatus);
                        if (blockReason) {
                          toast.error(blockReason);
                          setSelectedStatus(candidate.status || "review");
                          return;
                        }
                        setPendingFinalStatus(selectedStatus as "accepted" | "rejected");
                      } else {
                        saveStatus();
                      }
                    }}
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
              notesInputRef={notesRef}
            />

            <section>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">
                CV / Donnees
              </p>
              <div className="mt-2">
                {candidate.cvUrl ? (
                  // ── Uploaded PDF ──────────────────────────────────────────
                  <div className="flex min-h-[120px] items-center justify-center rounded-md border border-border bg-card2 p-4 text-center">
                    <div className="space-y-2">
                      <p className="text-[12px] text-ink3">PDF téléversé</p>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const token = authSession.getAccessToken()
                            const response = await fetch(`${API_BASE}/applications/${candidate.id}/cv`, {
                              headers: { 'Authorization': `Bearer ${token}` }
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
                            toast.error('Échec du téléchargement du CV')
                          }
                        }}
                        className="text-[11px]"
                      >
                        Télécharger le PDF
                      </Button>
                    </div>
                  </div>
                ) : candidate.formData ? (
                  // ── Generated CV — download as PDF ────────────────────────
                  <div className="space-y-3">
                    <div className="flex min-h-[120px] items-center justify-center rounded-md border border-border bg-card2 p-4 text-center">
                      <div className="space-y-2">
                        <p className="text-[12px] text-ink3">CV généré par le candidat</p>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              const token = authSession.getAccessToken()
                              const response = await fetch(`${API_BASE}/applications/${candidate.id}/cv`, {
                                headers: { 'Authorization': `Bearer ${token}` }
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
                              toast.error('Échec du téléchargement du CV')
                            }
                          }}
                          className="text-[11px]"
                        >
                          Télécharger le CV (PDF)
                        </Button>
                      </div>
                    </div>
                    {/* Quick summary still visible inline */}
                    <div className="rounded-md bg-card2 p-3 text-[11px] text-ink3 space-y-1">
                      {candidate.formData.personal?.name && (
                        <p><span className="font-medium text-ink">Nom :</span> {candidate.formData.personal.name}</p>
                      )}
                      {candidate.formData.personal?.city && (
                        <p><span className="font-medium text-ink">Ville :</span> {candidate.formData.personal.city}</p>
                      )}
                      {candidate.formData.skills?.length > 0 && (
                        <p><span className="font-medium text-ink">Compétences :</span> {candidate.formData.skills.slice(0, 6).join(', ')}{candidate.formData.skills.length > 6 ? '…' : ''}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[120px] items-center justify-center rounded-md bg-card2">
                    <p className="text-[12px] text-ink3">
                      Aucune donnée CV disponible
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

      {/* Revert from final status dialog */}
      <Dialog
        open={!!revertingStatus}
        onOpenChange={(isOpen) => { if (!isOpen) setRevertingStatus(null); }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink">
              <AlertTriangle className="h-4 w-4 text-warn" />
              Annuler la décision
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md border border-warn/30 bg-warn/10 p-4 text-[13px] text-ink">
            <p className="mb-3">
              Vous êtes sur le point de <strong>rétablir</strong> le statut de :
            </p>
            <div className="bg-card rounded-md p-3 border border-border mb-3">
              <p className="font-bold text-ink">{candidate.name}</p>
              <p className="text-xs text-ink3">{candidate.jobTitle}</p>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-err/10 text-err font-semibold border border-err/20">
                {revertingStatus?.from === "accepted" ? "Retenu" : "Non retenu"}
              </span>
              <span className="text-ink3">→</span>
              <span className="px-3 py-1 rounded-full bg-boul/10 text-primary font-semibold border border-bou-b/20">
                {revertingStatus?.to === "interview"
                  ? "Convoqué"
                  : revertingStatus?.to === "reviewing"
                  ? "En lecture"
                  : "À trier"}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-ink3">
              ⚠️ Cette action enverra un nouvel email au candidat pour l'informer du changement de statut.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRevertingStatus(null)}
              disabled={statusSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmRevert}
              disabled={statusSaving}
              className="bg-warn text-white hover:bg-warn/90"
            >
              {statusSaving ? "Traitement..." : "Oui, annuler la décision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm final status dialog */}
      <Dialog
        open={!!pendingFinalStatus}
        onOpenChange={(isOpen) => { if (!isOpen) setPendingFinalStatus(null); }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink">
              {pendingFinalStatus === "accepted" ? (
                <CheckCircle className="h-4 w-4 text-ok" />
              ) : (
                <XCircle className="h-4 w-4 text-err" />
              )}
              {pendingFinalStatus === "accepted" ? "Confirmer l'acceptation" : "Confirmer le rejet"}
            </DialogTitle>
          </DialogHeader>
          <div className={`rounded-md border p-4 text-[13px] ${
            pendingFinalStatus === "accepted"
              ? "border-ok/30 bg-ok/10 text-ok"
              : "border-err/30 bg-err/10 text-err"
          }`}>
            {pendingFinalStatus === "accepted" ? (
              <>
                Vous êtes sur le point de <strong>retenir</strong> la candidature de{" "}
                <strong>{candidate.name}</strong>.
              </>
            ) : (
              <>
                Vous êtes sur le point de <strong>rejeter</strong> la candidature de{" "}
                <strong>{candidate.name}</strong>.
              </>
            )}
            <span className="mt-1 block text-[11px] text-ink3">
              Cette action est <strong>irréversible</strong> — le statut sera verrouillé définitivement.
            </span>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingFinalStatus(null)}
              disabled={statusSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmFinalStatus}
              disabled={statusSaving}
              className={
                pendingFinalStatus === "accepted"
                  ? "bg-ok text-white hover:bg-ok/90"
                  : "bg-err text-white hover:bg-err/90"
              }
            >
              {statusSaving
                ? "Enregistrement..."
                : pendingFinalStatus === "accepted"
                ? "Oui, retenir"
                : "Oui, rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        applicationId={candidate.id}
        candidateName={candidate.name}
        isReschedule={!!interview}
        existingOutcome={interviewOutcome as any}
        isPastWithoutOutcome={interviewIsPastWithoutOutcome}
        onSuccess={() => {
          setScheduleModalOpen(false);
          toast.success("RDV fixé — rappel J-1 programmé.");
        }}
      />
    </>
  );
};

export default CandidateDrawer;
