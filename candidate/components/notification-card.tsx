"use client";

import type { Notification } from "@/lib/types";
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
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3.5 border-b border-solid border-border transition-colors active:bg-card2 select-none cursor-pointer",
        !notification.read ? "bg-card" : "bg-transparent",
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-4 flex items-center justify-start pt-1">
        {!notification.read && (
          <div className="w-1.5 h-1.5 rounded-full bg-v" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[13px] leading-snug",
            notification.read ? "text-ink2" : "text-ink font-semibold",
          )}
        >
          {notification.message || notification.title}
        </p>
        <p className="font-mono text-[10px] text-ink4 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
