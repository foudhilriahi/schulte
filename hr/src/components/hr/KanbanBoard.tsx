import { useState, useCallback, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CandidateDrawer from "./CandidateDrawer";
import KanbanFilters from "./KanbanFilters";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { api } from "@/lib/axios";
import { getApplicationAnalysisText } from "@/lib/applicationText";
import { toast } from "sonner";
import type { KanbanStatus } from "@/data/hrMockData";
import { useSocket } from "@/hooks/useSocket";

const KANBAN_COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: "new", label: "Nouvelles" },
  { id: "review", label: "En examen" },
  { id: "interview", label: "Entretien" },
  { id: "accepted", label: "Acceptées" },
  { id: "rejected", label: "Rejetées" },
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
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterCity, setFilterCity] = useState("Tous");
  const [filterContract, setFilterContract] = useState("Tous");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] =
    useState<PendingSchedule | null>(null);
  const { socket } = useSocket();

  const fetchApplications = useCallback(() => {
    api
      .get("/applications/by-site")
      .then((res) => {
        const apps = res.data.map((a: any) => ({
          ...a,
          id: a.id,
          name: a.candidate?.name || "Unknown",
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
        toast.error("Failed to load applications");
      });
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!socket) return;

    const onApplicationNew = () => {
      toast.info("Nouvelle candidature reçue !");
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

      // For all other columns: persist immediately
      try {
        const backendStatus = reverseStatusMap[toStatus];
        await api.patch(`/applications/${draggableId}/status`, {
          status: backendStatus,
        });
        toast.success(`Statut mis à jour : "${toStatus}"`);
      } catch {
        // Revert on failure
        setApplications((prev) =>
          prev.map((a) =>
            a.id === draggableId ? { ...a, status: fromStatus } : a,
          ),
        );
        toast.error("Échec de la mise à jour. Annulation.");
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
      toast.error("Échec de la mise à jour du statut.");
    }
    fetchApplications();
    setPendingSchedule(null);
    setScheduleModalOpen(false);
  }, [pendingSchedule, fetchApplications]);

  const handleCardClick = useCallback((candidate: any) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  }, []);

  const filtered = applications.filter((c) => {
    if (filterCity !== "Tous" && c.city !== filterCity) return false;
    if (filterContract !== "Tous" && c.contractType !== filterContract)
      return false;
    return true;
  });

  const getCandidatesForColumn = (status: KanbanStatus) =>
    filtered.filter((c) => c.status === status);

  return (
    <div className="space-y-4">
      <KanbanFilters
        filterCity={filterCity}
        filterContract={filterContract}
        onCityChange={setFilterCity}
        onContractChange={setFilterContract}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              candidates={getCandidatesForColumn(col.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </DragDropContext>

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={handleScheduleModalClose}
        applicationId={pendingSchedule?.appId || ""}
        candidateName={pendingSchedule?.candidateName || ""}
        onSuccess={handleScheduleSuccess}
      />

      <CandidateDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default KanbanBoard;
