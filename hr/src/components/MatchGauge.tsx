interface MatchGaugeProps {
  score: number;
  size?: number;
}

const MatchGauge = ({ score, size = 44 }: MatchGaugeProps) => {
  const strokeWidth = size >= 72 ? 5 : 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const color =
    score >= 75
      ? "var(--ok)"
      : score >= 40
      ? "var(--violet)"
      : "var(--err)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--violet-l)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease-out 50ms' }}
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-medium" style={{ color }}>{score}</span>
    </div>
  );
};

export default MatchGauge;
