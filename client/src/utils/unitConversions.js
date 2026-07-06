/**
 * Table de conversion d'unités partagée — implémente la spécification
 * DOCUMENTATION/DATA_REFERENCE/12_SAISIE_VALEURS_UNITES.md : toute valeur à unité physique se
 * saisit via une unité canonique de stockage + une unité d'affichage convertible à la volée
 * (jamais l'inverse — la valeur stockée en base ne change jamais d'unité).
 *
 * ⚠️ Familles volontairement ABSENTES de cette table (cf. doc 12 §7) — ne jamais les ajouter
 * sans le garde-fou explicite qui va avec, sous peine de convertir silencieusement une donnée
 * fausse plutôt qu'imprécise :
 * - EC ⇄ PPM : deux échelles concurrentes (500/700), écart jusqu'à 40% selon laquelle est utilisée.
 * - PPFD ⇄ lux : dépend du spectre de la source lumineuse, pas une conversion universelle.
 * - g/m² ⇄ g/plante : nécessite la densité de plantation, c'est un calcul dérivé, pas une conversion.
 * - mesh US ⇄ µm : table de correspondance normée (ASTM E11), pas une formule — à traiter à part.
 */

// Clé = unité canonique déclarée dans field.unit (cultureSidebarContent.js, extractionSidebarContent.js, etc.)
// Chaque entrée : { unit, toBase(v), fromBase(v) } — toBase/fromBase convertissent depuis/vers l'unité canonique.
export const UNIT_CONVERSIONS = {
    '°C': [
        { unit: '°C', toBase: v => v, fromBase: v => v },
        { unit: '°F', toBase: v => (v - 32) / 1.8, fromBase: v => v * 1.8 + 32 },
        { unit: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
    'g': [
        { unit: 'g', toBase: v => v, fromBase: v => v },
        { unit: 'mg', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { unit: 'kg', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { unit: 'oz', toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
    ],
    'PSI': [
        { unit: 'PSI', toBase: v => v, fromBase: v => v },
        { unit: 'bar', toBase: v => v * 14.5038, fromBase: v => v / 14.5038 },
    ],
    'bar': [
        { unit: 'bar', toBase: v => v, fromBase: v => v },
        { unit: 'PSI', toBase: v => v / 14.5038, fromBase: v => v * 14.5038 },
        { unit: 'mbar', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { unit: 'atm', toBase: v => v / 0.986923, fromBase: v => v * 0.986923 },
    ],
    'mbar': [
        { unit: 'mbar', toBase: v => v, fromBase: v => v },
        { unit: 'bar', toBase: v => v * 1000, fromBase: v => v / 1000 },
    ],
    'L': [
        { unit: 'L', toBase: v => v, fromBase: v => v },
        { unit: 'mL', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { unit: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    ],
    'mL': [
        { unit: 'mL', toBase: v => v, fromBase: v => v },
        { unit: 'L', toBase: v => v * 1000, fromBase: v => v / 1000 },
    ],
    'min': [
        { unit: 'sec', toBase: v => v / 60, fromBase: v => v * 60 },
        { unit: 'min', toBase: v => v, fromBase: v => v },
        { unit: 'h', toBase: v => v * 60, fromBase: v => v / 60 },
    ],
    'sec': [
        { unit: 'sec', toBase: v => v, fromBase: v => v },
        { unit: 'min', toBase: v => v * 60, fromBase: v => v / 60 },
    ],
    'jours': [
        { unit: 'jours', toBase: v => v, fromBase: v => v },
        { unit: 'semaines', toBase: v => v * 7, fromBase: v => v / 7 },
    ],
    'cm': [
        { unit: 'cm', toBase: v => v, fromBase: v => v },
        { unit: 'm', toBase: v => v * 100, fromBase: v => v / 100 },
        { unit: 'in', toBase: v => v * 2.54, fromBase: v => v / 2.54 },
    ],
}

export const roundDisplay = (n) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n * 100) / 100 : n)

/** Alternatives d'unité disponibles pour l'unité canonique donnée (>1 seulement si convertible). */
export function getUnitAlternates(canonicalUnit) {
    const alternates = UNIT_CONVERSIONS[canonicalUnit]
    return Array.isArray(alternates) && alternates.length > 1 ? alternates : null
}

/** Convertit une valeur stockée en unité canonique vers l'unité d'affichage choisie. */
export function toDisplayUnit(canonicalUnit, displayUnit, value) {
    const alternates = UNIT_CONVERSIONS[canonicalUnit]
    const unitDef = alternates?.find(u => u.unit === displayUnit)
    if (value === '' || value === undefined || value === null) return ''
    return roundDisplay(unitDef ? unitDef.fromBase(Number(value)) : Number(value))
}

/** Convertit une valeur saisie dans l'unité d'affichage choisie vers l'unité canonique de stockage. */
export function toCanonicalUnit(canonicalUnit, displayUnit, rawValue) {
    const alternates = UNIT_CONVERSIONS[canonicalUnit]
    const unitDef = alternates?.find(u => u.unit === displayUnit)
    return unitDef ? unitDef.toBase(rawValue) : rawValue
}
