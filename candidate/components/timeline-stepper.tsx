'use client'

import { useState } from 'react'
import { Check, MapPin, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

interface TimelineStepperProps {
  application: Application
}

const steps: { status: ApplicationStatus; label: string }[] = [
  { status: 'new', label: 'Applied' },
  { status: 'reviewing', label: 'Under Review' },
  { status: 'interview', label: 'Interview Scheduled' },
  { status: 'accepted', label: 'Accepted' },
]

function getStepState(stepStatus: ApplicationStatus, currentStatus: ApplicationStatus) {
  const stepOrder: ApplicationStatus[] = ['new', 'reviewing', 'interview', 'accepted']
  const stepIndex = stepOrder.indexOf(stepStatus)
  const currentIndex = stepOrder.indexOf(currentStatus)

  if (currentStatus === 'rejected') {
    if (stepStatus === 'new') return 'completed'
    return 'pending'
  }
  
  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'Date not available'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Date error'
  }
}

function getCountdown(targetDate: string | undefined) {
  if (!targetDate) return 'Date not set'
  
  try {
    const now = new Date()
    const target = new Date(targetDate)
    
    if (isNaN(target.getTime())) return 'Invalid date'
    
    const diff = target.getTime() - now.getTime()
    
    if (diff <= 0) return 'Today'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  } catch (error) {
    return 'Date error'
  }
}

export function TimelineStepper({ application }: TimelineStepperProps) {
  const [expandedInterview, setExpandedInterview] = useState(application.status === 'interview')
  const isRejected = application.status === 'rejected'

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
      
      {steps.map((step, index) => {
        const state = getStepState(step.status, application.status)
        const isInterview = step.status === 'interview' && application.interview
        const showInterviewCard = isInterview && (state === 'current' || state === 'completed')

        let timestamp: string | undefined
        if (step.status === 'new') timestamp = application.createdAt
        if (state === 'current' || state === 'completed') {
          if (step.status !== 'new') timestamp = application.updatedAt
        }

        return (
          <div key={step.status} className={cn('relative pb-6', index === steps.length - 1 && 'pb-0')}>
            <div className="absolute -left-6 flex items-center justify-center">
              {state === 'completed' ? (
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              ) : state === 'current' ? (
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center animate-pulse-dot">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>

            <div className="ml-4">
              <div 
                className={cn(
                  'flex items-center justify-between min-h-[44px]',
                  isInterview && showInterviewCard && 'cursor-pointer touch-manipulation'
                )}
                onClick={() => isInterview && showInterviewCard && setExpandedInterview(!expandedInterview)}
              >
                <div>
                  <p className={cn(
                    'font-medium text-sm',
                    state === 'completed' && 'text-green-600',
                    state === 'current' && 'text-blue-600',
                    state === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                  {timestamp && (state === 'completed' || state === 'current') && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(timestamp)}
                    </p>
                  )}
                </div>
                {isInterview && showInterviewCard && (
                  expandedInterview ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )
                )}
              </div>

              {isInterview && showInterviewCard && expandedInterview && application.interview && (
                <Card className="mt-3 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {application.interview.scheduledAt 
                            ? new Date(application.interview.scheduledAt).toLocaleDateString('en-GB', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : application.interview.date && application.interview.time
                              ? `${new Date(application.interview.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at ${application.interview.time}`
                              : 'Date/time not set'
                          }
                        </span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {application.interview.scheduledAt 
                          ? getCountdown(application.interview.scheduledAt)
                          : application.interview.date && application.interview.time
                            ? getCountdown(`${application.interview.date}T${application.interview.time}`)
                            : 'No date'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{application.interview.location || 'Location not set'}</span>
                    </div>

                    {application.interview.prepNotes && application.interview.prepNotes.length > 0 && (
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Prep Notes</span>
                        </div>
                        <ul className="space-y-1.5 pl-6">
                          {application.interview.prepNotes.map((note, i) => (
                            <li key={i} className="text-xs text-muted-foreground list-disc">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )
      })}

      {isRejected && (
        <div className="relative pb-0 mt-2">
          <div className="absolute -left-6 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✕</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="font-medium text-sm text-red-600">Rejected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(application.updatedAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
