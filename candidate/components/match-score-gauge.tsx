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
  const strokeWidth = size >= 72 ? 5 : 3.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 50)
    return () => window.clearTimeout(timer)
  }, [])

  const strokeDashoffset = mounted 
    ? circumference - (score / 100) * circumference 
    : circumference

  const getColor = (value: number) => {
    if (value >= 75) return 'var(--ok)'
    if (value >= 40) return 'var(--violet)'
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
            stroke="var(--violet-l)"
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
              transition: mounted ? 'stroke-dashoffset 600ms ease-out' : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-medium" style={{ color: getColor(score) }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-ink4 mt-0.5 font-mono tracking-[0.04em]">/100</span>
    </div>
  )
}
