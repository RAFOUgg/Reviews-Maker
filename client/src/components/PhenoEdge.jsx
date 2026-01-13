import React from 'react';
import { EdgeLabelRenderer, BaseEdge, getStraightPath } from 'reactflow';

/**
 * PhenoEdge - Edge personnalisé pour les connexions généalogiques
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
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: selected ? '#10b981' : '#059669',
                    strokeWidth: selected ? 2.5 : 2,
                    filter: selected ? 'drop-shadow(0 0 8px #10b981)' : 'none',
                    transition: 'all 200ms ease-in-out',
                }}
                markerEnd="url(#arrowhead)"
            />

            {/* Label */}
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
                    <div className="px-2 py-1 bg-slate-800/90 border border-emerald-500/30 rounded text-emerald-300 backdrop-blur-sm hover:bg-slate-700/90 hover:border-emerald-400/50 transition-all cursor-pointer">
                        {label || 'F1'}
                    </div>
                </div>
            </EdgeLabelRenderer>

            {/* SVG Marker Definition */}
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


