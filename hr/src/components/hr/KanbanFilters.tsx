import { Plus, Search } from "lucide-react";

interface KanbanFiltersProps {
  filterCity: string;
  filterContract: string;
  filterAiHigh: boolean;
  searchQuery: string;
  totalVisible: number;
  onCityChange: (val: string) => void;
  onContractChange: (val: string) => void;
  onAiHighChange: (val: boolean) => void;
  onSearchChange: (val: string) => void;
  onNewOffer?: () => void;
}

const cities = ["Tous", "Bouarada", "Zaghouan"];
const contracts = ["Tous", "CDI", "CDD", "Stage", "Alternance"];
const KanbanFilters = ({
  filterCity,
  filterContract,
  filterAiHigh,
  searchQuery,
  totalVisible,
  onCityChange,
  onContractChange,
  onAiHighChange,
  onSearchChange,
  onNewOffer,
}: KanbanFiltersProps) => {
  const pillBase =
    "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors";
  const pillActive = "bg-v border-v text-white";
  const pillIdle = "bg-card border-border text-ink3 hover:bg-card2";

  return (
    <div className="sticky top-0 z-20 flex min-h-[40px] flex-wrap items-center gap-2 border-b border-border bg-card2 px-3 py-1.5">
      <div className="flex items-center gap-1">
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onCityChange(city)}
            className={`${pillBase} ${filterCity === city ? pillActive : pillIdle}`}
          >
            {city}
          </button>
        ))}
      </div>

      <span className="mx-1 h-4 w-px bg-border" />

      <div className="flex items-center gap-1">
        {contracts.map((contract) => (
          <button
            key={contract}
            type="button"
            onClick={() => onContractChange(contract)}
            className={`${pillBase} ${filterContract === contract ? pillActive : pillIdle}`}
          >
            {contract}
          </button>
        ))}
      </div>

      <span className="mx-1 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={() => onAiHighChange(!filterAiHigh)}
        className={`${pillBase} ${filterAiHigh ? pillActive : pillIdle}`}
      >
        IA &gt; 70%
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-ink4" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher nom, telephone, poste..."
            className="h-8 w-[220px] rounded-full border border-border bg-card pl-8 pr-3 text-[11px] text-ink placeholder:text-ink4 focus:outline-none focus:border-v focus:ring-[3px] focus:ring-vl"
          />
        </div>
        <span className="text-[10px] font-mono text-ink4">
          {totalVisible} candidat{totalVisible > 1 ? "s" : ""}
        </span>
        {onNewOffer && (
          <button
            type="button"
            onClick={onNewOffer}
            className="flex items-center gap-1 rounded-md bg-v px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_2px_8px_rgba(91,79,232,0.22)] transition-all hover:-translate-y-[1px] hover:bg-vh"
          >
            <Plus className="h-3 w-3" />
            Nouvelle offre
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanFilters;
