'use client'

import { use, useState, useEffect } from 'react'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { useOffer } from '@/hooks/useOffers'
import { useMyApplications } from '@/hooks/useApplications'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { SiteBadge, ContractBadge } from '@/components/job-card'

interface JobDetailsPageProps {
  params: Promise<{ jobId: string }>
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-page pt-[52px]">
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-card border-b border-solid border-border px-4 flex items-center z-50">
        <Skeleton className="h-6 w-20 bg-card2" />
      </header>
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4 bg-card2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 bg-card2 animate-pulse" />
              <Skeleton className="h-6 w-16 bg-card2 animate-pulse" />
            </div>
          </div>
          <div className="bg-card border border-solid border-border rounded-xl h-48 w-full" />
        </div>
      </main>
    </div>
  )
}

function DetailRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-solid border-border last:border-b-0 select-none">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-ink4 mb-0.5 uppercase tracking-[0.09em] font-semibold">{label}</p>
        <p className="text-[13px] text-ink font-semibold truncate">{value}</p>
        {hint && <p className="text-[10px] text-v mt-0.5 font-medium">{hint}</p>}
      </div>
    </div>
  )
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const router = useRouterWithLoader()
  const { jobId } = use(params)
  
  const { data: job, isLoading: loadingOffer } = useOffer(jobId)
  const { data: myApps = [], isLoading: loadingApps } = useMyApplications()

  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loadingOffer || loadingApps) {
    return <LoadingSkeleton />
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 bg-page px-4 select-none">
        <h1 className="text-[15px] font-semibold text-ink">Offre introuvable</h1>
        <p className="text-[13px] text-ink3 mt-2">Cette offre a peut-être été supprimée.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-2.5 bg-card border border-solid border-border rounded-xl text-[12px] font-semibold text-ink active:scale-[0.97] transition-transform"
        >
          Retour aux offres
        </button>
      </div>
    )
  }

  // Check if offer is closed
  if (job.status !== 'open') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 bg-page px-4 select-none">
        <div className="w-16 h-16 bg-warnl text-warn rounded-full border border-solid border-[var(--warnb)] flex items-center justify-center mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="text-[15px] font-semibold text-ink">Offre fermée</h1>
        <p className="text-[13px] text-ink3 mt-2 text-center max-w-sm">
          Cette offre n'accepte plus de candidatures.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 bg-card border border-solid border-border rounded-xl text-[12px] font-semibold text-ink active:scale-[0.97] transition-transform"
        >
          Voir les offres ouvertes
        </button>
      </div>
    )
  }

  const hasApplied = myApps.some(app => app.offerId === jobId)

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expirée'
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    if (diffDays <= 7) return `${diffDays} jours restants`
    
    return date.toLocaleDateString('fr-TN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px]">
      {/* Dynamic scrolling header */}
      <header className={`fixed top-0 left-0 right-0 h-[52px] z-50 px-4 flex items-center justify-between select-none transition-all duration-200 backdrop-blur ${
        isScrolled 
          ? 'bg-card border-b border-solid border-border' 
          : 'bg-transparent'
      }`}>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-ink3 hover:text-ink active:scale-95 transition-transform cursor-pointer p-1 -ml-1 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={16} />
          <span className="text-[11px] font-semibold">Retour</span>
        </button>

        {isScrolled && (
          <span className="font-sans font-semibold text-[13px] text-ink truncate max-w-[200px] animate-slide-up-fade">
            {job.title}
          </span>
        )}

        <div className="w-12 flex justify-end">
          <SiteBadge site={job.site} />
        </div>
      </header>

      {/* Main content */}
      <main 
        className="flex-1 px-4 py-4 max-w-md mx-auto w-full select-none"
        style={{
          paddingBottom: hasApplied 
            ? 'calc(140px + env(safe-area-inset-bottom))' 
            : 'calc(80px + env(safe-area-inset-bottom))'
        }}
      >
        <div className="space-y-5 animate-slide-up-fade">
          {/* Header titles */}
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink leading-tight mb-3">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap select-none">
              <SiteBadge site={job.site} />
              <ContractBadge type={job.contractType} />
              {hasApplied && (
                <span className="bg-okl border border-solid border-okb text-[#0A8A5A] font-sans text-[10px] font-semibold px-2.5 py-[3px] rounded-full">
                  Candidature envoyée
                </span>
              )}
            </div>
          </div>

          {/* Details list inside flat box */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink4 mb-2 select-none">
              Détails du poste
            </p>
            <div className="bg-card border border-solid border-border rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
              <DetailRow label="Département" value={job.department} />
              <DetailRow label="Postes ouverts" value={`${job.seats || 1} poste(s)`} />
              {job.experienceYears !== undefined && job.experienceYears > 0 && (
                <DetailRow label="Expérience minimale" value={`${job.experienceYears}+ ans`} />
              )}
              {job.showSalary && job.salaryRange && (
                <DetailRow label="Fourchette salariale" value={job.salaryRange} hint="TND net / mois" />
              )}
              <DetailRow 
                label="Date limite" 
                value={formatDeadline(job.deadline)} 
                hint={new Date(job.deadline).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })} 
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink4 mb-2 mt-4 select-none">
              Description du poste
            </p>
            <div className="bg-card border border-solid border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(15,13,28,0.05)] text-[13px] text-ink2 leading-relaxed whitespace-pre-line font-sans">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink4 mb-2 mt-4 select-none">
                Compétences requises
              </p>
              <div className="bg-card border border-solid border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-card2 border border-solid border-border text-ink3 font-sans text-[11px] px-2 py-[2px] rounded-[4px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky footer apply action */}
      <div className="fixed bottom-[calc(58px+env(safe-area-inset-bottom))] left-0 right-0 px-4 pb-3 bg-gradient-to-t from-page via-page to-transparent pt-4 pointer-events-none z-40">
        <div className="max-w-md mx-auto w-full">
          {hasApplied ? (
            <div className="flex items-center justify-center">
              <span className="bg-okl border border-solid border-okb text-[#0A8A5A] font-sans text-[13px] font-semibold px-4 py-2.5 rounded-full">
                Candidature envoyée
              </span>
            </div>
          ) : (
            <button
              onClick={() => router.push(`/apply/${job.id}`)}
              className="w-full pointer-events-auto bg-v text-white rounded-xl py-3.5 text-[14px] font-semibold font-sans shadow-[0_4px_16px_rgba(91,79,232,.32)] active:scale-[0.97] transition-transform duration-100"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Postuler maintenant
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
