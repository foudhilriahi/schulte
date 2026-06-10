'use client'

import { ArrowLeft } from 'lucide-react'
import { TimelineStepper } from '@/components/timeline-stepper'
import type { Application } from '@/lib/types'
import { ApplicationStatusPill } from '@/components/application-status-pill'
import { SiteBadge } from '@/components/job-card'
import { MatchScoreGauge } from '@/components/match-score-gauge'

interface ApplicationDetailScreenProps {
  application: Application
  onBack: () => void
}

export function ApplicationDetailScreen({ application, onBack }: ApplicationDetailScreenProps) {
  const city = application.offer?.site || 'Zaghouan'

  // Parse match analysis if available
  let aiAnalysis = null
  try {
    if (application.aiAnalysis && typeof application.aiAnalysis === 'string') {
      aiAnalysis = JSON.parse(application.aiAnalysis)
    } else if (application.aiAnalysis && typeof application.aiAnalysis === 'object') {
      aiAnalysis = application.aiAnalysis
    }
  } catch (e) {
    // Ignore parsing errors
  }

  const aiTips = Array.isArray(aiAnalysis?.tipsForCandidate)
    ? aiAnalysis.tipsForCandidate
    : Array.isArray(aiAnalysis?.tips_for_candidate)
      ? aiAnalysis.tips_for_candidate
      : Array.isArray(aiAnalysis?.mergedTips)
        ? aiAnalysis.mergedTips
        : []

  const hasAITips = aiTips.length > 0
  const hasAIScore = typeof application.aiScore === 'number'
  const isAccepted = application.status === 'accepted'
  const isRejected = application.status === 'rejected'

  const appliedAtRaw = application.appliedAt || application.createdAt
  const appliedDate = new Date(appliedAtRaw)
  const appliedDateLabel = !isNaN(appliedDate.getTime())
    ? appliedDate.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date non disponible'

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px] pb-[calc(58px+env(safe-area-inset-bottom))]">
      {/* Premium Back Header */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-card border-b border-solid border-border px-4 flex items-center justify-between z-50 select-none">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink3 hover:text-ink active:scale-95 transition-transform cursor-pointer p-1 -ml-1 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">Retour</span>
        </button>

        <span className="font-sans font-semibold text-[13px] text-ink truncate max-w-[200px]">
          Détails candidature
        </span>

        <div className="w-12 flex justify-end">
          <SiteBadge site={city} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 space-y-5 select-none animate-slide-up-fade">
        {/* Title Block */}
        <div>
          <div className="flex gap-2 items-center mb-3">
            <SiteBadge site={city} />
            <ApplicationStatusPill status={application.status} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink leading-tight">
            {application.offer?.title || 'Candidature'}
          </h1>
          <p className="text-xs text-ink4 mt-1 font-mono">
            Envoyée le {appliedDateLabel}
          </p>
        </div>

        {isAccepted && (
          <div className="bg-okl border-t-2 border-ok rounded-xl p-4">
            <p className="text-[14px] font-semibold text-[#0A8A5A]">
              Félicitations — votre candidature a été retenue.
            </p>
          </div>
        )}

        {isRejected && (
          <div className="bg-card2 border border-solid border-border rounded-xl p-4">
            <p className="text-[13px] text-ink3 leading-relaxed">
              Votre candidature a été examinée. Nous vous remercions de l'intérêt porté
              à Schulte Tunisia.
            </p>
          </div>
        )}

        {/* Stepper tracking progress */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink4 mb-2 select-none">
            Suivi de votre dossier
          </p>
          <div className="bg-card border border-solid border-border rounded-xl p-4">
            <TimelineStepper application={application} />
          </div>
        </div>

        {/* Match Section */}
        {(hasAIScore || hasAITips) && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink4 mb-2 select-none">
              Correspondance
            </p>
            <div className="bg-vl border border-[var(--vb)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                {hasAIScore && <MatchScoreGauge score={application.aiScore as number} size={52} />}
                <div>
                  <p className="text-[13px] font-semibold text-ink">Correspondance au poste</p>
                  <p className="text-[11px] text-ink3 mt-0.5">Basé sur votre CV soumis</p>
                </div>
              </div>

              {hasAITips && (
                <div className="space-y-2 pt-3 border-t border-[var(--vb)]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-v/70">
                    Conseils pour améliorer
                  </p>
                  {aiTips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-v flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-semibold text-white">{index + 1}</span>
                      </div>
                      <p className="text-[12px] text-ink2 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
