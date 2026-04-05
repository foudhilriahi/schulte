"use client";

import { useEffect } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
  }, [fetchNotifications, isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* ── Header ── */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLoading
                  ? "Chargement…"
                  : unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                    : "Tout est lu"}
              </p>
            </div>

            {notifications.length > 0 && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 text-xs"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 py-4">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[76px] rounded-xl bg-muted animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">
              Aucune notification pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Vous serez notifié ici lors des changements de statut de vos
              candidatures.
            </p>
          </div>
        )}

        {/* Notification list */}
        {!isLoading && notifications.length > 0 && (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markOneRead(notification.id)}
                className={[
                  "relative flex items-start gap-3 p-4 rounded-xl bg-card border cursor-pointer",
                  "transition-colors hover:bg-muted/50 active:bg-muted",
                  !notification.read
                    ? "border-l-[3px] border-l-blue-500 border-t-border border-r-border border-b-border"
                    : "border-border",
                ].join(" ")}
              >
                {/* Unread dot */}
                <div className="mt-1 shrink-0 flex items-start pt-0.5">
                  {!notification.read ? (
                    <span className="h-2 w-2 rounded-full bg-blue-500 mt-0.5" />
                  ) : (
                    <span className="h-2 w-2" /> /* spacer to keep alignment */
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      "text-sm leading-snug truncate",
                      !notification.read
                        ? "font-bold text-foreground"
                        : "font-medium text-muted-foreground",
                    ].join(" ")}
                  >
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                    {formatRelative(notification.createdAt)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  aria-label="Supprimer la notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
