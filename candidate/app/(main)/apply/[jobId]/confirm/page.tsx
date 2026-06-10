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
import { messages } from '@/lib/messages'

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
            toast.error('Aucun CV enregistré trouvé.')
            router.push(`/apply/${jobId}`)
            return
          }

          const normalizedCv: CVItem = {
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
          toast.error(messages.cv.selectedLoadFailed)
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
          toast.error('Référence CV invalide.')
          return
        }
        const response = await api.get(`/uploads/${filename}`, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedCV.name}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(messages.cv.downloaded)
        return
      }

      if (selectedCV.type === 'generated' && selectedCV.data) {
        const { generateCV } = await import('@/lib/cv-generator')
        const doc = await generateCV(selectedCV.data, selectedCV.template || 'modern')
        doc.save(`${selectedCV.name}.pdf`)
        toast.success(messages.cv.downloaded)
        return
      }

      toast.error('Fichier CV indisponible pour le téléchargement.')
    } catch {
      toast.error(messages.cv.downloadFailed)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCV || !cvId) {
      toast.error('Aucun CV sélectionné.')
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
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-v" />
        <p className="text-[12px] text-ink3 mt-3">Chargement du CV sélectionné...</p>
      </div>
    )
  }

  if (!selectedCV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-[15px] font-semibold text-ink">CV introuvable</h1>
        <p className="text-[13px] text-ink3 mt-2">{messages.cv.selectedMissing}</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/apply/${jobId}`)}
          className="mt-4"
        >
          Retour à la candidature
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-page">
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(`/apply/${jobId}`)}
            className="flex items-center gap-2 text-ink3 min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-[12px]">Retour</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-[20px] font-semibold text-ink mb-2">Confirmer la candidature</h1>
            <p className="text-[13px] text-ink3">
              Vérifiez votre CV et ajoutez une note facultative avant l'envoi.
            </p>
          </div>

          {/* Job Info */}
          {job && (
            <Card className="bg-card border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-bou" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink">{job.title}</h3>
                    <p className="text-[12px] text-ink3">{job.site} • {job.contractType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected CV */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-[13px] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ok" />
                  CV sélectionné
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
                      <h3 className="font-semibold text-ink truncate">{selectedCV.name}</h3>
                      {selectedCV.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">Par défaut</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink3">
                      <Badge variant="default" className="text-[10px]">
                        {selectedCV.type === 'uploaded' ? 'Téléversé' : 'Généré'}
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
                  Aperçu du CV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cover Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px]">Note de motivation (facultatif)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Message court au recruteur</Label>
                  <span className="text-[11px] text-ink4">{coverNote.length}/300</span>
                </div>
                <Textarea 
                  placeholder="Pourquoi ce poste vous intéresse-t-il ? Qu'est-ce qui fait de vous un bon profil ?"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value.slice(0, 300))}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCV}
              className="w-full"
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
