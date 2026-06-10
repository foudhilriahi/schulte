"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNetworkActivityStore } from "@/store/network-activity";

const SHOW_DELAY_MS = 60;
const MIN_VISIBLE_MS = 260;

export function GlobalNetworkLoader() {
  const pendingCount = useNetworkActivityStore((state) => state.pendingCount);
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (pendingCount > 0) {
      if (visible) return;
      clearTimers();
      showTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, SHOW_DELAY_MS);
      return;
    }

    clearTimers();
    if (!visible) return;

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, remaining);

    return clearTimers;
  }, [pendingCount, visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 shadow-[0_1px_3px_rgba(15,13,28,0.05)] backdrop-blur-sm">
        <Loader2 className="h-4 w-4 animate-spin text-v" />
        <span className="text-[12px] font-medium text-ink">Chargement...</span>
      </div>
    </div>
  );
}
