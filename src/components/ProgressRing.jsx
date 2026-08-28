export function ProgressRing({ value, max, size = 64, strokeWidth = 6, colorClass = 'text-violet-500', label }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-100 dark:stroke-gray-800"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all`}
          stroke="currentColor"
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
        {label ?? `${Math.round(pct * 100)}%`}
      </div>
    </div>
  )
}
