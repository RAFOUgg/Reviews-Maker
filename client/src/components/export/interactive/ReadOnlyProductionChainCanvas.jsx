import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { safeParse } from '../../../utils/exportMakerHelpers';

const TYPE_ICONS = { flower: '🌸', hash: '🟤', concentrate: '💎', edible: '🍬' };

function normalizeReviewType(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

// Nœud minimal en lecture seule — mêmes raisons que `ReadOnlyGenealogyCanvas.jsx` (le vrai nœud
// d'édition de la Chaîne de production embarque des menus contextuels/handlers pensés pour
// l'édition, pas un simple embed d'inspection).
function ChainNode({ data }) {
    return (
        <div style={{
            padding: '8px 12px', borderRadius: 8, minWidth: 130,
            background: data.isCurrent ? data.accentColor : 'rgba(128,128,128,0.18)',
            color: data.isCurrent ? '#fff' : data.textColor,
            border: `1px solid ${data.isCurrent ? data.accentColor : 'rgba(128,128,128,0.35)'}`,
            fontSize: 12, fontWeight: data.isCurrent ? 700 : 500,
            display: 'flex', alignItems: 'center', gap: 6,
        }}>
            {/* Handles cachés — nécessaires pour que React Flow calcule la géométrie des arêtes,
                même en lecture seule (même bug/fix que `ReadOnlyGenealogyCanvas.jsx`). */}
            <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
            <span>{TYPE_ICONS[data.reviewType] || '📦'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</span>
            <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
        </div>
    );
}

const nodeTypes = { chain: ChainNode };

/**
 * ReadOnlyProductionChainCanvas — vrai canevas React Flow interactif (pan/zoom/clic), en lecture
 * seule, pour la traçabilité complète dans la Fiche Technique Détaillée (Chantier B, 2026-07-30).
 * Remplace `ProductionChainMiniView.jsx` UNIQUEMENT dans ce template.
 *
 * État 100% local (`useState`, pas `useProductionChainStore`) — même raisonnement d'isolation que
 * `ReadOnlyGenealogyCanvas.jsx` : le store Zustand de la Chaîne de production est un singleton
 * global partagé par le vrai canevas d'édition, incompatible avec plusieurs instances montées en
 * même temps (page de lignée multi-review, galerie) sans collision d'état.
 */
export default function ReadOnlyProductionChainCanvas({ reviewData, height = 320, accentColor = '#A78BFA', titleColor, textColor = '#CBD5E1' }) {
    const reviewId = reviewData?.id;
    const reviewType = normalizeReviewType(reviewData?.type);
    const [chain, setChain] = useState(null);

    useEffect(() => {
        if (!reviewId) return;
        let cancelled = false;
        (async () => {
            try {
                const listRes = await fetch(`/api/production-chains/for-review/${reviewType}/${reviewId}`, { credentials: 'include' });
                if (!listRes.ok) return;
                const chains = await listRes.json();
                if (!Array.isArray(chains) || chains.length === 0 || cancelled) return;
                const chainRes = await fetch(`/api/production-chains/chains/${chains[0].id}`, { credentials: 'include' });
                if (!chainRes.ok || cancelled) return;
                const full = await chainRes.json();
                if (!cancelled) {
                    setChain({
                        ...full,
                        nodes: (full.nodes || []).map((n) => ({ ...n, cellData: safeParse(n.cellData, []) })),
                        edges: (full.edges || []).map((e) => ({ ...e, cellData: safeParse(e.cellData, []) })),
                    });
                }
            } catch {
                // pas de chaîne — vue simplement masquée
            }
        })();
        return () => { cancelled = true; };
    }, [reviewId, reviewType]);

    const { rfNodes, rfEdges } = useMemo(() => {
        if (!chain || !Array.isArray(chain.nodes) || chain.nodes.length < 2) return { rfNodes: [], rfEdges: [] };
        const nodes = chain.nodes.map((n, i) => ({
            id: n.id,
            type: 'chain',
            // `ChainNode.position` est une CHAÎNE JSON en base (`position String // JSON: {x,y}`,
            // schema.prisma), jamais parsée par `assembleChainDetail` (`production-chains.js`) — même
            // bug que `ReadOnlyGenealogyCanvas.jsx` (chaîne brute passée à React Flow = tous les
            // nœuds effondrés à l'origine, `fitView`/`Background` cassés).
            position: safeParse(n.position, { x: i * 200, y: 0 }),
            data: {
                label: n.label, reviewType: n.reviewType,
                isCurrent: n.reviewType === reviewType && n.reviewId === reviewId,
                accentColor, textColor,
            },
        }));
        const edges = (chain.edges || []).map((e) => ({
            id: e.id,
            source: e.sourceId ?? e.sourceNodeId,
            target: e.targetId ?? e.targetNodeId,
            type: 'smoothstep',
            label: e.technique || undefined,
            style: { stroke: accentColor },
            labelStyle: { fill: textColor, fontSize: 10 },
        }));
        return { rfNodes: nodes, rfEdges: edges };
    }, [chain, accentColor, textColor, reviewType, reviewId]);

    if (rfNodes.length === 0) return null;

    return (
        <div>
            <h3 style={{
                fontSize: 14, fontWeight: 600, color: titleColor,
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                borderBottom: `2px solid ${accentColor}33`, paddingBottom: 6,
            }}>
                <span>🔗</span> Chaîne de production
            </h3>
            <div style={{ height, border: '1px solid rgba(128,128,128,0.2)', borderRadius: 9, overflow: 'hidden' }}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={rfNodes}
                        edges={rfEdges}
                        nodeTypes={nodeTypes}
                        fitView
                        proOptions={{ hideAttribution: true }}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={true}
                        zoomOnDoubleClick={false}
                    >
                        <Background color={textColor} gap={16} />
                        <Controls showInteractive={false} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}
