import { LayoutGrid, Sparkles, Dumbbell, Shirt } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, activeClass: 'text-gray-900 dark:text-gray-50' },
  { id: 'groom', label: 'Groom', icon: Sparkles, activeClass: 'text-emerald-500' },
  { id: 'shred', label: 'Shred', icon: Dumbbell, activeClass: 'text-orange-500' },
  { id: 'style', label: 'Style', icon: Shirt, activeClass: 'text-purple-500' },
]

export function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon, activeClass }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-xs font-medium transition-colors ${
                active ? activeClass : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
