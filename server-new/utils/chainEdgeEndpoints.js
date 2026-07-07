/**
 * Résolution d'une extrémité de liaison (ChainEdge) — depuis l'ajout de sourceAnnotationId/
 * targetAnnotationId au schéma, une extrémité peut être soit un nœud produit (ChainNode), soit
 * une bulle épinglée (ChainAnnotation, média ou carte de données). Prisma/SQL n'ayant pas de FK
 * polymorphique native, la mutuelle exclusion et l'existence de l'extrémité choisie sont
 * vérifiées ici plutôt qu'en base — réutilisé par les routes POST/PUT edges.
 */

export async function resolveChainEdgeEndpoint(prisma, { nodeId, annotationId }, chainId) {
    if (nodeId && annotationId) {
        return { error: "Une extrémité ne peut être à la fois un nœud et une bulle" }
    }

    if (nodeId) {
        const node = await prisma.chainNode.findFirst({ where: { id: nodeId, chainId } })
        if (!node) return { error: "Nœud introuvable dans cette chaîne" }
        return { kind: "node", id: node.id }
    }

    if (annotationId) {
        const annotation = await prisma.chainAnnotation.findFirst({ where: { id: annotationId, chainId } })
        if (!annotation) return { error: "Bulle introuvable dans cette chaîne" }
        return { kind: "annotation", id: annotation.id }
    }

    return { error: "Extrémité de liaison requise (nœud ou bulle)" }
}
