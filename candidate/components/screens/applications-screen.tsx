'use client'

import { ApplicationCard } from '@/components/application-card'
import { useMyApplications } from '@/hooks/useApplications'
import type { Application } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyJourneyState } from '@/components/empty-journey-state'
import { TopBar } from '@/components/topbar'

function ApplicationSkeleton() {
  return (
    <div className="bg-card border border-solid border-border rounded-xl p-4 animate-pulse select-none">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-20 rounded-full bg-card2" />
        <Skeleton className="h-5 w-24 rounded-full bg-card2" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-3 bg-card2" />
      <Skeleton className="h-4 w-32 bg-card2" />
    </div>
  )
}

interface ApplicationsScreenProps {
  onSelectApplication: (app: Application) => void
}

export function ApplicationsScreen({ onSelectApplication }: ApplicationsScreenProps) {
  const { data: applications = [], isLoading: loading } = useMyApplications()

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px] pb-[calc(58px+env(safe-area-inset-bottom))] select-none">
      {/* Reusable Fixed TopBar */}
      <TopBar />

      <div className="px-4 py-4 select-none">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink leading-tight">
          Mes candidatures
        </h1>
        <p className="text-xs text-ink4 mt-0.5">
          Suivez l'avancement de vos candidatures
        </p>
      </div>

      <main className="flex-1 px-4 py-2 select-none animate-slide-up-fade">
        <div className="space-y-3">
          {loading ? (
            <>
              <ApplicationSkeleton />
              <ApplicationSkeleton />
              <ApplicationSkeleton />
            </>
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => onSelectApplication(app)}
              />
            ))
          ) : (
            <EmptyJourneyState variant="no-applications" />
          )}
        </div>
      </main>
    </div>
  )
}

