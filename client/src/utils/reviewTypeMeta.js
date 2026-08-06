import { Flower2, Droplet, FlaskConical, Cookie } from 'lucide-react'

// review.type stocké en base : 'Fleurs' (seul type capitalisé en français, historique)
// vs 'hash'/'concentrate'/'edible' (anglais minuscule) — pas de convention uniforme, vérifié
// directement contre les routes POST de chaque type plutôt que supposé
export const TYPE_META = {
    flower: { label: 'Fleur', icon: Flower2, color: 'text-green-400', apiType: 'Fleurs' },
    hash: { label: 'Hash', icon: Droplet, color: 'text-amber-400', apiType: 'hash' },
    concentrate: { label: 'Concentré', icon: FlaskConical, color: 'text-cyan-400', apiType: 'concentrate' },
    edible: { label: 'Comestible', icon: Cookie, color: 'text-pink-400', apiType: 'edible' },
}

export const ALL_REVIEW_TYPES = Object.keys(TYPE_META)

export function apiTypeToInternal(apiType) {
    return ALL_REVIEW_TYPES.find(t => TYPE_META[t].apiType === apiType) || null
}

/**
 * Ramène une valeur brute de `review.type` à l'`apiType` canonique ci-dessus.
 *
 * Nécessaire parce que la base ne contient PAS que les 4 valeurs canoniques : un
 * relevé réel de /api/library/stats (2026-08-06) renvoie 7 valeurs distinctes pour
 * 95 reviews — 'Fleurs', 'hash', 'concentrate', 'edible' (le gros du volume) MAIS
 * aussi 'Hash', 'Concentré' et 'Comestible' (variantes françaises capitalisées,
 * quelques lignes anciennes). Une comparaison stricte `review.type === 'hash'` laisse
 * donc silencieusement de côté ces lignes, ce qui fait diverger un compteur d'un
 * listing filtré censé le détailler.
 *
 * La normalisation est faite par forme (accents retirés + minuscules) plutôt que par
 * liste figée de variantes, pour couvrir aussi les graphies d'une autre base (prod).
 * Renvoie la valeur d'origine si elle n'est reconnue par aucune famille.
 */
export function canonicalReviewType(rawType) {
    if (!rawType) return rawType
    const normalized = String(rawType)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()

    if (normalized === 'fleur' || normalized === 'fleurs' || normalized === 'flower') return 'Fleurs'
    if (normalized === 'hash') return 'hash'
    if (normalized === 'concentre' || normalized === 'concentres' || normalized === 'concentrate') return 'concentrate'
    if (normalized === 'comestible' || normalized === 'comestibles' || normalized === 'edible') return 'edible'
    return rawType
}

/** Deux valeurs de type désignent-elles le même produit, quelle que soit leur graphie ? */
export function isSameReviewType(a, b) {
    return canonicalReviewType(a) === canonicalReviewType(b)
}

/**
 * Route d'édition d'une review (`/edit/<slug>/<id>`).
 *
 * Les clés de TYPE_META SONT les slugs de route, donc le slug se déduit du type canonique
 * via apiTypeToInternal() — inutile de maintenir une seconde table de correspondance.
 * Passer par le type canonique est indispensable : un repli en `type.toLowerCase()` sur les
 * graphies françaises stockées en base produit des routes inexistantes
 * (/edit/concentré/..., /edit/comestible/...), donc un bouton "Modifier" qui ne mène nulle part.
 */
export function reviewEditPath(review, { openExport = false } = {}) {
    const slug = apiTypeToInternal(canonicalReviewType(review?.type)) || 'flower'
    return `/edit/${slug}/${review?.id}${openExport ? '?openExport=1' : ''}`
}
