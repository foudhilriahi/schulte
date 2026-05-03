'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { JobCard } from '@/components/job-card'
import { JobCardSkeleton } from '@/components/job-card-skeleton'
import { FilterChips, type FilterType } from '@/components/filter-chips'
import { useOffers } from '@/hooks/useOffers'
import { useMyApplications } from '@/hooks/useApplications'
import { useAuthStore } from '@/store/auth'
import { SmartInstallBanner } from '@/components/smart-install-banner'
import { EmptyJourneyState } from '@/components/empty-journey-state'
import { InterviewCountdown } from '@/components/interview-countdown'

export function HomeScreen() {
  const router = useRouterWithLoader()
  const { isAuthenticated } = useAuthStore()
  const { data: jobs = [], isLoading: loading } = useOffers()
  
  // Only fetch applications if logged in (React Query handles this, but avoids 401s if we add enabled)
  const { data: myApps = [] } = useMyApplications()
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredJobs = jobs.filter((job) => {
    // IMPORTANT: Only show open offers to candidates
    if (job.status !== 'open') return false
    
    if (activeFilter === 'all') return true
    if (activeFilter === 'Bouarada' || activeFilter === 'Zaghouan') {
      return job.site === activeFilter
    }
    return job.contractType === activeFilter
  })

  // Get list of offerIds the user has already applied to
  const appliedOfferIds = new Set(myApps.map(app => app.offerId))

  // Check if we have an active interview
  const activeInterviewApp = myApps.find(app => app.status === 'interview');

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Image
              src="/logo.png"
              alt="Schulte & Co"
              width={140}
              height={40}
              priority
              className="h-8 w-auto"
            />
            <span className="text-xs text-muted-foreground font-medium">Offres Tunisie</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-3">Trouvez votre prochain poste</h1>
          <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
      </header>

      {/* Job List */}
      <main className="flex-1 px-4 py-4">
        {activeInterviewApp && (
          <div className="animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
            <InterviewCountdown 
              applicationId={activeInterviewApp.id}
              jobTitle={activeInterviewApp.offer?.title || "Poste inconnu"}
              site={activeInterviewApp.offer?.site || "Site inconnu"}
              scheduledAt={activeInterviewApp.interview?.scheduledAt}
              location={activeInterviewApp.interview?.location}
            />
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                index={index}
                job={job}
                hasApplied={isAuthenticated && appliedOfferIds.has(job.id)}
                onClick={() => router.push(`/jobs/${job.id}`)}
              />
            ))
          ) : (
            <EmptyJourneyState variant="no-jobs" />
          )}
        </div>
      </main>

      <SmartInstallBanner />
    </div>
  )
}
