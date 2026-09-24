// Jagdamba Laboratories JLFD260604023, released 10 June 2026.
// Per-serving values are calculated from the tested per-100 g sample values.
export const nutrition = [
  ['Energy', 439.80, 'kcal'],
  ['Total fat', 23.60, 'g'],
  ['Saturated fat', 3.97, 'g'],
  ['Carbohydrate', 50.74, 'g'],
  ['Dietary fibre', 11.24, 'g'],
  ['Protein', 11.73, 'g'],
  ['Total sugars', 20.05, 'g'],
  ['Sodium', 187.69, 'mg'],
  ['Magnesium (as Mg)', 117.34, 'mg'],
  ['Omega-3', 0.383, 'g'],
]
export function formatNutrient(value, unit, grams = 100) {
  return `${(value * grams / 100).toFixed(value < 1 ? 3 : 2)} ${unit}`
}
