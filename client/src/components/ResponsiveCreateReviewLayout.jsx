import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * ResponsiveCreateReviewLayout - Layout responsive pour pages de création
 * 
 * Gère:
 * - Navigation sections (Prev/Next buttons + Steps indicator)
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
}) => {
    const layout = useResponsiveLayout();

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
                                    // Desktop: Progress bar
                                    <div className="w-full">
                                        <div className="flex justify-between items-center mb-2">
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
