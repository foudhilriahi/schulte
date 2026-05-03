import { CheckCircle2, Circle, Clock, Mail, User, ShieldAlert } from "lucide-react";

interface DecisionTimelineProps {
  application: any;
}

const DecisionTimeline = ({ application }: DecisionTimelineProps) => {
  const steps = [
    {
      id: "applied",
      label: "Candidature reçue",
      date: application.appliedDate ? new Date(application.appliedDate).toLocaleDateString("fr-TN") : "Date inconnue",
      status: "complete",
      icon: Mail,
    },
    {
      id: "review",
      label: "Évaluation IA & RH",
      date: application.status !== "new" ? "Terminée" : "En attente",
      status: application.status === "new" ? "current" : "complete",
      icon: Clock,
    },
  ];

  if (application.status === "rejected") {
    steps.push({
      id: "decision",
      label: "Candidature non retenue",
      date: "",
      status: "error",
      icon: ShieldAlert,
    });
  } else if (application.status === "interview") {
    steps.push({
      id: "interview",
      label: "Entretien planifié",
      date: application.interviewDate ? new Date(application.interviewDate).toLocaleDateString("fr-TN") : "À confirmer",
      status: "current",
      icon: User,
    });
    steps.push({
      id: "decision",
      label: "Décision finale",
      date: "",
      status: "pending",
      icon: Circle,
    });
  } else if (application.status === "accepted") {
    steps.push({
      id: "interview",
      label: "Entretien réalisé",
      date: "Terminé",
      status: "complete",
      icon: User,
    });
    steps.push({
      id: "decision",
      label: "Candidature retenue",
      date: "",
      status: "complete",
      icon: CheckCircle2,
    });
  }

  return (
    <div className="py-4">
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
        {steps.map((step) => {
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          const isError = step.status === "error";
          
          let iconClass = "text-ink4 bg-card border-border";
          if (isComplete) iconClass = "text-ok bg-okl border-[var(--okb)]";
          if (isCurrent) iconClass = "text-v bg-vl border-[var(--vb)]";
          if (isError) iconClass = "text-err bg-errl border-[var(--errb)]";

          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              <div className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${iconClass}`}>
                <Icon className="h-3 w-3" />
              </div>
              <div>
                <p className={`text-[12px] font-semibold ${isComplete || isCurrent || isError ? "text-ink" : "text-ink3"}`}>{step.label}</p>
                {step.date && <p className="text-[10px] text-ink4 font-mono mt-0.5">{step.date}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionTimeline;
