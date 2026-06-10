import { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/hr/DashboardLayout";
import OutcomeModal from "@/components/hr/OutcomeModal";
import ScheduleInterviewModal from "@/components/hr/ScheduleInterviewModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  Clock,
  Building,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  UserX,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

/* ── type icon by interview type ───────────────────────────── */
const typeIcons: Record<string, React.ElementType> = {
  "on-site": Building,
  video: Video,
  phone: Phone,
};

/* ── status badge config ────────────────────────────────────── */
const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  scheduled: {
    label: "Planifié",
    className: "bg-boul text-primary border-[var(--bou-b)]",
    icon: CalendarClock,
  },
  pass: {
    label: "Retenu",
    className: "bg-ok/14 text-ok border-ok/28",
    icon: CheckCircle,
  },
  fail: {
    label: "Refusé",
    className: "bg-err/14 text-err border-err/28",
    icon: XCircle,
  },
  no_show: {
    label: "Absent",
    className: "bg-card2 text-ink3 border-border",
    icon: UserX,
  },
};

/* ── helpers ────────────────────────────────────────────────── */
const formatInterviewDate = (dateStr: string, timeStr: string): string => {
  try {
    const readable = new Date(dateStr).toLocaleDateString("fr-TN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${readable} à ${timeStr}`;
  } catch {
    return `${dateStr} à ${timeStr}`;
  }
};

/* ── component ──────────────────────────────────────────────── */
const InterviewsPage = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [markingNoShow, setMarkingNoShow] = useState<string | null>(null);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [concludedPage, setConcludedPage] = useState(1);
  const pageSize = 12;
  const refreshTimerRef = useRef<number | null>(null);
  const { socket, socketVersion } = useSocket();

  const fetchInterviews = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/interviews")
      .then((res) => {
        const normalized = (res.data || []).map((i: any) => {
          const dt = i.scheduledAt ? new Date(i.scheduledAt) : null;
          return {
            ...i,
            status: i.outcome || 'scheduled',
            date: dt ? dt.toISOString().split('T')[0] : '',
            time: dt
              ? dt.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
              : '',
            notes: i.notesForCandidate || '',
            prepNotes: Array.isArray(i.notesForCandidate) ? i.notesForCandidate : [],
            scheduledDate: dt,
          };
        });
        setInterviews(normalized);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load interviews:', err);
        setError('Impossible de charger les entretiens.');
        setInterviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const queueRealtimeRefresh = useCallback(() => {
    if (typeof window === "undefined") return;
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      fetchInterviews();
    }, 250);
  }, [fetchInterviews]);

  useEffect(() => {
    if (!socket) return;

    const onRealtimeInterviewChanged = () => queueRealtimeRefresh();
    socket.on("interview:scheduled", onRealtimeInterviewChanged);
    socket.on("interview:outcome_updated", onRealtimeInterviewChanged);
    socket.on("application:status_changed", onRealtimeInterviewChanged);
    socket.on("connect", onRealtimeInterviewChanged);
    socket.on("reconnect", onRealtimeInterviewChanged);

    return () => {
      socket.off("interview:scheduled", onRealtimeInterviewChanged);
      socket.off("interview:outcome_updated", onRealtimeInterviewChanged);
      socket.off("application:status_changed", onRealtimeInterviewChanged);
      socket.off("connect", onRealtimeInterviewChanged);
      socket.off("reconnect", onRealtimeInterviewChanged);
    };
  }, [socket, socketVersion, queueRealtimeRefresh]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const openOutcomeModal = (interview: any) => {
    setSelectedInterview(interview);
    setOutcomeModalOpen(true);
  };

  const openRescheduleModal = (interview: any) => {
    setSelectedInterview(interview);
    setRescheduleModalOpen(true);
  };

  /** Quick-mark a past interview as no_show without opening the full outcome modal */
  const markNoShow = async (interview: any) => {
    if (markingNoShow) return;
    setMarkingNoShow(interview.id);
    try {
      await api.patch(`/interviews/${interview.id}/outcome`, { outcome: "no_show" });
      toast.success("Candidat marqué absent (no_show).");
      fetchInterviews();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Échec — réessaie.";
      toast.error(msg);
    } finally {
      setMarkingNoShow(null);
    }
  };

  const handleOutcomeSuccess = () => {
    setOutcomeModalOpen(false);
    setSelectedInterview(null);
    fetchInterviews();
  };

  /* Group by status for a quick summary strip */
  const now = new Date();
  const scheduled = interviews.filter(
    (i) => i.status === "scheduled" && i.scheduledDate && i.scheduledDate >= now,
  );
  /** Past interviews that have no outcome yet — need no_show or reschedule */
  const pastWithoutOutcome = interviews.filter(
    (i) => i.status === "scheduled" && i.scheduledDate && i.scheduledDate < now,
  );
  const concluded = interviews.filter((i) => i.status !== "scheduled");

  const scheduledPages = Math.max(1, Math.ceil(scheduled.length / pageSize));
  const concludedPages = Math.max(1, Math.ceil(concluded.length / pageSize));

  useEffect(() => {
    if (scheduledPage > scheduledPages) setScheduledPage(scheduledPages);
  }, [scheduledPage, scheduledPages]);

  useEffect(() => {
    if (concludedPage > concludedPages) setConcludedPage(concludedPages);
  }, [concludedPage, concludedPages]);

  const pagedScheduled = scheduled.slice((scheduledPage - 1) * pageSize, scheduledPage * pageSize);
  const pagedConcluded = concluded.slice((concludedPage - 1) * pageSize, concludedPage * pageSize);

  if (loading) {
    return (
      <DashboardLayout title="Entretiens">
        <div className="flex items-center gap-2 text-[12px] text-ink3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-v border-t-transparent" />
          Chargement des entretiens...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Entretiens">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          {
            label: "Planifiés",
            count: scheduled.length,
            color: "bg-boul text-primary border-[var(--bou-b)]",
          },
          {
            label: "En attente résultat",
            count: pastWithoutOutcome.length,
            color: pastWithoutOutcome.length > 0
              ? "bg-warn/12 text-warn border-warn/30"
              : "bg-card2 text-ink3 border-border",
          },
          {
            label: "Retenus",
            count: interviews.filter((i) => i.status === "pass").length,
            color: "bg-ok/12 text-ok border-ok/25",
          },
          {
            label: "Refusés",
            count: interviews.filter((i) => i.status === "fail").length,
            color: "bg-err/12 text-err border-err/25",
          },
          {
            label: "Absents",
            count: interviews.filter((i) => i.status === "no_show").length,
            color: "bg-card2 text-ink3 border-border",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-medium ${s.color}`}
          >
            <span>{s.label}</span>
            <span className="font-mono text-ink2">{s.count}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-err/30 bg-err/10 p-3 text-sm text-err">
          {error}
        </div>
      )}

      {interviews.length === 0 && !error && (
        <p className="text-[12px] text-ink3">
          Aucun entretien planifié pour le moment.
        </p>
      )}

      {/* Past interviews without outcome — require action */}
      {pastWithoutOutcome.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.09em] text-warn flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Passés sans résultat — action requise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pastWithoutOutcome.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                isPastWithoutOutcome
                onRecordOutcome={() => openOutcomeModal(interview)}
                onMarkNoShow={() => markNoShow(interview)}
                onReschedule={() => openRescheduleModal(interview)}
                markingNoShow={markingNoShow === interview.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled interviews */}
      {scheduled.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">
            À venir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedScheduled.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onRecordOutcome={() => openOutcomeModal(interview)}
              />
            ))}
          </div>
          {scheduled.length > pageSize && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={scheduledPage <= 1}
                onClick={() => setScheduledPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <span className="text-[11px] text-ink3">
                Page {scheduledPage}/{scheduledPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={scheduledPage >= scheduledPages}
                onClick={() => setScheduledPage((p) => Math.min(scheduledPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Concluded interviews */}
      {concluded.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">
            Terminés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedConcluded.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onRecordOutcome={undefined}
              />
            ))}
          </div>
          {concluded.length > pageSize && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={concludedPage <= 1}
                onClick={() => setConcludedPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <span className="text-[11px] text-ink3">
                Page {concludedPage}/{concludedPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={concludedPage >= concludedPages}
                onClick={() => setConcludedPage((p) => Math.min(concludedPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Outcome modal */}
      <OutcomeModal
        open={outcomeModalOpen}
        onClose={() => {
          setOutcomeModalOpen(false);
          setSelectedInterview(null);
        }}
        interviewId={selectedInterview?.id || ""}
        candidateName={
          selectedInterview?.application?.candidate?.name || "Candidat"
        }
        onSuccess={handleOutcomeSuccess}
      />

      {/* Reschedule modal — only for past-without-outcome interviews */}
      <ScheduleInterviewModal
        open={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedInterview(null);
        }}
        applicationId={selectedInterview?.applicationId || selectedInterview?.application?.id || ""}
        candidateName={selectedInterview?.application?.candidate?.name || "Candidat"}
        isReschedule
        existingOutcome={null}
        isPastWithoutOutcome
        onSuccess={() => {
          setRescheduleModalOpen(false);
          setSelectedInterview(null);
          toast.success("Entretien replanifié.");
          fetchInterviews();
        }}
      />
    </DashboardLayout>
  );
};

/* ── Interview card sub-component ───────────────────────────── */
interface InterviewCardProps {
  interview: any;
  onRecordOutcome?: () => void;
  onMarkNoShow?: () => void;
  onReschedule?: () => void;
  isPastWithoutOutcome?: boolean;
  markingNoShow?: boolean;
}

const InterviewCard = ({
  interview,
  onRecordOutcome,
  onMarkNoShow,
  onReschedule,
  isPastWithoutOutcome = false,
  markingNoShow = false,
}: InterviewCardProps) => {
  const cfg = statusConfig[interview.status] || statusConfig.scheduled;
  const StatusIcon = cfg.icon;
  const TypeIcon = typeIcons[interview.type] || Building;

  const candidateName =
    interview.application?.candidate?.name || "Candidat inconnu";
  const offerTitle = interview.application?.offer?.title || "—";
  const offerCity = interview.application?.offer?.site || "";

  const dateDisplay = formatInterviewDate(interview.date, interview.time);

  const typeLabel: Record<string, string> = {
    "on-site": "Présentiel",
    video: "Vidéo",
    phone: "Téléphonique",
  };

  return (
    <Card
      className={`rounded-md shadow-card transition-shadow hover:shadow-hover ${
        isPastWithoutOutcome ? "border-warn/40 bg-warn/5" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">
              {candidateName}
            </CardTitle>
            <p className="mt-0.5 truncate text-[11px] text-ink3">
              {offerTitle}
              {offerCity ? ` — ${offerCity}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              className={`text-xs shrink-0 flex items-center gap-1 border ${cfg.className}`}
              variant="outline"
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </Badge>
            {isPastWithoutOutcome && (
              <Badge
                className="text-[10px] shrink-0 flex items-center gap-1 border border-warn/40 bg-warn/10 text-warn"
                variant="outline"
              >
                <AlertTriangle className="h-3 w-3" />
                Résultat manquant
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {/* Date & time */}
        <div className="flex items-start gap-2 text-[12px] text-ink3">
          <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="capitalize">{dateDisplay}</span>
        </div>

        {/* Location */}
        {interview.location && (
          <div className="flex items-center gap-2 text-[12px] text-ink3">
            <TypeIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {interview.location}
              {interview.type
                ? ` (${typeLabel[interview.type] || interview.type})`
                : ""}
            </span>
          </div>
        )}

        {/* Notes */}
        {interview.notes && (
          <p className="mt-1 border-l-2 border-warn pl-2 text-[11px] italic text-ink3">
            "{interview.notes}"
          </p>
        )}

        {/* Prep notes */}
        {Array.isArray(interview.prepNotes) &&
          interview.prepNotes.length > 0 && (
            <div className="space-y-0.5 text-[11px] text-ink3">
              <p className="font-medium text-ink">Points à aborder :</p>
              <ul className="list-disc list-inside space-y-0.5">
                {interview.prepNotes.map((note: string, idx: number) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Past without outcome: show no_show + reschedule actions */}
        {isPastWithoutOutcome && (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[11px] text-warn flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              Cet entretien est passé sans résultat enregistré.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-[11px] border-warn/40 text-warn hover:bg-warn/10"
                onClick={onMarkNoShow}
                disabled={markingNoShow}
              >
                <UserX className="h-3.5 w-3.5" />
                {markingNoShow ? "..." : "Marquer absent"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-[11px]"
                onClick={onRecordOutcome}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Résultat
              </Button>
            </div>
          </div>
        )}

        {/* Normal scheduled: record outcome button */}
        {!isPastWithoutOutcome && onRecordOutcome && (
          <Button
            size="sm"
            className="mt-1 w-full gap-1.5 text-[11px]"
            onClick={onRecordOutcome}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Enregistrer résultat
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewsPage;
