import { useEffect, useState } from 'react';

/**
 * ProductionChainMiniView - Vue interactive lecture seule de la chaîne de production
 * (lignée Fleur → Hash → Concentré/Comestible) à laquelle appartient une review,
 * pour affichage dans Export Maker (Fiche Détaillée) et la galerie.
 *
 * Appel direct à l'API (pas via useProductionChainStore) : ce store est un Zustand
 * global partagé — l'utiliser ici casserait l'affichage dès que plusieurs cartes sont
 * montées en même temps (galerie), chacune écrasant les nodes/edges des autres.
 */
function normalizeReviewType(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

// Ordonne les nœuds de la chaîne selon les liaisons (amont → aval), en tolérant
// les chaînes non strictement linéaires (plusieurs sources/aval possibles).
function orderChainNodes(nodes, edges) {
    const incomingCount = {};
    const outgoing = {};
    nodes.forEach(n => { incomingCount[n.id] = 0; });
    edges.forEach(e => {
        outgoing[e.sourceNodeId] = outgoing[e.sourceNodeId] || [];
        outgoing[e.sourceNodeId].push(e.targetNodeId);
        incomingCount[e.targetNodeId] = (incomingCount[e.targetNodeId] || 0) + 1;
    });
    const roots = nodes.filter(n => !incomingCount[n.id]);
    const queue = [...(roots.length ? roots : nodes.slice(0, 1))];
    const visited = new Set();
    const ordered = [];
    while (queue.length > 0) {
        const n = queue.shift();
        if (!n || visited.has(n.id)) continue;
        visited.add(n.id);
        ordered.push(n);
        const nextIds = outgoing[n.id] || [];
        nextIds.forEach(id => {
            const next = nodes.find(x => x.id === id);
            if (next && !visited.has(id)) queue.push(next);
        });
    }
    nodes.forEach(n => { if (!visited.has(n.id)) ordered.push(n); });
    return ordered;
}

const TYPE_ICONS = { flower: '🌸', hash: '🟤', concentrate: '💎', edible: '🍬' };

export default function ProductionChainMiniView({ reviewData, sectionFontSize = 16, accentColor = '#a78bfa', titleColor }) {
    const reviewId = reviewData?.id;
    const reviewType = normalizeReviewType(reviewData?.type);
    const [chain, setChain] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

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
                if (!cancelled) setChain(full);
            } catch {
                // pas de chaîne — vue simplement masquée
            }
        })();

        return () => { cancelled = true; };
    }, [reviewId, reviewType]);

    if (!chain || !Array.isArray(chain.nodes) || chain.nodes.length < 2) return null;

    const ordered = orderChainNodes(chain.nodes, chain.edges || []);

    return (
        <div>
            <h3 style={{
                fontSize: `${sectionFontSize}px`, fontWeight: 600, color: titleColor,
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                borderBottom: `2px solid ${accentColor}33`, paddingBottom: 6,
            }}>
                <span>🔗</span> Chaîne de production
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                {ordered.map((node, i) => {
                const isCurrent = node.reviewType === reviewType && node.reviewId === reviewId;
                const edgeToNext = (chain.edges || []).find(e => e.sourceNodeId === node.id && e.targetNodeId === ordered[i + 1]?.id);
                return (
                    <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === node.id ? null : node.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 20,
                                border: isCurrent ? '2px solid currentColor' : '1px solid rgba(128,128,128,0.3)',
                                background: isCurrent ? 'rgba(167,139,250,0.18)' : 'rgba(128,128,128,0.08)',
                                fontSize: 12, fontWeight: isCurrent ? 700 : 500,
                                cursor: node.reviewId ? 'pointer' : 'default',
                                color: 'inherit',
                            }}
                            title={node.label}
                        >
                            <span>{TYPE_ICONS[node.reviewType] || '📦'}</span>
                            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {node.label}
                            </span>
                        </button>
                        {i < ordered.length - 1 && (
                            <span title={edgeToNext?.technique || ''} style={{ opacity: 0.6, fontSize: 14 }}>→</span>
                        )}
                        {expandedId === node.id && (
                            <ChainNodeDetail node={node} onNavigate={() => {
                                if (node.reviewId) window.open(`/review/${node.reviewId}`, '_blank', 'noopener');
                            }} />
                        )}
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

function ChainNodeDetail({ node, onNavigate }) {
    return (
        <div style={{
            position: 'absolute', marginTop: 4, zIndex: 20,
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(20,20,30,0.95)', color: '#fff',
            fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            minWidth: 160,
        }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{node.label}</div>
            {Array.isArray(node.cellData) && node.cellData.length > 0 && (
                <div style={{ opacity: 0.8, marginBottom: 4 }}>{node.cellData.length} donnée(s) de pipeline attachée(s)</div>
            )}
            {node.reviewId && (
                <button type="button" onClick={onNavigate} style={{ color: '#a78bfa', textDecoration: 'underline', fontSize: 12 }}>
                    Voir la fiche →
                </button>
            )}
        </div>
    );
}
