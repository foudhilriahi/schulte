import { Send, Clock, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";

interface ApplicationStatusPillProps {
  status: ApplicationStatus;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; icon: any; color: string; pulse?: boolean }
> = {
  new: {
    label: "Candidature envoyée",
    icon: Send,
    color: "bg-card2 text-ink3 border-border",
  },
  reviewing: {
    label: "Dossier en lecture",
    icon: Clock,
    color: "bg-warnl text-warn border-[var(--warn-b)]",
  },
  interview: {
    label: "Entretien planifié",
    icon: CalendarCheck,
    color: "bg-violetl text-violet border-[var(--violet-b)]",
    pulse: true,
  },
  accepted: {
    label: "Candidature retenue",
    icon: CheckCircle2,
    color: "bg-okl text-ok border-[var(--ok-b)]",
  },
  rejected: {
    label: "Non retenue",
    icon: XCircle,
    color: "bg-errl text-err border-[var(--err-b)]",
  },
};

export function ApplicationStatusPill({ status }: ApplicationStatusPillProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-full ${config.color}`}
    >
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-status-pulse rounded-full bg-violet opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet"></span>
        </span>
      )}
      {!config.pulse && <Icon className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />}
      <span>{config.label}</span>
    </div>
  );
}
