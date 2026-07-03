import React, { useCallback, useState } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow, useStoreApi } from 'reactflow';
import { Heart, Baby } from 'lucide-react';
import { useEdgeEndpointParams, useFloatingNodeRect, findNodeAtPoint, nearestHandleSide } from '../graph-canvas/floatingEdgeUtils';
import { useDraggableEndpoint } from '../graph-canvas/useDraggableEndpoint';

/**
 * PairingEdge - Liaison "couple parental" (convention pedigree : ligne de jonction entre deux
 * parents, distincte des liens de filiation). Point d'attache flottant par défaut, extrémités
 * ancrables manuellement — voir PhenoEdge.jsx. Les enfants communs à ce couple ne se connectent
 * pas directement à cette ligne : FamilyDropEdge calcule son propre point de jonction à partir
 * des positions des deux nœuds (voir UnifiedGeneticsCanvas). Supporte le même glisser-déposer
 * de courbure que PhenoEdge.
 *
 * La bulle médiane a un second usage : la glisser jusqu'à la relâcher AU-DESSUS d'un autre nœud
 * du canvas relie ce nœud comme enfant commun du couple (2 liens de filiation créés d'un coup),
 * raccourci direct équivalent à "Ajouter un enfant à ce couple" (EdgeContextMenu) mais pour un
 * individu déjà présent sur le canvas plutôt qu'un nouveau nœud à créer via modal.
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
    const store = useStoreApi();
    const [dragPos, setDragPos] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const dropTargetRect = useFloatingNodeRect(dropTargetId);

    const endpoints = useEdgeEndpointParams(source, target, data?.sourceHandle, data?.targetHandle);
    const [baseSx, baseSy, baseTx, baseTy] = endpoints
        ? [endpoints.sx, endpoints.sy, endpoints.tx, endpoints.ty]
        : [sourceX, sourceY, targetX, targetY];

    const handleAssignEndpoint = useCallback((end, side) => {
        data?.onEndpointHandleChange?.(id, end === 'source' ? { sourceHandle: side } : { targetHandle: side });
    }, [id, data]);
    const { dragging, dragPreviewPos, startDrag } = useDraggableEndpoint(handleAssignEndpoint);

    const sx = (dragging === 'source' && dragPreviewPos) ? dragPreviewPos.x : baseSx;
    const sy = (dragging === 'source' && dragPreviewPos) ? dragPreviewPos.y : baseSy;
    const tx = (dragging === 'target' && dragPreviewPos) ? dragPreviewPos.x : baseTx;
    const ty = (dragging === 'target' && dragPreviewPos) ? dragPreviewPos.y : baseTy;

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
            const pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            setDragPos(pos);
            const hit = findNodeAtPoint(store.getState().nodeInternals, pos, [source, target]);
            setDropTargetId(hit?.id || null);
        };
        const handleUp = (upEvent) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            const pos = screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY });
            const hit = findNodeAtPoint(store.getState().nodeInternals, pos, [source, target]);
            if (hit) {
                data?.onDropChildLink?.(id, hit.id, nearestHandleSide(hit, pos));
            } else {
                data?.onWaypointChange?.(id, pos);
            }
            setDragPos(null);
            setDropTargetId(null);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }, [id, data, screenToFlowPosition, store, source, target]);

    const handleDoubleClick = useCallback((event) => {
        event.stopPropagation();
        data?.onWaypointChange?.(id, null);
    }, [id, data]);

    const handleEndpointDoubleClick = useCallback((end) => (event) => {
        event.stopPropagation();
        handleAssignEndpoint(end, null);
    }, [handleAssignEndpoint]);

    return (
        <>
            <BaseEdge
                path={edgePath}
                interactionWidth={24}
                style={{
                    stroke: selected ? '#f472b6' : '#ec4899',
                    strokeWidth: selected ? 2.5 : 2,
                    strokeDasharray: '6 4',
                    filter: selected ? 'drop-shadow(0 0 8px #f472b6)' : 'none',
                    transition: dragPos ? 'none' : 'all 200ms ease-in-out',
                }}
            />

            <EdgeLabelRenderer>
                {/* Surbrillance du nœud survolé pendant le glisser — signale qu'une dépose ici
                    reliera ce nœud comme enfant du couple plutôt que de courber la ligne. */}
                {dropTargetRect && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(${dropTargetRect.x - 4}px, ${dropTargetRect.y - 4}px)`,
                            width: dropTargetRect.width + 8,
                            height: dropTargetRect.height + 8,
                            border: '3px solid #fbbf24',
                            borderRadius: 14,
                            boxShadow: '0 0 16px 2px #fbbf24',
                            pointerEvents: 'none',
                            zIndex: 5,
                        }}
                    />
                )}

                {/* Zone de saisie agrandie (32x32) autour de la bulle visuelle (20x20) — les
                    gestionnaires vivent sur ce conteneur, pas sur la bulle elle-même, pour que
                    la marge invisible autour reste tout aussi cliquable/tactile qu'elle. */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${bendX}px,${bendY}px)`,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                    onPointerDown={handlePointerDown}
                    onDoubleClick={handleDoubleClick}
                    title={dropTargetId
                        ? 'Relâcher pour relier ce nœud comme enfant du couple'
                        : 'Glisser pour courber • glisser jusqu\'à un nœud pour le relier comme enfant du couple • double-clic pour réinitialiser'}
                >
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: dropTargetId ? 'rgba(251, 191, 36, 0.9)' : 'rgba(20, 20, 30, 0.85)',
                            border: `2px solid ${dropTargetId ? '#fbbf24' : (selected ? '#f472b6' : '#ec4899')}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)',
                            cursor: 'grab',
                            opacity: selected || hasCustomBend || dropTargetId ? 1 : 0.55,
                            transition: dragPos ? 'none' : 'background 150ms ease-in-out, border-color 150ms ease-in-out',
                        }}
                    >
                        {dropTargetId
                            ? <Baby size={11} color="#78350f" />
                            : <Heart size={10} color="#ec4899" fill="#ec4899" />}
                    </div>
                </div>

                {/* Poignées d'extrémité — mêmes gestes que PhenoEdge.jsx, même agrandissement
                    de zone de saisie (26x26) autour du point visuel (9x9). */}
                {[
                    { end: 'source', x: sx, y: sy, nodeId: source, active: !!data?.sourceHandle },
                    { end: 'target', x: tx, y: ty, nodeId: target, active: !!data?.targetHandle },
                ].map(({ end, x, y, nodeId, active }) => (
                    <div
                        key={end}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
                            width: 26,
                            height: 26,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'all',
                            opacity: selected || active || dragging === end ? 1 : 0,
                            transition: dragging ? 'none' : 'opacity 150ms ease-in-out',
                        }}
                        className="nodrag nopan edge-endpoint-handle"
                        onPointerDown={startDrag(end, nodeId)}
                        onDoubleClick={handleEndpointDoubleClick(end)}
                        title="Glisser vers un autre côté du nœud pour ancrer la liaison ici — double-clic pour revenir à l'accroche automatique"
                    >
                        <div
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                background: active ? '#fbbf24' : (selected ? '#f472b6' : '#ec4899'),
                                border: '2px solid rgba(255,255,255,0.7)',
                                cursor: 'grab',
                            }}
                        />
                    </div>
                ))}
            </EdgeLabelRenderer>
        </>
    );
}
