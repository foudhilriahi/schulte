import type { ApplicationStatus } from "@/lib/types";

interface ApplicationStatusPillProps {
  status: ApplicationStatus;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  new: {
    label: "Candidature envoyée",
    color: "bg-card2 text-ink3 border-border",
  },
  reviewing: {
    label: "En cours d'examen",
    color: "bg-vl text-[#3730B8] border-[var(--vb)]",
  },
  interview: {
    label: "Entretien planifié",
    color: "bg-tanl text-[#A0471A] border-[var(--tanb)]",
  },
  accepted: {
    label: "Candidature retenue",
    color: "bg-okl text-[#0A8A5A] border-[var(--okb)]",
  },
  rejected: {
    label: "Non retenue",
    color: "bg-card2 text-ink3 border-border",
  },
};

export function ApplicationStatusPill({ status }: ApplicationStatusPillProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <div
      className={`inline-flex items-center px-2.5 py-[3px] text-[10px] font-semibold border border-solid rounded-full font-sans ${config.color}`}
    >
      {config.label}
    </div>
  );
}

