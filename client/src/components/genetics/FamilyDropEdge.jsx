import React from 'react';
import { BaseEdge } from 'reactflow';
import { useEdgeEndpointParams, useFloatingNodeRect } from '../graph-canvas/floatingEdgeUtils';

// Distance verticale visée entre le point de jonction du couple et la barre de fourche vers
// le(s) enfant(s) — plusieurs enfants du même couple partagent ce même niveau, ce qui les fait
// tous forker depuis une ligne horizontale commune (convention pedigree en "T"/peigne) plutôt que
// de rayonner à des angles différents depuis le point de jonction.
const FORK_OFFSET = 60;

/**
 * FamilyDropEdge - Ligne de descendance "pedigree" en T : un enfant issu de deux parents déjà
 * reliés par un PairingEdge se connecte depuis le MILIEU de cette liaison plutôt que par deux
 * traits séparés. Remplace les deux GenEdge individuels (parentA→enfant, parentB→enfant) dans le
 * rendu uniquement — les deux GenEdge réels restent inchangés en base (voir UnifiedGeneticsCanvas).
 *
 * Le point de jonction (départ de la barre du T) est calculé EXACTEMENT comme le point de coude de
 * la PairingEdge réelle (mêmes points d'attache flottants + même waypoint manuel s'il existe) —
 * jamais recalculé indépendamment, sinon la fourche vers l'enfant ne concorderait pas visuellement
 * avec l'endroit où la ligne pointillée du couple se coude réellement à l'écran.
 *
 * Point d'arrivée sur l'enfant : ancré au centre-haut de son rectangle RÉEL (mesuré par React
 * Flow) plutôt qu'au `targetX/targetY` du handle résolu — sinon la ligne peut sembler arriver
 * "du mauvais côté" selon le handle utilisé lors de la création de la connexion sous-jacente.
 */
export default function FamilyDropEdge({ target, targetX, targetY, data, selected }) {
    const { parentAId, parentBId, pairingSourceHandle, pairingTargetHandle, pairingWaypointX, pairingWaypointY } = data || {};
    if (!parentAId || !parentBId) return null;

    const pairingEndpoints = useEdgeEndpointParams(parentAId, parentBId, pairingSourceHandle, pairingTargetHandle);
    const childRect = useFloatingNodeRect(target);

    if (!pairingEndpoints) return null;

    const bendX = pairingWaypointX ?? (pairingEndpoints.sx + pairingEndpoints.tx) / 2;
    const bendY = pairingWaypointY ?? (pairingEndpoints.sy + pairingEndpoints.ty) / 2;

    const childX = childRect ? childRect.x + childRect.width / 2 : targetX;
    const childTopY = childRect ? childRect.y : targetY;

    // Barre de fourche à distance fixe sous le point de jonction, sans jamais dépasser l'enfant
    // (cas rare d'un enfant positionné au-dessus du couple) ni descendre en dessous de lui.
    const rawDrop = childTopY - bendY;
    const forkY = bendY + Math.max(10, Math.min(FORK_OFFSET, rawDrop));

    const edgePath = Math.abs(bendX - childX) < 1
        ? `M ${bendX},${bendY} L ${childX},${childTopY}`
        : `M ${bendX},${bendY} L ${bendX},${forkY} L ${childX},${forkY} L ${childX},${childTopY}`;

    return (
        <BaseEdge
            path={edgePath}
            interactionWidth={24}
            style={{
                stroke: selected ? '#a78bfa' : '#8b5cf6',
                strokeWidth: selected ? 2.5 : 2,
                filter: selected ? 'drop-shadow(0 0 8px #a78bfa)' : 'none',
            }}
            markerEnd="url(#arrowhead)"
        />
    );
}
