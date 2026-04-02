'use client'

import { cn } from '@/lib/utils'

export type FilterType = 'all' | 'Bouarada' | 'Zaghouan' | 'CDI' | 'CDD' | 'Stage'

interface FilterChipsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { value: FilterType; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Bouarada', label: 'Bouarada', color: 'blue' },
  { value: 'Zaghouan', label: 'Zaghouan', color: 'teal' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'Stage', label: 'Stage' }
]

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value
        const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] flex items-center touch-manipulation'
        
        let colorClasses = ''
        if (isActive) {
          if (filter.color === 'blue') {
            colorClasses = 'bg-blue-600 text-white'
          } else if (filter.color === 'teal') {
            colorClasses = 'bg-teal-600 text-white'
          } else {
            colorClasses = 'bg-foreground text-background'
          }
        } else {
          colorClasses = 'bg-muted text-muted-foreground'
        }

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(baseClasses, colorClasses)}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
