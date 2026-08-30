// Achieved (full target hit) / partial / missed (nothing done) / no-data, so a scan of
// the chart reads as a pattern of good/bad days rather than a blur of similar heights.
function barColorClass(pct) {
  if (pct === null) return 'bg-gray-100 dark:bg-gray-800'
  if (pct >= 1) return 'bg-emerald-500'
  if (pct > 0) return 'bg-amber-400'
  return 'bg-red-400'
}

const COUNT_LABEL_HEIGHT = 14

/** Simple hand-rolled bar chart: one bar per entry from getTrendData(). */
export function TrendChart({ data, height = 56, showLabels = false, showCounts = false }) {
  const chartHeight = showCounts ? height + COUNT_LABEL_HEIGHT : height
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height: chartHeight }}>
        {data.map((d) => (
          <div key={d.date} className="flex-1 h-full flex flex-col items-center justify-end">
            {showCounts && (
              <p className="text-[9px] leading-none text-gray-400 dark:text-gray-500 mb-0.5 tabular-nums">
                {d.pct === null ? '' : `${d.done}/${d.total}`}
              </p>
            )}
            <div
              className={`w-full rounded-sm ${barColorClass(d.pct)}`}
              style={{ height: d.pct === null ? 4 : Math.max(4, d.pct * height) }}
              title={d.pct === null ? 'No tasks yet' : `${Math.round(d.pct * 100)}% (${d.done}/${d.total})`}
            />
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-1 mt-1">
          {data.map((d) => (
            <p key={d.date} className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500">
              {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
