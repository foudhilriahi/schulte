import { Draggable } from "@hello-pangea/dnd";
import { Star, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/data/hrMockData";

interface KanbanCardProps {
  candidate: Candidate;
  index: number;
  onClick: (candidate: Candidate) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-success text-success-foreground";
  if (score >= 60) return "bg-accent text-accent-foreground";
  return "bg-destructive text-destructive-foreground";
};

const KanbanCard = ({ candidate, index, onClick }: KanbanCardProps) => {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(candidate)}
          className={`rounded-xl border bg-card p-3.5 shadow-sm cursor-pointer transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-accent/50" : ""
          } ${candidate.city === "Bouarada" ? "card-bouarada" : "card-zaghouan"}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-card-foreground truncate">{candidate.name}</p>
              <p className="text-xs text-muted-foreground truncate">{candidate.jobTitle}</p>
            </div>
            <span className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getScoreColor(candidate.aiScore)}`}>
              {candidate.aiScore}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Phone className="h-3 w-3" />
            <span className="truncate">{candidate.phone}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3" />
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
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
