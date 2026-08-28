export const toDateStr = (date = new Date()) => {
  const d = new Date(date)
  const offsetMs = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offsetMs).toISOString().split('T')[0]
}

export const todayStr = () => toDateStr(new Date())

export const formatDisplayDate = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export const addDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}
