import { useEffect, useMemo, useState } from 'react';
import ProductionChainCanvas from '../../production-chain/ProductionChainCanvas';
import { ScopedChainStoreProvider } from '../../../store/scopedCanvasStores';
import ReactFlow, { ReactFlowProvider, Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { safeParse, MIN_FONT_PX } from '../../../utils/exportMakerHelpers';
import { LiquidModal } from '@/components/ui/LiquidUI';
import { useIsInteractive } from './InteractiveContext';

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
            {/* `title` : le libellé est tronqué par `text-overflow: ellipsis` — sans lui, le nom
                complet d'une étape n'est lisible nulle part sur un nœud étroit. */}
            <span title={data.fullLabel || data.label} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</span>
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
    const [chainId, setChainId] = useState(null);
    const [detail, setDetail] = useState(null);
    const interactive = useIsInteractive();

    useEffect(() => {
        if (!reviewId) return;
        let cancelled = false;
        (async () => {
            try {
                const listRes = await fetch(`/api/production-chains/for-review/${reviewType}/${reviewId}`, { credentials: 'include' });
                if (!listRes.ok) return;
                const chains = await listRes.json();
                if (!Array.isArray(chains) || chains.length === 0 || cancelled) return;
                if (!cancelled) setChainId(chains[0].id);
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
                // Conservé pour le détail au clic — le nœud n'affiche qu'un libellé tronqué.
                reviewId: n.reviewId,
                cells: Array.isArray(n.cellData) ? n.cellData : [],
                // `title` natif : l'infobulle du nom complet fonctionne même dans le canevas
                // React Flow, où un survol personnalisé entrerait en concurrence avec le pan.
                fullLabel: n.label,
            },
        }));
        const edges = (chain.edges || []).map((e) => ({
            id: e.id,
            source: e.sourceId ?? e.sourceNodeId,
            target: e.targetId ?? e.targetNodeId,
            type: 'smoothstep',
            label: e.technique || undefined,
            style: { stroke: accentColor },
            labelStyle: { fill: textColor, fontSize: MIN_FONT_PX },
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
            {/* LE canevas de l'app, en lecture seule — plus une reconstruction. Le doublon
                n'existait que parce que le store était un singleton : deux canevas montés
                ensemble se mélangeaient. `ScopedChainStoreProvider` donne à celui-ci son
                état à lui, ce qui lève ce blocage. */}
            <div style={{ height, border: '1px solid rgba(128,128,128,0.2)', borderRadius: 9, overflow: 'hidden' }}>
                {/* `ReactFlowProvider` INDISPENSABLE : les vrais canevas le supposent fourni par
                    leur page (`GraphCanvasShell` le pose en édition). Sans lui, React Flow
                    lève « Seems like you have not used zustand provider as an ancestor » et
                    RIEN ne s'affiche — attrapé en vérification le 2026-08-06, après un
                    déploiement où la mesure d'export n'avait rien vu (les fixtures d'audit
                    n'ont ni chaîne ni arbre). */}
                <ReactFlowProvider>
                <ScopedChainStoreProvider>
                    <ProductionChainCanvas chainId={chainId} readOnly />
                </ScopedChainStoreProvider>
                </ReactFlowProvider>
            </div>

            {/* Détail d'une étape de la chaîne. Strictement ADDITIF : le canevas imprime déjà le
                libellé, le type et les liaisons de chaque étape — la modale ne fait qu'épargner
                le déchiffrage d'un nœud étroit et offrir le saut vers la review source. */}
            <LiquidModal
                isOpen={Boolean(detail)}
                onClose={() => setDetail(null)}
                size="md"
                title={`${TYPE_ICONS[detail?.reviewType] || '📦'} ${detail?.fullLabel || detail?.label || ''}`.trim()}
            >
                {detail && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white/70">
                                {detail.reviewType || 'étape'}
                            </span>
                            {detail.isCurrent && (
                                <span className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300">
                                    Review affichée
                                </span>
                            )}
                            {detail.cells?.length > 0 && (
                                <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white/70">
                                    {detail.cells.length} étape{detail.cells.length > 1 ? 's' : ''} documentée{detail.cells.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {detail.reviewId && !detail.isCurrent && (
                            <a
                                href={`/review/${detail.reviewId}`}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                            >
                                Ouvrir cette fiche →
                            </a>
                        )}
                    </div>
                )}
            </LiquidModal>
        </div>
    );
}
