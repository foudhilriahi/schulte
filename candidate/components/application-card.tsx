'use client'

import type { Application } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import { ApplicationStatusPill } from './application-status-pill'
import { SiteBadge } from './job-card'
import { MatchScoreGauge } from './match-score-gauge'

interface ApplicationCardProps {
  application: Application
  onClick: () => void
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const city = application.offer?.site || 'Zaghouan'
  const appliedAt = application.appliedAt || application.createdAt
  const sentDate = new Date(appliedAt)
  const sentDateLabel = !isNaN(sentDate.getTime())
    ? sentDate.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'date indisponible'

  return (
    <div
      onClick={onClick}
      className="relative bg-card border border-solid border-border rounded-xl overflow-hidden active:scale-[0.98] transition-transform duration-[120ms] cursor-pointer shadow-[0_1px_3px_rgba(15,13,28,0.05)] select-none touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Site identity bar — left edge, always visible */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] ${city === 'Bouarada' ? 'bg-bou' : 'bg-zag'}`} />

      <div className="pl-4 pr-4 pt-3.5 pb-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <SiteBadge site={city} />
          <ApplicationStatusPill status={application.status} />
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-ink mb-2 leading-snug truncate">
          {application.offer?.title || 'Offre inconnue'}
        </h3>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink4">
            Envoyé le {sentDateLabel}
          </span>
          <div className="flex items-center gap-2">
            {application.aiScore !== undefined && application.aiScore !== null && (
              <MatchScoreGauge score={application.aiScore} size={38} />
            )}
            <ChevronRight size={14} className="text-ink4 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

