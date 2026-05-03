import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import KanbanCardSkeleton from "./KanbanCardSkeleton";
import type { Candidate, KanbanStatus } from "@/data/hrMockData";

interface KanbanColumnProps {
  id: KanbanStatus;
  label: string;
  candidates: Candidate[];
  onCardClick: (candidate: Candidate) => void;
  isLast?: boolean;
  selectedId?: string | null;
  loading?: boolean;
  pendingDragId?: string | null;
  snapBackId?: string | null;
  selectedIds?: string[];
}

const KanbanColumn = ({ id, label, candidates, onCardClick, isLast, selectedId, loading, pendingDragId, snapBackId, selectedIds = [] }: KanbanColumnProps) => {
  const titleColor = id === "interview" ? "text-v" : "text-ink3";
  return (
    <div className={`flex min-w-[200px] flex-1 flex-col bg-transparent ${isLast ? "" : "border-r border-border"}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card2 px-3 py-2.5">
        <h3 className={`text-[10px] font-semibold uppercase tracking-[0.07em] ${titleColor}`}>{label}</h3>
        <span className="rounded-full border border-border bg-card px-2 py-[1px] text-[10px] font-mono text-ink3">
          {candidates.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-[7px] overflow-y-auto px-3 pb-4 ${
              snapshot.isDraggingOver ? "bg-vl/40" : ""
            }`}
          >
            {loading && candidates.length === 0 ? (
              <>
                <KanbanCardSkeleton />
                <KanbanCardSkeleton />
                <KanbanCardSkeleton />
              </>
            ) : (
              candidates.map((candidate, index) => (
                <KanbanCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  onClick={onCardClick}
                  selected={selectedId === candidate.id}
                  laneId={id}
                  isPending={pendingDragId === candidate.id}
                  isSnapBack={snapBackId === candidate.id}
                  isBatchSelected={selectedIds.includes(candidate.id)}
                />
              ))
            )}
            {!loading && candidates.length === 0 && (
              <div className="pt-6 text-center text-[11px] text-ink4">
                {id === "new" ? "File d'attente vide — c'est rare." :
                 id === "review" ? "Rien en cours de lecture." :
                 id === "interview" ? "Aucun entretien en attente." :
                 id === "accepted" ? "Pas encore de décision." : "—"}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
