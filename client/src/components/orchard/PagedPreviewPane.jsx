import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useOrchardStore } from '../../store/orchardStore';
import { useOrchardPagesStore } from '../../store/orchardPagesStore';
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

    // Si le mode pages n'est pas activé, afficher comme avant
    if (!pagesEnabled || pages.length === 0) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto">
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

    // Variants pour l'animation de transition
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0,
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
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
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
                        {/* Page info badge */}
                        <div className="absolute -top-10 left-0 flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <span className="text-xl mr-2">{currentPage.icon}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {currentPage.label}
                                </span>
                            </div>
                            <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-300">
                                {currentPageIndex + 1} / {pages.length}
                            </div>
                        </div>

                        {/* Template renderer avec modules filtrés selon la page */}
                        <TemplateRenderer
                            config={config}
                            reviewData={reviewData}
                            activeModules={currentPage.modules}
                            pageMode={true}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {pages.length > 1 && (
                    <>
                        {/* Previous button */}
                        {currentPageIndex > 0 && (
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-200 dark:border-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Next button */}
                        {currentPageIndex < pages.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-200 dark:border-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Page indicators (dots) */}
            {pages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    {pages.map((page, index) => (
                        <button
                            key={page.id}
                            onClick={() => {
                                setDirection(index > currentPageIndex ? 1 : -1);
                                setCurrentPage(index);
                            }}
                            className={`transition-all ${index === currentPageIndex
                                    ? 'w-8 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full'
                                    : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                            title={`${page.icon} ${page.label}`}
                        />
                    ))}
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
