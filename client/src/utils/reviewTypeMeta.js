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
