'use client'

import { useState } from 'react'
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
import { TopBar } from '@/components/topbar'
import { Search } from 'lucide-react'

export function HomeScreen() {
  const router = useRouterWithLoader()
  const { isAuthenticated } = useAuthStore()
  const { data: jobs = [], isLoading: loading } = useOffers()
  
  // Only fetch applications if logged in
  const { data: myApps = [] } = useMyApplications()
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = jobs.filter((job) => {
    // IMPORTANT: Only show open offers to candidates
    if (job.status !== 'open') return false
    
    // Filter by location / contract
    if (activeFilter !== 'all') {
      if (activeFilter === 'Bouarada' || activeFilter === 'Zaghouan') {
        if (job.site !== activeFilter) return false
      } else {
        if (job.contractType !== activeFilter) return false
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchTitle = job.title.toLowerCase().includes(q)
      const matchDept = job.department.toLowerCase().includes(q)
      const matchSkills = job.requiredSkills?.some(s => s.toLowerCase().includes(q)) ?? false
      if (!matchTitle && !matchDept && !matchSkills) return false
    }
    
    return true
  })

  // Get list of offerIds the user has already applied to
  const appliedOfferIds = new Set(myApps.map(app => app.offerId))
  const appMap = new Map(myApps.map(app => [app.offerId, app]))

  // Check if we have an active interview
  const activeInterviewApp = myApps.find(app => app.status === 'interview');

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px] pb-[calc(58px+env(safe-area-inset-bottom))] select-none">
      {/* Reusable Fixed TopBar */}
      <TopBar />

      {/* Sticky Search bar below TopBar */}
      <div className="sticky top-[52px] bg-page px-4 pt-[10px] pb-[8px] z-40 select-none">
        <div className="flex items-center gap-2 bg-card border border-solid border-border rounded-full px-3.5 py-2.5 transition-all focus-within:border-[var(--vb)] focus-within:ring-2 focus-within:ring-[var(--vl)]">
          <Search size={14} className="text-ink4 flex-shrink-0" />
          <input 
            className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-ink4 font-sans border-0 p-0 focus:ring-0 focus:outline-none"
            placeholder="Rechercher un poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips sticky below search */}
      <div className="sticky top-[106px] bg-page px-4 pb-[12px] z-40 select-none">
        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Job List */}
      <main className="flex-1 px-4 py-2 select-none">
        {activeInterviewApp && (
          <div className="animate-slide-up-fade mb-4" style={{ animationDelay: '50ms' }}>
            <InterviewCountdown 
              applicationId={activeInterviewApp.id}
              jobTitle={activeInterviewApp.offer?.title || "Poste inconnu"}
              site={activeInterviewApp.offer?.site || "Site inconnu"}
              scheduledAt={activeInterviewApp.interview?.scheduledAt}
              location={activeInterviewApp.interview?.location}
            />
          </div>
        )}

        {/* Screen Title */}
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink mb-4 leading-tight">
          Trouvez votre prochain poste
        </h1>

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
                matchScore={isAuthenticated ? appMap.get(job.id)?.aiScore : null}
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

