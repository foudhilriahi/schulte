'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { jobId } = use(params)
  
  const { data: job, isLoading: loadingOffer } = useOffer(jobId)
  const { data: myApps = [], isLoading: loadingApps } = useMyApplications()

  if (loadingOffer || loadingApps) {
    return <LoadingSkeleton />
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-lg font-semibold text-foreground">Job Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">This job posting may have been removed.</p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mt-4"
        >
          Back to Jobs
        </Button>
      </div>
    )
  }

  // Check if offer is closed
  if (job.status !== 'open') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <div className="w-16 h-16 bg-destructive/15 text-destructive rounded-full border border-destructive/30 flex items-center justify-center mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Job Closed</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
          This job posting is no longer accepting applications.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="mt-6"
        >
          Browse Open Positions
        </Button>
      </div>
    )
  }

  const hasApplied = myApps.some(app => app.offerId === jobId)
  
  const siteColor = job.site === 'Bouarada' 
    ? 'bg-bou/10 border-bou/25 text-bou'
    : 'bg-zag/10 border-zag/25 text-zag'

  const contractColors: Record<string, string> = {
    CDI: 'bg-success/10 border-success/30 text-success',
    CDD: 'bg-warning/10 border-warning/30 text-warning',
    Stage: 'bg-secondary border-input text-muted-foreground'
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days left`
    
    return date.toLocaleDateString('en-GB', { 
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
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Job Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">
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
                    <Badge variant="outline" className="border-success/30 text-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Applied
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
                      <p className="text-xs text-muted-foreground">Positions</p>
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
                      <p className="text-xs text-muted-foreground">Department</p>
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
                        <p className="font-medium">{job.experienceYears}+ years</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {job.showSalary && job.salaryRange && (
                <Card className="border-success/30 bg-success/10">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-xs text-success">Salary Range</p>
                        <p className="font-medium text-foreground">{job.salaryRange}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Deadline */}
            <Card className="border-warning/30 bg-warning/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Application Deadline</p>
                    <p className="text-sm text-warning">{formatDeadline(job.deadline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Description */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-foreground mb-3">Job Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold text-foreground mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm bg-s3 text-muted-foreground rounded-sm border border-border"
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
                  className="w-full h-12 text-success border-success/30 bg-success/10"
                  disabled
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Application Submitted
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/applications')}
                  className="w-full"
                >
                  Track My Application
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => router.push(`/apply/${jobId}`)}
                className="w-full h-12"
              >
                Apply for This Position
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}