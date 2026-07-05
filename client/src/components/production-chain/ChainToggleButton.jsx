/**
 * ChainToggleButton Component
 *
 * Bouton compact affiché à droite du titre d'une section pipeline (Culture/Séparation/
 * Extraction/Recette) — bascule l'affichage entre le pipeline lui-même et la Chaîne de
 * production embarquée (ChainSectionEmbed), qui lit le même `linkOpen` depuis le store
 * partagé. Remplace l'ancien bouton interne à ChainSectionEmbed, désormais positionné
 * dans le titre plutôt qu'en pleine largeur au-dessus du contenu.
 */

import React, { useEffect } from 'react';
import { GitBranch, Plus, ArrowLeft } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainToggleButton = ({ reviewId, reviewType }) => {
    const store = useProductionChainStore();

    useEffect(() => {
        if (reviewId) store.ensureLinkStatus(reviewType, reviewId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, reviewType]);

    if (!reviewId) {
        return (
            <button
                type="button"
                disabled
                title="Enregistrez d'abord un brouillon (donnez un nom à la fiche) pour accéder à la chaîne de production"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            >
                <GitBranch className="w-3.5 h-3.5" />
                Chaîne de production
            </button>
        );
    }

    const isLinked = !store.linkStatusLoading && store.linkedChains.length > 0;
    const Icon = store.linkOpen ? ArrowLeft : (isLinked || store.linkStatusLoading ? GitBranch : Plus);
    const label = store.linkOpen
        ? 'Revenir au pipeline'
        : store.linkStatusLoading
            ? 'Chaîne de production…'
            : (isLinked ? 'Ouvrir la chaîne de production' : 'Créer une chaîne de production');

    return (
        <button
            type="button"
            onClick={() => store.setLinkOpen(!store.linkOpen)}
            disabled={store.linkStatusLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed ${store.linkOpen
                ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:text-emerald-200'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
};

export default ChainToggleButton;
