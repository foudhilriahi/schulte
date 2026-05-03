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
  const { socket } = useSocket();
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

    socket.on("application:new", onApplicationNew);
    socket.on("application:analysed", onApplicationAnalysed);

    return () => {
      socket.off("application:new", onApplicationNew);
      socket.off("application:analysed", onApplicationAnalysed);
    };
  }, [socket, fetchApplications]);

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

      // Optimistic visual update
      setApplications((prev) =>
        prev.map((a) =>
          a.id === draggableId ? { ...a, status: toStatus } : a,
        ),
      );

      if (toStatus === "interview") {
        // Find candidate name for the modal title
        const draggedApp = applications.find((a) => a.id === draggableId);
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
      } catch {
        // Revert on failure
        setApplications((prev) =>
          prev.map((a) =>
            a.id === draggableId ? { ...a, status: fromStatus } : a,
          ),
        );
        toast.error("Échec — annulé.");
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
    } catch (err) {
      toast.error("Erreur lors de l'action par lot.");
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
    const stillVisible = filtered.some((c) => c.id === selectedCandidate.id);
    if (!stillVisible) closeSplit();
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
        onSuccess={handleScheduleSuccess}
      />

    </div>
  );
};

export default KanbanBoard;
