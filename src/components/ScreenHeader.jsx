import { ArrowLeft } from 'lucide-react'

export function ScreenHeader({ onBack, title, rightAction }) {
  return (
    <div className="flex items-center gap-2 pt-6">
      <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full text-gray-500 dark:text-gray-400" aria-label="Back">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50 flex-1">{title}</h1>
      {rightAction}
    </div>
  )
}
