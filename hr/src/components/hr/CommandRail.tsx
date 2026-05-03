import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface CommandRailProps {
  statsOpen: boolean;
  onToggleStats: () => void;
  onOpenCommand: () => void;
}

const hrTabs = [
  { to: "/overview", label: "Vue d'ensemble" },
  { to: "/applications", label: "Candidatures" },
  { to: "/interviews", label: "Entretiens" },
  { to: "/offers", label: "Modeles" },
  { to: "/settings", label: "Parametres" },
];

const adminTabs = [
  { to: "/admin", label: "Vue d'ensemble" },
  { to: "/admin/hr-accounts", label: "Comptes RH" },
  { to: "/admin/templates", label: "Modeles" },
  { to: "/admin/settings", label: "Parametres" },
];

const CommandRail = ({ statsOpen, onToggleStats, onOpenCommand }: CommandRailProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [shortcut, setShortcut] = useState("Ctrl+K");
  const isAdmin = user?.role === "ADMIN";
  const tabs = isAdmin ? adminTabs : hrTabs;
  const isApplicationsTab = location.pathname === "/applications" || location.pathname.startsWith("/applications/");
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "?";

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const platform = navigator.platform || "";
    const isMac = /Mac|iPhone|iPad/.test(platform);
    setShortcut(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  return (
    <div className="flex h-[46px] items-center gap-2 border-b border-border bg-card px-4">
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isExactAdmin = tab.to === "/admin" && location.pathname === "/admin";
          const isActive =
            isExactAdmin ||
            (tab.to !== "/admin" &&
              (location.pathname === tab.to ||
                location.pathname.startsWith(`${tab.to}/`)));
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "bg-vl text-v"
                  : "text-ink3 hover:bg-card2 hover:text-ink2"
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {isApplicationsTab && (
          <button
            type="button"
            onClick={onToggleStats}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-mono text-ink4 transition-colors hover:text-ink3"
          >
            Aperçu
            {statsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenCommand}
          className="flex items-center gap-2 rounded-full border border-border bg-card2 px-3 py-1.5 text-[11px] text-ink4 transition-colors hover:border-border2"
        >
          <Search className="h-[11px] w-[11px]" />
          <span className="hidden sm:inline">Rechercher</span>
          <span className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink3">
            {shortcut}
          </span>
        </button>

        {user?.site && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-mono font-medium ${
              user.site === "Bouarada"
                ? "bg-boul text-[#1a5fcc] border-[var(--boub)]"
                : "bg-zagl text-[#0a8a5a] border-[var(--zagb)]"
            }`}
          >
            {user.site}
          </span>
        )}

        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-vl text-[10px] font-semibold text-v">
          {initials}
        </div>
      </div>
    </div>
  );
};

export default CommandRail;
