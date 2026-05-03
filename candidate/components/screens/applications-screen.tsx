'use client'


import { ApplicationCard } from '@/components/application-card'
import { useMyApplications } from '@/hooks/useApplications'
import type { Application } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyJourneyState } from '@/components/empty-journey-state'

interface ApplicationsScreenProps {
  onSelectApplication: (app: Application) => void
}

function ApplicationSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}

export function ApplicationsScreen({ onSelectApplication }: ApplicationsScreenProps) {
  const { data: applications = [], isLoading: loading } = useMyApplications()

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground">Mes candidatures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez l'avancement de vos candidatures
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
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
