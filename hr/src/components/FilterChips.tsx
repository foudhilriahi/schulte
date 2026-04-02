interface FilterChipsProps {
  active: string;
  onSelect: (filter: string) => void;
}

const filters = ["Tous", "Bouarada", "Zaghouan", "CDI", "CDD", "Stage"];

const FilterChips = ({ active, onSelect }: FilterChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`touch-target shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === f
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground border border-border hover:bg-accent"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
