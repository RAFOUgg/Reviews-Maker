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
    const [emojiCarouselIndex, setEmojiCarouselIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const carouselRef = useRef(null);

    // Nombre de sections visibles dans le carrousel
    const VISIBLE_ITEMS = 5;
    const maxIndex = Math.max(0, sectionEmojis.length - VISIBLE_ITEMS);

    const handlePrevious = () => {
        if (layout.isMobile) {
            // Sur mobile, le footer n'a pas les boutons prev/next
            return;
        }
        if (currentSection > 0) {
            onSectionChange(currentSection - 1);
        }
    };

    const handleNext = () => {
        if (layout.isMobile) {
            // Sur mobile, le footer n'a pas les boutons prev/next
            return;
        }
        if (currentSection < totalSections - 1) {
            onSectionChange(currentSection + 1);
        }
    };

    // Auto-position carousel to keep selected section visible
    useEffect(() => {
        if (currentSection < emojiCarouselIndex) {
            // Section est avant le carousel visible
            setEmojiCarouselIndex(Math.max(0, currentSection - 2));
        } else if (currentSection > emojiCarouselIndex + VISIBLE_ITEMS - 1) {
            // Section est après le carousel visible
            setEmojiCarouselIndex(Math.min(maxIndex, currentSection - 2));
        }
    }, [currentSection]);

    // Drag handlers - Smooth scroll horizontal
    const handleMouseDown = (e) => {
        if (sectionEmojis.length <= VISIBLE_ITEMS) return;
        setIsDragging(true);
        setDragStart(e.clientX || e.touches?.[0]?.clientX);
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;
        setIsDragging(false);

        const dragEnd = e.clientX || e.changedTouches?.[0]?.clientX;
        const diff = dragStart - dragEnd;

        // Threshold pour le drag (plus sensible)
        const threshold = 30;

        if (diff > threshold && emojiCarouselIndex < maxIndex) {
            // Drag vers la gauche → scroll à droite
            setEmojiCarouselIndex(Math.min(maxIndex, emojiCarouselIndex + 1));
        } else if (diff < -threshold && emojiCarouselIndex > 0) {
            // Drag vers la droite → scroll à gauche
            setEmojiCarouselIndex(Math.max(0, emojiCarouselIndex - 1));
        }
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
                                    <div className="w-full">
                                        {layout.isMobile ? (
                                            // Mobile: Drag-to-scroll carousel with 5 items visible + fade effect
                                            <div
                                                ref={carouselRef}
                                                onMouseDown={handleMouseDown}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={handleMouseDown}
                                                onTouchEnd={handleMouseUp}
                                                className={`relative flex items-center justify-center gap-1 py-4 px-0 transition-all overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                            >
                                                {/* Gradient fade left */}
                                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />

                                                {/* Gradient fade right */}
                                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

                                                <div className="flex items-center justify-center gap-2">
                                                    <AnimatePresence mode="wait">
                                                        {Array.from({ length: Math.min(VISIBLE_ITEMS, sectionEmojis.length) }).map((_, displayOffset) => {
                                                            const index = emojiCarouselIndex + displayOffset;
                                                            if (index >= sectionEmojis.length) return null;

                                                            // Position dans le carousel (center is 0, sides are -2 to 2)
                                                            const centerOffset = displayOffset - 2;
                                                            const isCenter = centerOffset === 0;

                                                            // Calcul opacité avec effect fade progressif
                                                            const opacityMap = {
                                                                0: 1,      // Center: 100% opaque
                                                                1: 0.6,    // Adjacent: 60%
                                                                2: 0.3     // Outer: 30%
                                                            };
                                                            const opacity = opacityMap[Math.abs(centerOffset)];

                                                            return (
                                                                <motion.button
                                                                    key={index}
                                                                    initial={{ opacity: 0.3, scale: 0.85 }}
                                                                    animate={{
                                                                        opacity: opacity,
                                                                        scale: isCenter ? 1.15 : 1
                                                                    }}
                                                                    exit={{ opacity: 0, scale: 0.85 }}
                                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
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
                                            // Desktop: Show all emojis in a wrap
                                            <div className="flex gap-2 flex-1 justify-center flex-wrap">
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

                {/* Main Content - Flex-grow to push footer down */}
                <main className={`relative z-20 flex-1 overflow-y-auto ${layout.isMobile
                    ? 'px-3 py-4'
                    : 'px-6 md:px-8 py-8'
                    }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Persistent & safe-area aware */}
                <div className={`bg-gradient-to-t from-gray-900 via-gray-900 to-transparent border-t border-gray-700/50 backdrop-blur-xl z-40 ${layout.isMobile ? 'safe-area-inset-bottom' : ''
                    }`}>
                    <div className={layout.isMobile ? 'px-3 py-3' : 'px-6 md:px-8 py-6'}>
                        <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                            <div className="flex items-center justify-between gap-2">
                                {/* Bouton Précédent - Desktop only */}
                                {!layout.isMobile && (
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentSection === 0}
                                        className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 px-4 py-2.5 text-base gap-2 ${currentSection === 0
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-800 hover:bg-gray-700 text-white active:scale-95'
                                            }`}
                                    >
                                        ← Précédent
                                    </button>
                                )}

                                {/* Section Indicator */}
                                <div className={`text-center ${!layout.isMobile ? 'flex-1' : 'flex-1'}`}>
                                    <div className={`font-medium ${layout.isMobile ? 'text-xs text-gray-400' : 'text-sm text-gray-400'
                                        }`}>
                                        {currentSection + 1}/{totalSections}
                                    </div>
                                </div>

                                {/* Bouton Suivant - Desktop only */}
                                {!layout.isMobile && (
                                    <button
                                        onClick={handleNext}
                                        disabled={currentSection === totalSections - 1}
                                        className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 px-4 py-2.5 text-base gap-2 ${currentSection === totalSections - 1
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                                            }`}
                                    >
                                        Suivant →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveCreateReviewLayout;
