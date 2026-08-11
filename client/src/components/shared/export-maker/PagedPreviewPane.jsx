import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { useExportMakerPagesStore } from '../../../store/exportMakerPagesStore';
import TemplateRenderer from '../../export/TemplateRenderer';
import { RATIO_DIMENSIONS } from '../../../utils/exportMakerHelpers';

/**
 * Hook: measure a ref'd container and return the CSS scale needed to fit
 * a canvas of (canvasW × canvasH) inside it with `padding` px of breathing room.
 */
function useScaleToFit(canvasW, canvasH, padding = 48) {
    const ref = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const { width, height } = el.getBoundingClientRect();
            const availW = width - padding * 2;
            const availH = height - padding * 2;
            if (availW > 0 && availH > 0) {
                setScale(Math.min(availW / canvasW, availH / canvasH, 1));
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [canvasW, canvasH, padding]);

    return { ref, scale };
}

/**
 * Composant d'affichage avec pagination pour le mode multi-pages.
 * @param {boolean} autoActive - pagination active automatiquement (contenu dense détecté par
 *   `shouldAutoLockPagination` côté `ExportMakerPanel`) sans que l'utilisateur ait coché le mode
 *   pages à la main — `pagesEnabled` reste `false` dans ce cas, donc le repli non-paginé
 *   ci-dessous doit aussi en tenir compte, pas seulement `pagesEnabled`.
 */
export default function PagedPreviewPane({ autoActive = false, measuring = false }) {
    const previewRef = useRef(null);
    const [direction, setDirection] = useState(0);

    const config = useExportMakerStore((state) => state.config);
    const reviewData = useExportMakerStore((state) => state.reviewData);

    const pagesEnabled = useExportMakerPagesStore((state) => state.pagesEnabled);
    const pages = useExportMakerPagesStore((state) => state.pages);
    const currentPageIndex = useExportMakerPagesStore((state) => state.currentPageIndex);
    const setCurrentPage = useExportMakerPagesStore((state) => state.setCurrentPage);
    const nextPage = useExportMakerPagesStore((state) => state.nextPage);
    const previousPage = useExportMakerPagesStore((state) => state.previousPage);

    // Canvas dimensions for scale-to-fit
    const dims = RATIO_DIMENSIONS[config?.ratio] || RATIO_DIMENSIONS['1:1'];
    const { ref: areaRef, scale } = useScaleToFit(dims.width, dims.height);
    const scaledW = Math.round(dims.width * scale);
    const scaledH = Math.round(dims.height * scale);

    // Helper: renders the TemplateRenderer inside a scale wrapper
    const renderScaledCanvas = (canvasProps) => (
        <div className="shadow-2xl rounded-xl overflow-hidden" style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
            <div style={{
                position: 'absolute', top: 0, left: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
            }}>
                <TemplateRenderer {...canvasProps} />
            </div>
        </div>
    );

    // Le bandeau de suggestion n'a plus de raison d'être une fois la pagination déjà active
    // automatiquement (autoActive) — elle l'est déjà, pas besoin de proposer de l'activer.
    const paginationRecommended = pages.length > 1 && !pagesEnabled && !autoActive && (
        config.ratio === '1:1' || config.ratio === '9:16' || config.ratio === '4:3'
    );

    // Non-paged render path
    if (!(pagesEnabled || autoActive) || pages.length === 0) {
        return (
            <div ref={areaRef} className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    id="export-maker-preview-container"
                >
                    {renderScaledCanvas({ config, reviewData })}
                </motion.div>

                {/* Suggestion de pagination si recommandé */}
                {paginationRecommended && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => useExportMakerPagesStore.getState().togglePagesMode()}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <div className="font-bold">⚠️ Contenu dense détecté</div>
                            <div className="text-xs opacity-90">Cliquez pour activer la pagination ({pages.length} pages)</div>
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    const currentPage = pages[currentPageIndex];

    const handleNext = () => {
        setDirection(1);
        nextPage();
    };

    const handlePrevious = () => {
        setDirection(-1);
        previousPage();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrevious();
    };

    // Variants pour l'animation de transition - PROFESSIONAL SMOOTH
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '50%' : '-50%',
            opacity: 0,
            scale: 0.95,
            rotateY: direction > 0 ? 20 : -20,
            filter: 'blur(4px)'
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            filter: 'blur(0px)'
        },
        exit: (direction) => ({
            x: direction > 0 ? '-50%' : '50%',
            opacity: 0,
            scale: 0.95,
            rotateY: direction > 0 ? -20 : 20,
            filter: 'blur(4px)'
        }),
    };

    // Restructuration 2026-07-28 : flèches/vignettes étaient en `absolute` par-dessus le canevas
    // (chevauchement visuel cramé sur petits aperçus) — désormais dans une barre de contrôle dédiée
    // sous le canevas (flex column), plus de superposition. `areaRef` (utilisé par
    // `useScaleToFit` pour calculer l'échelle) est déplacé sur la SEULE zone canevas, pas le
    // conteneur entier, pour que le calcul d'échelle exclue la hauteur de cette barre.
    return (
        <div
            className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Zone canevas */}
            <div ref={areaRef} className="flex-1 min-h-0 w-full flex items-center justify-center p-6 relative">
                {/* Pendant la mesure, on n'affiche PAS la mise en page de repli : elle est presque
                    toujours différente du résultat final, et l'afficher produisait un reflow visible
                    quelques secondes après l'ouverture (« 1/5 » qui devenait « 1/8 » avec un contenu
                    différent). Mieux vaut annoncer un calcul en cours qu'un résultat qu'on sait faux. */}
                {measuring && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3
                                    bg-gray-900/70 backdrop-blur-sm">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
                        <p className="text-sm text-white/70">Calcul de la mise en page…</p>
                    </div>
                )}
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentPageIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 26,
                            mass: 1,
                            duration: 0.5
                        }}
                        id="export-maker-preview-container"
                        className="relative"
                    >
                        {/* Template renderer avec modules filtrés selon la page */}
                        <div ref={previewRef}>
                            {renderScaledCanvas({
                                config,
                                reviewData,
                                activeModules: currentPage.modules,
                                pageModuleIds: currentPage.adaptive ? currentPage.modules : undefined,
                                pageStretch: currentPage.adaptive ? currentPage.stretch : undefined,
                                pageMode: true,
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Barre de contrôle de pagination — flèches + vignettes + raccourcis, sous le canevas */}
            {pages.length > 1 && (
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-3 py-2.5 flex items-center gap-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPageIndex === 0}
                        className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Page précédente"
                    >
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Vignettes de pages — défilement horizontal si trop nombreuses, plus d'ellipsis fixe */}
                    <div className="flex-1 min-w-0 overflow-x-auto">
                        <div className="flex items-center gap-1.5 w-max mx-auto px-1">
                            {pages.map((page, index) => {
                                const isActive = index === currentPageIndex;
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => {
                                            setDirection(index > currentPageIndex ? 1 : -1);
                                            setCurrentPage(index);
                                        }}
                                        title={`${page.label} (${page.modules.length} modules)`}
                                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                    >
                                        <span>{page.icon}</span>
                                        <span className="hidden sm:inline">{index + 1}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentPageIndex === pages.length - 1}
                        className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Page suivante"
                    >
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <span className="flex-shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 hidden md:inline">
                        {currentPageIndex + 1}/{pages.length}
                    </span>
                </div>
            )}
        </div>
    );
}

PagedPreviewPane.propTypes = {
    autoActive: PropTypes.bool,
    /** Mesure de pagination en cours — masque l'aperçu provisoire. */
    measuring: PropTypes.bool,
};



