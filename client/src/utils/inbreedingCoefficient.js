/**
 * Calcul automatique du coefficient de consanguinité (Wright's F, 1922) depuis la structure
 * réelle de l'arbre généalogique (GenNode/GenEdge), plutôt que de le laisser en saisie libre.
 *
 * Contexte scientifique (cf. DOCUMENTATION/DATA_REFERENCE/05_GENETIQUE_GENEALOGIE.md §5) :
 * le coefficient de consanguinité F (0 à 1) mesure la probabilité que les deux allèles d'un
 * gène chez un individu soient identiques par descendance. Méthode utilisée ici : comptage de
 * chemins (path counting) — pour deux parents distincts A et B, F = Σ sur tous les ancêtres
 * communs C de (1/2)^(n1+n2+1) × (1+F_C), où n1/n2 sont les nombres de générations séparant
 * respectivement A et B de C, sommés sur TOUS les chemins généalogiques distincts (pas
 * seulement le plus proche ancêtre commun). Cas particulier de l'autofécondation (selfing,
 * S1/S2...) : F_enfant = (1 + F_parent) / 2.
 *
 * Limites assumées (à documenter côté UI, ne jamais présenter comme une mesure de laboratoire) :
 * - Un individu sans parent connu est traité comme "fondateur" (F = 0), convention standard
 *   de l'analyse de pedigree, pas une certitude biologique.
 * - Un individu avec un seul parent connu (pedigree incomplet) retourne `null` (non calculable),
 *   sauf s'il est explicitement marqué comme génération "S..." (selfing) auquel cas ce parent
 *   unique est traité comme les deux parents génétiques (autofécondation).
 * - `clone`/`mutation` : traités comme génétiquement identiques à leur source (même F), pas
 *   comme un nouveau croisement.
 * - `sibling`/`pairing` : ignorés pour ce calcul (ne décrivent pas une relation parent→enfant).
 */

const GENETIC_PARENT_RELATIONSHIP_TYPES = ['parent', 'pollen_donor']
const IDENTITY_RELATIONSHIP_TYPES = ['clone', 'mutation']
const MAX_GENERATIONS = 20

function getGeneticParentEdges(nodeId, edges) {
    return edges.filter(e => e.childNodeId === nodeId && GENETIC_PARENT_RELATIONSHIP_TYPES.includes(e.relationshipType))
}

function getIdentitySourceId(nodeId, edges) {
    const e = edges.find(e => e.childNodeId === nodeId && IDENTITY_RELATIONSHIP_TYPES.includes(e.relationshipType))
    return e ? e.parentNodeId : null
}

function isSelfingGeneration(node) {
    const gen = node?.genetics?.generation
    return typeof gen === 'string' && /^S\d/i.test(gen.trim())
}

/**
 * Calcule le coefficient de consanguinité F (0-1) d'un nœud donné à partir de l'arbre complet.
 * @param {string} nodeId - id du GenNode cible
 * @param {Array} nodes - tous les GenNode de l'arbre (pour lire `genetics.generation`)
 * @param {Array} edges - tous les GenEdge de l'arbre
 * @returns {{ value: number|null, reason: string }} value=null si non calculable (pedigree incomplet)
 */
export function computeInbreedingCoefficient(nodeId, nodes, edges) {
    const nodeById = new Map(nodes.map(n => [n.id, n]))
    const fCache = new Map()
    const ancestorCache = new Map()

    // Ancêtres d'un nœud : Map<ancestorId, longueurs de chemin[]> (inclut le nœud lui-même à
    // distance 0, utile pour détecter les backcross où l'un des parents est un ancêtre de l'autre).
    function ancestorsOf(id, depth, visiting) {
        if (ancestorCache.has(id)) return ancestorCache.get(id)
        if (depth > MAX_GENERATIONS || visiting.has(id)) return new Map()
        visiting.add(id)
        const result = new Map()
        const addPath = (ancId, len) => {
            if (!result.has(ancId)) result.set(ancId, [])
            result.get(ancId).push(len)
        }
        addPath(id, 0)
        const parentIds = [...new Set(getGeneticParentEdges(id, edges).map(e => e.parentNodeId))]
        for (const pId of parentIds) {
            const subAnc = ancestorsOf(pId, depth + 1, new Set(visiting))
            for (const [ancId, lens] of subAnc) {
                for (const len of lens) addPath(ancId, len + 1)
            }
        }
        visiting.delete(id)
        ancestorCache.set(id, result)
        return result
    }

    function computeF(id, visiting) {
        if (fCache.has(id)) return fCache.get(id)
        if (visiting.has(id) || !nodeById.has(id)) return 0 // cycle/nœud inconnu — garde-fou
        visiting.add(id)

        const identitySourceId = getIdentitySourceId(id, edges)
        if (identitySourceId) {
            const f = computeF(identitySourceId, visiting)
            visiting.delete(id)
            fCache.set(id, f)
            return f
        }

        const parentEdges = getGeneticParentEdges(id, edges)
        const parentIds = parentEdges.map(e => e.parentNodeId)
        const distinctParentIds = [...new Set(parentIds)]

        let f
        if (distinctParentIds.length >= 2) {
            const [pA, pB] = distinctParentIds
            const ancA = ancestorsOf(pA, 0, new Set())
            const ancB = ancestorsOf(pB, 0, new Set())
            let sum = 0
            for (const [ancId, lensA] of ancA) {
                if (!ancB.has(ancId)) continue
                const lensB = ancB.get(ancId)
                const fAnc = computeF(ancId, new Set(visiting)) ?? 0
                for (const n1 of lensA) {
                    for (const n2 of lensB) {
                        sum += Math.pow(0.5, n1 + n2 + 1) * (1 + fAnc)
                    }
                }
            }
            f = sum
        } else if (parentIds.length === 2 && distinctParentIds.length === 1) {
            // Autofécondation explicite : 2 arêtes génétiques (parent + pollen_donor) pointant
            // vers la même source.
            const fParent = computeF(distinctParentIds[0], visiting) ?? 0
            f = (1 + fParent) / 2
        } else if (distinctParentIds.length === 1 && isSelfingGeneration(nodeById.get(id))) {
            // Un seul parent connu mais génération marquée "S..." (selfing) : traité comme
            // autofécondation de ce parent unique.
            const fParent = computeF(distinctParentIds[0], visiting) ?? 0
            f = (1 + fParent) / 2
        } else if (distinctParentIds.length === 1) {
            f = null // pedigree incomplet — un seul parent connu, non calculable de façon fiable
        } else {
            f = 0 // aucun parent connu — traité comme "fondateur" (convention standard, pas une certitude biologique)
        }

        visiting.delete(id)
        fCache.set(id, f)
        return f
    }

    const value = computeF(nodeId, new Set())
    let reason
    if (value === null) {
        reason = 'Pedigree incomplet : un seul parent renseigné (et génération non marquée "S..."). Renseignez le second parent génétique (parent/pollen_donor) pour activer le calcul.'
    } else if (value === 0) {
        reason = 'Aucun ancêtre commun détecté entre les deux lignées connues (ou nœud fondateur sans parent renseigné).'
    } else {
        reason = 'Calculé par comptage de chemins (Wright, 1922) sur les ancêtres communs des deux parents génétiques.'
    }
    return { value, reason }
}
