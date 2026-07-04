import React, { useCallback, useState } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import { useEdgeEndpointParams, useFloatingNodeRect } from '../graph-canvas/floatingEdgeUtils';
import { useDraggableEndpoint } from '../graph-canvas/useDraggableEndpoint';
import DropTargetHighlight from '../graph-canvas/DropTargetHighlight';

/**
 * PhenoEdge - Edge personnalisé pour les connexions généalogiques
 *
 * Point d'attache flottant par défaut (voir graph-canvas/floatingEdgeUtils.js) : la ligne part du
 * bord réel des nœuds selon leur position relative, pas d'un handle fixe — sinon la liaison
 * semble partir "du mauvais endroit" dès qu'un nœud est déplacé. Chaque extrémité peut aussi être
 * ancrée manuellement à un côté précis (haut/bas/gauche/droite) en glissant sa poignée — visible
 * au survol/sélection, cf. useDraggableEndpoint.
 *
 * Supporte aussi un point de courbure ("waypoint") déplaçable à la main : par défaut la liaison
 * est une ligne droite parent→enfant, mais on peut glisser la poignée médiane sur le côté
 * pour la faire dévier (utile pour désenchevêtrer des arbres denses). Le point est persisté
 * via data.onWaypointChange, fourni par UnifiedGeneticsCanvas (délègue à store.updateEdge).
 */
export default function PhenoEdge({
    id,
    source,
    target,
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

    const endpoints = useEdgeEndpointParams(source, target, data?.sourceHandle, data?.targetHandle);
    const [baseSx, baseSy, baseTx, baseTy] = endpoints
        ? [endpoints.sx, endpoints.sy, endpoints.tx, endpoints.ty]
        : [sourceX, sourceY, targetX, targetY];

    const handleAssignEndpoint = useCallback((end, side) => {
        data?.onEndpointHandleChange?.(id, end === 'source' ? { sourceHandle: side } : { targetHandle: side });
    }, [id, data]);
    const handleReconnect = useCallback((end, newNodeId, side) => {
        data?.onEndpointReconnect?.(id, end, newNodeId, side);
    }, [id, data]);
    const { dragging, dragPreviewPos, hoverNodeId, startDrag } = useDraggableEndpoint({
        onAssign: handleAssignEndpoint,
        onReconnect: handleReconnect
    });

    // Surbrillance uniquement quand le survol pointe vers un AUTRE nœud que celui déjà attaché à
    // cette extrémité — un survol du nœud d'origine (simple changement de côté) n'a pas besoin de
    // cette mise en avant, déjà géré par l'opacité de la poignée elle-même.
    const draggingOriginId = dragging === 'source' ? source : dragging === 'target' ? target : null;
    const showReconnectHighlight = hoverNodeId && hoverNodeId !== draggingOriginId;
    const hoverRect = useFloatingNodeRect(showReconnectHighlight ? hoverNodeId : null);

    // Pendant le glisser d'une extrémité, elle suit le curseur (aperçu live) ; l'autre extrémité
    // ne bouge pas.
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

    const handleEndpointDoubleClick = useCallback((end) => (event) => {
        // Double-clic sur une poignée d'extrémité : retour à l'accroche flottante automatique
        event.stopPropagation();
        handleAssignEndpoint(end, null);
    }, [handleAssignEndpoint]);

    return (
        <>
            <BaseEdge
                path={edgePath}
                interactionWidth={24}
                style={{
                    stroke: selected ? '#10b981' : '#059669',
                    strokeWidth: selected ? 2.5 : 2,
                    filter: selected ? 'drop-shadow(0 0 8px #10b981)' : 'none',
                    transition: dragPos ? 'none' : 'all 200ms ease-in-out',
                }}
                markerEnd="url(#arrowhead)"
            />

            <EdgeLabelRenderer>
                {/* Surbrillance du nœud survolé pendant le glisser d'une extrémité vers un AUTRE
                    nœud — signale qu'une dépose ici reconnectera réellement la liaison. */}
                <DropTargetHighlight rect={hoverRect} />

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
                    <div
                        className="px-2.5 py-1 rounded-lg text-emerald-300 cursor-pointer transition-all hover:bg-white/10 hover:border-emerald-400/50"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            backdropFilter: 'blur(12px) saturate(150%)',
                            boxShadow: '0 2px 12px -2px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.08)',
                        }}
                    >
                        {label || 'F1'}
                    </div>
                </div>

                {/* Poignée de courbure — visible seulement au survol/sélection pour ne pas
                    encombrer un arbre dense, sauf si déjà déplacée (hasCustomBend). Zone de
                    saisie agrandie (28x28) autour du point visuel (10x10) : plus facile à
                    attraper à la souris comme au doigt sans changer l'encombrement visuel. */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${bendX}px,${bendY}px)`,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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

                {/* Poignées d'extrémité — glisser vers un autre côté du MÊME nœud pour forcer
                    l'accroche à cet endroit, ou vers un AUTRE nœud pour reconnecter réellement
                    la liaison (double-clic : retour à l'accroche automatique). Visibles au
                    survol/sélection ou pendant le glisser en cours. Même agrandissement de zone
                    de saisie que la poignée de courbure ci-dessus. */}
                {[
                    { end: 'source', x: sx, y: sy, nodeId: source, otherNodeId: target, active: !!data?.sourceHandle },
                    { end: 'target', x: tx, y: ty, nodeId: target, otherNodeId: source, active: !!data?.targetHandle },
                ].map(({ end, x, y, nodeId, otherNodeId, active }) => (
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
                        onPointerDown={startDrag(end, nodeId, otherNodeId)}
                        onDoubleClick={handleEndpointDoubleClick(end)}
                        title="Glisser vers un autre côté du nœud pour ancrer la liaison ici, ou vers un autre nœud pour reconnecter la liaison — double-clic pour revenir à l'accroche automatique"
                    >
                        <div
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                background: active ? '#fbbf24' : (selected ? '#10b981' : '#059669'),
                                border: '2px solid rgba(255,255,255,0.7)',
                                cursor: 'grab',
                            }}
                        />
                    </div>
                ))}
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
