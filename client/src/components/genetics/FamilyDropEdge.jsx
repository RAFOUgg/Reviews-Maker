import React from 'react';
import { BaseEdge } from 'reactflow';
import { useFloatingNodeRect } from '../graph-canvas/floatingEdgeUtils';

// Fallback si React Flow n'a pas encore mesuré les nœuds (premier rendu) — doit correspondre à
// .cultivar-node (cf. UnifiedGeneticsCanvas.css).
const FALLBACK_NODE_SIZE = 140;

/**
 * FamilyDropEdge - Ligne de descendance "pedigree" : un enfant issu de deux parents déjà reliés
 * par un PairingEdge se connecte depuis le MILIEU de cette liaison plutôt que par deux traits
 * séparés. Remplace les deux GenEdge individuels (parentA→enfant, parentB→enfant) dans le rendu
 * uniquement — les deux GenEdge réels restent inchangés en base (voir UnifiedGeneticsCanvas).
 * Point d'arrivée sur l'enfant : ancré au centre-haut de son rectangle RÉEL (mesuré par React
 * Flow) plutôt qu'au `targetX/targetY` du handle résolu — sinon la ligne peut sembler arriver
 * "du mauvais côté" selon le handle utilisé lors de la création de la connexion sous-jacente.
 */
export default function FamilyDropEdge({ target, targetX, targetY, data, selected }) {
    const { parentAPos, parentBPos } = data || {};
    if (!parentAPos || !parentBPos) return null;

    const childRect = useFloatingNodeRect(target);
    const tx = childRect ? childRect.x + childRect.width / 2 : targetX;
    const ty = childRect ? childRect.y : targetY;

    const aX = parentAPos.x + FALLBACK_NODE_SIZE / 2;
    const aY = parentAPos.y + FALLBACK_NODE_SIZE;
    const bX = parentBPos.x + FALLBACK_NODE_SIZE / 2;
    const bY = parentBPos.y + FALLBACK_NODE_SIZE;
    const midX = (aX + bX) / 2;
    const midY = Math.max(aY, bY);
    const dropY = midY + (ty - midY) * 0.5;

    const edgePath = `M ${midX},${midY} L ${midX},${dropY} L ${tx},${dropY} L ${tx},${ty}`;

    return (
        <BaseEdge
            path={edgePath}
            style={{
                stroke: selected ? '#a78bfa' : '#8b5cf6',
                strokeWidth: selected ? 2.5 : 2,
                filter: selected ? 'drop-shadow(0 0 8px #a78bfa)' : 'none',
            }}
            markerEnd="url(#arrowhead)"
        />
    );
}
