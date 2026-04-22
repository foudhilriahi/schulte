'use client'

import { cn } from '@/lib/utils'

export type FilterType = 'all' | 'Bouarada' | 'Zaghouan' | 'CDI' | 'CDD' | 'Stage'

interface FilterChipsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { value: FilterType; label: string; color?: string }[] = [
  { value: 'all', label: 'Tous' },
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
        const baseClasses = 'px-4 py-[7px] rounded-full text-xs font-semibold whitespace-nowrap border-[1.5px] transition-all duration-150 min-h-[36px] flex items-center touch-manipulation'
        
        let colorClasses = ''
        if (isActive) {
          colorClasses = 'bg-primary border-primary text-primary-foreground'
        } else {
          colorClasses = 'bg-card border-border text-ink3 hover:border-[var(--violet-b)] hover:text-violet hover:bg-violetl'
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
