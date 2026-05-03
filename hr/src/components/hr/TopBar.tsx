import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, LogOut, X } from "lucide-react";
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
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "?";

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
      toast.error("Échec — réessaie.");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      toast.error("Échec — réessaie.");
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header
      aria-label={title}
      className="sticky top-0 z-30 flex h-[54px] items-center justify-between border-b border-border bg-card px-[20px] gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="text-[14px] font-semibold tracking-[-0.015em] text-ink">
          SCHULTE <span className="text-v">&</span> <span className="text-ink3">CO</span>
        </div>
        <span className="ml-1 font-mono text-[10px] tracking-[0.06em] text-ink4">
          automotive components
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user?.site && (
          <Badge
            variant="outline"
            className={`text-[10px] font-mono font-medium ${
              user.site === "Bouarada"
                ? "bg-boul text-[#1a5fcc] border-[var(--boub)]"
                : "bg-zagl text-[#0a8a5a] border-[var(--zagb)]"
            }`}
          >
            {user.site}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-ink4 transition-colors hover:text-ink">
              <Bell className="h-[18px] w-[18px]" />
              {displayUnread > 0 && (
                <span className="absolute right-[-2px] top-[-2px] h-[7px] w-[7px] rounded-full border-2 border-card bg-tan" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs text-v hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tout marquer comme lu
                </button>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs text-err hover:underline"
                  title="Effacer toutes les notifications"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-3 py-4 text-[12px] text-ink3">Aucune notification.</p>
              )}
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => !n.readAt && markOneRead(n.id)}
                  className="flex flex-col items-start gap-1 px-3 py-2"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {n.payload?.title || "Mise a jour"}
                    </span>
                    {!n.readAt && <span className="h-2 w-2 rounded-full bg-tan" />}
                  </div>
                  <p className="line-clamp-2 text-[11px] text-ink3">
                    {n.payload?.message || "A new event was received."}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-vl text-[11px] font-semibold text-v">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">{user?.name || "Utilisateur"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs text-err">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Deconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
