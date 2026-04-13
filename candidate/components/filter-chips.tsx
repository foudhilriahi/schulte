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
        const baseClasses = 'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors duration-150 min-h-[36px] flex items-center touch-manipulation'
        
        let colorClasses = ''
        if (isActive) {
          if (filter.color === 'blue') {
            colorClasses = 'bg-bou/10 border-bou/25 text-bou'
          } else if (filter.color === 'teal') {
            colorClasses = 'bg-zag/10 border-zag/25 text-zag'
          } else {
            colorClasses = 'bg-acc/12 border-acc/30 text-acch'
          }
        } else {
          colorClasses = 'bg-s2 border-input text-muted-foreground'
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
