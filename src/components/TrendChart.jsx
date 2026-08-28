/** Simple hand-rolled bar chart: one bar per entry from getTrendData(). */
export function TrendChart({ data, height = 56, barClassName = 'bg-violet-500', showLabels = false }) {
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d) => (
          <div key={d.date} className="flex-1 h-full flex items-end">
            <div
              className={`w-full rounded-sm ${d.pct === null ? 'bg-gray-100 dark:bg-gray-800' : barClassName}`}
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
