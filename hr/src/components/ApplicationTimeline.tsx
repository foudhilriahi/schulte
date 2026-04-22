import { Check, MapPin, Clock, FileText } from "lucide-react";
import type { Application, ApplicationStatus } from "@/data/mockData";
import { useState } from "react";

const steps: { key: ApplicationStatus; label: string }[] = [
  { key: "applied", label: "Candidature envoyée" },
  { key: "review", label: "En cours d'examen" },
  { key: "interview", label: "Entretien programmé" },
  { key: "decision", label: "Décision finale" },
];

const statusOrder: ApplicationStatus[] = ["applied", "review", "interview", "decision"];

interface ApplicationTimelineProps {
  application: Application;
}

const ApplicationTimeline = ({ application }: ApplicationTimelineProps) => {
  const [interviewExpanded, setInterviewExpanded] = useState(false);
  const currentIndex = statusOrder.indexOf(application.status);

  const getDate = (step: ApplicationStatus) => {
    switch (step) {
      case "applied": return application.appliedDate;
      case "review": return application.reviewDate;
      case "interview": return application.interviewDate;
      case "decision": return application.decisionDate;
      default: return undefined;
    }
  };

  const getCountdown = () => {
    if (!application.interviewDate) return null;
    const diff = new Date(application.interviewDate).getTime() - Date.now();
    if (diff <= 0) return "Aujourd'hui";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `Dans ${days} jour${days > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const date = getDate(step.key);

        return (
          <div key={step.key} className="relative flex gap-4">
            {/* Vertical line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "bg-violet border-violet text-white"
                    : isCurrent
                    ? "bg-card border-violet animate-npulse"
                    : "border-border2 bg-card2"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-violet" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] rounded-sm ${
                    isCompleted ? "bg-violet" : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 pt-1">
              <p
                className={`text-sm font-semibold ${
                  isPending ? "text-ink4 font-normal" : "text-ink"
                }`}
              >
                {step.label}
              </p>
              {date && (
                <p className="mt-0.5 text-[10px] text-ink4 font-mono">
                  {new Date(date).toLocaleDateString("fr-TN")}
                </p>
              )}

              {/* Interview expanded card */}
              {step.key === "interview" && isCurrent && application.interviewDate && (
                <button
                  onClick={() => setInterviewExpanded(!interviewExpanded)}
                  className="mt-2 w-full text-left"
                >
                  <div className="rounded-md border-[1.5px] border-[var(--violet-b)] bg-violetl p-3 transition-all">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Clock className="h-4 w-4 text-violet" />
                      <span>{application.interviewTime}</span>
                      <span className="ml-auto rounded-full border border-[var(--violet-b)] bg-violetl px-2 py-0.5 text-xs font-semibold text-violet">
                        {getCountdown()}
                      </span>
                    </div>
                    {interviewExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start gap-2 text-xs text-ink2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet" />
                          <span>{application.interviewLocation}</span>
                        </div>
                        {application.prepNotes && (
                          <div className="flex items-start gap-2 text-xs text-ink2">
                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet" />
                            <span>{application.prepNotes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationTimeline;
