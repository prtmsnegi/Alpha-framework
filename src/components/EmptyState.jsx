export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
