'use client'

import { Check } from 'lucide-react'

interface StepProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function StepProgressBar({ currentStep, totalSteps, stepLabels }: StepProgressBarProps) {
  const steps = stepLabels.length > 0 ? stepLabels : Array.from({ length: totalSteps }, (_, i) => `Etape ${i + 1}`)

  return (
    <div className="px-4 py-3 flex items-center gap-2">
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={
                `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-all duration-200 ` +
                (isCompleted
                  ? 'bg-v text-white'
                  : isCurrent
                    ? 'bg-vl text-v border-2 border-v'
                    : 'bg-card2 text-ink4 border border-[var(--border)]')
              }
            >
              {isCompleted ? <Check size={11} /> : stepNum}
            </div>
            {index < steps.length - 1 && (
              <div
                className={
                  `flex-1 h-[2px] rounded-full transition-all duration-300 ` +
                  (isCompleted ? 'bg-v' : 'bg-[var(--border)]')
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
