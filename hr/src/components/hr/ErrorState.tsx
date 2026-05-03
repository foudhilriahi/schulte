import { AlertCircle, WifiOff, ServerCrash, ShieldAlert, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  variant: "network" | "server" | "permission" | "ai-failure";
  onRetry?: () => void;
  className?: string;
}

const errorConfig = {
  network: {
    icon: WifiOff,
    headline: "Hors connexion",
    hint: "La plateforme est accessible hors ligne (mode lecture). Reconnexion...",
  },
  server: {
    icon: ServerCrash,
    headline: "Échec de synchronisation",
    hint: "Le serveur n'a pas répondu à temps. Vos données locales sont intactes.",
  },
  permission: {
    icon: ShieldAlert,
    headline: "Accès restreint",
    hint: "Vous n'avez pas les droits RH nécessaires pour cette action.",
  },
  "ai-failure": {
    icon: Bot,
    headline: "Analyse indisponible",
    hint: "L'IA Schulte est surchargée. Évaluez le candidat manuellement.",
  },
};

const ErrorState = ({ variant, onRetry, className = "" }: ErrorStateProps) => {
  const config = errorConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="mb-4 rounded-full bg-errl p-3 text-err">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-[14px] font-semibold text-ink">{config.headline}</h3>
      <p className="mb-4 max-w-[240px] text-[12px] leading-relaxed text-ink3">{config.hint}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="text-[11px]">
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
