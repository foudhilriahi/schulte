'use client'

import { use } from 'react'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { useOffer } from '@/hooks/useOffers'
import { useMyApplications } from '@/hooks/useApplications'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Users, 
  Clock,
  CheckCircle2,
  Building
} from 'lucide-react'

interface JobDetailsPageProps {
  params: Promise<{ jobId: string }>
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <Skeleton className="h-10 w-20" />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </main>
    </div>
  )
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const router = useRouterWithLoader()
  const { jobId } = use(params)
  
  const { data: job, isLoading: loadingOffer } = useOffer(jobId)
  const { data: myApps = [], isLoading: loadingApps } = useMyApplications()

  if (loadingOffer || loadingApps) {
    return <LoadingSkeleton />
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-lg font-semibold text-foreground">Offre introuvable</h1>
        <p className="text-sm text-muted-foreground mt-2">Cette offre a peut-etre ete supprimee.</p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mt-4"
        >
          Retour aux offres
        </Button>
      </div>
    )
  }

  // Check if offer is closed
  if (job.status !== 'open') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <div className="w-16 h-16 bg-errl text-err rounded-full border border-[var(--err-b)] flex items-center justify-center mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Offre fermee</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
          Cette offre n'accepte plus de candidatures.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="mt-6"
        >
          Voir les offres ouvertes
        </Button>
      </div>
    )
  }

  const hasApplied = myApps.some(app => app.offerId === jobId)
  
  const siteColor = job.site === 'Bouarada' 
    ? 'bg-boul border-[var(--bou-b)] text-primary'
    : 'bg-zagl border-[var(--zag-b)] text-ok'

  const contractColors: Record<string, string> = {
    CDI: 'bg-okl border-[var(--ok-b)] text-ok',
    CDD: 'bg-warnl border-[var(--warn-b)] text-warn',
    Stage: 'bg-card2 border-border text-ink3'
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expiree'
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
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Job Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink mb-3 leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={siteColor}>
                    <MapPin className="h-3 w-3 mr-1" />
                    {job.site}
                  </Badge>
                  <Badge variant="secondary" className={contractColors[job.contractType]}>
                    <Briefcase className="h-3 w-3 mr-1" />
                    {job.contractType}
                  </Badge>
                  {hasApplied && (
                    <Badge variant="outline" className="bg-okl border-[var(--ok-b)] text-ok">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Candidature envoyee
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Job Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Postes</p>
                      <p className="font-medium">{job.seats || 1}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Departement</p>
                      <p className="font-medium">{job.department}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {job.experienceYears !== undefined && job.experienceYears > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="font-medium">{job.experienceYears}+ ans</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {job.showSalary && job.salaryRange && (
                <Card className="border-[var(--ok-b)] bg-okl">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-ok" />
                      <div>
                        <p className="text-xs text-ok">Fourchette salariale</p>
                        <p className="font-medium text-ink">{job.salaryRange}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Deadline */}
            <Card className="border-[var(--warn-b)] bg-warnl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-warn" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Date limite de candidature</p>
                    <p className="text-sm text-warn">{formatDeadline(job.deadline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Description */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-foreground mb-3">Description du poste</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold text-foreground mb-3">Competences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm bg-card2 text-muted-foreground rounded-sm border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apply Button */}
          <div className="sticky bottom-4 pt-4">
            {hasApplied ? (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 text-ok border-[var(--ok-b)] bg-okl"
                  disabled
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Candidature envoyee
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/applications')}
                  className="w-full"
                >
                  Suivre ma candidature
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => router.push(`/apply/${jobId}`)}
                className="w-full h-12"
              >
                Postuler a cette offre
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
