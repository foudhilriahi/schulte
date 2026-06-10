import { useState, useCallback, useEffect, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useNavigate, useSearchParams } from "react-router-dom";
import KanbanColumn from "./KanbanColumn";
import CandidateDrawer from "./CandidateDrawer";
import KanbanFilters from "./KanbanFilters";
import ErrorState from "./ErrorState";
import BatchActionBar from "./BatchActionBar";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { api } from "@/lib/axios";
import { getApplicationAnalysisText } from "@/lib/applicationText";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { KanbanStatus } from "@/data/hrMockData";
import { useSocket } from "@/hooks/useSocket";

const KANBAN_COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: "new", label: "À trier" },
  { id: "review", label: "En lecture" },
  { id: "interview", label: "Convoqué" },
  { id: "accepted", label: "Retenu" },
  { id: "rejected", label: "Non retenu" },
];

// Map backend statuses to kanban columns
const statusMap: Record<string, KanbanStatus> = {
  new: "new",
  reviewing: "review",
  interview: "interview",
  accepted: "accepted",
  rejected: "rejected",
};
const reverseStatusMap: Record<string, string> = {
  new: "new",
  review: "reviewing",
  interview: "interview",
  accepted: "accepted",
  rejected: "rejected",
};

interface PendingSchedule {
  appId: string;
  fromStatus: KanbanStatus;
  candidateName: string;
}

interface RevertingApp {
  appId: string;
  fromStatus: KanbanStatus;
  toStatus: KanbanStatus;
  candidateName: string;
  jobTitle: string;
}

const KanbanBoard = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pendingDragId, setPendingDragId] = useState<string | null>(null);
  const [snapBackId, setSnapBackId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<KanbanStatus | null>(null);
  const [filterCity, setFilterCity] = useState("Tous");
  const [filterContract, setFilterContract] = useState("Tous");
  const [filterAiHigh, setFilterAiHigh] = useState(false);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const initialQuery = queryParam;
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"recent" | "score" | "name">("recent");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] =
    useState<PendingSchedule | null>(null);
  const [revertingApp, setRevertingApp] = useState<RevertingApp | null>(null);
  const [revertSaving, setRevertSaving] = useState(false);
  const { socket, socketVersion } = useSocket();
  const navigate = useNavigate();

  const fetchApplications = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get("/applications/by-site")
      .then((res) => {
        const apps = res.data.map((a: any) => ({
          ...a,
          id: a.id,
          name: a.candidate?.name || "Inconnu",
          phone: a.candidate?.phone || "",
          email: a.candidate?.email || "",
          appliedDate: a.appliedAt || a.createdAt,
          jobTitle: a.offer?.title || "",
          contractType: a.offer?.contractType || "CDI",
          city: a.offer?.site || "Bouarada",
          aiScore: a.aiScore ?? 0,
            aiAnalysis: a.aiAnalysis || null,
            starRating: a.hrRating ?? 0,
          status: statusMap[a.status] || "new",
          skills: a.candidate?.skills || [],
            analysisText: getApplicationAnalysisText(a),
            requiredSkills: a.offer?.requiredSkills || [],
            experienceYears: a.offer?.experienceYears || 0,
            description: a.offer?.description || "",
          experience: "",
          education: "",
          notes: a.hrNotes || "",
        }));
        setApplications(apps);
      })
      .catch(() => {
        setError(true);
        toast.error("Échec — réessaie dans un instant.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!socket) return;

    const onApplicationNew = () => {
      toast.info("Nouvelle candidature reçue.");
      fetchApplications();
    };

    const onApplicationAnalysed = () => {
      fetchApplications();
    };

    const onApplicationManualAnalysis = () => {
      fetchApplications();
    };

    const onInterviewScheduled = () => {
      fetchApplications();
    };

    const onApplicationStatusChanged = () => {
      fetchApplications();
    };

    socket.on("application:new", onApplicationNew);
    socket.on("application:analysed", onApplicationAnalysed);
    socket.on("application:manual_analysis", onApplicationManualAnalysis);
    socket.on("interview:scheduled", onInterviewScheduled);
    socket.on("application:status_changed", onApplicationStatusChanged);

    return () => {
      socket.off("application:new", onApplicationNew);
      socket.off("application:analysed", onApplicationAnalysed);
      socket.off("application:manual_analysis", onApplicationManualAnalysis);
      socket.off("interview:scheduled", onInterviewScheduled);
      socket.off("application:status_changed", onApplicationStatusChanged);
    };
  }, [socket, socketVersion, fetchApplications]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      )
        return;

      const fromStatus = source.droppableId as KanbanStatus;
      const toStatus = destination.droppableId as KanbanStatus;

      // ── Strict real-life guards (client-side, backend also enforces) ──────
      const draggedApp = applications.find((a) => a.id === draggableId);
      const interview = draggedApp?.interview ?? null;
      const interviewOutcome: string | null = interview?.outcome ?? null;
      const interviewIsPending = !!interview && !interviewOutcome;
      const interviewScheduledAt: Date | null = interview?.scheduledAt
        ? new Date(interview.scheduledAt)
        : null;
      const interviewIsPastWithoutOutcome =
        interviewIsPending && !!interviewScheduledAt && interviewScheduledAt < new Date();

      // Final status lock — allow revert with confirmation
      if (
        (fromStatus === "accepted" || fromStatus === "rejected") &&
        toStatus !== fromStatus
      ) {
        // Store pending revert and show dialog
        setRevertingApp({
          appId: draggableId,
          fromStatus,
          toStatus,
          candidateName: draggedApp?.name || "Candidat",
          jobTitle: draggedApp?.jobTitle || "",
        });
        // Don't move the card yet — wait for user to confirm
        return;
      }

      // Interview pending → only "interview" column allowed
      if (interviewIsPending && toStatus !== "interview") {
        if (interviewIsPastWithoutOutcome) {
          toast.error(
            "L'entretien est passé sans résultat. Marquez le candidat absent avant de changer le statut.",
          );
        } else {
          toast.error(
            "Entretien en attente — renseignez le résultat avant de déplacer cette candidature.",
          );
        }
        return;
      }

      // Outcome already set → lock to matching final column
      if (interviewOutcome === "pass" && toStatus !== "accepted") {
        toast.error("Résultat fixé (Retenu) — déplacez vers « Retenu » uniquement.");
        return;
      }
      if (interviewOutcome === "fail" && toStatus !== "rejected") {
        toast.error("Résultat fixé (Refusé) — déplacez vers « Non retenu » uniquement.");
        return;
      }
      if (interviewOutcome === "no_show") {
        const noShowCount = interview?.noShowCount ?? 0;
        if (noShowCount >= 2 && toStatus !== "rejected") {
          toast.error("2 absences enregistrées — candidature automatiquement rejetée.");
          return;
        }
        if (noShowCount < 2 && toStatus !== "interview") {
          toast.error("Absence enregistrée — statut verrouillé sur Convoqué jusqu'à replanification.");
          return;
        }
      }
      // ── End guards ────────────────────────────────────────────────────────

      // Optimistic visual update
      setApplications((prev) =>
        prev.map((a) =>
          a.id === draggableId ? { ...a, status: toStatus } : a,
        ),
      );

      if (toStatus === "interview") {
        // Find candidate name for the modal title
        const candidateName = draggedApp?.name || "Candidat";

        // Store pending schedule info and open modal — do NOT call api.patch yet
        setPendingSchedule({ appId: draggableId, fromStatus, candidateName });
        setScheduleModalOpen(true);
        return;
      }

      setPendingDragId(draggableId);
      // For all other columns: persist immediately
      try {
        const backendStatus = reverseStatusMap[toStatus];
        await api.patch(`/applications/${draggableId}/status`, {
          status: backendStatus,
        });
        toast.success("Enregistré.");
      } catch (error: any) {
        // Revert on failure
        setApplications((prev) =>
          prev.map((a) =>
            a.id === draggableId ? { ...a, status: fromStatus } : a,
          ),
        );
        const message =
          error?.response?.data?.error || "Échec — annulé.";
        toast.error(message);
        setSnapBackId(draggableId);
        setTimeout(() => setSnapBackId(null), 300);
      } finally {
        setPendingDragId(null);
      }
    },
    [applications],
  );

  /** Called when ScheduleInterviewModal is dismissed without success */
  const handleScheduleModalClose = useCallback(() => {
    if (pendingSchedule) {
      // Revert the card back to its original column
      const { appId, fromStatus } = pendingSchedule;
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: fromStatus } : a)),
      );
      setPendingSchedule(null);
    }
    setScheduleModalOpen(false);
  }, [pendingSchedule]);

  /** Called when ScheduleInterviewModal successfully creates an interview */
  const handleScheduleSuccess = useCallback(async () => {
    if (!pendingSchedule) return;
    try {
      await api.patch(`/applications/${pendingSchedule.appId}/status`, {
        status: "interview",
      });
    } catch {
      toast.error("Échec — réessaie.");
    }
    fetchApplications();
    setPendingSchedule(null);
    setScheduleModalOpen(false);
  }, [pendingSchedule, fetchApplications]);

  /** Confirm revert from final status (accepted/rejected → earlier status) */
  const confirmRevert = useCallback(async () => {
    if (!revertingApp) return;
    const { appId, fromStatus, toStatus, candidateName } = revertingApp;
    setRevertSaving(true);
    try {
      const backendStatus = reverseStatusMap[toStatus];
      await api.patch(`/applications/${appId}/status`, {
        status: backendStatus,
        allowRevert: true,
      });
      // Move card visually
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: toStatus } : a)),
      );
      toast.success(`Décision annulée — ${candidateName} rétabli(e).`);
      setRevertingApp(null);
      fetchApplications();
    } catch (err: any) {
      const message = err?.response?.data?.error || "Échec — réessaie.";
      toast.error(message);
    } finally {
      setRevertSaving(false);
    }
  }, [revertingApp, fetchApplications]);

  const handleCardClick = useCallback((candidate: any, e?: React.MouseEvent) => {
    if (e && (e.metaKey || e.ctrlKey)) {
      setSelectedIds((prev) =>
        prev.includes(candidate.id)
          ? prev.filter((id) => id !== candidate.id)
          : [...prev, candidate.id]
      );
      return;
    }
    setSelectedCandidate(candidate);
    setActiveColumn(candidate.status as KanbanStatus);
    setSplitOpen(true);
  }, []);

  const handleQuickStatusChange = useCallback(
    async (candidate: any, nextStatus: "new" | "review" | "interview" | "accepted" | "rejected") => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === candidate.id ? { ...app, status: nextStatus } : app,
        ),
      );
      if (nextStatus === "interview") {
        setSelectedCandidate(candidate);
      }
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate((prev: any) => prev ? { ...prev, status: nextStatus } : prev);
        setActiveColumn(nextStatus as KanbanStatus);
      }
    },
    [selectedCandidate],
  );

  const filtered = applications.filter((c) => {
    if (filterCity !== "Tous" && c.city !== filterCity) return false;
    if (filterContract !== "Tous" && c.contractType !== filterContract)
      return false;
    if (filterAiHigh && (c.aiScore || 0) <= 70) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const haystack = [
        c.name,
        c.phone,
        c.email,
        c.jobTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const getCandidatesForColumn = (status: KanbanStatus) => {
    const byStatus = filtered.filter((c) => c.status === status);
    if (sortBy === "score") {
      return [...byStatus].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    }
    if (sortBy === "name") {
      return [...byStatus].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "fr"));
    }
    return [...byStatus].sort(
      (a, b) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime(),
    );
  };

  const activeColumnLabel = useMemo(() => {
    if (!activeColumn) return "";
    return KANBAN_COLUMNS.find((col) => col.id === activeColumn)?.label || "";
  }, [activeColumn]);

  const activeCandidates = useMemo(() => {
    if (!activeColumn) return [];
    return getCandidatesForColumn(activeColumn);
  }, [activeColumn, filtered, sortBy]);

  const closeSplit = useCallback(() => {
    setSplitOpen(false);
    setSelectedCandidate(null);
    setActiveColumn(null);
  }, []);

  const handleBatchAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    const oldApps = [...applications];
    try {
      const promises = selectedIds.map(id => {
        if (action === "delete") {
          return api.delete(`/applications/${id}`);
        } else {
          return api.patch(`/applications/${id}/status`, { status: reverseStatusMap[action] || action });
        }
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.length} candidats mis à jour.`);
      setSelectedIds([]);
      fetchApplications();
    } catch (err: any) {
      const message = err?.response?.data?.error || "Erreur lors de l'action par lot.";
      toast.error(message);
      setApplications(oldApps);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedIds.length > 0) {
          event.preventDefault();
          setSelectedIds([]);
        } else if (splitOpen) {
          event.preventDefault();
          closeSplit();
        }
      } else if (splitOpen && activeCandidates.length > 0 && selectedCandidate) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const currentIndex = activeCandidates.findIndex(c => c.id === selectedCandidate.id);
          if (currentIndex === -1) return;
          
          let nextIndex = event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
          if (nextIndex >= 0 && nextIndex < activeCandidates.length) {
            setSelectedCandidate(activeCandidates[nextIndex]);
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [splitOpen, closeSplit, selectedIds.length, activeCandidates, selectedCandidate]);

  useEffect(() => {
    if (!splitOpen || !selectedCandidate) return;
    const updated = filtered.find((c) => c.id === selectedCandidate.id);
    if (!updated) {
      closeSplit();
      return;
    }
    if (updated !== selectedCandidate) {
      setSelectedCandidate(updated);
    }
  }, [filtered, splitOpen, selectedCandidate, closeSplit]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-zagl border-[var(--zagb)] text-[#0a8a5a]";
    if (score >= 40) return "bg-warnl border-[var(--warnb)] text-[#9a6210]";
    return "bg-errl border-[var(--errb)] text-[#a02020]";
  };

  return (
    <div className="flex flex-col gap-0">
      <KanbanFilters
        filterCity={filterCity}
        filterContract={filterContract}
        filterAiHigh={filterAiHigh}
        searchQuery={searchQuery}
        totalVisible={filtered.length}
        onCityChange={setFilterCity}
        onContractChange={setFilterContract}
        onAiHighChange={setFilterAiHigh}
        onSearchChange={setSearchQuery}
        onNewOffer={() => navigate("/offers/new")}
      />

      {error && applications.length === 0 ? (
        <div className="flex h-[540px] items-center justify-center border-b border-border bg-page">
          <ErrorState variant="server" onRetry={fetchApplications} />
        </div>
      ) : splitOpen && selectedCandidate ? (
        <div className="flex min-h-[540px] border-b border-border bg-card">
          <div className="w-[260px] border-r border-border bg-card2">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-[11px] font-semibold text-ink">{activeColumnLabel}</p>
              <span className="rounded-full border border-border bg-card px-2 py-[1px] text-[10px] font-mono text-ink3">
                {activeCandidates.length}
              </span>
            </div>
            <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-2">
              {activeCandidates.map((candidate) => {
                const initials = candidate.name
                  ? candidate.name.split(" ").map((n: string) => n[0]).join("")
                  : "?";
                const isActive = selectedCandidate?.id === candidate.id;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors ${
                      isActive ? "bg-vl" : "hover:bg-card"
                    }`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-vl text-v" : "bg-card text-ink3"
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[12px] font-semibold ${isActive ? "text-v" : "text-ink"}`}>
                        {candidate.name}
                      </p>
                      <p className="truncate text-[10px] font-mono text-ink4">
                        {candidate.phone}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-mono ${getScoreColor(candidate.aiScore)}`}>
                      {candidate.aiScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <CandidateDrawer
              candidate={selectedCandidate}
              open={splitOpen}
              onClose={closeSplit}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex min-h-[540px] w-full overflow-x-auto border-b border-border bg-page">
            {KANBAN_COLUMNS.map((col, index) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                candidates={getCandidatesForColumn(col.id)}
                onCardClick={handleCardClick}
                isLast={index === KANBAN_COLUMNS.length - 1}
                selectedId={selectedCandidate?.id}
                loading={loading}
                pendingDragId={pendingDragId}
                snapBackId={snapBackId}
                selectedIds={selectedIds}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <BatchActionBar 
        count={selectedIds.length} 
        onClear={() => setSelectedIds([])} 
        onAction={handleBatchAction} 
      />

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={handleScheduleModalClose}
        applicationId={pendingSchedule?.appId || ""}
        candidateName={pendingSchedule?.candidateName || ""}
        isReschedule={!!applications.find((a) => a.id === pendingSchedule?.appId)?.interview}
        existingOutcome={
          applications.find((a) => a.id === pendingSchedule?.appId)?.interview?.outcome ?? null
        }
        isPastWithoutOutcome={(() => {
          const app = applications.find((a) => a.id === pendingSchedule?.appId);
          const iv = app?.interview;
          if (!iv || iv.outcome) return false;
          const dt = iv.scheduledAt ? new Date(iv.scheduledAt) : null;
          return !!dt && dt < new Date();
        })()}
        onSuccess={handleScheduleSuccess}
      />

      {/* ── Revert from final status dialog ─────────────────────────────── */}
      <Dialog
        open={!!revertingApp}
        onOpenChange={(isOpen) => { if (!isOpen && !revertSaving) setRevertingApp(null); }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink">
              <AlertTriangle className="h-4 w-4 text-warn shrink-0" />
              Annuler la décision finale
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Candidate info card */}
            <div className="rounded-lg border border-border bg-card2 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vl text-[13px] font-bold text-v">
                  {revertingApp?.candidateName
                    ? revertingApp.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    : "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {revertingApp?.candidateName}
                  </p>
                  <p className="text-[11px] text-ink3 truncate">
                    {revertingApp?.jobTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Status transition */}
            <div className="flex items-center justify-center gap-3">
              <span className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
                revertingApp?.fromStatus === "accepted"
                  ? "border-ok/30 bg-ok/10 text-ok"
                  : "border-err/30 bg-err/10 text-err"
              }`}>
                {revertingApp?.fromStatus === "accepted" ? "✓ Retenu" : "✗ Non retenu"}
              </span>
              <span className="text-ink3 text-sm">→</span>
              <span className="rounded-full border border-border bg-card2 px-3 py-1.5 text-[12px] font-semibold text-ink3">
                {revertingApp?.toStatus === "interview"
                  ? "Convoqué"
                  : revertingApp?.toStatus === "review"
                  ? "En lecture"
                  : "À trier"}
              </span>
            </div>

            {/* Warning */}
            <div className="rounded-md border border-warn/30 bg-warn/10 p-3 text-[12px] text-warn leading-relaxed">
              <p className="font-semibold mb-1">⚠️ Attention</p>
              <ul className="space-y-1 text-[11px] text-ink3">
                <li>• Cette action annule la décision finale enregistrée.</li>
                <li>• Un email sera envoyé au candidat pour l'informer du changement.</li>
                <li>• L'historique de la décision sera conservé dans les logs.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRevertingApp(null)}
              disabled={revertSaving}
            >
              Garder la décision
            </Button>
            <Button
              onClick={confirmRevert}
              disabled={revertSaving}
              className="bg-warn text-white hover:bg-warn/90"
            >
              {revertSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Traitement...
                </span>
              ) : (
                "Oui, annuler la décision"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default KanbanBoard;
