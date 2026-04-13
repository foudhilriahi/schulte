'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface MatchScoreGaugeProps {
  score: number // 0 to 100
  size?: number
  className?: string
}

export function MatchScoreGauge({ score, size = 48, className }: MatchScoreGaugeProps) {
  const [mounted, setMounted] = useState(false)
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const strokeDashoffset = mounted 
    ? circumference - (score / 100) * circumference 
    : circumference

  const getColor = (value: number) => {
    if (value >= 70) return 'var(--ok)'
    if (value >= 40) return 'var(--warn)'
    return 'var(--err)'
  }

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--s3)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            style={{
              strokeDashoffset,
              transition: mounted ? 'stroke-dashoffset 900ms ease-out' : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">{score}%</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Match</span>
    </div>
  )
}
