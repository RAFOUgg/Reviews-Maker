import { motion } from 'framer-motion';
import { useOrchardStore, DEFAULT_TEMPLATES } from '../../../store/orchardStore';
import { useOrchardPagesStore } from '../../../store/orchardPagesStore';

// Templates that support pagination (multi-page) — detailed/full templates
const PAGINATION_SUPPORTED_TEMPLATES = ['detailedCard', 'blogArticle'];
// Minimum data count to auto-lock pagination ON
function shouldAutoLockPagination(reviewData) {
    if (!reviewData) return false;
    const categoryCount = reviewData.categoryRatings ? Object.keys(reviewData.categoryRatings).length : 0;
    const aromasCount = Array.isArray(reviewData.aromas) ? reviewData.aromas.length : 0;
    const effectsCount = Array.isArray(reviewData.effects) ? reviewData.effects.length : 0;
    const tastesCount = Array.isArray(reviewData.tastes) ? reviewData.tastes.length : 0;
    const hasPipeline = !!(reviewData.pipelineGlobal || reviewData.pipelineSeparation || reviewData.pipelineExtraction || reviewData.pipelineCuring);
    return (categoryCount >= 4 || aromasCount > 4 || effectsCount > 5 || tastesCount > 4 || hasPipeline);
}

export default function TemplateSelector() {
    const config = useOrchardStore((state) => state.config);
    const reviewData = useOrchardStore((state) => state.reviewData);
    const setTemplate = useOrchardStore((state) => state.setTemplate);
    const setRatio = useOrchardStore((state) => state.setRatio);
    const registerTemplate = useOrchardStore((state) => state.registerTemplate);
    const templates = useOrchardStore((state) => state.templates);
    const unregisterTemplate = useOrchardStore((state) => state.unregisterTemplate);
    const setActivePanel = useOrchardStore((state) => state.setActivePanel);

    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);
    const pagesCount = useOrchardPagesStore((state) => state.pages.length);
    const togglePagesMode = useOrchardPagesStore((state) => state.togglePagesMode);
    const loadDefaultPages = useOrchardPagesStore((state) => state.loadDefaultPages);

    const isOverflow = shouldAutoLockPagination(reviewData);
    const isPaginationSupported = PAGINATION_SUPPORTED_TEMPLATES.includes(config.template) || isOverflow;
    // Auto-lock: overflow data on compact format forces pagination
    const isPaginationLocked = isOverflow && (config.ratio === '1:1' || config.ratio === '9:16');

    const handlePaginationToggle = () => {
        if (isPaginationLocked && !pagesEnabled) return; // Can't turn off when locked
        const willEnable = !pagesEnabled;
        togglePagesMode();
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
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Choix du Template
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates */}
            <div className="flex items-center justify-between">
                <div />
                <button onClick={() => {
                    const id = prompt('ID du template (ex: my-custom-template)');
                    if (!id) return;
                    const name = prompt('Nom du template (ex: Ma mise en page)') || id;
                    registerTemplate(id, {
                        name,
                        description: 'Template personnalisé',
                        layout: 'custom',
                        defaultRatio: '1:1',
                        supportedRatios: ['1:1', '16:9']
                    });
                }} className="px-3 py-2 text-white rounded-lg text-sm">➕ Créer Template</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {Object.values(templates).map((template) => (
                    <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setTemplate(template.id)}
                        className={`p-3 rounded-lg text-left transition-all border-2 ${config.template === template.id ? ' dark:' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:'}`}
                    >
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                    {template.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {template.description}
                                </p>
                            </div>
                            {config.template === template.id && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    {/* Supprimer template custom */}
                                    {!DEFAULT_TEMPLATES[template.id] && (
                                        <button title="Supprimer le template" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Supprimer le template ${template.name}?`)) unregisterTemplate(template.id); }} className="ml-2 p-1 text-xs bg-red-100 rounded">×</button>
                                    )}
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <div className="flex gap-1 mt-1.5">
                            {template.supportedRatios.slice(0, 3).map((ratio) => (
                                <span
                                    key={ratio}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                    {ratio}
                                </span>
                            ))}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Sélecteur de ratio */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
                                className={`p-2 rounded-md text-xs font-medium transition-all ${config.ratio === ratio.id ? 'bg-gradient-to-r text-white shadow-md' : isSupported ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'}`}
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
            {/* ── PAGINATION TOGGLE ── */}
            <div className={`rounded-xl border-2 p-4 transition-all ${isPaginationLocked ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : pagesEnabled ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                Pagination
                            </span>
                            {isPaginationLocked && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Auto
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isPaginationLocked
                                ? 'Données denses — pagination recommandée'
                                : pagesEnabled
                                    ? `${pagesCount} page(s) — voir onglet Pagination`
                                    : 'Répartir le contenu sur plusieurs pages'}
                        </p>
                    </div>

                    {/* Toggle button */}
                    <button
                        onClick={handlePaginationToggle}
                        disabled={isPaginationLocked && !pagesEnabled && !isPaginationSupported}
                        title={isPaginationLocked && !pagesEnabled ? 'Pagination requise pour ce volume de données' : pagesEnabled ? 'Désactiver la pagination' : 'Activer la pagination'}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ml-3 ${pagesEnabled ? 'bg-indigo-500' : isPaginationLocked ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'} ${isPaginationLocked && !pagesEnabled ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${pagesEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                        {isPaginationLocked && (
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </button>
                </div>

                {/* Quick action when just enabled */}
                {pagesEnabled && (
                    <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onClick={() => setActivePanel('pagination')}
                        className="mt-3 w-full px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Gérer les pages →
                    </motion.button>
                )}
            </div>
        </div>
    );
}
