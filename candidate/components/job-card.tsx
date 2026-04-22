'use client'

import type { JobOffer } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, CheckCircle2, Users, Briefcase, TrendingUp, Banknote } from 'lucide-react'

interface JobCardProps {
  job: JobOffer
  hasApplied?: boolean
  onClick: () => void
}

export function JobCard({ job, hasApplied = false, onClick }: JobCardProps) {
  const cityColor = job.site === 'Bouarada'
    ? 'bg-boul border-[var(--bou-b)] text-primary'
    : 'bg-zagl border-[var(--zag-b)] text-ok'

  const contractColors: Record<string, string> = {
    CDI: 'bg-okl border-[var(--ok-b)] text-ok',
    CDD: 'bg-warnl border-[var(--warn-b)] text-warn',
    Stage: 'bg-card2 border-border text-ink3',
    Alternance: 'bg-card2 border-border text-ink3'
  }

  // Calculate days until deadline
  const daysUntilDeadline = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline > 0
  const isSoon = daysUntilDeadline <= 7 && daysUntilDeadline > 3

  return (
    <Card 
      className="group relative cursor-pointer touch-manipulation overflow-hidden border-border py-0 transition-[transform,box-shadow,border-color] duration-[220ms] ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[3px] hover:border-[var(--border2)] hover:shadow-hover"
      onClick={onClick}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${job.site === 'Bouarada' ? 'bg-boul' : 'bg-zagl'}`} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cityColor}>{job.site}</Badge>
              <Badge variant="secondary" className={contractColors[job.contractType]}>
                {job.contractType}
              </Badge>
              {hasApplied && (
                <Badge variant="outline" className="bg-okl border-[var(--ok-b)] text-ok pl-1 pr-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Candidature envoyee
                </Badge>
              )}
              {isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-[17px] tracking-[-0.02em] text-ink mb-2 line-clamp-2">
              {job.title}
            </h3>

            {/* Department */}
            {job.department && (
              <div className="flex items-center gap-1.5 text-xs text-ink3 mb-2">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{job.department}</span>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.requiredSkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-[9px] py-1 text-[11px] bg-card2 text-ink3 rounded-sm border border-border"
                  >
                    {skill}
                  </span>
                ))}
                {job.requiredSkills.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-card2 text-ink3 rounded-full border border-border">
                    +{job.requiredSkills.length - 3} autres
                  </span>
                )}
              </div>
            )}

            {/* Bottom Info */}
            <div className="flex items-center justify-between gap-3 text-xs text-ink3">
              <div className="flex items-center gap-3">
                {/* Seats */}
                {job.seats && job.seats > 1 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{job.seats} postes</span>
                  </div>
                )}
                
                {/* Experience */}
                {job.experienceYears !== undefined && job.experienceYears > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{job.experienceYears}+ ans</span>
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div className={`flex items-center gap-1 ${isUrgent ? 'text-err font-semibold' : isSoon ? 'text-warn font-medium' : 'text-ink4'}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {daysUntilDeadline <= 0 
                    ? 'Expiree' 
                    : daysUntilDeadline === 1 
                    ? 'Demain' 
                    : daysUntilDeadline <= 7 
                    ? `${daysUntilDeadline} jours restants`
                    : new Date(job.deadline).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })
                  }
                </span>
              </div>
            </div>

            {/* Salary Range (if shown) */}
            {job.showSalary && job.salaryRange && (
              <div className="mt-2 pt-2 border-t border-border">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ok">
                  <Banknote className="h-3.5 w-3.5" />
                  {job.salaryRange}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
