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
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        </div>
        <div>
          <p className="font-mono text-[28px] leading-none text-card-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
