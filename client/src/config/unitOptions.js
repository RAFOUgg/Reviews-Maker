/**
 * unitOptions.js
 *
 * Unités partagées pour les champs valeur+unité liés au rendement, utilisées à la fois par
 * `phenoNodeFields.js` (GenNode.genetics.yieldEstimate) et `CultivarsTab.jsx` (Cultivar.yieldValue/yieldUnit).
 * g/m² et g/plant ne sont volontairement JAMAIS convertis l'un vers l'autre (dépend de la densité de
 * plantation, inconnue ici) — l'unité choisie par l'utilisateur est affichée telle quelle.
 */

export const YIELD_UNITS = [
    { value: 'g_m2', label: 'g/m²' },
    { value: 'g_plant', label: 'g/plant' }
]

export function formatValueUnit(compound, unitOptions = YIELD_UNITS) {
    if (!compound || compound.value === undefined || compound.value === null || compound.value === '') return ''
    const unitLabel = unitOptions.find(u => u.value === compound.unit)?.label || compound.unit || ''
    return `${compound.value} ${unitLabel}`.trim()
}
