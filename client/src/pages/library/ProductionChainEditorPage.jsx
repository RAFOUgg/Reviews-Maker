import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { Home, GitBranch } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';
import ProductionChainCanvas from '../../components/production-chain/ProductionChainCanvas';
import ProductAddSidebar from '../../components/production-chain/ProductAddSidebar';

/**
 * ProductionChainEditorPage — page dédiée à l'édition d'une chaîne de production,
 * accessible uniquement depuis la Bibliothèque privée (pas de lien public direct).
 * Modelée sur PhenoHuntPage.jsx.
 */
export default function ProductionChainEditorPage() {
    const navigate = useNavigate();
    const { chainId } = useParams();
    const store = useProductionChainStore();

    useEffect(() => {
        if (chainId && chainId !== store.selectedChainId) {
            store.loadChain(chainId);
        }
    }, [chainId]); // eslint-disable-line react-hooks/exhaustive-deps

    const chainName = store.chains.find(c => c.id === chainId)?.name || 'Chaîne de production';
    const existingReviewIds = store.nodes.map(n => n.reviewId);

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            <header className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/20 px-3 sm:px-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/library?tab=production-chain')}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Retour à la bibliothèque"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-emerald-400" />
                        {chainName}
                    </h1>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden p-3 gap-3">
                <ProductAddSidebar existingReviewIds={existingReviewIds} />

                <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
                    {/* canvasLoading est aussi vrai pendant chaque mutation en arrière-plan (déplacer
                        un nœud...) — ne démonter tout le ReactFlowProvider que lors du tout premier
                        chargement, sinon chaque drag fait disparaître puis réapparaître tout le canvas
                        (perte du zoom/pan). Cf. UnifiedGeneticsCanvas.jsx / ProductionChainCanvas.jsx. */}
                    {store.canvasLoading && store.nodes.length === 0 ? (
                        <div className="h-full flex items-center justify-center bg-slate-900">
                            <div className="text-center text-slate-400">
                                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                                <p>Chargement...</p>
                            </div>
                        </div>
                    ) : (
                        <ReactFlowProvider>
                            <ProductionChainCanvas chainId={chainId} />
                        </ReactFlowProvider>
                    )}
                </div>
            </div>
        </div>
    );
}
