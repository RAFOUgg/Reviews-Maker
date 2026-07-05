/**
 * ChainSectionEmbed Component
 *
 * Accès à la Chaîne de production directement depuis une section pipeline (Culture/Séparation/
 * Extraction/Recette) d'un formulaire de review — même esprit que Genetiques.jsx (PhenoHunt)
 * pour la fleur : bouton d'ouverture, choix créer vide / créer à partir de cette fiche / importer
 * dans une chaîne existante, puis canvas complet embarqué une fois lié.
 *
 * Différence structurelle assumée avec PhenoHunt : il n'existe PAS de FK "productionChainId" sur
 * les reviews (ChainNode.reviewId n'est qu'un champ best-effort, cf. schema.prisma) — une review
 * peut appartenir à plusieurs chaînes, et "créer une chaîne vide" ne l'y ajoute pas automatiquement
 * (elle ne sera donc pas retrouvée comme "liée" à la prochaine ouverture tant qu'aucun nœud ne la
 * référence réellement). Comportement volontairement identique à handleCreateEmptyTree côté PhenoHunt.
 */

import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { GitBranch, Plus, PackagePlus, Upload, X, ArrowLeft } from 'lucide-react';
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import ProductionChainCanvas from './ProductionChainCanvas';
import ProductAddSidebar from './ProductAddSidebar';

const ChainSectionEmbed = ({ reviewId, reviewType, reviewLabel, reviewImage }) => {
    const store = useProductionChainStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [linkedChains, setLinkedChains] = useState([]);
    const [selectedChainId, setSelectedChainId] = useState(null);
    const [forceChoicePanel, setForceChoicePanel] = useState(false);
    const [showImportPicker, setShowImportPicker] = useState(false);
    const [error, setError] = useState(null);

    if (!reviewId) return null;

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        setError(null);
        const [forReviewResult] = await Promise.all([
            store.fetchChainsForReview(reviewType, reviewId),
            store.fetchChains()
        ]);
        const chains = forReviewResult?.data || [];
        setLinkedChains(chains);
        setSelectedChainId(chains[0]?.id || null);
        setLoading(false);
    };

    const handleClose = () => {
        setOpen(false);
        setForceChoicePanel(false);
        setShowImportPicker(false);
    };

    const nodePayload = () => ({
        reviewType,
        reviewId,
        label: reviewLabel || 'Sans nom',
        image: reviewImage || null,
        position: { x: 300, y: 200 },
        color: '#10b981'
    });

    const handleCreateEmpty = async () => {
        setBusy(true);
        setError(null);
        const result = await store.createChain({ name: `Chaîne de production - ${reviewLabel || 'Sans nom'}` });
        if (result?.data) {
            await store.loadChain(result.data.id);
            setLinkedChains(prev => [...prev, result.data]);
            setSelectedChainId(result.data.id);
            setForceChoicePanel(false);
        } else {
            setError(result?.error || 'Erreur lors de la création');
        }
        setBusy(false);
    };

    const handleCreateFromReview = async () => {
        setBusy(true);
        setError(null);
        const result = await store.createChain({ name: `Chaîne de production - ${reviewLabel || 'Sans nom'}` });
        if (result?.data) {
            await store.loadChain(result.data.id);
            await store.addNode(nodePayload());
            setLinkedChains(prev => [...prev, result.data]);
            setSelectedChainId(result.data.id);
            setForceChoicePanel(false);
        } else {
            setError(result?.error || 'Erreur lors de la création');
        }
        setBusy(false);
    };

    const handleImportToChain = async (chain) => {
        setBusy(true);
        setError(null);
        await store.loadChain(chain.id);
        const result = await store.addNode(nodePayload());
        if (result?.data) {
            setLinkedChains(prev => [...prev, chain]);
            setSelectedChainId(chain.id);
            setForceChoicePanel(false);
            setShowImportPicker(false);
        } else {
            setError(result?.error || "Erreur lors de l'import");
        }
        setBusy(false);
    };

    if (!open) {
        return (
            <LiquidButton variant="outline" icon={GitBranch} onClick={handleOpen}>
                Ouvrir la chaîne de production
            </LiquidButton>
        );
    }

    const showChoicePanel = linkedChains.length === 0 || forceChoicePanel;
    const importableChains = store.chains.filter(c => !linkedChains.some(lc => lc.id === c.id));
    const existingReviewIds = store.nodes.map(n => n.reviewId);

    return (
        <LiquidCard className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    Chaîne de production
                </h4>
                <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10">
                    <X className="w-4 h-4 text-white/50" />
                </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loading ? (
                <div className="py-8 text-center text-white/40 text-sm">Chargement...</div>
            ) : showChoicePanel ? (
                showImportPicker ? (
                    <div className="space-y-2">
                        <p className="text-sm text-white/60">Choisissez la chaîne à laquelle ajouter cette fiche :</p>
                        {importableChains.length === 0 && (
                            <p className="text-sm text-white/40">Aucune autre chaîne disponible.</p>
                        )}
                        {importableChains.map(chain => (
                            <button
                                key={chain.id}
                                type="button"
                                disabled={busy}
                                onClick={() => handleImportToChain(chain)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                            >
                                <span className="text-sm text-white">{chain.name}</span>
                                <span className="text-xs text-white/40">{chain._count?.nodes ?? 0} produit(s)</span>
                            </button>
                        ))}
                        <LiquidButton variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setShowImportPicker(false)}>
                            Retour
                        </LiquidButton>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-white/60">Comment souhaitez-vous procéder avec cette fiche technique ?</p>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCreateEmpty}
                            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-white">Créer une chaîne vide</p>
                                <p className="text-xs text-white/50">Commencez une nouvelle chaîne de production depuis zéro</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCreateFromReview}
                            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                        >
                            <PackagePlus className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-white">Créer une chaîne à partir de cette fiche</p>
                                <p className="text-xs text-white/50">Utilisez cette fiche comme point de départ de la chaîne</p>
                            </div>
                        </button>
                        {store.chains.length > 0 && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setShowImportPicker(true)}
                                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                            >
                                <Upload className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Importer cette fiche dans une chaîne existante</p>
                                    <p className="text-xs text-white/50">Ajoutez cette fiche à une chaîne déjà créée ({store.chains.length} chaîne{store.chains.length > 1 ? 's' : ''})</p>
                                </div>
                            </button>
                        )}
                        {linkedChains.length > 0 && (
                            <LiquidButton variant="ghost" size="sm" onClick={() => setForceChoicePanel(false)}>
                                Annuler
                            </LiquidButton>
                        )}
                    </div>
                )
            ) : (
                <>
                    {linkedChains.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                            {linkedChains.map(chain => (
                                <button
                                    key={chain.id}
                                    type="button"
                                    onClick={() => setSelectedChainId(chain.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedChainId === chain.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {chain.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 h-[60vh] min-h-[420px] max-h-[650px]">
                        <ProductAddSidebar existingReviewIds={existingReviewIds} />
                        <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
                            <ReactFlowProvider>
                                <ProductionChainCanvas chainId={selectedChainId} />
                            </ReactFlowProvider>
                        </div>
                    </div>
                    <LiquidButton variant="ghost" size="sm" icon={Plus} onClick={() => setForceChoicePanel(true)}>
                        Ajouter à une autre chaîne
                    </LiquidButton>
                </>
            )}
        </LiquidCard>
    );
};

export default ChainSectionEmbed;
