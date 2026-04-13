'use client'

import { useEffect, useMemo } from "react";
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

  const groupedNotifications = useMemo(() => {
    return notifications.reduce<Record<string, typeof notifications>>((groups, notification) => {
      const dayKey = new Date(notification.createdAt).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(notification);
      return groups;
    }, {});
  }, [notifications]);

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
                className="shrink-0 gap-1.5 text-xs text-bou hover:bg-bou/10 hover:text-bou"
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
          <div className="space-y-5">
            {Object.entries(groupedNotifications).map(([dayLabel, group]) => (
              <section key={dayLabel} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {dayLabel}
                  </h2>
                  <span className="text-[10px] text-muted-foreground">
                    {group.length} item{group.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markOneRead(notification.id)}
                      className={[
                        "relative flex items-start gap-3 p-4 rounded-xl bg-card border cursor-pointer",
                        "transition-colors hover:bg-muted/50 active:bg-muted",
                        !notification.read
                          ? "border-l-[3px] border-l-bou border-t-border border-r-border border-b-border"
                          : "border-border",
                      ].join(" ")}
                    >
                      <div className="mt-1 shrink-0 flex items-start pt-0.5">
                        <span className={notification.read ? "h-2 w-2" : "h-2 w-2 rounded-full bg-bou mt-0.5"} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={[
                              "text-sm leading-snug line-clamp-1",
                              !notification.read
                                ? "font-semibold text-foreground"
                                : "font-medium text-muted-foreground",
                            ].join(" ")}
                          >
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatRelative(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {!notification.read && (
                            <span className="rounded-full bg-bou/14 px-2 py-0.5 text-[10px] font-medium text-bou">
                              Non lue
                            </span>
                          )}
                          <button
                            type="button"
                            aria-label="Supprimer la notification"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-err"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
