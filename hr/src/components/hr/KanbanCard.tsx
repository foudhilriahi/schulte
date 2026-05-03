import { Draggable } from "@hello-pangea/dnd";
import { Star } from "lucide-react";
import type { Candidate, KanbanStatus } from "@/data/hrMockData";

interface KanbanCardProps {
  candidate: Candidate;
  index: number;
  onClick: (candidate: Candidate, e: React.MouseEvent) => void;
  selected?: boolean;
  laneId: KanbanStatus;
  isPending?: boolean;
  isSnapBack?: boolean;
  isBatchSelected?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return "bg-okl border-[var(--okb)] text-ok";
  if (score >= 40) return "bg-warnl border-[var(--warnb)] text-warn";
  return "bg-errl border-[var(--errb)] text-err";
};

const KanbanCard = ({ candidate, index, onClick, selected, laneId, isPending, isSnapBack, isBatchSelected }: KanbanCardProps) => {
  const isNew = laneId === "new";
  const isReview = laneId === "review";
  const isInterview = laneId === "interview";
  const isAccepted = laneId === "accepted" || laneId === "rejected";

  const appliedAgo = candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString("fr-TN", { month: "short", day: "numeric" }) : "";
  const hoverClass = isNew || isAccepted ? "" : "hover:-translate-y-[2px] hover:rotate-[0.3deg] hover:shadow-hover hover:border-border2";
  const heightClass = isNew || isAccepted ? "h-[48px]" : "min-h-[72px]";

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={(e) => onClick(candidate, e)}
          className={`cursor-pointer rounded-md border bg-card2 px-3 py-2 flex flex-col justify-center transition-[transform,box-shadow,border-color,opacity] duration-180 ease-[cubic-bezier(.34,1.56,.64,1)] ${hoverClass} ${heightClass} ${
            snapshot.isDragging ? "scale-[1.02] shadow-drag border-border2" : ""
          } ${
            selected ? "bg-vl border-[var(--vb)] border-l-2 border-l-v" : ""
          } ${isBatchSelected ? "bg-vl border-[var(--vb)] ring-1 ring-[var(--v)]" : ""} ${isInterview ? "border-l-2 border-l-v border-[var(--vb)]" : ""} ${isAccepted ? "opacity-50" : ""} ${isPending ? "border-[var(--v)] load-pulse" : ""} ${isSnapBack ? "snap-back" : ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink truncate">{candidate.name}</p>
              {isReview && <p className="text-[10px] font-mono text-ink4 truncate">{candidate.phone}</p>}
              {isAccepted && <p className="text-[10px] font-mono text-ink4 truncate">{appliedAgo}</p>}
            </div>
            {isNew ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-ink4">{appliedAgo}</span>
                <span className={`rounded-full border px-2 py-[1px] text-[10px] font-mono ${getScoreColor(candidate.aiScore)}`}>
                  {candidate.aiScore}
                </span>
              </div>
            ) : (
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-mono ${getScoreColor(candidate.aiScore)}`}>
                {candidate.aiScore}
              </span>
            )}
          </div>

          {(isReview || isInterview) && (
            <div className="mt-2 flex items-center justify-between">
              {isInterview ? (
                <div className="text-[10px] font-semibold text-[#9A6210] bg-warnl border border-[var(--warnb)] px-2 py-px rounded-full truncate max-w-[140px]">
                  {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleString("fr-TN", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "À planifier"}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {candidate.skills?.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[9px] bg-card border border-[var(--border)] rounded px-1.5 py-px text-ink3 truncate max-w-[60px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
