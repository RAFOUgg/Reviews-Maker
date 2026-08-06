import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { safeParse, MIN_FONT_PX } from '../../../utils/exportMakerHelpers';
import { LiquidModal } from '@/components/ui/LiquidUI';
import { useIsInteractive } from './InteractiveContext';

// Nœud minimal en lecture seule — pas de réutilisation de `CultivarNode.jsx` (le vrai nœud
// d'édition), qui embarque des hooks de drag de handle/waypoint pensés pour l'édition interactive
// (pas de garde `readOnly` interne) ; réutiliser ces composants tels quels pour un simple embed
// d'inspection aurait été un risque de comportement non désiré plutôt qu'un vrai gain de fidélité.
function GenealogyNode({ data }) {
    return (
        <div style={{
            padding: '8px 12px', borderRadius: 8, minWidth: 120,
            background: data.color || '#7c8f7a', color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            fontSize: 12, fontWeight: 600, textAlign: 'center',
        }}>
            {/* Un nœud sans <Handle> n'a aucun point d'ancrage calculable pour React Flow — les
                arêtes ne s'affichent jamais (`Couldn't create edge for source handle id: "undefined"`),
                trouvé en vérification 2026-07-31. Handles cachés visuellement (lecture seule, pas
                d'interaction de connexion) mais nécessaires à la géométrie des arêtes. */}
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            {data.label}
            {data.genetics?.type && (
                <div style={{ fontSize: MIN_FONT_PX, fontWeight: 400, opacity: 0.85, marginTop: 2, textTransform: 'capitalize' }}>{data.genetics.type}</div>
            )}
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
        </div>
    );
}

const nodeTypes = { cultivar: GenealogyNode };

/**
 * ReadOnlyGenealogyCanvas — vrai canevas React Flow interactif (pan/zoom/clic), en lecture seule,
 * pour la traçabilité complète dans la Fiche Technique Détaillée (Chantier B, 2026-07-30).
 * Remplace `GenealogyMiniView.jsx` (rendu HTML/SVG fait main) UNIQUEMENT dans ce template — les
 * autres templates continuent d'utiliser la mini-vue existante, hors scope de ce chantier.
 *
 * État 100% local (`useState`, pas `useGeneticsStore`) — chaque instance montée (Studio, export,
 * page publique, ET page de lignée qui empile plusieurs reviews à la fois) a son propre état
 * totalement indépendant, sans passer par le store Zustand global partagé utilisé par le vrai
 * canevas d'édition PhenoHunt — élimine par construction le risque de collision entre plusieurs
 * canevas montés simultanément (repéré en auditant avant d'implémenter).
 */
export default function ReadOnlyGenealogyCanvas({ reviewData, height = 320, accentColor = '#A78BFA', titleColor, textColor = '#CBD5E1' }) {
    const treeId = reviewData?.geneticTreeId || reviewData?.flowerData?.geneticTreeId;
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const interactive = useIsInteractive();

    useEffect(() => {
        if (!treeId) { setTree(null); return; }
        let cancelled = false;
        setLoading(true);
        fetch(`/api/genetics/trees/${treeId}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => { if (!cancelled) setTree(data); })
            .catch(() => { if (!cancelled) setTree(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [treeId]);

    const { rfNodes, rfEdges } = useMemo(() => {
        if (!tree || !Array.isArray(tree.nodes)) return { rfNodes: [], rfEdges: [] };
        const nodes = tree.nodes.map((n) => ({
            id: n.id,
            type: 'cultivar',
            // `GenNode.position` est stocké en base comme une CHAÎNE JSON (`position String // JSON:
            // {x,y}`, schema.prisma) et `GET /api/genetics/trees/:id` ne le parse pas côté serveur
            // (contrairement à `GET /trees/:treeId/nodes/:id` qui le fait) — passer la chaîne brute
            // telle quelle à React Flow (bug initial de ce composant) fait s'effondrer TOUS les
            // nœuds à l'origine (0,0) : `fitView` ne peut rien calculer, le `Background` reçoit des
            // coordonnées NaN. `safeParse` (déjà utilisé juste en dessous pour `genetics`).
            position: safeParse(n.position, { x: 0, y: 0 }),
            data: { label: n.cultivarName, color: n.color, genetics: safeParse(n.genetics, {}) },
        }));
        const edges = (tree.edges || []).map((e) => ({
            id: e.id,
            source: e.parentNodeId,
            target: e.childNodeId,
            type: 'smoothstep',
            label: e.relationshipType !== 'pairing' ? e.relationshipType : undefined,
            style: { stroke: accentColor },
            labelStyle: { fill: textColor, fontSize: MIN_FONT_PX },
        }));
        return { rfNodes: nodes, rfEdges: edges };
    }, [tree, accentColor, textColor]);

    if (!treeId || loading) return null;
    if (rfNodes.length === 0) return null;

    return (
        <div>
            <h3 style={{
                fontSize: 14, fontWeight: 600, color: titleColor,
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                borderBottom: `2px solid ${accentColor}33`, paddingBottom: 6,
            }}>
                <span>🧬</span> Généalogie (PhenoHunt) — {tree.name || 'Arbre Généalogique'}
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
                        onNodeClick={interactive ? (_, node) => setDetail(node.data) : undefined}
                    >
                        <Background color={textColor} gap={16} />
                        <Controls showInteractive={false} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            {/* Détail d'un cultivar. Additif : le nœud imprime déjà son nom et son type ; la
                modale développe les caractéristiques génétiques saisies, trop nombreuses pour
                tenir dans un nœud de 120px sans le rendre illisible dans un export figé. */}
            <LiquidModal
                isOpen={Boolean(detail)}
                onClose={() => setDetail(null)}
                size="md"
                title={`🧬 ${detail?.label || 'Cultivar'}`}
            >
                {detail && (() => {
                    const g = detail.genetics || {};
                    const rows = Object.entries(g).filter(([, v]) => v !== undefined && v !== null && v !== '');
                    if (rows.length === 0) {
                        return <p className="text-white/50 text-sm">Aucune caractéristique génétique renseignée pour ce cultivar.</p>;
                    }
                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rows.map(([k, v]) => (
                                <div key={k} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                                    <div className="text-[11px] uppercase tracking-wide text-white/40">{k}</div>
                                    <div className="text-sm text-white font-medium break-words capitalize">
                                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </LiquidModal>
        </div>
    );
}
