interface StatItem {
  id: string;
  label: string;
  value: number | string;
  sub?: string;
  accentClass: string;
}

interface StatTrayProps {
  open: boolean;
  loading?: boolean;
  items: StatItem[];
}

const StatTray = ({ open, loading = false, items }: StatTrayProps) => {
  return (
    <section className={`overflow-hidden border-b border-border bg-card transition-all duration-200 ease-out ${open ? "h-[82px]" : "h-0"}`}>
      <div className={`grid h-full grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${open ? "animate-slideDown" : ""}`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`px-[18px] py-[14px] ${
              index < items.length - 1 ? "border-b border-border xl:border-b-0 xl:border-r" : ""
            } ${loading ? "opacity-70" : ""}`}
          >
            <span className={`block h-[3px] w-7 rounded-[2px] ${item.accentClass}`} />
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.09em] text-ink3">
              {item.label}
            </p>
            <p className="font-mono text-[28px] font-medium text-ink">
              {item.value}
            </p>
            {item.sub && (
              <p className="text-[10px] text-ink4">{item.sub}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatTray;
