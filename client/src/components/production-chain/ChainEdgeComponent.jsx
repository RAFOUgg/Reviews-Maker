import React from 'react';
import { EdgeLabelRenderer, BaseEdge, getStraightPath } from 'reactflow';

/**
 * ChainEdgeComponent - Edge personnalisé pour les liaisons de transformation
 * entre deux fiches techniques d'une chaîne de production. Modelé sur PhenoEdge.jsx.
 */
export default function ChainEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
    data,
}) {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const label = data?.technique || 'Transformation';
    const date = data?.date ? new Date(data.date).toLocaleDateString('fr-FR') : null;

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: selected ? '#f59e0b' : '#d97706',
                    strokeWidth: selected ? 2.5 : 2,
                    filter: selected ? 'drop-shadow(0 0 8px #f59e0b)' : 'none',
                    transition: 'all 200ms ease-in-out',
                }}
                markerEnd="url(#chain-arrowhead)"
            />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: '12px',
                        fontWeight: '600',
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="px-2 py-1 bg-slate-800/90 border border-amber-500/30 rounded text-amber-300 backdrop-blur-sm hover:bg-slate-700/90 hover:border-amber-400/50 transition-all cursor-pointer text-center">
                        <div>{label}</div>
                        {date && <div className="text-[10px] text-amber-400/70">{date}</div>}
                    </div>
                </div>
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
