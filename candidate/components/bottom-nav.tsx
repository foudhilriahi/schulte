"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notifications";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/applications", icon: FileText, label: "Applications" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useEffect(() => {
    useNotificationStore.getState().fetchUnreadCount();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
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
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 rounded-lg transition-colors touch-manipulation",
                isActive ? "text-blue-600" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-blue-600" : "text-muted-foreground",
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
