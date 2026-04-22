"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome }>;
}

const DISMISS_KEY = "candidate:pwa-install-hint:dismissed";

const isMobileDevice = (userAgent: string) =>
  /android|iphone|ipad|ipod|mobile/i.test(userAgent);

const getPlatform = (userAgent: string): "ios" | "android" | "other" => {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  return "other";
};

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
    .standalone;
  return window.matchMedia("(display-mode: standalone)").matches || !!iosStandalone;
};

export function PwaInstallHint() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent;
    setPlatform(getPlatform(ua));

    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    if (!isMobileDevice(ua) || isStandaloneMode() || dismissed) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
    setVisible(false);
  };

  const handleInstallNow = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const steps = useMemo(() => {
    if (platform === "ios") {
      return "Sur Safari iPhone: bouton Partager puis Sur l'ecran d'accueil.";
    }
    if (platform === "android") {
      return "Sur Chrome Android: menu puis Installer l'application ou Ajouter a l'ecran d'accueil.";
    }
    return "Ouvrez le menu du navigateur puis choisissez Installer l'application.";
  }, [platform]);

  if (!visible) return null;

  return (
    <div className="rounded-md border border-[var(--bou-b)] bg-boul px-3 py-3">
      <div className="flex items-start gap-2">
        <Download className="mt-0.5 h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Installer l'app mobile</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajoutez cette app a l'ecran d'accueil pour un mode plein ecran plus rapide.
          </p>
          <p className="mt-2 text-xs text-foreground">{steps}</p>
          <div className="mt-2 flex items-center gap-2">
            {deferredPrompt && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  void handleInstallNow();
                }}
              >
                Installer maintenant
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={handleDismiss}
            >
              Masquer
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fermer le rappel d'installation"
          className="rounded p-1 text-muted-foreground hover:bg-card2"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
