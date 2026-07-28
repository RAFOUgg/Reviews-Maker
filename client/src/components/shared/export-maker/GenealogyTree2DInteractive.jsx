import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Dna, Camera, Flower2, Info } from 'lucide-react';

/**
 * GenealogyTree2DInteractive – Interactive HTML/CSS genealogy tree with clickable nodes
 * Lightweight alternative to UnifiedGeneticsCanvas (React Flow) for gallery display
 * Features: clickable cultivars, node detail modals, hover effects
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

    const NODE_W = 160;
    const NODE_H = 70;
    const GAP_X = 40;
    const GAP_Y = 90;
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
                level: lv,
            });
        });
    });

    // Normalize positions to start from 0
    if (positioned.length > 0) {
        const minX = Math.min(...positioned.map(n => n.x - n.w / 2));
        const minY = Math.min(...positioned.map(n => n.y));
        positioned.forEach(n => { n.x -= minX; n.y -= minY; });
    }

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
                id: e.id || `${src.id}-${tgt.id}`,
            };
        })
        .filter(Boolean);

    return { positioned, connections };
}

// Single cultivar detail panel
function CultivarDetailPanel({ cultivar, onClose }) {
    const name = cultivar.cultivarName || cultivar.data?.label || cultivar.data?.cultivarName || cultivar.id;
    const genetics = cultivar.genetics || cultivar.data?.genetics || {};
    const img = cultivar.image || cultivar.data?.image;
    const notes = cultivar.notes || cultivar.data?.notes || '';
    const breeder = genetics.breeder || '';
    const variety = genetics.variety || '';
    const type = genetics.type || genetics.geneticType || '';
    const indicaPercent = genetics.indicaPercent;
    const sativaPercent = genetics.sativaPercent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[#12121e] border border-white/15 rounded-2xl p-6 shadow-2xl relative max-w-lg"
        >
            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Header with image and name */}
            <div className="flex items-start gap-4 mb-5">
                {img ? (
                    <img
                        src={img}
                        alt={name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                        <Flower2 className="w-8 h-8" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-white mb-1">{name}</h4>
                    {type && (
                        <span className="inline-block px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wide">
                            {type}
                        </span>
                    )}
                </div>
            </div>

            {/* Genetics info */}
            {(breeder || variety || indicaPercent != null || sativaPercent != null) && (
                <div className="mb-5 space-y-3">
                    <h5 className="text-sm font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
                        <Dna className="w-4 h-4" />
                        Génétiques
                    </h5>
                    <div className="space-y-2">
                        {breeder && (
                            <div className="flex justify-between">
                                <span className="text-sm text-white/50">Breeder</span>
                                <span className="text-sm text-white font-medium">{breeder}</span>
                            </div>
                        )}
                        {variety && (
                            <div className="flex justify-between">
                                <span className="text-sm text-white/50">Variété</span>
                                <span className="text-sm text-white font-medium">{variety}</span>
                            </div>
                        )}
                        {(indicaPercent != null || sativaPercent != null) && (
                            <div className="flex gap-2">
                                {indicaPercent != null && (
                                    <span className="px-2 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                                        {indicaPercent}% Indica
                                    </span>
                                )}
                                {sativaPercent != null && (
                                    <span className="px-2 py-1 rounded-md bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold">
                                        {sativaPercent}% Sativa
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            {notes && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <span className="text-xs text-white/40 block mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Notes
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed">{notes}</p>
                </div>
            )}
        </motion.div>
    );
}

export default function GenealogyTree2DInteractive({ nodes = [], edges = [], compact = false, title = "Arbre Généalogique" }) {
    const [selectedCultivar, setSelectedCultivar] = useState(null);
    const [hoveredCultivar, setHoveredCultivar] = useState(null);

    const { positioned, connections } = useMemo(() => layoutNodes(nodes, edges), [nodes, edges]);

    if (!positioned.length) {
        return (
            <div className="text-center py-8">
                <Flower2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">Aucune donnée généalogique disponible</p>
            </div>
        );
    }

    const maxX = Math.max(...positioned.map(n => n.x + n.w / 2)) + 20;
    const maxY = Math.max(...positioned.map(n => n.y + n.h)) + 20;
    const scale = compact ? 0.7 : 1;

    return (
        <div className="space-y-4">
            {/* Tree Header */}
            {!compact && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌳</span>
                        <div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <span className="text-xs text-white/40">
                                {positioned.length} cultivar{positioned.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-white/30">
                        Cliquez sur un cultivar pour plus d'infos
                    </div>
                </div>
            )}

            {/* Interactive Tree */}
            <div className="relative overflow-auto bg-white/2 rounded-xl border border-white/8 p-4">
                <div
                    className="relative"
                    style={{
                        width: maxX * scale,
                        height: maxY * scale,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        minHeight: compact ? 200 : 300,
                    }}
                >
                    {/* SVG connection lines */}
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        width={maxX}
                        height={maxY}
                        style={{ overflow: 'visible' }}
                    >
                        {connections.map((c, i) => {
                            const midY = (c.y1 + c.y2) / 2;
                            return (
                                <g key={c.id || i}>
                                    <path
                                        d={`M${c.x1},${c.y1} C${c.x1},${midY} ${c.x2},${midY} ${c.x2},${c.y2}`}
                                        fill="none"
                                        stroke="rgba(139,92,246,0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="4,4"
                                    />
                                    <circle cx={c.x2} cy={c.y2} r="4" fill="rgba(139,92,246,0.6)" />
                                    {c.label && (
                                        <text
                                            x={(c.x1 + c.x2) / 2}
                                            y={midY - 8}
                                            textAnchor="middle"
                                            className="text-[10px] fill-white/50 font-medium"
                                        >
                                            {c.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Interactive cultivar nodes */}
                    {positioned.map((cultivar) => {
                        const name = cultivar.cultivarName || cultivar.data?.label || cultivar.data?.cultivarName || cultivar.id;
                        const genetics = cultivar.genetics || cultivar.data?.genetics || {};
                        const img = cultivar.image || cultivar.data?.image;
                        const isSelected = selectedCultivar === cultivar.id;
                        const isHovered = hoveredCultivar === cultivar.id;
                        const type = genetics.type || genetics.geneticType;

                        return (
                            <motion.button
                                key={cultivar.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCultivar(isSelected ? null : cultivar.id)}
                                onMouseEnter={() => setHoveredCultivar(cultivar.id)}
                                onMouseLeave={() => setHoveredCultivar(null)}
                                className={`absolute rounded-xl border transition-all duration-200 overflow-hidden shadow-lg ${isSelected
                                        ? 'border-purple-500/80 shadow-purple-500/20 shadow-lg'
                                        : isHovered
                                            ? 'border-purple-500/40 shadow-purple-500/10'
                                            : 'border-white/15 hover:border-white/30'
                                    }`}
                                style={{
                                    left: cultivar.x - cultivar.w / 2,
                                    top: cultivar.y,
                                    width: cultivar.w,
                                    height: cultivar.h,
                                    background: isSelected
                                        ? 'rgba(139,92,246,0.15)'
                                        : 'rgba(26,26,46,0.95)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <div className="flex items-center gap-3 p-3 h-full">
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={name}
                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                                            <Flower2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="text-xs font-semibold text-white truncate mb-0.5">
                                            {name}
                                        </div>
                                        {type && (
                                            <div className="text-[10px] text-purple-300/80 truncate">
                                                {type}
                                            </div>
                                        )}
                                        {genetics.breeder && (
                                            <div className="text-[9px] text-white/40 truncate">
                                                {genetics.breeder}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedCultivar !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <CultivarDetailPanel
                            cultivar={positioned.find(c => c.id === selectedCultivar)}
                            onClose={() => setSelectedCultivar(null)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}