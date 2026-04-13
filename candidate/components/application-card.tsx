'use client'

import type { Application } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

interface ApplicationCardProps {
  application: Application
  onClick: () => void
}

const statusLabels: Record<string, string> = {
  new: 'Applied',
  reviewing: 'Under Review',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected'
}

const statusColors: Record<string, string> = {
  new: 'bg-secondary text-muted-foreground border-input',
  reviewing: 'bg-warning/10 text-warning border-warning/30',
  interview: 'bg-primary/15 text-primary border-primary/30',
  accepted: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-destructive/10 text-destructive border-destructive/30'
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const city = application.offer?.site || 'Zaghouan';
  const cityColor = city === 'Bouarada'
    ? 'bg-bou/10 border-bou/25 text-bou'
    : 'bg-zag/10 border-zag/25 text-zag'

  return (
    <Card 
      className="cursor-pointer transition-colors touch-manipulation hover:bg-s2 hover:border-primary/40"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cityColor}>{city}</Badge>
              <Badge variant="secondary" className={statusColors[application.status] || statusColors.new}>
                {statusLabels[application.status] || 'Unknown'}
              </Badge>
            </div>
            <h3 className="font-semibold text-base text-foreground line-clamp-1">
              {application.offer?.title || 'Unknown Job'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Applied {new Date(application.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
