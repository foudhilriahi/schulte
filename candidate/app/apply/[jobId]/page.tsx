'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CVSelector } from '@/components/cv-selector'
import { useOffer } from '@/hooks/useOffers'
import { useMyApplications } from '@/hooks/useApplications'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/axios'

interface CVItem {
  id: string
  name: string
  type: 'uploaded' | 'generated'
  createdAt: string
  isDefault: boolean
  size?: number
  template?: 'modern' | 'classic'
  cvUrl?: string
  data?: any
}

interface ApplyPageProps {
  params: Promise<{ jobId: string }>
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 bg-background border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <Skeleton className="h-10 w-20 mb-4" />
          <Skeleton className="h-1.5 w-full rounded-full mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-4">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-1.5" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-1.5" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-1.5" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const router = useRouter()
  const { jobId } = use(params)
  const { user } = useAuthStore()
  
  const { data: job, isLoading: loadingOffer } = useOffer(jobId)
  const { data: myApps = [], isLoading: loadingApps } = useMyApplications()
  
  const [cvs, setCvs] = useState<CVItem[]>([])
  const [showCVSelector, setShowCVSelector] = useState(false)

  useEffect(() => {
    const loadCVs = async () => {
      try {
        const res = await api.get('/cvs/mine')
        const mapped: CVItem[] = Array.isArray(res.data)
          ? res.data.map((cv: any) => ({
              id: cv.id,
              name: cv.name,
              type: cv.type === 'generated' ? 'generated' : 'uploaded',
              createdAt: cv.createdAt,
              isDefault: !!cv.isDefault,
              size: typeof cv.size === 'number' ? cv.size : undefined,
              template: cv.cvTemplate === 'classic' ? 'classic' : 'modern',
              cvUrl: cv.cvUrl,
              data: cv.formData,
            }))
          : []
        setCvs(mapped)
      } catch {
        setCvs([])
      }
    }

    loadCVs()
  }, [user?.id])

  if (loadingOffer || loadingApps) {
    return <LoadingSkeleton />
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-lg font-semibold text-foreground">Job Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">This job posting may have been removed.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-blue-600 font-medium min-h-[44px] touch-manipulation"
        >
          Back to Jobs
        </button>
      </div>
    )
  }

  // Check if offer is closed
  if (job.status !== 'open') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8" />
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

  if (hasApplied) {
    return (
      <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
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
        
        <main className="flex-1 px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Already Applied</h1>
          <p className="text-muted-foreground mb-8">
            You have already submitted an application for the <strong className="text-foreground">{job.title}</strong> position.
          </p>
          <Button 
            onClick={() => router.push('/applications')}
            className="w-full max-w-xs h-12 rounded-xl text-base"
          >
            Track My Application
          </Button>
        </main>
      </div>
    )
  }

  const handleCVSelect = (cv: CVItem | null) => {
    if (!cv) return
    router.push(`/apply/${jobId}/confirm?cvId=${cv.id}`)
  }

  const handleDefaultCVApply = () => {
    if (cvs.length === 0) return

    const defaultCV = cvs.find((cv) => cv.isDefault) || cvs[0]
    router.push(`/apply/${jobId}/confirm?cvId=${defaultCV.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-slate-50">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">Apply for {job.title}</h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to submit your application
          </p>
        </div>

        <div className="space-y-4">
          {/* Quick Apply with Default CV */}
          {cvs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Quick Apply</h2>
              <Card
                className="border-blue-200 bg-blue-50/50"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {cvs.find((cv) => cv.isDefault)?.name || cvs[0].name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This CV will be used automatically if you continue without choosing another one.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDefaultCVApply} className="flex-1">
                      Apply with Default CV
                    </Button>
                    <Button variant="outline" onClick={() => setShowCVSelector(true)}>
                      Choose Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Options */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              {cvs.length > 0 ? 'All Saved CVs' : 'No Saved CV'}
            </h2>

            {cvs.length === 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-900 mb-3">
                    Build or upload your CV from Profile first, then come back to apply.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/profile/cv')}>
                    Go to My CVs
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Choose from existing CVs */}
            {cvs.length > 1 && (
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowCVSelector(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Choose from My CVs</h3>
                      <p className="text-sm text-muted-foreground">Select from {cvs.length} saved CVs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CV Selector Modal */}
        <CVSelector
          open={showCVSelector}
          onClose={() => setShowCVSelector(false)}
          onSelectCV={handleCVSelect}
          onUploadNew={() => router.push('/profile/cv')}
          allowCreateNew={false}
        />
      </main>
    </div>
  )
}
