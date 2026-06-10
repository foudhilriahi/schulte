'use client'

import { useEffect } from "react";
import { Trash2, CheckCheck } from "lucide-react";
import { useNotificationStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { EmptyJourneyState } from "@/components/empty-journey-state";
import { TopBar } from "@/components/topbar";

function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }
}

export function NotificationsScreen() {
  const notifications = useNotificationStore((s) => s.notifications);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markOneRead = useNotificationStore((s) => s.markOneRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSupported, isSubscribed, permission, isLoading: isPushLoading, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
  }, [fetchNotifications, isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px] pb-[calc(58px+env(safe-area-inset-bottom))]">
      {/* Fixed Reusable TopBar */}
      <TopBar />

      {/* ── Main content area ── */}
      <main className="flex-1 select-none animate-slide-up-fade">
        <div className="px-4 py-4 flex items-center justify-between gap-3 border-b border-solid border-border select-none">
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink leading-tight">
              Notifications
            </h1>
            <p className="text-xs text-ink4 mt-0.5">
              {isLoading
                ? "Chargement…"
                : unreadCount > 0
                  ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Tout est lu"}
            </p>
          </div>

          {notifications.length > 0 && !isLoading && unreadCount > 0 && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-solid border-border bg-card text-[11px] font-semibold text-ink3 hover:bg-card2 active:scale-[0.97] transition-all cursor-pointer select-none touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              onClick={() => markAllRead()}
            >
              <CheckCheck size={14} className="text-v" />
              <span>Tout lire</span>
            </button>
          )}
        </div>

        {/* Push Notification Banner */}
        {isSupported && !isSubscribed && permission !== 'denied' && !isPushLoading && (
          <div className="mx-4 mt-4 p-3 bg-vl/30 border border-v/20 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-ink leading-tight">Activer les alertes</p>
              <p className="text-[11px] text-ink3 mt-0.5 leading-snug">Soyez notifié(e) instantanément de l'avancement de vos candidatures.</p>
            </div>
            <button
              onClick={subscribeToPush}
              className="flex-shrink-0 px-3 py-1.5 bg-v text-white text-[11px] font-semibold rounded-lg hover:bg-v/90 active:scale-95 transition-transform"
            >
              Activer
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[76px] border-b border-solid border-border bg-card/40 animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && notifications.length === 0 && (
          <div className="px-4 py-8">
            <EmptyJourneyState variant="no-notifications" />
          </div>
        )}

        {/* Notification flat list */}
        {!isLoading && notifications.length > 0 && (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markOneRead(notif.id);
                }}
                className={`flex gap-3 px-4 py-3.5 border-b border-solid border-border transition-colors active:bg-card2 select-none cursor-pointer ${
                  !notif.read ? "bg-card" : "bg-transparent"
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Unread dot column */}
                <div className="flex-shrink-0 w-3.5 flex items-center justify-start pt-1">
                  {!notif.read && (
                    <div className="w-[7px] h-[7px] rounded-full bg-v" />
                  )}
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug font-sans ${!notif.read ? 'text-ink font-semibold' : 'text-ink2'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 select-none">
                    <span className="font-mono text-[10px] text-ink4">
                      {formatRelative(notif.createdAt)}
                    </span>
                    <button
                      type="button"
                      aria-label="Supprimer la notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-ink4 hover:text-err active:scale-[0.95] transition-transform p-1 cursor-pointer select-none touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Trash2 size={11} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

