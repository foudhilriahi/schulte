import { Draggable } from "@hello-pangea/dnd";
import { Star, Phone, Calendar, Copy, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Candidate } from "@/data/hrMockData";

interface KanbanCardProps {
  candidate: Candidate;
  index: number;
  onClick: (candidate: Candidate) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return "bg-okl border-[var(--ok-b)] text-ok";
  if (score >= 40) return "bg-warnl border-[var(--warn-b)] text-warn";
  return "bg-errl border-[var(--err-b)] text-err";
};

const KanbanCard = ({ candidate, index, onClick }: KanbanCardProps) => {
  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(candidate)}
          className={`rounded-md border-[1.5px] bg-card p-[13px] cursor-pointer transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[2px] hover:rotate-[0.4deg] hover:shadow-lift hover:border-[var(--violet-b)] group ${
            snapshot.isDragging ? "scale-[1.03] shadow-drag border-[var(--violet-b)]" : ""
          } ${candidate.city === "Bouarada" ? "card-bouarada" : "card-zaghouan"}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[13px] text-ink truncate">{candidate.name}</p>
              <p className="text-[10px] text-ink4 font-mono truncate">{candidate.phone}</p>
            </div>
            <span className={`shrink-0 flex h-8 min-w-8 items-center justify-center rounded-full border text-xs font-medium font-mono px-2 ${getScoreColor(candidate.aiScore)}`}>
              {candidate.aiScore}
            </span>
          </div>

          {/* Contact info with quick copy */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group/phone">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate flex-1">{candidate.phone}</span>
              <button
                onClick={(e) => handleCopy(e, candidate.phone, "Tél.")}
                className="opacity-0 group-hover/phone:opacity-100 p-0.5 hover:bg-accent rounded-sm transition-colors"
                title="Copier le téléphone"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group/email">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate flex-1">{candidate.email || "—"}</span>
              {candidate.email && (
                <button
                  onClick={(e) => handleCopy(e, candidate.email, "Email")}
                  className="opacity-0 group-hover/email:opacity-100 p-0.5 hover:bg-accent rounded-sm transition-colors"
                  title="Copier l'email"
                >
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink3 mb-3">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{new Date(candidate.appliedDate).toLocaleDateString("fr-TN")}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {candidate.contractType}
            </Badge>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= candidate.starRating
                      ? "fill-violet text-violet"
                      : "text-ink4"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-border/50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="w-full rounded-md border-[1.5px] border-border bg-card px-3 py-2 text-xs font-semibold text-ink3 transition-colors hover:bg-card2 hover:border-[var(--border2)]"
              onClick={() => onClick(candidate)}
            >
              Ouvrir les détails et changer le statut
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
