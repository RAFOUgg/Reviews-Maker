import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useAccountFeatures } from '../../../hooks/useAccountFeatures';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { useExportMakerPagesStore } from '../../../store/exportMakerPagesStore';
import { LiquidButton, LiquidToggle } from '../../ui/LiquidUI';
import { shouldAutoLockPagination } from '../../../utils/exportMakerHelpers';
import { isTemplatePaginable } from '../../../store/exportMakerConstants';

// Capacité de pagination — même source que le moteur de rendu (matrice C4), plus de liste locale.

export default function TemplateSelector() {
    const config = useExportMakerStore((state) => state.config);
    const reviewData = useExportMakerStore((state) => state.reviewData);
    const setTemplate = useExportMakerStore((state) => state.setTemplate);
    const setRatio = useExportMakerStore((state) => state.setRatio);
    const templates = useExportMakerStore((state) => state.templates);
    const setActivePanel = useExportMakerStore((state) => state.setActivePanel);

    // Gating par type de compte (2026-08-04) : amateur → Moderne Compact ; influenceur → +Blog
    // +Story ; producteur → les 5. Les templates non autorisés restent VISIBLES mais verrouillés —
    // les masquer priverait l'utilisateur de la raison de monter en offre.
    const { allowedTemplates, isAmateur, isInfluenceur } = useAccountFeatures();
    const requiredTierLabel = (templateId) => {
        if (templateId === 'traceabilityReport' || templateId === 'detailedCard') return 'Producteur';
        return isAmateur ? 'Influenceur' : 'Producteur';
    };

    const pagesEnabled = useExportMakerPagesStore((state) => state.pagesEnabled);
    const pagesCount = useExportMakerPagesStore((state) => state.pages.length);
    const paginationDisabled = useExportMakerPagesStore((state) => state.paginationDisabled);
    const setPaginationDisabled = useExportMakerPagesStore((state) => state.setPaginationDisabled);
    const togglePagesMode = useExportMakerPagesStore((state) => state.togglePagesMode);
    const loadDefaultPages = useExportMakerPagesStore((state) => state.loadDefaultPages);

    const isOverflow = shouldAutoLockPagination(reviewData, config.template);
    const isPaginationSupported = isTemplatePaginable(config.template);
    // Auto-lock: overflow data on compact format forces pagination
    const isPaginationLocked = isOverflow && (config.ratio === '1:1' || config.ratio === '9:16');

    // L'interrupteur reflète l'état EFFECTIF (manuel OU automatique) et l'inverse dans les deux
    // sens. Auparavant il affichait `pagesEnabled` seul : quand la pagination automatique
    // s'appliquait, il restait ÉTEINT alors que le rendu était bel et bien paginé, et le clic
    // était purement annulé — « le bouton de pagination n'est pas lié ».
    const effectivePagination = !paginationDisabled && (pagesEnabled || isPaginationLocked);

    const handlePaginationToggle = () => {
        if (effectivePagination) {
            // Éteindre : refus explicite, qui prime aussi sur l'automatique.
            setPaginationDisabled(true);
            if (pagesEnabled) togglePagesMode();
            return;
        }
        setPaginationDisabled(false);
        const willEnable = !pagesEnabled;
        if (willEnable) togglePagesMode();
        if (willEnable) {
            loadDefaultPages(reviewData?.type, config.ratio);
            // Switch to Pagination tab
            setTimeout(() => setActivePanel('pagination'), 100);
        }
    };

    const ratios = [
        { id: '1:1', name: 'Carré (1:1)', icon: '⬜' },
        { id: '16:9', name: 'Paysage (16:9)', icon: '▭' },
        { id: '9:16', name: 'Portrait (9:16)', icon: '▯' },
        { id: '4:3', name: 'Standard (4:3)', icon: '▭' },
        { id: 'A4', name: 'A4 (Document)', icon: '📄' }
    ];

    return (
        <div className="space-y-4">
            {/* Titre */}
            <div>
                <h3 className="text-base font-semibold text-white/90 mb-1">
                    Choix du Template
                </h3>
                <p className="text-xs text-white/50">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates */}
            <div className="grid grid-cols-1 gap-2">
                {Object.values(templates).map((template) => {
                    const isAllowed = allowedTemplates.includes(template.id);
                    return (
                    <motion.button
                        key={template.id}
                        whileHover={isAllowed ? { scale: 1.01 } : {}}
                        whileTap={isAllowed ? { scale: 0.99 } : {}}
                        onClick={() => isAllowed && setTemplate(template.id)}
                        disabled={!isAllowed}
                        aria-disabled={!isAllowed}
                        title={isAllowed ? undefined : `Réservé aux comptes ${requiredTierLabel(template.id)}`}
                        className={`liquid-card p-3 text-left ${config.template === template.id ? 'ring-2 ring-purple-500' : ''} ${isAllowed ? '' : 'opacity-45 cursor-not-allowed'}`}
                    >
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <h4 className="font-medium text-sm text-white/90">
                                    {template.name}
                                </h4>
                                <p className="text-[11px] text-white/50 mt-0.5">
                                    {template.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {config.template === template.id && isAllowed && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                                {!isAllowed && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300/90 bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        <Lock className="w-3 h-3" />
                                        {requiredTierLabel(template.id)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-1 mt-1.5">
                            {template.supportedRatios.slice(0, 3).map((ratio) => (
                                <span
                                    key={ratio}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60"
                                >
                                    {ratio}
                                </span>
                            ))}
                        </div>
                    </motion.button>
                    );
                })}
            </div>

            {/* Sélecteur de ratio */}
            <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">
                    Format d'affichage
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                    {ratios.map((ratio) => {
                        const currentTemplate = templates[config.template];
                        const isSupported = currentTemplate?.supportedRatios.includes(ratio.id);

                        return (
                            <motion.button
                                key={ratio.id}
                                whileHover={isSupported ? { scale: 1.01 } : {}}
                                whileTap={isSupported ? { scale: 0.99 } : {}}
                                onClick={() => isSupported && setRatio(ratio.id)}
                                disabled={!isSupported}
                                className={`p-2 rounded-lg text-xs font-medium transition-all ${config.ratio === ratio.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : isSupported ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10' : 'bg-white/[0.02] text-white/25 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-sm">{ratio.icon}</span>
                                    <span className="text-[11px]">{ratio.name}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            {/* ── PAGINATION TOGGLE ── masqué pour `traceabilityReport` : ce template est toujours
                rendu comme un document continu (shouldAutoLockPagination l'exempte explicitement,
                2026-08-02) — le contrôle restait affiché et fonctionnel en apparence (créait une
                session de N pages) sans jamais varier le contenu d'une page à l'autre, un contrôle
                trompeur plutôt qu'un vrai bug de rendu (trouvé en vérification). */}
            {isTemplatePaginable(config.template) && (
            <div className={`liquid-card p-4 ${isPaginationLocked ? 'ring-2 ring-amber-400/60' : pagesEnabled ? 'ring-2 ring-indigo-400/60' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white/90">
                                Pagination
                            </span>
                            {isPaginationLocked && (
                                <span className="text-xs font-semibold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-full">
                                    🔒 Auto
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/50">
                            {isPaginationLocked
                                ? 'Données denses — pagination recommandée'
                                : pagesEnabled
                                    ? `${pagesCount} page(s) — voir onglet Pagination`
                                    : 'Répartir le contenu sur plusieurs pages'}
                        </p>
                    </div>

                    <LiquidToggle
                        checked={effectivePagination}
                        onChange={handlePaginationToggle}
                        disabled={!isPaginationSupported}
                    />
                </div>

                {/* Quick action when just enabled */}
                {pagesEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                        <LiquidButton size="sm" variant="ghost" className="w-full" onClick={() => setActivePanel('pagination')}>
                            Gérer les pages →
                        </LiquidButton>
                    </motion.div>
                )}
            </div>
            )}
        </div>
    );
}
