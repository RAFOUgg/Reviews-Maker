import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useOrchardStore } from '../store/orchardStore';
import { useOrchardPagesStore } from '../store/orchardPagesStore';
import TemplateRenderer from './TemplateRenderer';

/**
 * Composant d'affichage avec pagination pour le mode multi-pages
 */
export default function PagedPreviewPane() {
    const previewRef = useRef(null);
    const [direction, setDirection] = useState(0); // -1 = gauche, 1 = droite

    const config = useOrchardStore((state) => state.config);
    const reviewData = useOrchardStore((state) => state.reviewData);

    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);
    const pages = useOrchardPagesStore((state) => state.pages);
    const currentPageIndex = useOrchardPagesStore((state) => state.currentPageIndex);
    const setCurrentPage = useOrchardPagesStore((state) => state.setCurrentPage);
    const nextPage = useOrchardPagesStore((state) => state.nextPage);
    const previousPage = useOrchardPagesStore((state) => state.previousPage);

    // Détecter si la pagination est recommandée
    const paginationRecommended = pages.length > 1 && !pagesEnabled && (
        config.ratio === '1:1' || config.ratio === '9:16' || config.ratio === '4:3'
    );

    // Si le mode pages n'est pas activé, afficher comme avant
    if (!pagesEnabled || pages.length === 0) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto relative">
                <div className="w-full h-full flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        ref={previewRef}
                        id="orchard-preview-container"
                        className="relative"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'fit-content',
                            height: 'fit-content'
                        }}
                    >
                        <TemplateRenderer config={config} reviewData={reviewData} />
                    </motion.div>
                </div>

                {/* Suggestion de pagination si recommandé */}
                {paginationRecommended && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => useOrchardPagesStore.getState().togglePagesMode()}
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

    return (
        <div
            className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Preview area with pagination */}
            <div className="w-full h-full flex items-center justify-center p-8 relative">
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
                        ref={previewRef}
                        id="orchard-preview-container"
                        className="relative"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'fit-content',
                            height: 'fit-content'
                        }}
                    >
                        {/* Page info badge - PROFESSIONAL REDESIGN */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-3"
                        >
                            <div className="px-5 py-3 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border-2 dark: flex items-center gap-3 backdrop-blur-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg">
                                        <span className="text-2xl filter drop-shadow-lg">{currentPage.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                                            {currentPage.label}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {currentPage.modules.length} modules actifs
                                        </span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gradient-to-b from-transparent to-transparent" />
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 bg-gradient-to-r rounded-xl text-sm font-black text-white shadow-lg shadow-purple-500/50 min-w-[60px] text-center">
                                        {currentPageIndex + 1} / {pages.length}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Template renderer avec modules filtrés selon la page */}
                        <TemplateRenderer
                            config={config}
                            reviewData={reviewData}
                            activeModules={currentPage.modules}
                            pageMode={true}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows - PROFESSIONAL REDESIGN */}
                {pages.length > 1 && (
                    <>
                        {/* Previous button */}
                        {currentPageIndex > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrevious}
                                className="absolute left-6 top-1/2 -translate-y-1/2 group"
                            >
                                <div className="relative">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                                    {/* Button */}
                                    <div className="relative w-14 h-14 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-2xl flex items-center justify-center border-2 dark: group-hover: dark:group-hover: transition-all">
                                        <svg className="w-7 h-7 dark: group-hover: dark:group-hover: transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Page précédente
                                    </div>
                                </div>
                            </motion.button>
                        )}

                        {/* Next button */}
                        {currentPageIndex < pages.length - 1 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="absolute right-6 top-1/2 -translate-y-1/2 group"
                            >
                                <div className="relative">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                                    {/* Button */}
                                    <div className="relative w-14 h-14 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-2xl flex items-center justify-center border-2 dark: group-hover: dark:group-hover: transition-all">
                                        <svg className="w-7 h-7 dark: group-hover: dark:group-hover: transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Page suivante
                                    </div>
                                </div>
                            </motion.button>
                        )}
                    </>
                )}
            </div>

            {/* Page indicators - ENHANCED PROFESSIONAL DESIGN */}
            {pages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border-2 dark:">
                    {/* Page cards instead of dots */}
                    {pages.map((page, index) => {
                        const isActive = index === currentPageIndex;
                        const isPrev = index === currentPageIndex - 1;
                        const isNext = index === currentPageIndex + 1;
                        const isVisible = isActive || isPrev || isNext;

                        if (!isVisible && pages.length > 5) {
                            // Show ellipsis for hidden pages
                            if (index === 1 && currentPageIndex > 2) {
                                return (
                                    <span key={`ellipsis-start-${page.id}`} className="text-gray-400 dark:text-gray-600 font-bold">
                                        •••
                                    </span>
                                );
                            }
                            if (index === pages.length - 2 && currentPageIndex < pages.length - 3) {
                                return (
                                    <span key={`ellipsis-end-${page.id}`} className="text-gray-400 dark:text-gray-600 font-bold">
                                        •••
                                    </span>
                                );
                            }
                            if (index !== 0 && index !== pages.length - 1) return null;
                        }

                        return (
                            <motion.div
                                key={page.id}
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    opacity: isActive ? 1 : 0.6
                                }}
                                className="relative group"
                            >
                                <button
                                    onClick={() => {
                                        setDirection(index > currentPageIndex ? 1 : -1);
                                        setCurrentPage(index);
                                    }}
                                    className={`relative overflow-hidden transition-all duration-300 rounded-xl ${isActive ? 'w-20 h-16 bg-gradient-to-br shadow-lg shadow-purple-500/50 ring-4 dark:' : 'w-14 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover: hover: dark:hover:/30 dark:hover:/30 hover:scale-110 shadow-md' }`}
                                >
                                    {/* Page content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                        <span className={`text-2xl mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                                            {page.icon}
                                        </span>
                                        {isActive && (
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                                                {index + 1}/{pages.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePageIndicator"
                                            className="absolute inset-0 border-2 border-white/50 rounded-xl"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>

                                {/* Enhanced tooltip */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white text-xs font-medium rounded-xl whitespace-nowrap shadow-xl border border-gray-700 dark:border-gray-500 pointer-events-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{page.icon}</span>
                                        <div className="text-left">
                                            <div className="font-bold">{page.label}</div>
                                            <div className="text-gray-300 text-[10px]">
                                                {page.modules.length} modules • Page {index + 1}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-600" />
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r"
                            initial={false}
                            animate={{
                                width: `${((currentPageIndex + 1) / pages.length) * 100}%`
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>
                </div>
            )}

            {/* Keyboard hints */}
            {pages.length > 1 && (
                <div className="absolute top-4 right-4 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
                        <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
                        <span>pour naviguer</span>
                    </div>
                </div>
            )}
        </div>
    );
}


