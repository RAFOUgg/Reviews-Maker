import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { GitBranch, Eye } from 'lucide-react';
import ProductionChainCanvas from '../../components/production-chain/ProductionChainCanvas';

/**
 * ProductionChainSharedPage — page publique en lecture seule pour une chaîne de production
 * partagée par code (cf. ChainFormModal.jsx, POST/DELETE .../share). Page sans chrome, hors
 * Layout, même motif que PublicRenderPage.jsx (/r/:id) : /production-chain/shared/:code.
 *
 * GET /api/production-chains/shared/:code ne demande aucune authentification (le code est le
 * justificatif) et renvoie le document complet de la chaîne, mais on ne s'en sert ici que pour
 * résoudre l'id réel — ProductionChainCanvas charge ensuite normalement via
 * useProductionChainStore.loadChain (GET /chains/:id), qui autorise déjà la lecture publique
 * (isPublic) : réutiliser ce chemin déjà testé plutôt que dupliquer sa logique de parsing ici.
 */
export default function ProductionChainSharedPage() {
    const { code } = useParams();
    const [state, setState] = useState({ loading: true, error: null, chainId: null, chainName: '' });

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, error: null, chainId: null, chainName: '' });

        (async () => {
            try {
                const res = await fetch(`/api/production-chains/shared/${code}`, { credentials: 'include' });
                if (cancelled) return;
                if (!res.ok) {
                    setState({ loading: false, error: 'Lien de partage invalide ou révoqué.', chainId: null, chainName: '' });
                    return;
                }
                const chain = await res.json();
                if (cancelled) return;
                setState({ loading: false, error: null, chainId: chain.id, chainName: chain.name || 'Chaîne de production' });
            } catch {
                if (!cancelled) setState({ loading: false, error: 'Impossible de charger cette chaîne.', chainId: null, chainName: '' });
            }
        })();

        return () => { cancelled = true; };
    }, [code]);

    return (
        <div className="h-dvh bg-slate-950 flex flex-col">
            <header className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/20 px-3 sm:px-6 flex items-center justify-between shadow-xl shrink-0">
                <div className="flex items-center gap-3">
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                        Terpologie
                    </Link>
                    <span className="text-slate-600">/</span>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-emerald-400" />
                        {state.chainName || 'Chaîne de production'}
                    </h1>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                    <Eye size={12} /> Lecture seule
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                {state.loading && (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                            <p>Chargement...</p>
                        </div>
                    </div>
                )}
                {state.error && (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <p>❌ {state.error}</p>
                    </div>
                )}
                {!state.loading && !state.error && state.chainId && (
                    <ReactFlowProvider>
                        <ProductionChainCanvas chainId={state.chainId} readOnly />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
}
