/**
 * Résolution d'une extrémité de liaison (ChainEdge.sourceId/targetId, cf. normalizeEdge côté
 * serveur dans routes/production-chains.js) — une extrémité peut être un nœud produit
 * (store.nodes) ou une bulle épinglée (store.annotations, média ou carte de données) depuis
 * l'ajout de sourceAnnotationId/targetAnnotationId au schéma. Point de vérité unique réutilisé
 * partout où le code faisait auparavant `store.nodes.find(n => n.id === edge.sourceNodeId)`.
 */
export function resolveChainEndpoint(store, id) {
    if (!id) return null;

    const node = store.nodes.find(n => n.id === id);
    if (node) {
        return {
            kind: 'node',
            id: node.id,
            label: node.label,
            reviewType: node.reviewType,
            reviewId: node.reviewId,
            image: node.image,
            color: node.color
        };
    }

    const annotation = store.annotations.find(a => a.id === id);
    if (annotation) {
        return {
            kind: 'annotation',
            id: annotation.id,
            label: annotation.title || (annotation.mediaUrl ? 'Bulle média' : 'Carte de données'),
            reviewType: null,
            reviewId: null,
            image: annotation.mediaUrl || null,
            color: '#f59e0b'
        };
    }

    return null;
}
