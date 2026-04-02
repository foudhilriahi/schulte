'use client'

import { useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSubmitPDFApplication } from '@/hooks/useApplications'
import { useOffer } from '@/hooks/useOffers'
import { Textarea } from '@/components/ui/textarea'

export default function UploadApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter()
  const { jobId } = use(params)
  const { data: job } = useOffer(jobId)
  const mutation = useSubmitPDFApplication()
  
  const [file, setFile] = useState<File | null>(null)
  const [coverNote, setCoverNote] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files accepted.')
      return
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File too large — max 5MB.')
      return
    }
    
    setFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a PDF file first.')
      return
    }
    
    try {
      await mutation.mutateAsync({ offerId: jobId, cvFile: file })
      router.push('/applications')
    } catch (e) {
      // Error is handled in the hook
    }
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Upload CV</h1>
        {job && <p className="text-muted-foreground mb-6">Application for {job.title}</p>}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your CV Document</label>
            <label 
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-foreground font-medium">Tap to select your CV</p>
                    <p className="text-xs text-muted-foreground">PDF only • Max 5MB</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Cover Note <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <span className="text-xs text-muted-foreground">{coverNote.length}/300</span>
            </div>
            <Textarea 
              placeholder="Brief message to the recruiter..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value.slice(0, 300))}
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button 
            className="w-full h-12 rounded-xl text-base shadow-md shadow-primary/20 hover:shadow-primary/30"
            disabled={!file || mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? 'Uploading...' : 'Submit Application'}
          </Button>
        </div>
      </main>
    </div>
  )
}
