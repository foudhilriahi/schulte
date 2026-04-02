interface MatchGaugeProps {
  score: number;
  size?: number;
}

const MatchGauge = ({ score, size = 44 }: MatchGaugeProps) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const color =
    score >= 75
      ? "hsl(var(--success))"
      : score >= 50
      ? "hsl(var(--warning))"
      : "hsl(var(--destructive))";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={3}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-gauge"
          style={{ "--gauge-offset": offset } as React.CSSProperties}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">{score}%</span>
    </div>
  );
};

export default MatchGauge;
