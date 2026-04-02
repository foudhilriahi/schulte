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
import { useSubmitPDFApplication } from '@/hooks/useApplications'
import { toast } from 'sonner'

interface CVItem {
  id: string
  name: string
  type: 'uploaded' | 'generated'
  createdAt: string
  isDefault: boolean
  size?: number
  template?: string
  data?: string // Base64 data for uploaded files, or CV data for generated ones
}

interface ConfirmApplicationPageProps {
  params: Promise<{ jobId: string }>
}

export default function ConfirmApplicationPage({ params }: ConfirmApplicationPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { jobId } = use(params)
  const cvId = searchParams.get('cvId')
  
  const { data: job } = useOffer(jobId)
  const mutation = useSubmitPDFApplication()
  
  const [selectedCV, setSelectedCV] = useState<CVItem | null>(null)
  const [coverNote, setCoverNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (cvId && typeof window !== 'undefined') {
      const savedCVs = localStorage.getItem('user_cvs')
      if (savedCVs) {
        const cvs: CVItem[] = JSON.parse(savedCVs)
        const cv = cvs.find(c => c.id === cvId)
        if (cv) {
          setSelectedCV(cv)
        } else {
          toast.error('CV not found')
          router.push(`/apply/${jobId}`)
        }
      }
    }
  }, [cvId, jobId, router])

  const handleDownloadCV = () => {
    if (selectedCV?.data) {
      try {
        if (selectedCV.type === 'uploaded') {
          // For uploaded PDFs, recreate blob from base64
          const byteCharacters = atob(selectedCV.data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${selectedCV.name}.pdf`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('CV downloaded!')
        } else {
          toast.error('Generated CV preview not available here')
        }
      } catch (error) {
        toast.error('Error downloading CV')
      }
    } else {
      toast.error('CV file not available for download')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCV?.data) {
      toast.error('No CV data available')
      return
    }

    setIsSubmitting(true)
    try {
      let cvFile: File

      if (selectedCV.type === 'uploaded') {
        // Recreate File from base64 data
        try {
          const byteCharacters = atob(selectedCV.data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          cvFile = new File([byteArray], `${selectedCV.name}.pdf`, { type: 'application/pdf' })
        } catch (error) {
          toast.error('Error processing uploaded CV')
          return
        }
      } else {
        // For generated CVs, create PDF from data
        try {
          const { generateCV } = await import('@/lib/cv-generator')
          const doc = generateCV(selectedCV.data, selectedCV.template || 'modern')
          const pdfBlob = doc.output('blob')
          cvFile = new File([pdfBlob], `${selectedCV.name}.pdf`, { type: 'application/pdf' })
        } catch (error) {
          toast.error('Error processing generated CV')
          return
        }
      }

      await mutation.mutateAsync({
        offerId: jobId,
        cvFile,
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
                      <Badge variant="default" className="text-xs">Uploaded</Badge>
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