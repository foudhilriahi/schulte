import { Skeleton } from '@/components/ui/skeleton'

export function JobCardSkeleton() {
  return (
    <div className="relative bg-card border border-solid border-border rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
      <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-card2" />
      <div className="pl-4 pr-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex gap-1.5 mb-3">
          <Skeleton className="h-5 w-16 rounded-[4px]" />
          <Skeleton className="h-5 w-20 rounded-[4px]" />
          <Skeleton className="h-5 w-14 rounded-[4px]" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}
