import { Skeleton } from "@/components/ui/skeleton";

const JobCardSkeleton = () => (
  <div className="rounded-md border border-border bg-card p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <div className="mb-3 flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="ml-3 h-11 w-11 rounded-full" />
    </div>
  </div>
);

export default JobCardSkeleton;
