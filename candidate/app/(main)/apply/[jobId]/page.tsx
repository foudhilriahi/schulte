'use client'

import { use, useState, useEffect } from 'react'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
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
  const router = useRouterWithLoader()
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
        <h1 className="text-lg font-semibold text-foreground">Offre introuvable</h1>
        <p className="text-sm text-muted-foreground mt-2">This job posting may have been removed.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-primary font-medium min-h-[44px] touch-manipulation"
        >
          Retour aux offres
        </button>
      </div>
    )
  }

  // Check if offer is closed
  if (job.status !== 'open') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <div className="w-16 h-16 bg-errl text-err rounded-full border border-[var(--err-b)] flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8" />
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

  if (hasApplied) {
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
        
        <main className="flex-1 px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full border border-[var(--ok-b)] bg-okl flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-ok" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Candidature deja envoyee</h1>
          <p className="text-muted-foreground mb-8">
            Vous avez deja postule au poste <strong className="text-foreground">{job.title}</strong>.
          </p>
          <Button 
            onClick={() => router.push('/applications')}
            className="w-full max-w-xs h-12 rounded-xl text-base"
          >
            Suivre ma candidature
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
    return new Date(dateString).toLocaleDateString('fr-TN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">Postuler a {job.title}</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez comment envoyer votre candidature
          </p>
        </div>

        <div className="space-y-4">
          {/* Quick Apply with Default CV */}
          {cvs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Postulation rapide</h2>
              <Card className="border-[var(--bou-b)] bg-boul">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-boul text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {cvs.find((cv) => cv.isDefault)?.name || cvs[0].name}
                        </h3>
                        <Badge variant="secondary" className="text-xs bg-card2 text-ink3 border-border">Par defaut</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ce CV sera utilise automatiquement si vous continuez sans en choisir un autre.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDefaultCVApply} className="flex-1">
                      Postuler avec le CV par defaut
                    </Button>
                    <Button variant="outline" onClick={() => setShowCVSelector(true)}>
                      Choisir un autre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Options */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              {cvs.length > 0 ? 'Tous les CV enregistres' : 'Aucun CV enregistre'}
            </h2>

            {cvs.length === 0 && (
              <Card className="border-[var(--warn-b)] bg-warnl">
                <CardContent className="p-4">
                  <p className="text-sm text-warn mb-3">
                    Creez ou televersez d'abord votre CV depuis Profil, puis revenez postuler.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/profile/cv')}>
                    Aller a mes CV
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Choose from existing CVs */}
            {cvs.length > 1 && (
              <Card 
                className="cursor-pointer transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[3px] hover:border-[var(--border2)] hover:shadow-hover"
                onClick={() => setShowCVSelector(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-okl text-ok flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Choisir parmi mes CV</h3>
                      <p className="text-sm text-muted-foreground">Selectionner parmi {cvs.length} CV enregistres</p>
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
