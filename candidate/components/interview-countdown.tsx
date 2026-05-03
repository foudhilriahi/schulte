import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      formattedDate = date.toLocaleDateString("fr-TN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const now = new Date();
      const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) countdownText = "Aujourd'hui";
      else if (diffDays === 1) countdownText = "Demain";
      else if (diffDays > 1) countdownText = `Dans ${diffDays}j`;
    }
  }

  return (
    <Card 
      className="mb-4 bg-violetl border-[var(--violet-b)] cursor-pointer active:scale-[0.98] transition-all touch-manipulation overflow-hidden"
      onClick={() => router.push(`/applications/${applicationId}`)}
    >
      <CardContent className="p-0 relative">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-violet" />
        
        <div className="p-4 pl-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 mt-0.5">
                <span className="animate-status-pulse absolute inline-flex h-full w-full rounded-full bg-violet opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet"></span>
              </span>
              <span className="text-xs font-bold text-violet uppercase tracking-wider">
                Entretien Planifié
              </span>
            </div>
            {countdownText && (
              <span className="text-xs font-semibold bg-violet text-white px-2 py-0.5 rounded-full">
                {countdownText}
              </span>
            )}
          </div>

          <h3 className="font-bold text-[15px] text-ink leading-tight mb-3">
            {jobTitle}
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-ink2">
              <Calendar className="h-4 w-4 text-violet/70" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink2">
              <MapPin className="h-4 w-4 text-violet/70" />
              <span>{location || site || "Lieu à confirmer"}</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border-t border-[var(--violet-b)] px-4 py-2.5 flex items-center justify-between mt-1">
          <span className="text-xs font-medium text-violet">
            Voir les détails de préparation
          </span>
          <ChevronRight className="h-4 w-4 text-violet" />
        </div>
      </CardContent>
    </Card>
  );
}
