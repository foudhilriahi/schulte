"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/applications", icon: FileText, label: "Candidatures" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    useNotificationStore.getState().fetchUnreadCount();
  }, [isAuthenticated]);

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 transition-colors touch-manipulation",
                isActive ? "text-violet" : "text-ink4",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-coral border-2 border-card" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "text-violet" : "text-ink4",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
