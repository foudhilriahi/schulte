import { FolderOpen, Inbox, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";

interface EmptyJourneyStateProps {
  variant: "no-jobs" | "no-applications" | "no-notifications";
}

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
    color: "text-violet",
    bg: "bg-violetl",
  },
  "no-notifications": {
    icon: Bell,
    title: "Tout est calme pour l'instant",
    description: "Vous serez notifié ici dès qu'un recruteur consulte votre dossier ou planifie un entretien.",
    color: "text-ok",
    bg: "bg-okl",
  },
};

export function EmptyJourneyState({ variant }: EmptyJourneyStateProps) {
  const router = useRouterWithLoader();
  const data = CONFIG[variant];
  const Icon = data.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-slide-up-fade">
      <div className={`h-20 w-20 rounded-full ${data.bg} flex items-center justify-center mb-5`}>
        <Icon className={`h-10 w-10 ${data.color}`} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-ink mb-2">{data.title}</h3>
      <p className="text-sm text-ink3 max-w-[280px] leading-relaxed mb-6">
        {data.description}
      </p>
      {data.action && data.path && (
        <Button
          onClick={() => router.push(data.path)}
          className="rounded-full px-6 font-semibold"
        >
          {data.action}
        </Button>
      )}
    </div>
  );
}
