/**
 * Contract for external nutrition/weight data (e.g. from Fix-Your-Calorie).
 * Shred's UI codes against this interface only, never against a concrete
 * data source — so plugging in a real provider later never touches Shred's screens.
 */
export class HealthDataProvider {
  /** @returns {{calories:number, protein_g:number, carbs_g:number, fat_g:number}|null} */
  getDailyNutrition(_date) {
    throw new Error('Not implemented')
  }

  /** @returns {{goal_calories:number, goal_protein_g:number, goal_carbs_g:number, goal_fat_g:number}|null} */
  getNutritionTargets() {
    throw new Error('Not implemented')
  }

  /** @returns {number|null} */
  getCurrentWeight() {
    throw new Error('Not implemented')
  }

  /** @returns {{date:string, weight_kg:number}[]} */
  getWeightHistory(_startDate, _endDate) {
    throw new Error('Not implemented')
  }
}

/** V1 default: no external data source is connected yet. */
export class NullHealthDataProvider extends HealthDataProvider {
  getDailyNutrition() {
    return null
  }

  getNutritionTargets() {
    return null
  }

  getCurrentWeight() {
    return null
  }

  getWeightHistory() {
    return []
  }
}
