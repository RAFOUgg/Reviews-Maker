import React, { useCallback, useState } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';

/**
 * PhenoEdge - Edge personnalisé pour les connexions généalogiques
 *
 * Supporte un point de courbure ("waypoint") déplaçable à la main : par défaut la liaison
 * est une ligne droite parent→enfant, mais on peut glisser la poignée médiane sur le côté
 * pour la faire dévier (utile pour désenchevêtrer des arbres denses). Le point est persisté
 * via data.onWaypointChange, fourni par UnifiedGeneticsCanvas (délègue à store.updateEdge).
 */
export default function PhenoEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
    data,
    label,
}) {
    const { screenToFlowPosition } = useReactFlow();
    const [dragPos, setDragPos] = useState(null);

    const defaultMidX = (sourceX + targetX) / 2;
    const defaultMidY = (sourceY + targetY) / 2;
    const bendX = dragPos ? dragPos.x : (data?.waypointX ?? defaultMidX);
    const bendY = dragPos ? dragPos.y : (data?.waypointY ?? defaultMidY);
    const hasCustomBend = dragPos !== null || (data?.waypointX != null && data?.waypointY != null);

    const edgePath = `M ${sourceX},${sourceY} L ${bendX},${bendY} L ${targetX},${targetY}`;
    const labelX = bendX;
    const labelY = bendY;

    const handleHandlePointerDown = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();

        const handleMove = (moveEvent) => {
            const pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            setDragPos(pos);
        };
        const handleUp = (upEvent) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            const pos = screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY });
            data?.onWaypointChange?.(id, pos);
            setDragPos(null);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }, [id, data, screenToFlowPosition]);

    const handleDoubleClick = useCallback((event) => {
        // Double-clic sur la poignée : réinitialise la ligne droite (retire le waypoint)
        event.stopPropagation();
        data?.onWaypointChange?.(id, null);
    }, [id, data]);

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: selected ? '#10b981' : '#059669',
                    strokeWidth: selected ? 2.5 : 2,
                    filter: selected ? 'drop-shadow(0 0 8px #10b981)' : 'none',
                    transition: dragPos ? 'none' : 'all 200ms ease-in-out',
                }}
                markerEnd="url(#arrowhead)"
            />

            <EdgeLabelRenderer>
                {/* Label de relation, décalé au-dessus de la poignée pour ne pas la masquer */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 18}px)`,
                        fontSize: '12px',
                        fontWeight: '600',
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="px-2 py-1 bg-slate-800/90 border border-emerald-500/30 rounded text-emerald-300 backdrop-blur-sm hover:bg-slate-700/90 hover:border-emerald-400/50 transition-all cursor-pointer">
                        {label || 'F1'}
                    </div>
                </div>

                {/* Poignée de courbure — visible seulement au survol/sélection pour ne pas
                    encombrer un arbre dense, sauf si déjà déplacée (hasCustomBend) */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${bendX}px,${bendY}px)`,
                        pointerEvents: 'all',
                        opacity: selected || hasCustomBend ? 1 : 0,
                        transition: 'opacity 150ms ease-in-out',
                    }}
                    className="nodrag nopan edge-waypoint-handle"
                    onPointerDown={handleHandlePointerDown}
                    onDoubleClick={handleDoubleClick}
                    title="Glisser pour courber la liaison — double-clic pour réinitialiser"
                >
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: selected ? '#10b981' : '#059669',
                            border: '2px solid rgba(255,255,255,0.6)',
                            cursor: 'grab',
                        }}
                    />
                </div>
            </EdgeLabelRenderer>

            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M 0 0 L 10 3 L 0 6 Z"
                        fill={selected ? '#10b981' : '#059669'}
                    />
                </marker>
            </defs>
        </>
    );
}
