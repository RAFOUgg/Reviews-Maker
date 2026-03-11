import { useMemo } from 'react';

/**
 * GenealogyTree2D – Static 2D HTML/CSS genealogy tree renderer
 * Renders genetic tree nodes and relationships as pure HTML
 * for use in OrchardPanel preview/export (no React Flow dependency).
 */

// Layout: auto-position nodes in a top-down tree layout
function layoutNodes(nodes, edges) {
    if (!nodes?.length) return { positioned: [], connections: [] };

    const childMap = {};  // parentId -> [childId]
    const parentMap = {}; // childId -> [parentId]
    edges.forEach(e => {
        const src = e.parentNodeId || e.source;
        const tgt = e.childNodeId || e.target;
        if (!childMap[src]) childMap[src] = [];
        childMap[src].push(tgt);
        if (!parentMap[tgt]) parentMap[tgt] = [];
        parentMap[tgt].push(src);
    });

    // Find root nodes (no parents)
    const roots = nodes.filter(n => !parentMap[n.id] || parentMap[n.id].length === 0);
    if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0]);

    // BFS to assign levels
    const levels = {};
    const visited = new Set();
    const queue = roots.map(r => ({ id: r.id, level: 0 }));
    roots.forEach(r => { levels[r.id] = 0; visited.add(r.id); });

    while (queue.length > 0) {
        const { id, level } = queue.shift();
        const children = childMap[id] || [];
        children.forEach(cid => {
            if (!visited.has(cid)) {
                visited.add(cid);
                levels[cid] = level + 1;
                queue.push({ id: cid, level: level + 1 });
            }
        });
    }

    // Assign levels to orphan nodes
    nodes.forEach(n => {
        if (levels[n.id] === undefined) levels[n.id] = 0;
    });

    // Group by level
    const byLevel = {};
    nodes.forEach(n => {
        const lv = levels[n.id];
        if (!byLevel[lv]) byLevel[lv] = [];
        byLevel[lv].push(n);
    });

    const NODE_W = 140;
    const NODE_H = 60;
    const GAP_X = 30;
    const GAP_Y = 80;
    const positioned = [];
    const sortedLevels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

    sortedLevels.forEach(lv => {
        const row = byLevel[lv];
        const totalW = row.length * NODE_W + (row.length - 1) * GAP_X;
        const startX = -totalW / 2;
        row.forEach((node, i) => {
            positioned.push({
                ...node,
                x: startX + i * (NODE_W + GAP_X) + NODE_W / 2,
                y: lv * (NODE_H + GAP_Y),
                w: NODE_W,
                h: NODE_H,
            });
        });
    });

    // Normalize positions to start from 0
    const minX = Math.min(...positioned.map(n => n.x - n.w / 2));
    const minY = Math.min(...positioned.map(n => n.y));
    positioned.forEach(n => { n.x -= minX; n.y -= minY; });

    // Build connections between positioned nodes
    const posMap = {};
    positioned.forEach(n => { posMap[n.id] = n; });
    const connections = edges
        .map(e => {
            const src = posMap[e.parentNodeId || e.source];
            const tgt = posMap[e.childNodeId || e.target];
            if (!src || !tgt) return null;
            return {
                x1: src.x, y1: src.y + src.h,
                x2: tgt.x, y2: tgt.y,
                label: e.relationshipType || e.label || '',
            };
        })
        .filter(Boolean);

    return { positioned, connections };
}

export default function GenealogyTree2D({ nodes = [], edges = [], compact = false }) {
    const { positioned, connections } = useMemo(() => layoutNodes(nodes, edges), [nodes, edges]);

    if (!positioned.length) return null;

    const maxX = Math.max(...positioned.map(n => n.x + n.w / 2)) + 10;
    const maxY = Math.max(...positioned.map(n => n.y + n.h)) + 10;
    const scale = compact ? 0.75 : 1;

    return (
        <div
            className="relative overflow-hidden"
            style={{ width: maxX * scale, height: maxY * scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
            {/* SVG lines */}
            <svg
                className="absolute inset-0 pointer-events-none"
                width={maxX}
                height={maxY}
                style={{ overflow: 'visible' }}
            >
                {connections.map((c, i) => {
                    const midY = (c.y1 + c.y2) / 2;
                    return (
                        <g key={i}>
                            <path
                                d={`M${c.x1},${c.y1} C${c.x1},${midY} ${c.x2},${midY} ${c.x2},${c.y2}`}
                                fill="none"
                                stroke="rgba(168,85,247,0.5)"
                                strokeWidth="2"
                            />
                            <circle cx={c.x2} cy={c.y2} r="3" fill="rgba(168,85,247,0.7)" />
                            {c.label && (
                                <text
                                    x={(c.x1 + c.x2) / 2}
                                    y={midY - 4}
                                    textAnchor="middle"
                                    className="text-[9px] fill-white/40"
                                >
                                    {c.label}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Nodes */}
            {positioned.map((node) => {
                const name = node.cultivarName || node.data?.label || node.data?.cultivarName || node.id;
                const genetics = node.genetics || node.data?.genetics;
                const img = node.image || node.data?.image;

                return (
                    <div
                        key={node.id}
                        className="absolute rounded-xl border border-white/15 bg-[#1a1a2e]/90 backdrop-blur-sm shadow-lg overflow-hidden"
                        style={{
                            left: node.x - node.w / 2,
                            top: node.y,
                            width: node.w,
                            height: node.h,
                        }}
                    >
                        <div className="flex items-center gap-2 p-2 h-full">
                            {img && (
                                <img
                                    src={img}
                                    alt={name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-semibold text-white truncate">{name}</div>
                                {genetics?.type && (
                                    <div className="text-[9px] text-purple-300/70 truncate">{genetics.type}</div>
                                )}
                                {genetics?.breeder && (
                                    <div className="text-[9px] text-white/40 truncate">{genetics.breeder}</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
