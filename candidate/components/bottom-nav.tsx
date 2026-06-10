"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/applications", icon: FileText, label: "Candidatures" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-[calc(58px+env(safe-area-inset-bottom))] bg-card border-t border-solid border-border z-50 shadow-[0_-2px_20px_rgba(15,13,28,0.10)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] pt-2 pb-1 transition-transform duration-100 active:scale-[0.97] touch-manipulation select-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className={cn(
                "w-5 h-5 flex items-center justify-center transition-colors duration-100",
                isActive ? "text-v" : "text-ink4"
              )}>
                <Icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-colors duration-100",
                isActive ? "text-v" : "text-ink4"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

