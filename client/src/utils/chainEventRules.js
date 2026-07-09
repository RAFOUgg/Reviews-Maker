/**
 * chainEventRules.js
 *
 * Moteur de règles minimal pour qualifier automatiquement un événement journalisé (cf.
 * ChainEventForm.jsx / server-new/utils/chainAuditLog.js) — ex: "frigo resté ouvert 4min31s"
 * qualifié en "rupture possible de la chaîne du froid".
 *
 * Principes (cf. DOCUMENTATION/DATA_REFERENCE/11_TRACABILITE_ET_EXTENSIBILITE.md) :
 * - Jamais bloquant : une règle ne fait QUE qualifier après coup, elle n'empêche jamais la saisie
 *   d'un événement ni ne modifie la donnée d'origine.
 * - Évalué à la lecture (pas de table de constats persistée) — le résultat est dérivé à chaque
 *   affichage du journal, jamais stocké, pour ne jamais diverger de la donnée source.
 * - Détection par mots-clés plutôt que par une taxonomie d'équipement figée : le matériel
 *   (SavedData catégorie 'materiel') n'a qu'une catégorie commerciale large ("Conteneurs" etc.),
 *   pas de type technique assez précis pour une règle fiable — le texte libre (titre/description/
 *   nom d'équipement) reste la source la plus fiable tant qu'aucune taxonomie plus fine n'existe.
 */

// Durée d'un événement en secondes, si startedAt/endedAt sont tous les deux renseignés.
function eventDurationSeconds(metadata) {
    if (!metadata?.startedAt || !metadata?.endedAt) return null
    const start = new Date(metadata.startedAt).getTime()
    const end = new Date(metadata.endedAt).getTime()
    if (isNaN(start) || isNaN(end) || end <= start) return null
    return (end - start) / 1000
}

function textOf(metadata) {
    return `${metadata?.title || ''} ${metadata?.description || ''} ${metadata?.equipmentLabel || ''}`.toLowerCase()
}

// Chaque règle : id/label (affiché comme badge dérivé), match(event) -> booléen.
// `event` est une entrée AuditLog telle que renvoyée par GET /chains/:id/events (metadata déjà
// JSON.parse'd côté serveur).
export const CHAIN_EVENT_RULES = [
    {
        id: 'cold_chain_break',
        label: '⚠️ Rupture possible de la chaîne du froid',
        match: (event) => {
            const keywords = ['frigo', 'réfrigérat', 'refrigerat', 'congél', 'congel', 'chambre froide', 'cold room', 'chaîne du froid', 'chaine du froid']
            const text = textOf(event.metadata)
            if (!keywords.some(k => text.includes(k))) return false
            const duration = eventDurationSeconds(event.metadata)
            return duration !== null && duration > 60
        }
    },
    {
        id: 'long_critical_incident',
        label: '⚠️ Incident critique de longue durée (>30min)',
        match: (event) => {
            if (event.metadata?.severity !== 'critical') return false
            const duration = eventDurationSeconds(event.metadata)
            return duration !== null && duration > 1800
        }
    }
]

// Retourne les libellés des règles qui matchent cet événement (peut être vide) — usage purement
// d'affichage, jamais persisté.
export function evaluateChainEventRules(event) {
    if (event.action !== 'manual.event') return []
    return CHAIN_EVENT_RULES.filter(rule => {
        try { return rule.match(event) } catch { return false }
    }).map(rule => rule.label)
}
