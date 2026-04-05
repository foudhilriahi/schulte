'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Download, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useOffer } from '@/hooks/useOffers'
import { useSubmitSavedCVApplication } from '@/hooks/useApplications'
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

interface ConfirmApplicationPageProps {
  params: Promise<{ jobId: string }>
}

export default function ConfirmApplicationPage({ params }: ConfirmApplicationPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { jobId } = use(params)
  const cvId = searchParams.get('cvId')
  const { user } = useAuthStore()
  
  const { data: job } = useOffer(jobId)
  const mutation = useSubmitSavedCVApplication()
  
  const [selectedCV, setSelectedCV] = useState<CVItem | null>(null)
  const [coverNote, setCoverNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (cvId && typeof window !== 'undefined') {
      api
        .get('/cvs/mine')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : []
          const cv = list.find((c: any) => c.id === cvId)
          if (!cv) {
            toast.error('CV not found')
            router.push(`/apply/${jobId}`)
            return
          }

          setSelectedCV({
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
        })
        .catch(() => {
          toast.error('Failed to load selected CV')
          router.push(`/apply/${jobId}`)
        })
    }
  }, [cvId, jobId, router, user?.id])

  const handleDownloadCV = async () => {
    if (!selectedCV) return

    try {
      if (selectedCV.type === 'uploaded' && selectedCV.cvUrl) {
        const filename = selectedCV.cvUrl.split('/').pop()
        if (!filename) {
          toast.error('Invalid CV reference')
          return
        }
        const response = await api.get(`/uploads/${filename}`, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedCV.name}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CV downloaded!')
        return
      }

      if (selectedCV.type === 'generated' && selectedCV.data) {
        const { generateCV } = await import('@/lib/cv-generator')
        const doc = generateCV(selectedCV.data, selectedCV.template || 'modern')
        doc.save(`${selectedCV.name}.pdf`)
        toast.success('CV downloaded!')
        return
      }

      toast.error('CV file not available for download')
    } catch {
      toast.error('Error downloading CV')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCV || !cvId) {
      toast.error('No CV selected')
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!selectedCV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 px-4">
        <h1 className="text-lg font-semibold text-foreground">CV Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">The selected CV could not be found.</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/apply/${jobId}`)}
          className="mt-4"
        >
          Back to Application
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-slate-50">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(`/apply/${jobId}`)}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">Confirm Application</h1>
            <p className="text-sm text-muted-foreground">
              Review your CV and add an optional cover note before submitting.
            </p>
          </div>

          {/* Job Info */}
          {job && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">{job.title}</h3>
                    <p className="text-sm text-blue-700">{job.site} • {job.contractType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected CV */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Selected CV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{selectedCV.name}</h3>
                      {selectedCV.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="default" className="text-xs">
                        {selectedCV.type === 'uploaded' ? 'Uploaded' : 'Generated'}
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
                  Preview CV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cover Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cover Note (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Brief message to the recruiter</Label>
                  <span className="text-xs text-muted-foreground">{coverNote.length}/300</span>
                </div>
                <Textarea 
                  placeholder="Why are you interested in this position? What makes you a good fit?"
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
              disabled={isSubmitting}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}