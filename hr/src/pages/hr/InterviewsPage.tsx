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
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CalendarClock,
  },
  pass: {
    label: "Retenu",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  fail: {
    label: "Refusé",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
  no_show: {
    label: "Absent",
    className: "bg-slate-100 text-slate-600 border-slate-200",
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
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);

  const fetchInterviews = useCallback(() => {
    setLoading(true);
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
          };
        });
        setInterviews(normalized);
      })
      .catch(() => {
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

  if (loading) {
    return (
      <DashboardLayout title="Entretiens">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1A2B4A] border-t-transparent" />
          Chargement des entretiens...
        </div>
      </DashboardLayout>
    );
  }

  /* Group by status for a quick summary strip */
  const scheduled = interviews.filter((i) => i.status === "scheduled");
  const concluded = interviews.filter((i) => i.status !== "scheduled");

  return (
    <DashboardLayout title="Entretiens">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          {
            label: "Planifiés",
            count: interviews.filter((i) => i.status === "scheduled").length,
            color: "bg-blue-50 text-blue-700 border-blue-200",
          },
          {
            label: "Retenus",
            count: interviews.filter((i) => i.status === "pass").length,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          },
          {
            label: "Refusés",
            count: interviews.filter((i) => i.status === "fail").length,
            color: "bg-red-50 text-red-700 border-red-200",
          },
          {
            label: "Absents",
            count: interviews.filter((i) => i.status === "no_show").length,
            color: "bg-slate-50 text-slate-600 border-slate-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${s.color}`}
          >
            <span>{s.label}</span>
            <span className="font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {interviews.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Aucun entretien planifié pour le moment.
        </p>
      )}

      {/* Scheduled interviews */}
      {scheduled.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#1A2B4A] mb-3 uppercase tracking-wide">
            À venir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scheduled.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onRecordOutcome={() => openOutcomeModal(interview)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Concluded interviews */}
      {concluded.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#1A2B4A] mb-3 uppercase tracking-wide">
            Terminés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {concluded.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onRecordOutcome={undefined}
              />
            ))}
          </div>
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
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">
              {candidateName}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
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
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="capitalize">{dateDisplay}</span>
        </div>

        {/* Location */}
        {interview.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground italic border-l-2 border-[#F59E0B] pl-2 mt-1">
            "{interview.notes}"
          </p>
        )}

        {/* Prep notes */}
        {Array.isArray(interview.prepNotes) &&
          interview.prepNotes.length > 0 && (
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-[#1A2B4A]">Points à aborder :</p>
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
            className="w-full mt-1 bg-[#1A2B4A] hover:bg-[#243a5e] text-white text-xs gap-1.5"
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
