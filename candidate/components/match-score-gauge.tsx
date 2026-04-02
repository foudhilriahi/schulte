'use client'

import { motion } from 'framer-motion'
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
    if (value >= 70) return '#10b981' // emerald-500
    if (value >= 40) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
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
            stroke="#f1f5f9" // slate-100
            strokeWidth={strokeWidth}
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
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
