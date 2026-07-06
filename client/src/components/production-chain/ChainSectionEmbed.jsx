/**
 * ChainSectionEmbed Component
 *
 * Panneau "Chaîne de production" affiché à la place du pipeline (Culture/Séparation/
 * Extraction/Recette) d'un formulaire de review quand le bouton ChainToggleButton (à droite
 * du titre de section) est activé — un seul état global (`linkOpen` etc. dans
 * useProductionChainStore) partagé entre le bouton et ce panneau, donc pas de prop-drilling
 * ni de désynchronisation entre les deux : ouvrir/fermer bascule proprement pipeline <-> chaîne.
 *
 * Différence structurelle assumée avec PhenoHunt : il n'existe PAS de FK "productionChainId" sur
 * les reviews (ChainNode.reviewId n'est qu'un champ best-effort, cf. schema.prisma) — une review
 * peut appartenir à plusieurs chaînes, et "créer une chaîne vide" ne l'y ajoute pas automatiquement
 * (elle ne sera donc pas retrouvée comme "liée" à la prochaine ouverture tant qu'aucun nœud ne la
 * référence réellement). Comportement volontairement identique à handleCreateEmptyTree côté PhenoHunt.
 */

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { GitBranch, Plus, PackagePlus, Upload, ArrowLeft } from 'lucide-react';
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import ProductionChainCanvas from './ProductionChainCanvas';
import ProductAddSidebar from './ProductAddSidebar';

const ChainSectionEmbed = ({ reviewId, reviewType, reviewLabel, reviewImage }) => {
    const store = useProductionChainStore();

    if (!reviewId || !store.linkOpen) return null;

    const nodePayload = () => ({
        reviewType,
        reviewId,
        label: reviewLabel || 'Sans nom',
        image: reviewImage || null,
        position: { x: 300, y: 200 },
        color: '#10b981'
    });

    const showChoicePanel = store.linkedChains.length === 0 || store.linkForceChoicePanel;
    const importableChains = store.chains.filter(c => !store.linkedChains.some(lc => lc.id === c.id));
    const existingReviewIds = store.nodes.map(n => n.reviewId);

    return (
        <LiquidCard className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-white">Chaîne de production</h4>
                </div>
                <LiquidButton variant="ghost" size="sm" icon={ArrowLeft} onClick={() => store.setLinkOpen(false)}>
                    Revenir au pipeline
                </LiquidButton>
            </div>

            {store.linkError && <p className="text-sm text-red-400">{store.linkError}</p>}

            {showChoicePanel ? (
                store.linkShowImportPicker ? (
                    <div className="space-y-2">
                        <p className="text-sm text-white/60">Choisissez la chaîne à laquelle ajouter cette fiche :</p>
                        {importableChains.length === 0 && (
                            <p className="text-sm text-white/40">Aucune autre chaîne disponible.</p>
                        )}
                        {importableChains.map(chain => (
                            <button
                                key={chain.id}
                                type="button"
                                disabled={store.linkBusy}
                                onClick={() => store.linkImportToChain(chain, nodePayload())}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                            >
                                <span className="text-sm text-white">{chain.name}</span>
                                <span className="text-xs text-white/40">{chain._count?.nodes ?? 0} produit(s)</span>
                            </button>
                        ))}
                        <LiquidButton variant="ghost" size="sm" icon={ArrowLeft} onClick={() => store.setLinkState({ linkShowImportPicker: false })}>
                            Retour
                        </LiquidButton>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-white/60">Comment souhaitez-vous procéder avec cette fiche technique ?</p>
                        {store.chains.length > 0 && (
                            <button
                                type="button"
                                disabled={store.linkBusy}
                                onClick={() => store.setLinkState({ linkShowImportPicker: true })}
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
                            disabled={store.linkBusy}
                            onClick={() => store.linkCreateFromReview(reviewLabel, nodePayload())}
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
                            disabled={store.linkBusy}
                            onClick={() => store.linkCreateEmpty(reviewLabel)}
                            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-white">Créer une chaîne vide</p>
                                <p className="text-xs text-white/50">Commencez une nouvelle chaîne de production depuis zéro</p>
                            </div>
                        </button>
                        {store.linkedChains.length > 0 && (
                            <LiquidButton variant="ghost" size="sm" onClick={() => store.setLinkState({ linkForceChoicePanel: false })}>
                                Annuler
                            </LiquidButton>
                        )}
                    </div>
                )
            ) : (
                <>
                    {store.linkedChains.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                            {store.linkedChains.map(chain => (
                                <button
                                    key={chain.id}
                                    type="button"
                                    onClick={() => store.setLinkState({ linkSelectedChainId: chain.id })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${store.linkSelectedChainId === chain.id
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
                                <ProductionChainCanvas chainId={store.linkSelectedChainId} />
                            </ReactFlowProvider>
                        </div>
                    </div>
                    <LiquidButton variant="ghost" size="sm" icon={Plus} onClick={() => store.setLinkState({ linkForceChoicePanel: true })}>
                        Ajouter à une autre chaîne
                    </LiquidButton>
                </>
            )}
        </LiquidCard>
    );
};

export default ChainSectionEmbed;
