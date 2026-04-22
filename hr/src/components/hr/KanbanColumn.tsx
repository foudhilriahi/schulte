import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import KanbanCard from "./KanbanCard";
import type { Candidate, KanbanStatus } from "@/data/hrMockData";

interface KanbanColumnProps {
  id: KanbanStatus;
  label: string;
  candidates: Candidate[];
  onCardClick: (candidate: Candidate) => void;
}

const columnColors: Record<KanbanStatus, string> = {
  new: "bg-card2 border-border text-ink3",
  review: "bg-violetl border-[var(--violet-b)] text-violet",
  interview: "bg-warnl border-[var(--warn-b)] text-warn",
  accepted: "bg-okl border-[var(--ok-b)] text-ok",
  rejected: "bg-errl border-[var(--err-b)] text-err",
};

const KanbanColumn = ({ id, label, candidates, onCardClick }: KanbanColumnProps) => {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-md border bg-card p-3 h-[calc(100vh-220px)] min-h-[540px]">
      <div className="flex items-center justify-between mb-3 px-1 sticky top-0 bg-card z-10">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink3">{label}</h3>
        <Badge className={`text-xs ${columnColors[id]}`}>
          {candidates.length}
        </Badge>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2.5 min-h-[120px] rounded-md p-1.5 transition-colors overflow-y-auto pr-2 ${
              snapshot.isDraggingOver ? "border-[1.5px] border-[var(--violet-b)] bg-violetl/40" : ""
            }`}
          >
            {candidates.map((candidate, index) => (
              <KanbanCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
