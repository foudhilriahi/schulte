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
  new: 'bg-gray-100 text-gray-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  interview: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const city = application.offer?.site || 'Zaghouan';
  const cityColor = city === 'Bouarada'
    ? 'bg-blue-600 text-white'
    : 'bg-teal-600 text-white'

  return (
    <Card 
      className="cursor-pointer active:scale-[0.98] transition-transform touch-manipulation"
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
