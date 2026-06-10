'use client'

import { useState } from 'react'
import { Check, MapPin, Clock, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/lib/types'

interface TimelineStepperProps {
  application: Application
}

const steps: { status: ApplicationStatus; label: string }[] = [
  { status: 'new', label: 'Candidature envoyée' },
  { status: 'reviewing', label: 'En cours d\'examen' },
  { status: 'interview', label: 'Entretien planifié' },
  { status: 'accepted', label: 'Candidature retenue' },
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
  if (!targetDate) return 'Date non définie'
  
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

const interviewOutcomeLabel: Record<'pass' | 'fail' | 'no_show', string> = {
  pass: 'Entretien validé',
  fail: 'Entretien non retenu',
  no_show: 'Absent signalé',
}

export function TimelineStepper({ application }: TimelineStepperProps) {
  const [expandedInterview, setExpandedInterview] = useState(application.status === 'interview')
  const prepNotes = Array.isArray(application.interview?.prepNotes)
    ? application.interview?.prepNotes
    : []
  const notesForCandidate =
    typeof application.interview?.notesForCandidate === 'string'
      ? application.interview?.notesForCandidate.trim()
      : ''

  return (
    <div className="space-y-0 select-none font-sans">
      {steps.map((step, index) => {
        const state = getStepState(step.status, application.status)
        const isInterview = step.status === 'interview' && application.interview
        const showInterviewCard = isInterview && (state === 'current' || state === 'completed')
        const isLast = index === steps.length - 1

        let timestamp: string | undefined
        if (step.status === 'new') timestamp = application.createdAt
        if (state === 'current' || state === 'completed') {
          if (step.status !== 'new') timestamp = application.updatedAt
        }

        return (
          <div key={step.status} className="flex gap-3.5">
            <div className="flex flex-col items-center w-5 flex-shrink-0">
              {state === 'completed' ? (
                <div className="w-5 h-5 rounded-full bg-v flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="h-[10px] w-[10px] text-white" strokeWidth={3} />
                </div>
              ) : state === 'current' ? (
                <div className="w-5 h-5 rounded-full border-2 border-v bg-card flex-shrink-0 z-10 animate-npulse" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[var(--border2)] bg-card2 flex-shrink-0 z-10" />
              )}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 w-[2px] rounded-full',
                    state === 'completed' ? 'bg-v/40' : 'bg-[var(--border)]'
                  )}
                />
              )}
            </div>

            <div className={cn('pb-6 flex-1 min-w-0', isLast && 'pb-0')}>
              <div
                className={cn(
                  'flex items-center justify-between min-h-[32px]',
                  isInterview && showInterviewCard && 'cursor-pointer touch-manipulation'
                )}
                onClick={() => isInterview && showInterviewCard && setExpandedInterview(!expandedInterview)}
              >
                <div>
                  <p
                    className={cn(
                      'text-[13px] font-semibold',
                      state === 'pending' ? 'text-ink4 font-normal' : 'text-ink'
                    )}
                  >
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
                    <ChevronUp className="h-4 w-4 text-ink3" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink3" />
                  )
                )}
              </div>

              {isInterview && showInterviewCard && expandedInterview && application.interview && (
                <div className="bg-vl border-[1.5px] border-[var(--vb)] rounded-xl p-3.5 mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Calendar className="h-[14px] w-[14px] text-v flex-shrink-0" />
                    <span className="font-semibold text-ink">
                      {application.interview.scheduledAt
                        ? new Date(application.interview.scheduledAt).toLocaleDateString('fr-TN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : application.interview.date
                          ? new Date(application.interview.date).toLocaleDateString('fr-TN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Date non définie'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-ink2">
                    <Clock className="h-[13px] w-[13px] text-v flex-shrink-0" />
                    <span>
                      {application.interview.scheduledAt
                        ? new Date(application.interview.scheduledAt).toLocaleTimeString('fr-TN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : application.interview.time || 'Heure non définie'}
                    </span>
                    <span className="font-mono text-[10px] text-ink4">
                      {application.interview.scheduledAt
                        ? getCountdown(application.interview.scheduledAt)
                        : application.interview.date && application.interview.time
                          ? getCountdown(`${application.interview.date}T${application.interview.time}`)
                          : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-ink2">
                    <MapPin className="h-[13px] w-[13px] text-v flex-shrink-0" />
                    <span>{application.interview.location || 'Lieu non défini'}</span>
                  </div>

                  {notesForCandidate && (
                    <div className="flex items-start gap-2 text-[12px] text-ink2 pt-2 border-t border-[var(--vb)]">
                      <FileText className="h-[13px] w-[13px] text-v flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed whitespace-pre-wrap">{notesForCandidate}</span>
                    </div>
                  )}

                  {prepNotes.length > 0 && (
                    <div className={cn('pt-2', !notesForCandidate && 'border-t border-[var(--vb)]')}>
                      <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-v/70 mb-1.5">
                        Notes de préparation
                      </p>
                      <ul className="space-y-1 pl-4">
                        {prepNotes.map((note, i) => (
                          <li key={i} className="text-[11px] text-ink3 list-disc leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {application.interview.outcome && (
                    <div className="pt-2 border-t border-[var(--vb)]">
                      <p className="text-[11px] font-semibold text-ink2">
                        {interviewOutcomeLabel[application.interview.outcome]}
                      </p>
                      {application.interview.outcome === 'no_show' && (
                        <p className="mt-1 text-[10px] text-ink4">
                          Nombre d'absences enregistrées : {application.interview.noShowCount || 1}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

