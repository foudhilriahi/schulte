import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface KanbanFiltersProps {
  filterCity: string;
  filterContract: string;
  searchQuery: string;
  sortBy: "recent" | "score" | "name";
  totalVisible: number;
  onCityChange: (val: string) => void;
  onContractChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onSortChange: (val: "recent" | "score" | "name") => void;
}

const cities = ["Tous", "Bouarada", "Zaghouan"];
const contracts = ["Tous", "CDI", "CDD", "Stage", "Alternance"];

const KanbanFilters = ({
  filterCity,
  filterContract,
  searchQuery,
  sortBy,
  totalVisible,
  onCityChange,
  onContractChange,
  onSearchChange,
  onSortChange,
}: KanbanFiltersProps) => {
  return (
    <div className="flex items-center gap-3 flex-wrap rounded-xl border bg-card p-3">
      <div className="relative min-w-[240px] flex-1 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
          placeholder="Rechercher nom, email, téléphone, poste..."
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Site:</span>
        <Select value={filterCity} onValueChange={onCityChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Trier:</span>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as "recent" | "score" | "name")}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récentes</SelectItem>
            <SelectItem value="score">Score IA</SelectItem>
            <SelectItem value="name">Nom A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto text-xs font-medium text-muted-foreground">
        {totalVisible} candidat{totalVisible > 1 ? "s" : ""}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Contrat:</span>
        <Select value={filterContract} onValueChange={onContractChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contracts.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default KanbanFilters;
