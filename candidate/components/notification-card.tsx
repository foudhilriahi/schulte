"use client";

import type { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `il y a ${days}j`;
  if (hours > 0) return `il y a ${hours}h`;
  if (minutes > 0) return `il y a ${minutes}m`;
  return "À l'instant";
}

export function NotificationCard({
  notification,
  onClick,
}: NotificationCardProps) {
  const Icon =
    notification.type === "success"
      ? CheckCircle
      : notification.type === "warning"
        ? AlertCircle
        : Bell;

  const iconColor =
    notification.type === "success"
      ? "text-ok"
      : notification.type === "warning"
        ? "text-warn"
        : "text-violet";

  return (
    <Card
      className={cn(
        "cursor-pointer active:scale-[0.98] transition-all touch-manipulation",
        !notification.read && "border-l-4 border-l-violet bg-violetl animate-slide-up-fade",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "text-sm line-clamp-1",
                  notification.read
                    ? "text-foreground"
                    : "font-semibold text-foreground",
                )}
              >
                {notification.title}
              </h3>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
