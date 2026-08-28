import { FrameworkScreen } from '../components/FrameworkScreen'
import { healthDataProvider } from '../services/healthData'

export function ShredScreen() {
  const nutrition = healthDataProvider.getDailyNutrition(new Date())
  const targets = healthDataProvider.getNutritionTargets()

  return (
    <FrameworkScreen framework="shred">
      {nutrition && targets && (
        <div className="px-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              Nutrition
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-50">
              {nutrition.calories} / {targets.goal_calories} kcal
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-50">
              {nutrition.protein_g} / {targets.goal_protein_g} g protein
            </p>
          </div>
        </div>
      )}
    </FrameworkScreen>
  )
}
