import React from 'react';
import { BaseEdge } from 'reactflow';

// Doit correspondre à .cultivar-node (width/height 140px, cf. UnifiedGeneticsCanvas.css) — sert
// uniquement à ancrer visuellement le point de jonction au bas des deux nœuds parents.
const NODE_WIDTH = 140;
const NODE_HEIGHT = 140;

/**
 * FamilyDropEdge - Ligne de descendance "pedigree" : un enfant issu de deux parents déjà reliés
 * par un PairingEdge se connecte depuis le MILIEU de cette liaison plutôt que par deux traits
 * séparés. Remplace les deux GenEdge individuels (parentA→enfant, parentB→enfant) dans le rendu
 * uniquement — les deux GenEdge réels restent inchangés en base (voir UnifiedGeneticsCanvas).
 */
export default function FamilyDropEdge({ targetX, targetY, data, selected }) {
    const { parentAPos, parentBPos } = data || {};
    if (!parentAPos || !parentBPos) return null;

    const aX = parentAPos.x + NODE_WIDTH / 2;
    const aY = parentAPos.y + NODE_HEIGHT;
    const bX = parentBPos.x + NODE_WIDTH / 2;
    const bY = parentBPos.y + NODE_HEIGHT;
    const midX = (aX + bX) / 2;
    const midY = Math.max(aY, bY);
    const dropY = midY + (targetY - midY) * 0.5;

    const edgePath = `M ${midX},${midY} L ${midX},${dropY} L ${targetX},${dropY} L ${targetX},${targetY}`;

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
