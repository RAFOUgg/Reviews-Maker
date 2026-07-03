import React, { useCallback, useState } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import { useFloatingEdgeParams } from '../graph-canvas/floatingEdgeUtils';

/**
 * PairingEdge - Liaison "couple parental" (convention pedigree : ligne de jonction entre deux
 * parents, distincte des liens de filiation). Point d'attache flottant, voir PhenoEdge.jsx.
 * Les enfants communs à ce couple ne se connectent pas directement à cette ligne :
 * FamilyDropEdge calcule son propre point de jonction à partir des positions des deux nœuds
 * (voir UnifiedGeneticsCanvas). Supporte le même glisser-déposer de courbure que PhenoEdge.
 */
export default function PairingEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
    data,
}) {
    const { screenToFlowPosition } = useReactFlow();
    const [dragPos, setDragPos] = useState(null);

    const floating = useFloatingEdgeParams(source, target);
    const [sx, sy, tx, ty] = floating
        ? [floating.sx, floating.sy, floating.tx, floating.ty]
        : [sourceX, sourceY, targetX, targetY];

    const defaultMidX = (sx + tx) / 2;
    const defaultMidY = (sy + ty) / 2;
    const bendX = dragPos ? dragPos.x : (data?.waypointX ?? defaultMidX);
    const bendY = dragPos ? dragPos.y : (data?.waypointY ?? defaultMidY);
    const hasCustomBend = dragPos !== null || (data?.waypointX != null && data?.waypointY != null);

    const edgePath = `M ${sx},${sy} L ${bendX},${bendY} L ${tx},${ty}`;

    const handlePointerDown = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        const handleMove = (moveEvent) => {
            setDragPos(screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY }));
        };
        const handleUp = (upEvent) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            data?.onWaypointChange?.(id, screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY }));
            setDragPos(null);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }, [id, data, screenToFlowPosition]);

    const handleDoubleClick = useCallback((event) => {
        event.stopPropagation();
        data?.onWaypointChange?.(id, null);
    }, [id, data]);

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: selected ? '#f472b6' : '#ec4899',
                    strokeWidth: selected ? 2.5 : 2,
                    strokeDasharray: '6 4',
                    filter: selected ? 'drop-shadow(0 0 8px #f472b6)' : 'none',
                    transition: dragPos ? 'none' : 'all 200ms ease-in-out',
                }}
            />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${bendX}px,${bendY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                    title="Couple parental — glisser pour courber, double-clic pour réinitialiser"
                >
                    <div
                        onPointerDown={handlePointerDown}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            background: 'rgba(30, 41, 59, 0.9)',
                            border: `2px solid ${selected ? '#f472b6' : '#ec4899'}`,
                            cursor: 'grab',
                            opacity: selected || hasCustomBend ? 1 : 0.55,
                        }}
                    >
                        💑
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
