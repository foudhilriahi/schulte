import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, CalendarDays, FileText, Plus, Trash2, Users } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CandidateItem {
  id: string;
  name: string;
  phone: string;
  query: string;
}

interface OfferItem {
  id: string;
  title: string;
}

const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);

  useEffect(() => {
    if (!open || isAdmin) return;
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [appsRes, offersRes] = await Promise.all([
          api.get("/applications/by-site"),
          api.get("/offers/hr/my-offers"),
        ]);

        if (!active) return;

        const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
        const offersList = Array.isArray(offersRes.data) ? offersRes.data : [];

        const uniqueCandidates = new Map<string, CandidateItem>();
        apps.forEach((app: any) => {
          const candidate = app.candidate || {};
          const name = candidate.name || "Inconnu";
          const phone = candidate.phone || "";
          const key = candidate.id || phone || app.id;
          if (!uniqueCandidates.has(key)) {
            uniqueCandidates.set(key, {
              id: String(key),
              name,
              phone,
              query: phone || name,
            });
          }
        });

        setCandidates(Array.from(uniqueCandidates.values()));
        setOffers(
          offersList.map((offer: any) => ({
            id: String(offer.id),
            title: offer.title || "Offre sans titre",
          })),
        );
      } catch {
        if (!active) return;
        setCandidates([]);
        setOffers([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [open, isAdmin]);

  const quickActions = useMemo(() => {
    if (isAdmin) {
      return [
        { id: "accounts", label: "Comptes RH", to: "/admin/hr-accounts", icon: Users },
        { id: "templates", label: "Modeles", to: "/admin/templates", icon: FileText },
        { id: "settings", label: "Parametres", to: "/admin/settings", icon: CalendarDays },
      ];
    }

    return [
      { id: "new-offer", label: "Nouvelle offre", to: "/offers/new", icon: Plus },
      { id: "schedule", label: "Planifier entretien", to: "/interviews", icon: CalendarDays },
      { id: "applications", label: "Voir candidatures", to: "/applications", icon: Users },
      { id: "bulk-reject", label: "Rejeter en masse", to: "/applications", icon: Trash2 },
    ];
  }, [isAdmin]);

  const candidateItems = candidates.slice(0, 50);
  const offerItems = offers.slice(0, 50);

  const handleNavigate = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher un candidat, une offre ou une action..." />
      <CommandList>
        <CommandEmpty>Aucun resultat.</CommandEmpty>

        <CommandGroup heading="Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              value={action.label}
              onSelect={() => handleNavigate(action.to)}
            >
              <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card2">
                <action.icon className="h-4 w-4 text-ink3" />
              </span>
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {!isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Candidats">
              {loading && (
                <CommandItem disabled value="Chargement">
                  Chargement...
                </CommandItem>
              )}
              {!loading &&
                candidateItems.map((candidate) => (
                  <CommandItem
                    key={candidate.id}
                    value={`${candidate.name} ${candidate.phone}`}
                    onSelect={() =>
                      handleNavigate(
                        `/applications?q=${encodeURIComponent(candidate.query)}`,
                      )
                    }
                  >
                    <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card2">
                      <Users className="h-4 w-4 text-ink3" />
                    </span>
                    <div className="flex flex-col">
                      <span>{candidate.name}</span>
                      <span className="text-[10px] text-ink4">{candidate.phone || "-"}</span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Offres">
              {loading && (
                <CommandItem disabled value="Chargement">
                  Chargement...
                </CommandItem>
              )}
              {!loading &&
                offerItems.map((offer) => (
                  <CommandItem
                    key={offer.id}
                    value={offer.title}
                    onSelect={() =>
                      handleNavigate(`/offers?q=${encodeURIComponent(offer.title)}`)
                    }
                  >
                    <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card2">
                      <Briefcase className="h-4 w-4 text-ink3" />
                    </span>
                    {offer.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
