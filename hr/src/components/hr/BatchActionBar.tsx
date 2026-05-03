import { Button } from "@/components/ui/button";
import { Archive, Mail, Trash2, X } from "lucide-react";

interface BatchActionBarProps {
  count: number;
  onClear: () => void;
  onAction: (action: string) => void;
}

const BatchActionBar = ({ count, onClear, onAction }: BatchActionBarProps) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-modal animate-slideUp">
      <div className="flex items-center gap-2 pl-3 pr-4 border-r border-border">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vl text-[11px] font-bold text-v">
          {count}
        </div>
        <span className="text-[12px] font-medium text-ink">sélectionnés</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onAction("interview")} className="h-8 gap-2 rounded-full text-[11px] text-ink2 hover:bg-card2">
          <Mail className="h-3.5 w-3.5" />
          Convoquer
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction("rejected")} className="h-8 gap-2 rounded-full text-[11px] text-ink2 hover:bg-card2">
          <Archive className="h-3.5 w-3.5" />
          Refuser
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction("delete")} className="h-8 gap-2 rounded-full text-[11px] text-err hover:bg-errl hover:text-err">
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer
        </Button>
      </div>

      <div className="pl-1 pr-1 border-l border-border">
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 w-8 p-0 rounded-full text-ink4 hover:bg-card2 hover:text-ink">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BatchActionBar;
