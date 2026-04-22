'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Download, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CVSelector } from '@/components/cv-selector'
import { useOffer } from '@/hooks/useOffers'
import { useSubmitSavedCVApplication } from '@/hooks/useApplications'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/axios'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'

interface CVItem {
  id: string
  name: string
  type: 'uploaded' | 'generated'
  createdAt: string
  isDefault: boolean
  size?: number
  template?: 'modern' | 'classic'
  data?: any
  cvUrl?: string
}

interface ConfirmApplicationPageProps {
  params: Promise<{ jobId: string }>
}

export default function ConfirmApplicationPage({ params }: ConfirmApplicationPageProps) {
  const router = useRouterWithLoader()
  const searchParams = useSearchParams()
  const { jobId } = use(params)
  const cvId = searchParams.get('cvId')
  const { user } = useAuthStore()
  
  const { data: job } = useOffer(jobId)
  const mutation = useSubmitSavedCVApplication()
  
  const [selectedCV, setSelectedCV] = useState<CVItem | null>(null)
  const [coverNote, setCoverNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCVSelector, setShowCVSelector] = useState(false)
  const [isLoadingCV, setIsLoadingCV] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoadingCV(true)
      api
        .get('/cvs/mine')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : []
          const fallbackCv = list.find((c: any) => c.id === cvId) || list.find((c: any) => c.isDefault) || list[0]

          if (!fallbackCv) {
            toast.error('Aucun CV enregistre trouve')
            router.push(`/apply/${jobId}`)
            return
          }

          const normalizedCv = {
            id: fallbackCv.id,
            name: fallbackCv.name,
            type: fallbackCv.type === 'generated' ? 'generated' : 'uploaded',
            createdAt: fallbackCv.createdAt,
            isDefault: !!fallbackCv.isDefault,
            size: typeof fallbackCv.size === 'number' ? fallbackCv.size : undefined,
            template: fallbackCv.cvTemplate === 'classic' ? 'classic' : 'modern',
            data: fallbackCv.formData,
            cvUrl: fallbackCv.cvUrl,
          }

          setSelectedCV(normalizedCv)

          if (!cvId) {
            router.replace(`/apply/${jobId}/confirm?cvId=${normalizedCv.id}`)
          }
        })
        .catch(() => {
          toast.error('Impossible de charger le CV selectionne')
          router.push(`/apply/${jobId}`)
        })
        .finally(() => {
          setIsLoadingCV(false)
        })
    }
  }, [cvId, jobId, router, user?.id])

  const handleCVSwitch = (cv: CVItem | null) => {
    if (!cv) return

    setSelectedCV(cv)
    setShowCVSelector(false)
    router.replace(`/apply/${jobId}/confirm?cvId=${cv.id}`)
  }

  const handleDownloadCV = async () => {
    if (!selectedCV) return

    try {
      if (selectedCV.type === 'uploaded' && selectedCV.cvUrl) {
        const filename = selectedCV.cvUrl.split('/').pop()
        if (!filename) {
          toast.error('Reference CV invalide')
          return
        }
        const response = await api.get(`/uploads/${filename}`, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedCV.name}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CV telecharge avec succes !')
        return
      }

      if (selectedCV.type === 'generated' && selectedCV.data) {
        const { generateCV } = await import('@/lib/cv-generator')
        const doc = await generateCV(selectedCV.data, selectedCV.template || 'modern')
        doc.save(`${selectedCV.name}.pdf`)
        toast.success('CV telecharge avec succes !')
        return
      }

      toast.error('Fichier CV indisponible pour le telechargement')
    } catch {
      toast.error('Erreur lors du telechargement du CV')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCV || !cvId) {
      toast.error('Aucun CV selectionne')
      return
    }

    setIsSubmitting(true)
    try {
      await mutation.mutateAsync({
        offerId: jobId,
        cvId,
        coverNote
      })
      router.push('/applications')
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoadingCV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground mt-3">Chargement du CV selectionne...</p>
      </div>
    )
  }

  if (!selectedCV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-lg font-semibold text-foreground">CV introuvable</h1>
        <p className="text-sm text-muted-foreground mt-2">Le CV selectionne est introuvable.</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/apply/${jobId}`)}
          className="mt-4"
        >
          Retour a la candidature
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(`/apply/${jobId}`)}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">Confirmer la candidature</h1>
            <p className="text-sm text-muted-foreground">
              Verifiez votre CV et ajoutez une note facultative avant l'envoi.
            </p>
          </div>

          {/* Job Info */}
          {job && (
            <Card className="bg-boul border-[var(--bou-b)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-boul text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-primary">{job.site} • {job.contractType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected CV */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-ok" />
                  CV selectionne
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowCVSelector(true)}>
                  Changer de CV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{selectedCV.name}</h3>
                      {selectedCV.isDefault && (
                        <Badge variant="secondary" className="text-xs">Par defaut</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="default" className="text-xs">
                        {selectedCV.type === 'uploaded' ? 'Televerse' : 'Genere'}
                      </Badge>
                      <span>•</span>
                      <span>{formatDate(selectedCV.createdAt)}</span>
                      {selectedCV.size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(selectedCV.size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadCV}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Apercu du CV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cover Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Note de motivation (facultatif)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Message court au recruteur</Label>
                  <span className="text-xs text-muted-foreground">{coverNote.length}/300</span>
                </div>
                <Textarea 
                  placeholder="Pourquoi ce poste vous interesse-t-il ? Qu'est-ce qui fait de vous un bon profil ?"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value.slice(0, 300))}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCV}
              className="w-full h-12"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la candidature
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <CVSelector
        open={showCVSelector}
        onClose={() => setShowCVSelector(false)}
        onSelectCV={handleCVSwitch}
        onUploadNew={() => router.push('/profile/cv')}
        allowCreateNew={false}
      />
    </div>
  )
}
