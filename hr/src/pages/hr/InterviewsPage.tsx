import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/hr/DashboardLayout";
import OutcomeModal from "@/components/hr/OutcomeModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import {
  Clock,
  Building,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  UserX,
  CalendarClock,
} from "lucide-react";

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
  const [scheduledPage, setScheduledPage] = useState(1);
  const [concludedPage, setConcludedPage] = useState(1);
  const pageSize = 12;

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

  const openOutcomeModal = (interview: any) => {
    setSelectedInterview(interview);
    setOutcomeModalOpen(true);
  };

  const handleOutcomeSuccess = () => {
    setOutcomeModalOpen(false);
    setSelectedInterview(null);
    fetchInterviews();
  };

  /* Group by status for a quick summary strip */
  const now = new Date();
  const scheduled = interviews.filter((i) => i.status === "scheduled" && i.scheduledDate && i.scheduledDate >= now);
  const concluded = interviews.filter((i) => i.status !== "scheduled" || (i.scheduledDate && i.scheduledDate < now));

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
    </DashboardLayout>
  );
};

/* ── Interview card sub-component ───────────────────────────── */
interface InterviewCardProps {
  interview: any;
  onRecordOutcome?: () => void;
}

const InterviewCard = ({ interview, onRecordOutcome }: InterviewCardProps) => {
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
    <Card className="rounded-md shadow-card transition-shadow hover:shadow-hover">
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
          <Badge
            className={`text-xs shrink-0 flex items-center gap-1 border ${cfg.className}`}
            variant="outline"
          >
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </Badge>
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

        {/* Action button */}
        {onRecordOutcome && (
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
