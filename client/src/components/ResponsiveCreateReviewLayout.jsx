import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * ResponsiveCreateReviewLayout - Layout responsive pour pages de création
 * OPTIMISÉ MOBILE FIRST
 * 
 * Gère:
 * - Carousel d'émojis sections avec drag-to-scroll (mobile)
 * - 5 sections visibles à la fois (mobile)
 * - Section du milieu à 100% opacité
 * - Effet fade pour sections des côtés
 * - Padding et spacing adaptatif (mobile-first)
 * - Full-width sur mobile avec safe-area padding
 * - Max-width sur desktop
 * - Footer sticky persistent
 * - Aucun overflow horizontal
 */

export const ResponsiveCreateReviewLayout = ({
    currentSection,
    totalSections,
    onSectionChange,
    children,
    title,
    subtitle,
    showProgress = true,
    sectionEmojis = [], // Array d'émojis pour chaque section
}) => {
    const layout = useResponsiveLayout();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [shouldUseCarousel, setShouldUseCarousel] = useState(false);
    const carouselRef = useRef(null);
    const containerRef = useRef(null);

    // Nombre de sections visibles dans le carrousel
    const VISIBLE_ITEMS = 5;
    const ITEM_WIDTH = 70; // px (emoji button width + gap)
    // Permet de scroller jusqu'à montrer la dernière section au centre
    const maxScroll = Math.max(0, (sectionEmojis.length - Math.ceil(VISIBLE_ITEMS / 2)) * ITEM_WIDTH);

    const handlePrevious = () => {
        if (currentSection > 0) {
            onSectionChange(currentSection - 1);
        }
    };

    const handleNext = () => {
        if (currentSection < totalSections - 1) {
            onSectionChange(currentSection + 1);
        }
    };

    // Détecte si l'espace n'est pas suffisant pour afficher tous les émojis
    useEffect(() => {
        const detectCarouselNeeded = () => {
            if (layout.isMobile) {
                setShouldUseCarousel(true);
                return;
            }

            if (containerRef.current && sectionEmojis.length > 0) {
                // Chaque emoji prend environ 50px (px-4 py-2 + gap-2)
                const estimatedWidth = (sectionEmojis.length * 50) + ((sectionEmojis.length - 1) * 8);
                const availableWidth = containerRef.current.offsetWidth - 32; // padding x2

                // Si pas assez de place, utiliser carousel
                setShouldUseCarousel(estimatedWidth > availableWidth);
            }
        };

        detectCarouselNeeded();

        const timer = setTimeout(detectCarouselNeeded, 100);
        window.addEventListener('resize', detectCarouselNeeded);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', detectCarouselNeeded);
        };
    }, [layout.isMobile, sectionEmojis.length]);

    // Auto-position carousel to center selected section
    useEffect(() => {
        // Centrer la section courante au milieu du carousel
        // scrollPosition = index * ITEM_WIDTH met la section 'index' au centre
        const targetScroll = Math.max(0, Math.min(maxScroll, currentSection * ITEM_WIDTH));

        // Smooth animation vers la position cible
        if (!isDragging) {
            setScrollPosition(targetScroll);
        }
    }, [currentSection, isDragging, maxScroll]);

    // Drag handlers - Smooth scroll horizontal with live animation
    const handleMouseDown = (e) => {
        if (sectionEmojis.length <= VISIBLE_ITEMS) return;
        setIsDragging(true);
        setDragStart(e.clientX || e.touches?.[0]?.clientX);
        setDragOffset(0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const currentPos = e.clientX || e.touches?.[0]?.clientX;
        const offset = dragStart - currentPos;
        setDragOffset(offset);
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;
        setIsDragging(false);

        const dragEnd = e.clientX || e.changedTouches?.[0]?.clientX;
        const diff = dragStart - dragEnd;

        // Calcul de la nouvelle position de scroll basée sur le drag
        let newScroll = scrollPosition + diff;

        // Limiter le scroll entre 0 et maxScroll
        newScroll = Math.max(0, Math.min(maxScroll, newScroll));

        // Snap vers la section la plus proche quand on lâche
        // Déterminer la section qui sera centrée après snap
        const centerIndex = Math.floor(VISIBLE_ITEMS / 2);
        // Quelle section est "presque centrée" maintenant?
        const scrolledIndex = newScroll / ITEM_WIDTH;
        const snapIndex = Math.round(scrolledIndex);

        // Calculer le scroll pour mettre cette section au centre
        // scrollPosition=0 => section 0 au centre
        // scrollPosition=ITEM_WIDTH => section 1 au centre
        // scrollPosition=(n-2)*ITEM_WIDTH => section n au centre (pour n >= 2 et n < length)
        const snappedScroll = Math.max(0, Math.min(maxScroll, snapIndex * ITEM_WIDTH));

        setScrollPosition(snappedScroll);
        setDragOffset(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative flex flex-col">
            {/* Background decorative - hidden on mobile for performance */}
            {!layout.isMobile && (
                <div className="fixed inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Responsive Padding & Safe Area */}
                <div className={`sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 ${layout.isMobile
                    ? 'px-3 py-3 safe-area-inset-top'
                    : 'px-6 md:px-8 py-6'
                    }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {/* Title & Subtitle */}
                        {(title || subtitle) && (
                            <div className={layout.isMobile ? 'mb-3' : 'mb-4'}>
                                {title && (
                                    <h1 className={`font-bold text-gray-100 ${layout.isMobile ? 'text-lg' : 'text-3xl'
                                        }`}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={`text-gray-400 mt-0.5 ${layout.isMobile ? 'text-xs' : 'text-sm'
                                        }`}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Progress Indicator */}
                        {showProgress && (
                            <div className={layout.isMobile ? 'space-y-2' : 'space-y-3'}>
                                {/* Emoji Carousel - Galerie tournante optimisée mobile */}
                                {sectionEmojis.length > 0 && (
                                    <div className="w-full" ref={containerRef}>
                                        {shouldUseCarousel ? (
                                            // Carousel mode: Drag-to-scroll with 5 items visible + fade effect
                                            <div
                                                ref={carouselRef}
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={handleMouseDown}
                                                onTouchMove={handleMouseMove}
                                                onTouchEnd={handleMouseUp}
                                                className={`relative flex items-center justify-center gap-1 py-4 px-0 transition-all overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                            >
                                                {/* Gradient fade left */}
                                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />

                                                {/* Gradient fade right */}
                                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

                                                <div className="flex items-center justify-center gap-2" style={{
                                                    transform: `translateX(-${scrollPosition + dragOffset}px)`,
                                                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }}>
                                                    <AnimatePresence mode="wait">
                                                        {sectionEmojis.map((emoji, index) => {
                                                            // Calculer l'offset visuel par rapport au centre
                                                            // scrollPosition = index * ITEM_WIDTH met cette section au centre
                                                            const scrolledCenterIndex = (scrollPosition + dragOffset) / ITEM_WIDTH;
                                                            const offset = index - scrolledCenterIndex;
                                                            const isCenter = Math.abs(offset) < 0.5;

                                                            // Calcul opacité avec effect fade progressif
                                                            const absOffset = Math.abs(Math.round(offset));
                                                            const opacityMap = {
                                                                0: 1,      // Center: 100% opaque
                                                                1: 0.6,    // Adjacent: 60%
                                                                2: 0.3     // Outer: 30%
                                                            };
                                                            const opacity = opacityMap[Math.min(absOffset, 2)];

                                                            return (
                                                                <motion.button
                                                                    key={index}
                                                                    initial={{ opacity: 0.3, scale: 0.85, x: 50 }}
                                                                    animate={{
                                                                        opacity: opacity,
                                                                        scale: isCenter ? 1.15 : 1,
                                                                        x: isDragging ? dragOffset * 0.1 : 0
                                                                    }}
                                                                    exit={{ opacity: 0, scale: 0.85, x: -50 }}
                                                                    transition={{
                                                                        duration: isDragging ? 0 : 0.3,
                                                                        ease: 'easeOut',
                                                                        opacity: { duration: 0.3 },
                                                                        scale: { duration: 0.3 }
                                                                    }}
                                                                    onClick={() => onSectionChange(index)}
                                                                    className={`flex-shrink-0 px-3.5 py-3 rounded-xl transition-all text-2xl font-medium ${index === currentSection
                                                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 ring-2 ring-purple-300 shadow-lg shadow-purple-500/50'
                                                                        : 'bg-gray-700/40 hover:bg-gray-700/60'
                                                                        }`}
                                                                    style={{
                                                                        filter: isCenter
                                                                            ? 'drop-shadow(0 0 16px rgba(168, 85, 247, 0.5))'
                                                                            : 'none'
                                                                    }}
                                                                    whileHover={{ y: -2 }}
                                                                >
                                                                    <span>{sectionEmojis[index]}</span>
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ) : (
                                            // Desktop: Show all emojis in a wrap (si assez d'espace)
                                            <div className="flex gap-2 flex-1 justify-center flex-wrap px-4">
                                                {sectionEmojis.map((emoji, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        onClick={() => onSectionChange(idx)}
                                                        className={`px-4 py-2 rounded-lg transition-all ${idx === currentSection
                                                            ? 'bg-purple-600 ring-2 ring-purple-400 scale-110'
                                                            : 'bg-gray-700/50 hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <span className="text-lg">{emoji}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Counter + Progress Bar */}
                                <div className={layout.isMobile ? 'space-y-1.5' : 'space-y-2'}>
                                    {layout.isMobile ? (
                                        // Mobile: Simple counter
                                        <div className="text-center">
                                            <div className="text-purple-400 font-bold text-sm">
                                                {currentSection + 1}/{totalSections}
                                            </div>
                                        </div>
                                    ) : (
                                        // Desktop: Counter + Progress Bar
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">
                                                Étape {currentSection + 1} sur {totalSections}
                                            </span>
                                            <span className="text-sm text-purple-400 font-medium">
                                                {Math.round(((currentSection + 1) / totalSections) * 100)}%
                                            </span>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - Flex-grow to push footer down, with padding-bottom for fixed footer */}
                <main className={`relative z-20 flex-1 overflow-y-auto ${layout.isMobile
                    ? 'px-3 py-4 pb-20'
                    : 'px-6 md:px-8 py-8 pb-24'
                    }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Fixed at bottom, always visible */}
                <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent border-t border-gray-700/50 backdrop-blur-xl z-50 ${layout.isMobile ? 'safe-area-inset-bottom' : ''
                    }`}>
                    <div className={layout.isMobile ? 'px-3 py-2' : 'px-6 md:px-8 py-4'}>
                        <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                            <div className="flex items-center justify-between gap-2">
                                {/* Bouton Précédent */}
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentSection === 0}
                                    className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 ${layout.isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-base'} gap-2 ${currentSection === 0
                                        ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-800 hover:bg-gray-700 text-white active:scale-95'
                                        }`}
                                >
                                    ←
                                </button>

                                {/* Section Indicator */}
                                <div className="text-center flex-1">
                                    <div className={`font-medium ${layout.isMobile ? 'text-xs text-gray-400' : 'text-sm text-gray-400'
                                        }`}>
                                        {currentSection + 1}/{totalSections}
                                    </div>
                                </div>

                                {/* Bouton Suivant */}
                                <button
                                    onClick={handleNext}
                                    disabled={currentSection === totalSections - 1}
                                    className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 ${layout.isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-base'} gap-2 ${currentSection === totalSections - 1
                                        ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                                        }`}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveCreateReviewLayout;
