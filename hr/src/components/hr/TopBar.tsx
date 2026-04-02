import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { currentHR } from "@/data/hrMockData";

interface TopBarProps {
  title: string;
}

const TopBar = ({ title }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-xs font-medium">
          Site: {currentHR.site}
        </Badge>
        <button className="relative rounded-lg p-2 hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
