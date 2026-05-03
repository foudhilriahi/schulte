'use client'

import type { Application } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { ApplicationStatusPill } from './application-status-pill'

interface ApplicationCardProps {
  application: Application
  onClick: () => void
}
export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const city = application.offer?.site || 'Zaghouan';
  const cityColor = city === 'Bouarada'
    ? 'bg-boul border-[var(--bou-b)] text-primary'
    : 'bg-zagl border-[var(--zag-b)] text-ok'
  const appliedAt = application.appliedAt || application.createdAt
  const sentDate = new Date(appliedAt)
  const sentDateLabel = !isNaN(sentDate.getTime())
    ? sentDate.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'date indisponible'

  return (
    <Card 
      className="cursor-pointer transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] touch-manipulation hover:-translate-y-[2px] hover:border-[var(--border2)] hover:shadow-hover"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cityColor}>{city}</Badge>
              <ApplicationStatusPill status={application.status} />
            </div>
            <h3 className="font-bold text-[13px] tracking-[-0.01em] text-ink line-clamp-1">
              {application.offer?.title || 'Offre inconnue'}
            </h3>
            <p className="text-[10px] font-mono text-ink4 mt-1">
              Candidature envoyee le {sentDateLabel}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-ink4 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
