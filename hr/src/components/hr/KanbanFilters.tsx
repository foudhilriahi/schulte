import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KanbanFiltersProps {
  filterCity: string;
  filterContract: string;
  onCityChange: (val: string) => void;
  onContractChange: (val: string) => void;
}

const cities = ["Tous", "Bouarada", "Zaghouan"];
const contracts = ["Tous", "CDI", "CDD", "Stage"];

const KanbanFilters = ({ filterCity, filterContract, onCityChange, onContractChange }: KanbanFiltersProps) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
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
