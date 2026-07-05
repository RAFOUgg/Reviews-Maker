import React, { useCallback, useState } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import { Layers, Image as ImageIcon } from 'lucide-react';
import { useEdgeEndpointParams, useFloatingNodeRect } from '../graph-canvas/floatingEdgeUtils';
import { useDraggableEndpoint } from '../graph-canvas/useDraggableEndpoint';
import DropTargetHighlight from '../graph-canvas/DropTargetHighlight';

/**
 * ChainEdgeComponent - Edge personnalisé pour les liaisons de transformation entre deux fiches
 * techniques d'une chaîne de production. Modelé sur PhenoEdge.jsx (PhenoHunt) : point d'attache
 * flottant par défaut, point de courbure ("waypoint") déplaçable à la main, et extrémités
 * reconnectables (glisser vers un autre côté du même nœud, ou vers un nœud différent).
 */
export default function ChainEdgeComponent({
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

    const draggingOriginId = dragging === 'source' ? source : dragging === 'target' ? target : null;
    const showReconnectHighlight = hoverNodeId && hoverNodeId !== draggingOriginId;
    const hoverRect = useFloatingNodeRect(showReconnectHighlight ? hoverNodeId : null);

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

    const label = data?.technique || 'Transformation';
    const date = data?.date ? new Date(data.date).toLocaleDateString('fr-FR') : null;

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
                    stroke: selected ? '#f59e0b' : '#d97706',
                    strokeWidth: selected ? 2.5 : 2,
                    filter: selected ? 'drop-shadow(0 0 8px #f59e0b)' : 'none',
                    transition: dragPos ? 'none' : 'all 200ms ease-in-out',
                }}
                markerEnd="url(#chain-arrowhead)"
            />

            <EdgeLabelRenderer>
                <DropTargetHighlight rect={hoverRect} />

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
                    <div className="px-2 py-1 bg-slate-800/90 border border-amber-500/30 rounded text-amber-300 backdrop-blur-sm hover:bg-slate-700/90 hover:border-amber-400/50 transition-all cursor-pointer text-center">
                        <div>{label}</div>
                        {date && <div className="text-[10px] text-amber-400/70">{date}</div>}
                        {data?.cellCount > 0 && (
                            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400" title={`${data.cellCount} cellule(s) de pipeline attachée(s)`}>
                                <Layers size={9} strokeWidth={2.5} />
                                {data.cellCount}
                            </div>
                        )}
                        {data?.mediaCount > 0 && (
                            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400" title={`${data.mediaCount} photo(s)/vidéo(s) attachée(s)`}>
                                <ImageIcon size={9} strokeWidth={2.5} />
                                {data.mediaCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Poignée de courbure — visible au survol/sélection ou si déjà déplacée */}
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
                            background: selected ? '#f59e0b' : '#d97706',
                            border: '2px solid rgba(255,255,255,0.6)',
                            cursor: 'grab',
                        }}
                    />
                </div>

                {/* Poignées d'extrémité — reconnexion vers un autre côté ou un autre nœud */}
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
                                background: active ? '#fbbf24' : (selected ? '#f59e0b' : '#d97706'),
                                border: '2px solid rgba(255,255,255,0.7)',
                                cursor: 'grab',
                            }}
                        />
                    </div>
                ))}
            </EdgeLabelRenderer>

            <defs>
                <marker
                    id="chain-arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M 0 0 L 10 3 L 0 6 Z"
                        fill={selected ? '#f59e0b' : '#d97706'}
                    />
                </marker>
            </defs>
        </>
    );
}
