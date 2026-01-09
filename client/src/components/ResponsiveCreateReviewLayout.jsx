import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * ResponsiveCreateReviewLayout - Layout responsive pour pages de création
 * OPTIMISÉ MOBILE FIRST
 * 
 * Gère:
 * - Navigation sections (Prev/Next buttons TOUJOURS visibles)
 * - Carousel d'émojis sections (galerie tournante sur mobile)
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

    const handlePrevious = () => {
        if (currentSection > 0) {
            onSectionChange(currentSection - 1);
            setEmojiCarouselIndex(Math.max(0, currentSection - 2));
        }
    };

    const handleNext = () => {
        if (currentSection < totalSections - 1) {
            onSectionChange(currentSection + 1);
            setEmojiCarouselIndex(Math.min(Math.max(0, sectionEmojis.length - 3), currentSection + 1));
        }
    };

    // Auto-scroll carousel when section changes
    useEffect(() => {
        if (currentSection > 1) {
            setEmojiCarouselIndex(Math.max(0, currentSection - 1));
        } else {
            setEmojiCarouselIndex(0);
        }
    }, [currentSection]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative flex flex-col">
            {/* Background decorative - hidden on mobile for performance */}
            {!layout.isMobile && (
                <div className="fixed inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Responsive Padding & Safe Area */}
                <div className={`sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 ${
                    layout.isMobile 
                        ? 'px-3 py-3 safe-area-inset-top' 
                        : 'px-6 md:px-8 py-6'
                }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {/* Title & Subtitle */}
                        {(title || subtitle) && (
                            <div className={layout.isMobile ? 'mb-3' : 'mb-4'}>
                                {title && (
                                    <h1 className={`font-bold text-gray-100 ${
                                        layout.isMobile ? 'text-lg' : 'text-3xl'
                                    }`}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={`text-gray-400 mt-0.5 ${
                                        layout.isMobile ? 'text-xs' : 'text-sm'
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
                                    <div className={`flex items-center justify-center gap-1 ${
                                        layout.isMobile ? '-mx-3' : ''
                                    }`}>
                                        {/* Left Arrow - Mobile optimized */}
                                        {emojiCarouselIndex > 0 && (
                                            <button
                                                onClick={() => setEmojiCarouselIndex(Math.max(0, emojiCarouselIndex - 1))}
                                                className={`flex-shrink-0 p-1 hover:bg-gray-700/50 rounded transition ${
                                                    layout.isMobile ? '' : ''
                                                }`}
                                            >
                                                <ChevronLeft className={`text-purple-400 ${
                                                    layout.isMobile ? 'w-4 h-4' : 'w-5 h-5'
                                                }`} />
                                            </button>
                                        )}

                                        {/* Emoji buttons */}
                                        {layout.isMobile ? (
                                            // Mobile: Show 3 emojis
                                            <div className="flex gap-1 flex-1 justify-center">
                                                <AnimatePresence mode="wait">
                                                    {[0, 1, 2].map((offset) => {
                                                        const index = emojiCarouselIndex + offset;
                                                        if (index >= sectionEmojis.length) return null;

                                                        return (
                                                            <motion.button
                                                                key={index}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                onClick={() => onSectionChange(index)}
                                                                className={`px-2.5 py-2 rounded-lg transition-all text-base ${
                                                                    index === currentSection
                                                                        ? 'bg-purple-600 ring-2 ring-purple-400 scale-110'
                                                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                <span>{sectionEmojis[index]}</span>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            // Desktop: Show all emojis
                                            <div className="flex gap-2 flex-1 justify-center flex-wrap">
                                                {sectionEmojis.map((emoji, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        onClick={() => onSectionChange(idx)}
                                                        className={`px-4 py-2 rounded-lg transition-all ${
                                                            idx === currentSection
                                                                ? 'bg-purple-600 ring-2 ring-purple-400 scale-110'
                                                                : 'bg-gray-700/50 hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        <span className="text-lg">{emoji}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Right Arrow - Mobile optimized */}
                                        {layout.isMobile && emojiCarouselIndex < Math.max(0, sectionEmojis.length - 3) && (
                                            <button
                                                onClick={() => setEmojiCarouselIndex(Math.min(Math.max(0, sectionEmojis.length - 3), emojiCarouselIndex + 1))}
                                                className="flex-shrink-0 p-1 hover:bg-gray-700/50 rounded transition"
                                            >
                                                <ChevronRight className="w-4 h-4 text-purple-400" />
                                            </button>
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
                <main className={`relative z-20 flex-1 overflow-y-auto ${
                    layout.isMobile 
                        ? 'px-3 py-4' 
                        : 'px-6 md:px-8 py-8'
                }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Persistent & safe-area aware */}
                <div className={`bg-gradient-to-t from-gray-900 via-gray-900 to-transparent border-t border-gray-700/50 backdrop-blur-xl z-40 ${
                    layout.isMobile ? 'safe-area-inset-bottom' : ''
                }`}>
                    <div className={layout.isMobile ? 'px-3 py-3' : 'px-6 md:px-8 py-6'}>
                        <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                            <div className="flex items-center justify-between gap-2">
                                {/* Bouton Précédent - Mobile optimized */}
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentSection === 0}
                                    className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 ${
                                        currentSection === 0
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-800 hover:bg-gray-700 text-white active:scale-95'
                                        } ${
                                        layout.isMobile 
                                            ? 'p-2.5 text-sm' 
                                            : 'px-4 py-2.5 text-base gap-2'
                                    }`}
                                >
                                    <ChevronLeft className={layout.isMobile ? 'w-5 h-5' : 'w-5 h-5'} />
                                    {!layout.isMobile && 'Précédent'}
                                </button>

                                {/* Section Indicator - Mobile */}
                                {layout.isMobile && (
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-gray-400 font-medium">
                                            {currentSection + 1}/{totalSections}
                                        </div>
                                    </div>
                                )}

                                {/* Bouton Suivant - Mobile optimized */}
                                <button
                                    onClick={handleNext}
                                    disabled={currentSection === totalSections - 1}
                                    className={`flex items-center justify-center rounded-lg font-medium transition-all flex-shrink-0 ${
                                        currentSection === totalSections - 1
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                                        } ${
                                        layout.isMobile 
                                            ? 'p-2.5 text-sm' 
                                            : 'px-4 py-2.5 text-base gap-2'
                                    }`}
                                >
                                    {!layout.isMobile && 'Suivant'}
                                    <ChevronRight className={layout.isMobile ? 'w-5 h-5' : 'w-5 h-5'} />
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
                                                            className={`px-4 py-2 rounded-lg transition-all ${idx === currentSection
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
