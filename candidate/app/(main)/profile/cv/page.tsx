'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Download, FileText, Trash2, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/axios'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { BottomSheetConfirm } from '@/components/bottom-sheet-confirm'
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

export default function MyCVPage() {
  const router = useRouterWithLoader()
  const { user } = useAuthStore()
  const [cvs, setCvs] = useState<CVItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<CVItem | null>(null)

  const mapApiCVToUI = (cv: any): CVItem => ({
    id: cv.id,
    name: cv.name,
    type: cv.type === 'generated' ? 'generated' : 'uploaded',
    createdAt: cv.createdAt,
    isDefault: !!cv.isDefault,
    size: typeof cv.size === 'number' ? cv.size : undefined,
    template: cv.cvTemplate === 'classic' ? 'classic' : 'modern',
    data: cv.formData,
    cvUrl: cv.cvUrl,
  })

  useEffect(() => {
    loadCVs()
  }, [user?.id])

  // Also reload when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCVs()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadCVs = async () => {
    try {
      const response = await api.get('/cvs/mine')
      const apiCVs = Array.isArray(response.data) ? response.data.map(mapApiCVToUI) : []
      setCvs(apiCVs)
      return
    } catch {
      setCvs([])
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error(messages.cv.uploadPdfOnly)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(messages.cv.uploadTooLarge)
      return
    }

    setIsUploading(true)

    try {
      const payload = new FormData()
      payload.append('cvFile', file)
      await api.post('/cvs/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(messages.cv.uploaded)
      await loadCVs()
    } catch {
      toast.error(messages.cv.uploadFailed)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDownload = async (cv: CVItem) => {
    try {
      if (cv.type === 'uploaded' && cv.cvUrl) {
        const filename = cv.cvUrl.split('/').pop()
        if (!filename) {
          toast.error(messages.cv.invalidFileRef)
          return
        }

        const response = await api.get(`/uploads/${filename}`, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${cv.name}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else if (cv.type === 'generated' && cv.data) {
        // For generated CVs, regenerate PDF
        const { generateCV } = await import('@/lib/cv-generator')
        const doc = await generateCV(cv.data, cv.template || 'modern')
        doc.save(`${cv.name}.pdf`)
      }
      toast.success(messages.cv.downloaded)
    } catch (err) {
      toast.error(messages.cv.downloadFailed)
    }
  }

  const handleSetDefault = (cvId: string) => {
    api
      .patch(`/cvs/${cvId}/default`)
      .then(async () => {
        toast.success(messages.cv.defaultUpdated)
        await loadCVs()
      })
      .catch(() => {
        toast.error(messages.cv.defaultFailed)
      })
  }

  const handleDelete = async () => {
    if (!cvToDelete) return
    api
      .delete(`/cvs/${cvToDelete.id}`)
      .then(async () => {
        toast.success(messages.cv.deleted)
        setCvToDelete(null)
        await loadCVs()
      })
      .catch(() => {
        toast.error(messages.cv.deleteFailed)
      })
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

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 text-ink3 min-h-[44px] touch-manipulation -ml-1"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[12px]">Retour</span>
            </button>
            <h1 className="ml-4 font-semibold text-ink">Mes CV</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            {cvs.length} CV{cvs.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {/* Upload New CV */}
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-vl text-v flex items-center justify-center mb-3">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-v"></div>
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                </div>
                <h3 className="font-semibold text-ink mb-1">Téléverser un nouveau CV</h3>
                <p className="text-[12px] text-ink3 text-center">
                  Ajouter un CV PDF à votre collection
                </p>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px]">Créer un nouveau CV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[12px] text-ink3 mb-3">
                Utilisez l'assistant pas à pas pour générer un CV dans votre bibliothèque.
              </p>
              <Button onClick={() => router.push('/profile/cv/build')} className="w-full">
                Ouvrir le générateur de CV
              </Button>
            </CardContent>
          </Card>

          {/* CV List */}
          {cvs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-card2 text-ink4 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Aucun CV pour le moment</h2>
                <p className="text-[12px] text-ink3 mt-1 max-w-[280px] mx-auto">
                  Téléversez un PDF ou utilisez le formulaire pour générer un CV.
                </p>
              </div>
            </div>
          ) : (
            cvs.map((cv) => (
              <Card key={cv.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base truncate">{cv.name}</CardTitle>
                        {cv.isDefault && (
                          <Star className="h-4 w-4 text-warn fill-current flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-ink3">
                        <Badge variant={cv.type === 'uploaded' ? 'default' : 'secondary'} className="text-xs">
                          {cv.type === 'uploaded' ? 'Téléversé' : 'Généré'}
                        </Badge>
                        <span>•</span>
                        <span>{formatDate(cv.createdAt)}</span>
                        {cv.size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(cv.size)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(cv)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                    {!cv.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(cv.id)}
                        title="Définir comme CV par défaut"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    {cv.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Déjà par défaut"
                      >
                        Par défaut
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCvToDelete(cv)}
                      className="text-err hover:text-err"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Info Card */}
          <Card className="bg-card2 border border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-bou mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-ink mb-1">Gestion des CV</h3>
                  <p className="text-[11px] text-ink3">
                    Votre CV par défaut est signalé par l'étoile et utilisé automatiquement lors de la candidature.
                    Vous pouvez aussi choisir un CV spécifique pendant le processus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomSheetConfirm
        open={!!cvToDelete}
        title="Supprimer ce CV"
        description={
          cvToDelete
            ? `Le CV « ${cvToDelete.name} » sera supprimé de votre bibliothèque.`
            : undefined
        }
        confirmLabel="Supprimer le CV"
        tone="danger"
        onClose={() => setCvToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
