'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Upload, Trash2, Star, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'

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

export default function MyCVPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [cvs, setCvs] = useState<CVItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load CVs on mount and when refreshKey changes
  useEffect(() => {
    loadCVs()
  }, [refreshKey])

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

  const loadCVs = () => {
    if (typeof window !== 'undefined') {
      const savedCVs = localStorage.getItem('user_cvs')
      if (savedCVs) {
        try {
          const parsed = JSON.parse(savedCVs)
          setCvs(parsed)
        } catch (err) {
          console.error('Failed to parse CVs:', err)
          setCvs([])
        }
      } else {
        setCvs([])
      }
      
      // Also check for legacy generated CV
      const legacyDraft = localStorage.getItem('latest_cv_draft')
      if (legacyDraft && (!savedCVs || JSON.parse(savedCVs).length === 0)) {
        try {
          const draft = JSON.parse(legacyDraft)
          const generatedCV: CVItem = {
            id: 'generated-' + Date.now(),
            name: `Generated CV - ${draft.template || 'Modern'}`,
            type: 'generated',
            createdAt: new Date().toISOString(),
            isDefault: true,
            template: draft.template || 'modern',
            data: draft
          }
          const newCVs = [generatedCV]
          setCvs(newCVs)
          localStorage.setItem('user_cvs', JSON.stringify(newCVs))
        } catch (err) {
          console.error('Failed to migrate legacy CV:', err)
        }
      }
    }
  }

  const saveCVs = (newCVs: CVItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_cvs', JSON.stringify(newCVs))
      setCvs(newCVs)
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Convert file to base64 for storage
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Data = e.target?.result as string
      
      // Create new CV item with base64 data
      const newCV: CVItem = {
        id: 'uploaded-' + Date.now(),
        name: file.name.replace('.pdf', ''),
        type: 'uploaded',
        createdAt: new Date().toISOString(),
        isDefault: cvs.length === 0, // First CV becomes default
        size: file.size,
        data: base64Data.split(',')[1] // Remove data:application/pdf;base64, prefix
      }

      const newCVs = [...cvs, newCV]
      saveCVs(newCVs)
      setIsUploading(false)
      toast.success('CV uploaded successfully!')
    }
    
    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Failed to process file')
    }
    
    reader.readAsDataURL(file)
  }

  const handleDownload = async (cv: CVItem) => {
    try {
      if (cv.type === 'uploaded' && cv.data) {
        // For uploaded PDFs, recreate blob from base64
        const byteCharacters = atob(cv.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
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
    const newCVs = cvs.map(cv => ({
      ...cv,
      isDefault: cv.id === cvId
    }))
    saveCVs(newCVs)
    toast.success('Default CV updated!')
  }

  const handleDelete = (cvId: string) => {
    const cvToDelete = cvs.find(cv => cv.id === cvId)
    if (!cvToDelete) return

    if (!confirm(`Are you sure you want to delete "${cvToDelete.name}"?`)) {
      return
    }

    const newCVs = cvs.filter(cv => cv.id !== cvId)
    
    // If deleted CV was default, make first remaining CV default
    if (cvToDelete.isDefault && newCVs.length > 0) {
      newCVs[0].isDefault = true
    }
    
    saveCVs(newCVs)
    toast.success('CV deleted successfully!')
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
    <div className="flex flex-col min-h-screen bg-slate-50">
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
          <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          {/* CV List */}
          {cvs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
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
                          <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
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
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cv.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">CV Management</h3>
                  <p className="text-xs text-blue-700">
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
