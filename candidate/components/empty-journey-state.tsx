import { FolderOpen, Inbox, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";

interface EmptyJourneyStateProps {
  variant: "no-jobs" | "no-applications" | "no-notifications";
}

type EmptyStateConfig = {
  icon: typeof FolderOpen;
  title: string;
  description: string;
  color: string;
  bg: string;
  action?: string;
  path?: string;
};

const CONFIG = {
  "no-jobs": {
    icon: FolderOpen,
    title: "Aucune offre pour ce filtre",
    description: "Essayez un autre site ou un autre type de contrat pour voir plus de résultats.",
    color: "text-bou",
    bg: "bg-boul",
  },
  "no-applications": {
    icon: Inbox,
    title: "Pas encore de candidature",
    description: "Parcourez les offres et postulez — votre parcours commence ici.",
    action: "Voir les offres",
    path: "/",
    color: "text-v",
    bg: "bg-vl",
  },
  "no-notifications": {
    icon: Bell,
    title: "Tout est calme pour l'instant",
    description: "Vous serez notifié ici dès qu'un recruteur consulte votre dossier ou planifie un entretien.",
    color: "text-ok",
    bg: "bg-okl",
  },
} satisfies Record<EmptyJourneyStateProps["variant"], EmptyStateConfig>;

export function EmptyJourneyState({ variant }: EmptyJourneyStateProps) {
  const router = useRouterWithLoader();
  const data: EmptyStateConfig = CONFIG[variant];
  const Icon = data.icon;
  const actionPath = typeof data.path === "string" ? data.path : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-slide-up-fade">
      <div className={`h-20 w-20 rounded-full ${data.bg} flex items-center justify-center mb-5`}>
        <Icon className={`h-10 w-10 ${data.color}`} strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold text-ink mb-2">{data.title}</h3>
      <p className="text-[12px] text-ink3 max-w-[280px] leading-relaxed mb-6">
        {data.description}
      </p>
      {data.action && actionPath && (
        <Button
          onClick={() => router.push(actionPath)}
          className="px-6"
        >
          {data.action}
        </Button>
      )}
    </div>
  );
}
