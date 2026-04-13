'use client'

import { cn } from '@/lib/utils'

interface StepProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function StepProgressBar({ currentStep, totalSteps, stepLabels }: StepProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div 
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep) / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between">
        {stepLabels.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep
          
          return (
            <div 
              key={label}
              className={cn(
                'flex flex-col items-center',
                index === 0 && 'items-start',
                index === stepLabels.length - 1 && 'items-end'
              )}
            >
              <div 
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {stepNum}
              </div>
              <span className={cn(
                'text-[10px] mt-1.5 font-medium',
                (isCompleted || isCurrent) ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
