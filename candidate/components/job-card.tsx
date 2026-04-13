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
    ? 'bg-bou/10 border-bou/25 text-bou'
    : 'bg-zag/10 border-zag/25 text-zag'

  const contractColors: Record<string, string> = {
    CDI: 'bg-success/10 border-success/30 text-success',
    CDD: 'bg-warning/10 border-warning/30 text-warning',
    Stage: 'bg-secondary border-input text-muted-foreground',
    Alternance: 'bg-secondary border-input text-muted-foreground'
  }

  // Calculate days until deadline
  const daysUntilDeadline = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline > 0

  return (
    <Card 
      className="cursor-pointer transition-colors touch-manipulation hover:bg-s2 hover:border-primary/40"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cityColor}>{job.site}</Badge>
              <Badge variant="secondary" className={contractColors[job.contractType]}>
                {job.contractType}
              </Badge>
              {hasApplied && (
                <Badge variant="outline" className="border-success/30 text-success gap-1 pl-1 pr-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Applied
                </Badge>
              )}
              {isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2">
              {job.title}
            </h3>

            {/* Department */}
            {job.department && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
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
                    className="px-2 py-0.5 text-xs bg-s3 text-muted-foreground rounded-sm border border-border"
                  >
                    {skill}
                  </span>
                ))}
                {job.requiredSkills.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    +{job.requiredSkills.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Bottom Info */}
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {/* Seats */}
                {job.seats && job.seats > 1 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{job.seats} positions</span>
                  </div>
                )}
                
                {/* Experience */}
                {job.experienceYears !== undefined && job.experienceYears > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{job.experienceYears}+ years</span>
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div className={`flex items-center gap-1 ${isUrgent ? 'text-err font-medium' : ''}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {daysUntilDeadline <= 0 
                    ? 'Expired' 
                    : daysUntilDeadline === 1 
                    ? 'Tomorrow' 
                    : daysUntilDeadline <= 7 
                    ? `${daysUntilDeadline} days left`
                    : new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  }
                </span>
              </div>
            </div>

            {/* Salary Range (if shown) */}
            {job.showSalary && job.salaryRange && (
              <div className="mt-2 pt-2 border-t border-border">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
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
