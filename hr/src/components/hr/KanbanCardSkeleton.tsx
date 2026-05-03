const KanbanCardSkeleton = () => (
  <div className="rounded-md border border-border bg-card2 px-3 py-2 min-h-[72px] flex flex-col justify-center">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-border load-pulse" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-1/2 rounded bg-border load-pulse" style={{ animationDelay: '75ms' }} />
      </div>
      <div className="h-4 w-6 rounded-full bg-border load-pulse" style={{ animationDelay: '150ms' }} />
    </div>
    <div className="mt-2 flex items-center justify-between">
      <div className="flex gap-1">
        <div className="h-3 w-8 rounded bg-border load-pulse" style={{ animationDelay: '225ms' }} />
        <div className="h-3 w-8 rounded bg-border load-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

export default KanbanCardSkeleton;
