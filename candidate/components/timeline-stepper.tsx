'use client'

import { useState } from 'react'
import { Check, MapPin, Clock, FileText, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

interface TimelineStepperProps {
  application: Application
}

const steps: { status: ApplicationStatus; label: string }[] = [
  { status: 'new', label: 'Candidature envoyee' },
  { status: 'reviewing', label: 'En examen' },
  { status: 'interview', label: 'Entretien planifie' },
  { status: 'accepted', label: 'Acceptee' },
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
  if (!dateString) return 'Date indisponible'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Date invalide'
    
    return date.toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Erreur de date'
  }
}

function getCountdown(targetDate: string | undefined) {
  if (!targetDate) return 'Date non definie'
  
  try {
    const now = new Date()
    const target = new Date(targetDate)
    
    if (isNaN(target.getTime())) return 'Date invalide'
    
    const diff = target.getTime() - now.getTime()
    
    if (diff <= 0) return "Aujourd'hui"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}j ${hours}h restantes`
    return `${hours}h restantes`
  } catch (error) {
    return 'Erreur de date'
  }
}

export function TimelineStepper({ application }: TimelineStepperProps) {
  const [expandedInterview, setExpandedInterview] = useState(application.status === 'interview')
  const isRejected = application.status === 'rejected'

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-sm bg-border" />
      
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
                <div className="h-[18px] w-[18px] rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                </div>
              ) : state === 'current' ? (
                <div className="relative h-[18px] w-[18px] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-timeline-ring" />
                  <div className="h-[18px] w-[18px] rounded-full bg-card border-2 border-primary" />
                </div>
              ) : (
                <div className="h-[18px] w-[18px] rounded-full border-2 border-border2 bg-card2" />
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
                    'text-[13px] font-bold',
                    state === 'completed' && 'text-ink',
                    state === 'current' && 'text-ink',
                    state === 'pending' && 'text-ink4 font-normal'
                  )}>
                    {step.label}
                  </p>
                  {timestamp && (state === 'completed' || state === 'current') && (
                    <p className="text-[10px] text-ink4 mt-0.5 font-mono">
                      {formatDate(timestamp)}
                    </p>
                  )}
                </div>
                {isInterview && showInterviewCard && (
                  expandedInterview ? (
                    <ChevronUp className="h-5 w-5 text-ink4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-ink4" />
                  )
                )}
              </div>

              {isInterview && showInterviewCard && expandedInterview && application.interview && (
                <Card className="mt-3 border-[1.5px] border-[var(--violet-b)] bg-violetl py-0">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-violet" />
                        <span className="font-bold text-ink">
                          {application.interview.scheduledAt 
                            ? new Date(application.interview.scheduledAt).toLocaleDateString('fr-TN', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : application.interview.date && application.interview.time
                              ? `${new Date(application.interview.date).toLocaleDateString('fr-TN', { weekday: 'short', day: 'numeric', month: 'short' })} a ${application.interview.time}`
                              : 'Date/heure non definie'
                          }
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-violet bg-violetl border border-[var(--violet-b)] px-2 py-1 rounded-full">
                        {application.interview.scheduledAt 
                          ? getCountdown(application.interview.scheduledAt)
                          : application.interview.date && application.interview.time
                            ? getCountdown(`${application.interview.date}T${application.interview.time}`)
                            : 'Aucune date'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-violet mt-0.5 flex-shrink-0" />
                      <span className="text-ink2">{application.interview.location || 'Lieu non defini'}</span>
                    </div>

                    {application.interview.prepNotes && application.interview.prepNotes.length > 0 && (
                      <div className="pt-2 border-t border-[var(--violet-b)]">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <FileText className="h-4 w-4 text-violet" />
                          <span className="font-semibold text-ink2">Notes de preparation</span>
                        </div>
                        <ul className="space-y-1.5 pl-6">
                          {application.interview.prepNotes.map((note, i) => (
                            <li key={i} className="text-xs text-ink3 list-disc">
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
            <div className="h-[18px] w-[18px] rounded-full bg-err flex items-center justify-center">
              <X className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="ml-4">
            <p className="font-bold text-[13px] text-ink3">Rejetee</p>
            <p className="text-[10px] text-ink4 mt-0.5 font-mono">
              {formatDate(application.updatedAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
