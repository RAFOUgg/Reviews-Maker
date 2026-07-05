/**
 * ChainSectionEmbed Component
 *
 * Accès à la Chaîne de production directement depuis une section pipeline (Culture/Séparation/
 * Extraction/Recette) d'un formulaire de review — même esprit que Genetiques.jsx (PhenoHunt)
 * pour la fleur : bouton d'ouverture, choix importer dans une chaîne existante / créer une
 * nouvelle chaîne avec ce produit / créer une chaîne vide, puis canvas complet embarqué une fois lié.
 *
 * Différence structurelle assumée avec PhenoHunt : il n'existe PAS de FK "productionChainId" sur
 * les reviews (ChainNode.reviewId n'est qu'un champ best-effort, cf. schema.prisma) — une review
 * peut appartenir à plusieurs chaînes, et "créer une chaîne vide" ne l'y ajoute pas automatiquement
 * (elle ne sera donc pas retrouvée comme "liée" à la prochaine ouverture tant qu'aucun nœud ne la
 * référence réellement). Comportement volontairement identique à handleCreateEmptyTree côté PhenoHunt.
 */

import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { GitBranch, Plus, PackagePlus, Upload, X, ArrowLeft } from 'lucide-react';
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import ProductionChainCanvas from './ProductionChainCanvas';
import ProductAddSidebar from './ProductAddSidebar';

const ChainSectionEmbed = ({ reviewId, reviewType, reviewLabel, reviewImage }) => {
    const store = useProductionChainStore();
    const [statusLoading, setStatusLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [linkedChains, setLinkedChains] = useState([]);
    const [selectedChainId, setSelectedChainId] = useState(null);
    const [forceChoicePanel, setForceChoicePanel] = useState(false);
    const [showImportPicker, setShowImportPicker] = useState(false);
    const [error, setError] = useState(null);

    // Résout dès le montage si cette fiche appartient déjà à une chaîne — le bouton fermé doit
    // afficher "Créer" ou "Ouvrir" sans attendre un clic (cf. retour utilisateur).
    useEffect(() => {
        if (!reviewId) return;
        let cancelled = false;
        setStatusLoading(true);
        Promise.all([
            store.fetchChainsForReview(reviewType, reviewId),
            store.fetchChains()
        ]).then(([forReviewResult]) => {
            if (cancelled) return;
            const chains = forReviewResult?.data || [];
            setLinkedChains(chains);
            setSelectedChainId(chains[0]?.id || null);
            setStatusLoading(false);
        });
        return () => { cancelled = true };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, reviewType]);

    // Pas encore de brouillon sauvegardé (nom pas encore renseigné, autosave pas encore
    // déclenché) — un ChainNode a besoin d'un reviewId réel. Bouton visible mais désactivé
    // plutôt que silencieusement absent, pour que ce ne soit pas pris pour un bug.
    if (!reviewId) {
        return (
            <button
                type="button"
                disabled
                title="Enregistrez d'abord un brouillon (donnez un nom à la fiche) pour accéder à la chaîne de production"
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            >
                <GitBranch className="w-4 h-4" />
                Créer une chaîne de production
            </button>
        );
    }

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

    // Bouton fermé — même convention visuelle que les autres actions "ouvrir un outil externe"
    // du header de pipeline (ex: bouton GrowBrain dans PipelineDragDropView.jsx).
    if (!open) {
        const isLinked = !statusLoading && linkedChains.length > 0;
        const Icon = statusLoading ? GitBranch : (isLinked ? GitBranch : Plus);
        const label = statusLoading
            ? 'Chaîne de production…'
            : (isLinked ? 'Ouvrir la chaîne de production' : 'Créer une chaîne de production');

        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={statusLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Icon className="w-4 h-4" />
                {label}
            </button>
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

            {showChoicePanel ? (
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
                        {store.chains.length > 0 && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setShowImportPicker(true)}
                                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                            >
                                <Upload className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Importer dans une chaîne existante</p>
                                    <p className="text-xs text-white/50">Ajoutez cette fiche à une chaîne déjà créée ({store.chains.length} chaîne{store.chains.length > 1 ? 's' : ''})</p>
                                </div>
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCreateFromReview}
                            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                        >
                            <PackagePlus className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-white">Créer une nouvelle chaîne avec ce produit</p>
                                <p className="text-xs text-white/50">Utilisez cette fiche comme point de départ de la chaîne</p>
                            </div>
                        </button>
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
