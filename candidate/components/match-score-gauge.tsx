'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface MatchScoreGaugeProps {
  score: number // 0 to 100
  size?: number
  className?: string
}

export function MatchScoreGauge({ score, size = 38, className }: MatchScoreGaugeProps) {
  const [mounted, setMounted] = useState(false)
  const isLarge = size >= 50
  const strokeWidth = isLarge ? 4 : 3
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
    if (value >= 40) return 'var(--v)'
    return 'var(--err)'
  }

  const fontSize = isLarge ? '14px' : '10px'

  return (
    <div className={cn("relative flex items-center justify-center select-none", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--vl)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
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
        <span 
          className="font-mono font-medium leading-none" 
          style={{ 
            color: getColor(score),
            fontSize: fontSize
          }}
        >
          {score}
        </span>
      </div>
    </div>
  )
}
