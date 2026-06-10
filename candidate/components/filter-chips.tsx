'use client'

import { cn } from '@/lib/utils'

export type FilterType = 'all' | 'Bouarada' | 'Zaghouan' | 'CDI' | 'CDD' | 'Stage' | 'Alternance'

interface FilterChipsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const locationFilters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'Bouarada', label: 'Bouarada' },
  { value: 'Zaghouan', label: 'Zaghouan' }
]

const contractFilters: { value: FilterType; label: string }[] = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'Stage', label: 'Stage' },
  { value: 'Alternance', label: 'Alternance' }
]

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  const renderPill = (value: FilterType, label: string) => {
    const isActive = activeFilter === value
    return (
      <button
        key={value}
        onClick={() => onFilterChange(value)}
        data-active={isActive ? "true" : "false"}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-solid transition-all duration-100 whitespace-nowrap border-border bg-card text-ink3 active:scale-[0.96] data-[active=true]:bg-v data-[active=true]:border-v data-[active=true]:text-white select-none touch-manipulation cursor-pointer"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {label}
      </button>
    )
  }

  return (
    <div 
      className="flex gap-2 items-center overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 select-none touch-manipulation" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}
    >
      {/* Locations */}
      <div className="flex gap-2">
        {locationFilters.map(f => renderPill(f.value, f.label))}
      </div>
      
      {/* Slight gap between groups */}
      <div className="w-1 flex-shrink-0" />

      {/* Contracts */}
      <div className="flex gap-2">
        {contractFilters.map(f => renderPill(f.value, f.label))}
      </div>
    </div>
  )
}

