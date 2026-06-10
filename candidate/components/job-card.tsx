'use client'

import type { JobOffer } from '@/lib/types'
import { MatchScoreGauge } from './match-score-gauge'

interface JobCardProps {
  job: JobOffer
  hasApplied?: boolean
  matchScore?: number | null
  onClick: () => void
  index?: number
}

export function SiteBadge({ site }: { site: 'Bouarada' | 'Zaghouan' }) {
  const badgeClasses = site === 'Bouarada'
    ? 'bg-boul border-boub text-[#1A5FCC]'
    : 'bg-zagl border-zagb text-[#0A8A5A]'
  
  return (
    <span className={`font-mono text-[10px] font-medium px-2.5 py-[3px] rounded-full border border-solid ${badgeClasses}`}>
      {site}
    </span>
  )
}

export function ContractBadge({ type }: { type: string }) {
  return (
    <span className="bg-card2 border border-solid border-border text-ink3 font-sans text-[10px] font-semibold px-2.5 py-[3px] rounded-full">
      {type}
    </span>
  )
}

export function SkillChip({ label }: { label: string }) {
  return (
    <span className="bg-card2 border border-solid border-border text-ink3 font-sans text-[11px] px-2 py-[2px] rounded-[4px]">
      {label}
    </span>
  )
}

export function DeadlineBadge({ date }: { date: string }) {
  const diffTime = new Date(date).getTime() - new Date().getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let colorClass = 'text-ink4'
  if (diffDays <= 3) {
    colorClass = 'text-err font-medium'
  } else if (diffDays <= 7) {
    colorClass = 'text-warn'
  }
  
  const text = diffDays <= 0
    ? 'Expiré'
    : diffDays === 1
    ? 'Demain'
    : diffDays <= 7
    ? `${diffDays} jours restants`
    : new Date(date).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })

  return (
    <span className={`font-mono text-[10px] ${colorClass}`}>
      {text}
    </span>
  )
}

export function JobCard({ job, hasApplied = false, matchScore = null, onClick, index = 0 }: JobCardProps) {
  const { site, contractType, title, requiredSkills = [], deadline } = job

  return (
    <div
      onClick={onClick}
      className="relative bg-card border border-solid border-border rounded-xl overflow-hidden active:scale-[0.98] transition-transform duration-[120ms] cursor-pointer shadow-[0_1px_3px_rgba(15,13,28,0.05)] select-none touch-manipulation animate-slide-up-fade"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Site identity bar — left edge, always visible */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] ${site === 'Bouarada' ? 'bg-bou' : 'bg-zag'}`} />

      <div className="pl-4 pr-4 pt-3.5 pb-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <SiteBadge site={site} />
          <ContractBadge type={contractType} />
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-ink mb-2 leading-snug">
          {title}
        </h3>

        {/* Skills */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {requiredSkills.slice(0, 3).map((s) => (
              <SkillChip key={s} label={s} />
            ))}
            {requiredSkills.length > 3 && (
              <span className="text-[10px] text-ink4 self-center font-sans">
                +{requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <DeadlineBadge date={deadline} />
          {hasApplied && matchScore !== undefined && matchScore !== null && (
            <MatchScoreGauge score={matchScore} size={38} />
          )}
        </div>
      </div>
    </div>
  )
}

