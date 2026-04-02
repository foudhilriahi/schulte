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
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
