/**
 * Détection de cycle pour les graphes orientés (arbres génétiques, chaînes de production).
 * Prend un tableau d'arêtes déjà normalisé en { source, target }.
 */

export function wouldCreateCycle(edges, sourceId, targetId) {
    if (sourceId === targetId) return true;

    const adjacency = new Map();
    for (const edge of edges) {
        if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
        adjacency.get(edge.source).push(edge.target);
    }

    // BFS depuis targetId : si sourceId est atteignable, ajouter sourceId->targetId fermerait un cycle
    const visited = new Set([targetId]);
    const queue = [targetId];

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === sourceId) return true;

        for (const next of adjacency.get(current) || []) {
            if (!visited.has(next)) {
                visited.add(next);
                queue.push(next);
            }
        }
    }

    return false;
}
