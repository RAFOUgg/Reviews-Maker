import { motion } from 'framer-motion';
import { Check, Layers, X } from 'lucide-react';
import { useExportMakerStore, DEFAULT_TEMPLATES } from '../../../store/exportMakerStore';
import { useExportMakerPagesStore } from '../../../store/exportMakerPagesStore';
import { LiquidButton, LiquidToggle } from '../../ui/LiquidUI';
import { shouldAutoLockPagination } from '../../../utils/exportMakerHelpers';

// Templates that support pagination (multi-page) — detailed/full templates
const PAGINATION_SUPPORTED_TEMPLATES = ['detailedCard', 'blogArticle'];

export default function TemplateSelector() {
    const config = useExportMakerStore((state) => state.config);
    const reviewData = useExportMakerStore((state) => state.reviewData);
    const setTemplate = useExportMakerStore((state) => state.setTemplate);
    const setRatio = useExportMakerStore((state) => state.setRatio);
    const registerTemplate = useExportMakerStore((state) => state.registerTemplate);
    const templates = useExportMakerStore((state) => state.templates);
    const unregisterTemplate = useExportMakerStore((state) => state.unregisterTemplate);
    const setActivePanel = useExportMakerStore((state) => state.setActivePanel);

    const pagesEnabled = useExportMakerPagesStore((state) => state.pagesEnabled);
    const pagesCount = useExportMakerPagesStore((state) => state.pages.length);
    const togglePagesMode = useExportMakerPagesStore((state) => state.togglePagesMode);
    const loadDefaultPages = useExportMakerPagesStore((state) => state.loadDefaultPages);

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
                <h3 className="text-base font-semibold text-white/90 mb-1">
                    Choix du Template
                </h3>
                <p className="text-xs text-white/50">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates */}
            <div className="flex items-center justify-end">
                <LiquidButton
                    size="sm"
                    icon={Layers}
                    onClick={() => {
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
                    }}
                >
                    Créer Template
                </LiquidButton>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {Object.values(templates).map((template) => (
                    <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setTemplate(template.id)}
                        className={`liquid-card p-3 text-left ${config.template === template.id ? 'ring-2 ring-purple-500' : ''}`}
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
                                {config.template === template.id && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                                {!DEFAULT_TEMPLATES[template.id] && (
                                    <button
                                        type="button"
                                        title="Supprimer le template"
                                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Supprimer le template ${template.name}?`)) unregisterTemplate(template.id); }}
                                        className="p-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
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
                ))}
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
            {/* ── PAGINATION TOGGLE ── */}
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
                        checked={pagesEnabled}
                        onChange={handlePaginationToggle}
                        disabled={isPaginationLocked && !pagesEnabled && !isPaginationSupported}
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
        </div>
    );
}
