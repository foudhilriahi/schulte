'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Trash2, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
  data?: any
  cvUrl?: string
}

export default function MyCVPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [cvs, setCvs] = useState<CVItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

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
      toast.error('Only PDF files are supported')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const payload = new FormData()
      payload.append('cvFile', file)
      await api.post('/cvs/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('CV uploaded successfully!')
      await loadCVs()
    } catch {
      toast.error('Failed to upload CV')
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
          toast.error('Invalid CV file reference')
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
        const doc = generateCV(cv.data, cv.template || 'modern')
        doc.save(`${cv.name}.pdf`)
      }
      toast.success('CV downloaded successfully!')
    } catch (err) {
      toast.error('Failed to download CV')
    }
  }

  const handleSetDefault = (cvId: string) => {
    api
      .patch(`/cvs/${cvId}/default`)
      .then(async () => {
        toast.success('Default CV updated!')
        await loadCVs()
      })
      .catch(() => {
        toast.error('Failed to update default CV')
      })
  }

  const handleDelete = (cvId: string) => {
    const cvToDelete = cvs.find(cv => cv.id === cvId)
    if (!cvToDelete) return

    if (!confirm(`Are you sure you want to delete "${cvToDelete.name}"?`)) {
      return
    }

    api
      .delete(`/cvs/${cvId}`)
      .then(async () => {
        toast.success('CV deleted successfully!')
        await loadCVs()
      })
      .catch(() => {
        toast.error('Failed to delete CV')
      })
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </button>
            <h1 className="ml-4 font-semibold text-foreground">My CVs</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            {cvs.length} CV{cvs.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {/* Upload New CV */}
          <Card className="border-2 border-dashed border-border hover:border-acch transition-colors">
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-bou/14 text-bou flex items-center justify-center mb-3">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bou"></div>
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">Upload New CV</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Add a PDF resume to your collection
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
              <CardTitle className="text-base">Build New CV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Use the step-by-step wizard to create a generated CV in your library.
              </p>
              <Button onClick={() => router.push('/profile/cv/build')} className="w-full">
                Open CV Builder
              </Button>
            </CardContent>
          </Card>

          {/* CV List */}
          {cvs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-s3 text-muted-foreground flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">No CVs yet</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
                  Upload a PDF or apply to jobs using the form to generate CVs automatically.
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={cv.type === 'uploaded' ? 'default' : 'secondary'} className="text-xs">
                          {cv.type === 'uploaded' ? 'Uploaded' : 'Generated'}
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
                      Download
                    </Button>
                    {!cv.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(cv.id)}
                        title="Set as default CV"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    {cv.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Already default"
                      >
                        Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cv.id)}
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
          <Card className="bg-bou/10 border-bou/25">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-bou/14 text-bou flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">CV Management</h3>
                  <p className="text-xs text-bou">
                    Your default CV (marked with ⭐) will be used automatically when applying. 
                    You can also choose a specific CV during the application process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
