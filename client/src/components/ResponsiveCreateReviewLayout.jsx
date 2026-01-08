import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * ResponsiveCreateReviewLayout - Layout responsive pour pages de création
 * 
 * Gère:
 * - Navigation sections (Prev/Next buttons TOUJOURS visibles)
 * - Carousel d'émojis sections (galerie tournante)
 * - Padding et spacing adaptatif
 * - Full-width sur mobile
 * - Max-width sur desktop
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

    const handlePrevious = () => {
        if (currentSection > 0) {
            onSectionChange(currentSection - 1);
            setEmojiCarouselIndex(Math.max(0, currentSection - 2));
        }
    };

    const handleNext = () => {
        if (currentSection < totalSections - 1) {
            onSectionChange(currentSection + 1);
            setEmojiCarouselIndex(Math.min(sectionEmojis.length - 3, currentSection + 1));
        }
    };

    // Auto-scroll carousel when section changes
    useEffect(() => {
        if (currentSection > 1) {
            setEmojiCarouselIndex(Math.max(0, currentSection - 1));
        }
    }, [currentSection]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative pb-24">
            {/* Background decorative */}
            <div className="fixed inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Header - Responsive Padding */}
                <div className={`sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 ${layout.isMobile ? 'px-4 py-4' : 'px-6 md:px-8 py-6'
                    }`}>
                    <div className={`${layout.isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto`}>
                        {/* Title & Subtitle */}
                        {(title || subtitle) && (
                            <div className="mb-4">
                                {title && (
                                    <h1 className={`font-bold text-gray-100 ${layout.isMobile ? 'text-xl' : 'text-3xl'
                                        }`}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={`text-gray-400 mt-1 ${layout.isMobile ? 'text-xs' : 'text-sm'
                                        }`}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Progress Indicator */}
                        {showProgress && (
                            <div className="space-y-3">
                                {/* Emoji Carousel - Galerie tournante sur mobile */}
                                {layout.isMobile && sectionEmojis.length > 0 && (
                                    <div className="flex items-center justify-center gap-2">
                                        {emojiCarouselIndex > 0 && (
                                            <button
                                                onClick={() => setEmojiCarouselIndex(Math.max(0, emojiCarouselIndex - 1))}
                                                className="p-1 hover:bg-gray-700/50 rounded transition"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-purple-400" />
                                            </button>
                                        )}

                                        <div className="flex gap-1">
                                            <AnimatePresence mode="wait">
                                                {[0, 1, 2].map((offset) => {
                                                    const index = emojiCarouselIndex + offset;
                                                    if (index >= sectionEmojis.length) return null;

                                                    return (
                                                        <motion.button
                                                            key={index}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -10 }}
                                                            onClick={() => onSectionChange(index)}
                                                            className={`px-3 py-2 rounded-lg transition-all ${
                                                                index === currentSection
                                                                    ? 'bg-purple-600 ring-2 ring-purple-400'
                                                                    : 'bg-gray-700/50 hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            <span className="text-lg">{sectionEmojis[index]}</span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>

                                        {emojiCarouselIndex < sectionEmojis.length - 3 && (
                                            <button
                                                onClick={() => setEmojiCarouselIndex(Math.min(sectionEmojis.length - 3, emojiCarouselIndex + 1))}
                                                className="p-1 hover:bg-gray-700/50 rounded transition"
                                            >
                                                <ChevronRight className="w-4 h-4 text-purple-400" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Counter + Progress */}
                                <div className="flex items-center justify-center gap-2">
                                    {/* Mobile: Simple counter */}
                                    {layout.isMobile ? (
                                        <div className="text-center">
                                            <div className="text-purple-400 font-bold text-lg">
                                                {currentSection + 1}/{totalSections}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Sections complétées
                                            </div>
                                        </div>
                                    ) : (
                                        // Desktop: Progress bar + All emojis
                                        <div className="w-full space-y-3">
                                            {sectionEmojis.length > 0 && (
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    {sectionEmojis.map((emoji, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => onSectionChange(idx)}
                                                            className={`px-4 py-2 rounded-lg transition-all ${
                                                                idx === currentSection
                                                                    ? 'bg-purple-600 ring-2 ring-purple-400 scale-110'
                                                                    : 'bg-gray-700/50 hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            <span className="text-lg">{emoji}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-400">
                                                    Étape {currentSection + 1} sur {totalSections}
                                                </span>
                                                <span className="text-sm text-purple-400 font-medium">
                                                    {Math.round(((currentSection + 1) / totalSections) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                                                    style={{
                                                        width: `${((currentSection + 1) / totalSections) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <main className={`relative z-20 ${layout.isMobile ? 'px-4 py-6' : 'px-6 md:px-8 py-8'
                    }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Sticky sur mobile, fixed sur desktop */}
                <div className={`${layout.isMobile ? 'fixed bottom-0 left-0 right-0' : 'sticky bottom-0'
                    } bg-gradient-to-t from-gray-900 via-gray-900 to-transparent border-t border-gray-700/50 backdrop-blur-xl z-40`}>
                    <div className={`${layout.isMobile ? 'px-4 py-4' : 'px-6 md:px-8 py-6'}`}>
                        <div className={layout.isMobile ? 'max-w-full' : 'max-w-6xl mx-auto'}>
                            <div className="flex items-center justify-between gap-3">
                                {/* Bouton Précédent */}
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentSection === 0}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${currentSection === 0
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                                        } ${layout.isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    <ChevronLeft className={layout.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                                    {!layout.isMobile && 'Précédent'}
                                </button>

                                {/* Section Title/Indicator (mobile) */}
                                {layout.isMobile && (
                                    <div className="text-center flex-1">
                                        <div className="text-sm text-gray-300 font-medium truncate">
                                            {currentSection + 1}/{totalSections}
                                        </div>
                                    </div>
                                )}

                                {/* Bouton Suivant */}
                                <button
                                    onClick={handleNext}
                                    disabled={currentSection === totalSections - 1}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${currentSection === totalSections - 1
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        } ${layout.isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    {!layout.isMobile && 'Suivant'}
                                    <ChevronRight className={layout.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
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
