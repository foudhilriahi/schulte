import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { socketService } from "@/lib/socket";
import { toast } from "sonner";

interface TopBarProps {
  title: string;
}

interface AppNotification {
  id: string;
  type: string;
  payload: {
    title?: string;
    message?: string;
    [key: string]: any;
  };
  readAt: string | null;
  createdAt: string;
}

const TopBar = ({ title }: TopBarProps) => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const unread = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications],
  );

  const fetchNotifications = async () => {
    try {
      const [{ data: list }, { data: unreadData }] = await Promise.all([
        api.get("/notifications?limit=20"),
        api.get("/notifications/unread-count"),
      ]);
      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(unreadData?.count || 0);
    } catch {
      // Silent fail to avoid noisy topbar UX.
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const socket = socketService.getSocket();
    const onNew = (payload: any) => {
      setNotifications((prev) => [
        {
          id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "info",
          payload,
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
      setUnreadCount((c) => c + 1);
      const titleText = payload?.title || "New notification";
      const messageText = payload?.message || "You have a new update.";
      toast.info(`${titleText}: ${messageText}`);
    };

    socket?.on("notification:new", onNew);
    return () => {
      socket?.off("notification:new", onNew);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => (c > 0 ? c - 1 : 0));
    } catch {
      // Ignore optimistic mismatch for live-only temporary notification ids.
    }
  };

  const displayUnread = unreadCount > unread ? unreadCount : unread;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        {user?.site && (
          <Badge variant="outline" className="text-xs font-medium">
            Site: {user.site}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 hover:bg-secondary transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {displayUnread > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {displayUnread > 99 ? "99+" : displayUnread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs text-[#1A2B4A] hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                  title="Clear all notifications"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => !n.readAt && markOneRead(n.id)}
                  className="flex flex-col items-start gap-1 px-3 py-2"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {n.payload?.title || "Update"}
                    </span>
                    {!n.readAt && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {n.payload?.message || "A new event was received."}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
