"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheetConfirm } from "@/components/bottom-sheet-confirm";
import { messages } from "@/lib/messages";
import { toast } from "sonner";

type InstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome }>;
}

const DISMISS_KEY = "candidate:smart-install-banner:dismissed";

type BrowserInstallMode =
  | "native-prompt"
  | "ios-safari"
  | "ios-other"
  | "unsupported";

function detectInstallMode(ua: string, isStandalone: boolean): BrowserInstallMode {
  if (isStandalone) return "unsupported";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafariIOS =
    isIOS && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
  const isOtherIOS = isIOS && !isSafariIOS;
  const isAndroid = /android/i.test(ua);

  if (isSafariIOS) return "ios-safari";
  if (isOtherIOS) return "ios-other";
  if (isAndroid) return "native-prompt";
  return "unsupported";
}

export function SmartInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<BrowserInstallMode>("unsupported");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    const detectedMode = detectInstallMode(ua, !!isStandalone);
    
    setMode(detectedMode);

    if (detectedMode === "unsupported" || dismissed) {
      setVisible(false);
      return;
    }

    // Delay to let the page load smoothly
    const timer = setTimeout(() => {
        setVisible(true);
    }, 1500);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      clearTimeout(timer);
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

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(messages.pwa.copied);
      setShowCopyConfirm(false);
    } catch {
      toast.info(messages.pwa.copyFallback);
      setShowCopyConfirm(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up-sheet">
        <div className="rounded-xl border border-[var(--border)] bg-card/95 backdrop-blur-md px-4 py-4 shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-bou mt-1" />
            
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold text-ink">Installer Schulte Mobile</h3>
              
              {mode === "native-prompt" && (
                <>
                  <p className="mt-1 text-[12px] text-ink3 leading-relaxed">
                    Ajoutez l'application à votre écran d'accueil pour une expérience plein écran, fluide et avec notifications.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleInstallNow}
                      disabled={!deferredPrompt}
                      className="h-8 px-4 text-[12px]"
                    >
                      Installer maintenant
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-8 px-3 text-[12px] text-ink3"
                    >
                      Plus tard
                    </Button>
                  </div>
                </>
              )}

              {mode === "ios-safari" && (
                <>
                  <p className="mt-1 text-[12px] text-ink3 leading-relaxed">
                    Pour installer, touchez l'icône Partager ci-dessous puis choisissez <strong className="text-ink font-semibold">Sur l'écran d'accueil</strong>.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-card2/80 py-2 border border-border">
                    <span className="text-[11px] text-ink3">1. Touchez</span>
                    <Share className="h-4 w-4 text-bou" />
                    <span className="text-[11px] text-ink3 ml-1">2. Sélectionnez [+]</span>
                  </div>
                </>
              )}

              {mode === "ios-other" && (
                <>
                  <p className="mt-1 text-[12px] text-ink3 leading-relaxed">
                    Votre navigateur actuel (Chrome/Firefox) ne permet pas l'installation sur iOS.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCopyConfirm(true)}
                    className="mt-3 h-8 px-4 text-[12px] w-full"
                  >
                    Copier le lien pour Safari
                  </Button>
                </>
              )}
            </div>
            
            <button
              type="button"
              aria-label="Fermer le rappel d'installation"
              className="shrink-0 rounded-lg p-1.5 text-ink3 hover:bg-card2 transition-colors active:scale-95"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <BottomSheetConfirm
        open={showCopyConfirm}
        title={messages.pwa.copyTitle}
        description={messages.pwa.copyDescription}
        confirmLabel={messages.pwa.copyConfirm}
        onClose={() => setShowCopyConfirm(false)}
        onConfirm={copyUrl}
      />
    </>
  );
}
