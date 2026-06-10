import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";

interface InterviewCountdownProps {
  applicationId: string;
  jobTitle: string;
  site: string;
  scheduledAt?: string;
  location?: string;
}

export function InterviewCountdown({
  applicationId,
  jobTitle,
  site,
  scheduledAt,
  location,
}: InterviewCountdownProps) {
  const router = useRouterWithLoader();

  let formattedDate = "Date à confirmer";
  let countdownText = "";

  if (scheduledAt) {
    const date = new Date(scheduledAt);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleString("fr-TN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffMs < 0) countdownText = "Passe";
      else if (diffDays === 0) countdownText = "Aujourd'hui";
      else if (diffDays === 1) countdownText = "Demain";
      else if (diffDays > 1) countdownText = `Dans ${diffDays}j`;
    }
  }

  return (
    <div
      className="relative bg-vl border border-[var(--vb)] rounded-xl overflow-hidden active:scale-[0.98] transition-transform duration-[120ms] cursor-pointer touch-manipulation"
      onClick={() => router.push(`/applications/${applicationId}`)}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-v" />

      <div className="pl-4 pr-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-v animate-npulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-v">
              Entretien planifie
            </span>
          </div>
          {countdownText && (
            <span className="text-[10px] font-mono text-ink3">
              {countdownText}
            </span>
          )}
        </div>

        <h3 className="text-[15px] font-semibold text-ink leading-snug mb-2">
          {jobTitle}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[12px] text-ink2">
            <Calendar className="h-[13px] w-[13px] text-v flex-shrink-0" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-ink2">
            <MapPin className="h-[13px] w-[13px] text-v flex-shrink-0" />
            <span>{location || site || "Lieu à confirmer"}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-v">
          <span>Voir les details de preparation</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
