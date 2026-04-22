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
          className={`touch-target shrink-0 rounded-full border-[1.5px] px-4 py-[7px] text-xs font-semibold transition-colors ${
            active === f
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-ink3 hover:border-[var(--violet-b)] hover:text-violet hover:bg-violetl"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
