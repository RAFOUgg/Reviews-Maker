/**
 * floatingEdgeUtils.js
 *
 * Calcul du point d'attache "flottant" d'une liaison sur le bord d'un nœud, au lieu du point
 * fixe d'un handle React Flow. Sans ça, une liaison créée depuis un handle gauche/droite/haut/bas
 * particulier reste ancrée à CE point précis même si le nœud cible se retrouve dans une autre
 * direction après un déplacement — la ligne semble alors partir "du mauvais endroit". Recette
 * standard React Flow (v11) pour les "floating edges" : le point d'attache est recalculé à chaque
 * rendu à partir des rectangles réels des deux nœuds, jamais figé sur un handle spécifique.
 *
 * Utilisé par PhenoEdge/PairingEdge/FamilyDropEdge (genetics) et ChainEdgeComponent (production
 * chain) — c'est la partie du "wrapper commun" qui vit dans components/graph-canvas plutôt que
 * dupliquée dans chaque domaine.
 */

import { useCallback } from 'react';
import { useStore } from 'reactflow';

function getNodeIntersection(intersectionNode, targetNode) {
    const width = intersectionNode.width ?? 140;
    const height = intersectionNode.height ?? 140;
    const intersectionPosition = intersectionNode.positionAbsolute || intersectionNode.position;
    const targetPosition = targetNode.positionAbsolute || targetNode.position;
    const targetWidth = targetNode.width ?? 140;
    const targetHeight = targetNode.height ?? 140;

    const w = width / 2;
    const h = height / 2;

    const x2 = intersectionPosition.x + w;
    const y2 = intersectionPosition.y + h;
    const x1 = targetPosition.x + targetWidth / 2;
    const y1 = targetPosition.y + targetHeight / 2;

    const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
    const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
    const xx3 = a * xx1;
    const yy3 = a * yy1;

    return {
        x: w * (xx3 + yy3) + x2,
        y: h * (-xx3 + yy3) + y2,
    };
}

/** Points d'intersection {sx, sy, tx, ty} entre le segment reliant les centres de deux nœuds et leurs bords respectifs. */
export function getFloatingEdgeParams(sourceNode, targetNode) {
    const source = getNodeIntersection(sourceNode, targetNode);
    const target = getNodeIntersection(targetNode, sourceNode);
    return { sx: source.x, sy: source.y, tx: target.x, ty: target.y };
}

/**
 * Hook : résout les deux nœuds React Flow par id et retourne leurs points d'attache flottants.
 * Retourne `null` tant que React Flow n'a pas encore mesuré les nœuds (premier rendu) — les
 * appelants doivent alors se rabattre sur les sourceX/sourceY/targetX/targetY fournis par défaut.
 */
export function useFloatingEdgeParams(sourceId, targetId) {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(sourceId), [sourceId]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(targetId), [targetId]));

    if (!sourceNode || !targetNode || !sourceNode.width || !targetNode.width) return null;
    return getFloatingEdgeParams(sourceNode, targetNode);
}

/** Variante pour un seul nœud cible (ex: FamilyDropEdge, qui calcule son propre point de départ). */
export function useFloatingNodeRect(nodeId) {
    return useStore(useCallback((store) => {
        const node = store.nodeInternals.get(nodeId);
        if (!node || !node.width) return null;
        const position = node.positionAbsolute || node.position;
        return { x: position.x, y: position.y, width: node.width, height: node.height };
    }, [nodeId]));
}

/** Point exact au milieu d'un côté ("top"|"bottom"|"left"|"right") du rectangle d'un nœud. */
export function getHandlePosition(node, side) {
    const position = node.positionAbsolute || node.position;
    const width = node.width ?? 140;
    const height = node.height ?? 140;
    switch (side) {
        case 'top': return { x: position.x + width / 2, y: position.y };
        case 'bottom': return { x: position.x + width / 2, y: position.y + height };
        case 'left': return { x: position.x, y: position.y + height / 2 };
        case 'right': return { x: position.x + width, y: position.y + height / 2 };
        default: return { x: position.x + width / 2, y: position.y + height / 2 };
    }
}

/**
 * Points d'attache d'une liaison, en respectant un choix manuel de côté par extrémité
 * (sourceHandle/targetHandle, ex: l'utilisateur a glissé la poignée sur le côté droit) — pour
 * l'extrémité non fixée manuellement, retombe sur le calcul flottant automatique habituel.
 */
export function useEdgeEndpointParams(sourceId, targetId, sourceHandle, targetHandle) {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(sourceId), [sourceId]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(targetId), [targetId]));

    if (!sourceNode || !targetNode || !sourceNode.width || !targetNode.width) return null;

    const floating = getFloatingEdgeParams(sourceNode, targetNode);
    const sourcePoint = sourceHandle ? getHandlePosition(sourceNode, sourceHandle) : { x: floating.sx, y: floating.sy };
    const targetPoint = targetHandle ? getHandlePosition(targetNode, targetHandle) : { x: floating.tx, y: floating.ty };

    return { sx: sourcePoint.x, sy: sourcePoint.y, tx: targetPoint.x, ty: targetPoint.y };
}

/** Détermine le côté ("top"|"bottom"|"left"|"right") d'un nœud le plus proche d'un point donné
 *  (coordonnées flow) — utilisé quand l'utilisateur relâche la poignée d'extrémité d'une liaison
 *  au-dessus d'un nœud, pour choisir sur quel côté l'accrocher. */
export function nearestHandleSide(node, point) {
    const position = node.positionAbsolute || node.position;
    const width = node.width ?? 140;
    const height = node.height ?? 140;
    const cx = position.x + width / 2;
    const cy = position.y + height / 2;
    const nx = (point.x - cx) / (width / 2);
    const ny = (point.y - cy) / (height / 2);
    if (Math.abs(nx) > Math.abs(ny)) return nx > 0 ? 'right' : 'left';
    return ny > 0 ? 'bottom' : 'top';
}

/** true si `point` (coordonnées flow) tombe dans le rectangle du nœud. */
export function isPointInNode(node, point) {
    const position = node.positionAbsolute || node.position;
    const width = node.width ?? 140;
    const height = node.height ?? 140;
    return point.x >= position.x && point.x <= position.x + width
        && point.y >= position.y && point.y <= position.y + height;
}

/** Nœud (React Flow, déjà mesuré) dont le rectangle contient `point` (coordonnées flow), en
 *  excluant les ids donnés — sert à détecter sur quel nœud on relâche une liaison glissée depuis
 *  un point qui n'est pas déjà lié à un nœud précis (ex: bulle médiane d'un PairingEdge relâchée
 *  sur un individu existant, pour le relier comme enfant du couple). */
export function findNodeAtPoint(nodeInternals, point, excludeIds = []) {
    for (const node of nodeInternals.values()) {
        if (excludeIds.includes(node.id)) continue;
        if (!node.width || !node.height) continue;
        if (isPointInNode(node, point)) return node;
    }
    return null;
}

/** Distance (coordonnées flow) entre `point` et le segment [a, b]. */
function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return Math.hypot(point.x - a.x, point.y - a.y);
    let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    return Math.hypot(point.x - projX, point.y - projY);
}

/**
 * Liaison (ChainEdge — objet du store, pas un edge React Flow) dont le tracé passe le plus près
 * de `point` (coordonnées flow), sous `thresholdPx`. Pas d'équivalent React Flow natif pour "hit
 * test" une arête (contrairement à `findNodeAtPoint`/nodeInternals pour les nœuds) — approxime le
 * tracé par les deux segments [source→waypoint] et [waypoint→target] si un point de courbure est
 * défini (cf. ChainEdgeComponent), sinon par le segment direct source→target.
 */
export function findEdgeNearPoint(edges, nodes, point, thresholdPx = 24) {
    let closest = null;
    let closestDistance = thresholdPx;

    for (const edge of edges) {
        const source = nodes.find(n => n.id === edge.sourceNodeId);
        const target = nodes.find(n => n.id === edge.targetNodeId);
        if (!source || !target) continue;

        const sourceCenter = {
            x: (source.position?.x || 0) + (source.width ?? 140) / 2,
            y: (source.position?.y || 0) + (source.height ?? 140) / 2
        };
        const targetCenter = {
            x: (target.position?.x || 0) + (target.width ?? 140) / 2,
            y: (target.position?.y || 0) + (target.height ?? 140) / 2
        };

        const distance = (edge.waypointX != null && edge.waypointY != null)
            ? Math.min(
                distanceToSegment(point, sourceCenter, { x: edge.waypointX, y: edge.waypointY }),
                distanceToSegment(point, { x: edge.waypointX, y: edge.waypointY }, targetCenter)
            )
            : distanceToSegment(point, sourceCenter, targetCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = edge;
        }
    }

    return closest;
}
