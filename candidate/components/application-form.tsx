'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StepProgressBar } from './step-progress-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { JobOffer } from '@/lib/types'
import { useSubmitPDFApplication, useSubmitFormApplication } from '@/hooks/useApplications'
import { loadStoredCVs, saveLatestDraft, saveStoredCVs } from '@/lib/cv-storage'
import { useAuthStore } from '@/store/auth'

interface ApplicationFormProps {
  job: JobOffer
  onBack: () => void
}

const stepLabels = ['Personal', 'Experience', 'Documents', 'Review']

interface FormData {
  fullName: string
  email: string
  phone: string
  city: string
  currentRole: string
  yearsExperience: string
  coverLetter: string
  cvFile: File | null
}

export function ApplicationForm({ job, onBack }: ApplicationFormProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    currentRole: '',
    yearsExperience: '',
    coverLetter: '',
    cvFile: null
  })

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setDirection('forward')
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection('backward')
      setCurrentStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  const pdfMutation = useSubmitPDFApplication()
  const formMutation = useSubmitFormApplication()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      if (formData.cvFile) {
        await pdfMutation.mutateAsync({
          offerId: job.id,
          cvFile: formData.cvFile
        })
      } else {
        // Save generated CV to CV management system
        const cvData = {
          personal: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
          },
          experience: {
            currentRole: formData.currentRole,
            yearsExperience: formData.yearsExperience,
          },
          coverLetter: formData.coverLetter,
          template: 'modern'
        }
        
        const existingCVs = loadStoredCVs(user?.id)
        const newCV = {
          id: 'generated-' + Date.now(),
          name: `Generated CV - ${job.title}`,
          type: 'generated' as const,
          createdAt: new Date().toISOString(),
          isDefault: existingCVs.length === 0,
          template: 'modern',
          data: cvData
        }

        saveStoredCVs(user?.id, [...existingCVs, newCV])
        saveLatestDraft(user?.id, cvData)

        await formMutation.mutateAsync({
          offerId: job.id,
          formData: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            currentRole: formData.currentRole,
            yearsExperience: formData.yearsExperience,
            coverLetter: formData.coverLetter
          }
        })
      }
      
      router.push('/applications')
    } catch (error) {
      // Error is handled by the hook's toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField('cvFile', file)
      toast.success('CV uploaded successfully')
    }
  }

  const cityColor = job.site === 'Bouarada' 
    ? 'bg-blue-600 text-white' 
    : 'bg-teal-600 text-white'

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1 mb-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">{currentStep === 1 ? 'Back' : 'Previous'}</span>
          </button>
          <StepProgressBar 
            currentStep={currentStep} 
            totalSteps={4} 
            stepLabels={stepLabels} 
          />
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 px-4 py-4 overflow-hidden">
        <div className="mb-4">
          <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', cityColor)}>
            {job.site}
          </span>
          <h1 className="text-lg font-semibold text-foreground mt-2">{job.title}</h1>
        </div>

        <div className="relative overflow-hidden">
          {/* Step 1: Personal Info */}
          <div 
            className={cn(
              'transition-all duration-300 ease-out',
              currentStep === 1 
                ? 'opacity-100 translate-x-0' 
                : direction === 'forward' 
                  ? 'absolute inset-0 opacity-0 -translate-x-full' 
                  : 'absolute inset-0 opacity-0 translate-x-full'
            )}
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Your city in Tunisia"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Experience */}
          <div 
            className={cn(
              'transition-all duration-300 ease-out',
              currentStep === 2 
                ? 'opacity-100 translate-x-0' 
                : currentStep < 2 
                  ? 'absolute inset-0 opacity-0 translate-x-full' 
                  : 'absolute inset-0 opacity-0 -translate-x-full'
            )}
          >
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentRole" className="text-sm font-medium">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => updateField('currentRole', e.target.value)}
                    placeholder="e.g. CNC Operator"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsExperience" className="text-sm font-medium">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={(e) => updateField('yearsExperience', e.target.value)}
                    placeholder="e.g. 3 years"
                    className="mt-1.5 min-h-[48px]"
                  />
                </div>
                <div>
                  <Label htmlFor="coverLetter" className="text-sm font-medium">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    value={formData.coverLetter}
                    onChange={(e) => updateField('coverLetter', e.target.value)}
                    placeholder="Tell us why you're interested in this position..."
                    className="mt-1.5 min-h-[140px] resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Documents */}
          <div 
            className={cn(
              'transition-all duration-300 ease-out',
              currentStep === 3 
                ? 'opacity-100 translate-x-0' 
                : currentStep < 3 
                  ? 'absolute inset-0 opacity-0 translate-x-full' 
                  : 'absolute inset-0 opacity-0 -translate-x-full'
            )}
          >
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Upload CV / Resume *</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'w-full mt-1.5 p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors min-h-[140px] touch-manipulation',
                      formData.cvFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-muted-foreground/30 hover:border-blue-300 hover:bg-blue-50/50'
                    )}
                  >
                    {formData.cvFile ? (
                      <>
                        <Check className="h-8 w-8 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{formData.cvFile.name}</span>
                        <span className="text-xs text-green-600">Tap to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Tap to upload your CV</span>
                        <span className="text-xs text-muted-foreground">PDF, DOC, or DOCX (max 5MB)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your CV will be reviewed by our HR team. Make sure it includes your contact information and relevant experience.
                </p>
              </div>
            )}
          </div>

          {/* Step 4: Review */}
          <div 
            className={cn(
              'transition-all duration-300 ease-out',
              currentStep === 4 
                ? 'opacity-100 translate-x-0' 
                : 'absolute inset-0 opacity-0 translate-x-full'
            )}
          >
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Please review your application before submitting.</p>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-sm font-medium">{formData.fullName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{formData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{formData.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="text-sm font-medium">{formData.city || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Role</p>
                      <p className="text-sm font-medium">{formData.currentRole || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-sm font-medium">{formData.yearsExperience || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CV</p>
                      <p className="text-sm font-medium">{formData.cvFile?.name || 'Not uploaded'}</p>
                    </div>
                  </CardContent>
                </Card>

                {formData.coverLetter && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-2">Cover Letter</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">{formData.coverLetter}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="max-w-lg mx-auto">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
