import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ label, value, icon: Icon, iconColor = "text-primary" }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden rounded-lg border border-border py-0 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[2px] hover:shadow-lift">
      <span className={`absolute inset-x-0 top-0 h-[3px] ${iconColor.replace('text-', 'bg-')}`} />
      <CardContent className="p-[22px]">
        <div className="mb-3 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink3">{label}</p>
        </div>
        <div>
          <p className="font-mono text-[30px] font-medium leading-none text-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
