import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardModeToggle from '../../ui/WizardModeToggle';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';

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
    onPrevious,
    onNext,
    children,
    title,
    subtitle,
    showProgress = true,
    sectionEmojis = [], // Array d'émojis pour chaque section
    // Optional callback to open a global preview/orchard panel from the footer
    onOpenPreview,
    // Optional manual save handler — renders a "Sauvegarder" button left of Aperçu.
    // Disabled (greyed out) when isDirty is false, so the user can see at a glance
    // whether the autosave has already caught up with their latest edit.
    onSave,
    isDirty = false,
    saving = false,
    // When true, the content container expands to use far more of the viewport width.
    // Reserved for data-dense sections (pipelines, genetics canvas) that benefit from
    // extra horizontal room — simple field-based sections stay at a comfortable reading width.
    wide = false,
    // Optional callback rendering a "Mode automatique" footer button that re-enables the wizard
    // from the classic form. Lives in the fixed footer (not the scrollable header row) so it's
    // never covered by the sticky section carousel above it.
    onEnableWizard,
}) => {
    const layout = useResponsiveLayout();
    const [isDragging, setIsDragging] = useState(false);
    const [shouldUseCarousel, setShouldUseCarousel] = useState(false);
    const carouselRef = useRef(null);
    const containerRef = useRef(null);

    const VISIBLE_ITEMS = 5;
    const FALLBACK_ITEM_WIDTH = 70;

    // Desktop content width: comfortable reading width by default, much wider for
    // data-dense sections (pipelines, genetics canvas) so they can use available screen space.
    const containerWidthClass = layout.isMobile
        ? 'w-full'
        : (wide ? 'max-w-[1800px] mx-auto' : 'max-w-[1500px] mx-auto');

    const effectiveChangeSection = (index) => {
        if (typeof onSectionChange === 'function') {
            onSectionChange(index)
            return
        }

        if (index < currentSection && typeof onPrevious === 'function') {
            onPrevious()
            return
        }

        if (index > currentSection && typeof onNext === 'function') {
            onNext()
            return
        }
    }

    const handlePrevious = () => {
        if (typeof onPrevious === 'function') {
            onPrevious()
            return
        }

        if (currentSection > 0 && typeof onSectionChange === 'function') {
            onSectionChange(currentSection - 1)
        }
    };

    const handleNext = () => {
        if (typeof onNext === 'function') {
            onNext()
            return
        }

        if (currentSection < totalSections - 1 && typeof onSectionChange === 'function') {
            onSectionChange(currentSection + 1)
        }
    };

    // Scroll-snap helpers (Apple-like UX)

    const scrollToIndex = (index) => {
        const container = carouselRef.current;
        if (!container) return;
        const buttons = Array.from(container.querySelectorAll('button'));
        const btn = buttons[index];
        if (!btn) return;
        // Scroll le container directement — scrollIntoView scrolle la page entière
        const targetLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToIndex(currentSection);
    }, [currentSection]);

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


    // Pointer-enabled handlers - Improved touch responsiveness and softer snap
    // Use a ref-based drag state and rAF for smooth updates, avoid passive scroll interference
    const dragStateRef = React.useRef({ active: false, startX: 0, lastX: 0, offset: 0, raf: null, moved: false });

    const handlePointerDown = (e) => {
        // Normaliser clientX pour mouse/touch/pointer events
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        // NE PAS appeler e.preventDefault() ici — ça bloque les click events sur les boutons enfants
        const startScroll = carouselRef.current ? carouselRef.current.scrollLeft : 0;
        dragStateRef.current = { active: true, startX: clientX, lastX: clientX, startScroll, offset: 0, raf: null, moved: false };
        // Ne pas setIsDragging ici — attendre un vrai mouvement

        // Attach global listeners to ensure we capture move/up outside the element
        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerUp, { passive: false });
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerUp, { passive: false });
    };

    const handlePointerMove = (e) => {
        if (!dragStateRef.current.active) return;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const offset = dragStateRef.current.startX - clientX;
        dragStateRef.current.lastX = clientX;
        dragStateRef.current.offset = offset;

        // Activer le mode drag seulement après un mouvement significatif
        if (Math.abs(offset) > 5 && !dragStateRef.current.moved) {
            dragStateRef.current.moved = true;
            setIsDragging(true);
        }

        // rAF throttle updates for smoother visual feedback and apply live scroll
        if (dragStateRef.current.moved) {
            if (!dragStateRef.current.raf) {
                dragStateRef.current.raf = requestAnimationFrame(() => {
                    if (carouselRef.current) {
                        carouselRef.current.scrollLeft = dragStateRef.current.startScroll + dragStateRef.current.offset;
                    }
                    dragStateRef.current.raf = null;
                });
            }
        }

        // Prevent vertical page scrolling when significant horizontal move is detected
        if (Math.abs(offset) > 6) e.preventDefault?.();
    };

    const handlePointerUp = (e) => {
        if (!dragStateRef.current.active) return;
        dragStateRef.current.active = false;
        setIsDragging(false);

        // Nettoyer raf et listeners
        if (dragStateRef.current.raf) {
            cancelAnimationFrame(dragStateRef.current.raf);
            dragStateRef.current.raf = null;
        }
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);

        // Si pas de mouvement significatif, c'est un clic — laisser le onClick du button gérer
        if (!dragStateRef.current.moved) return;

        const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStateRef.current.lastX;
        const diff = dragStateRef.current.startX - clientX;

        const container = carouselRef.current;
        const currentScroll = container ? container.scrollLeft : (dragStateRef.current.startScroll + diff);
        const containerWidth = container ? container.offsetWidth : (VISIBLE_ITEMS * FALLBACK_ITEM_WIDTH);

        // Snap to the closest button based on container center
        let snapIndex = currentSection;
        if (container) {
            const center = currentScroll + containerWidth / 2;
            const buttons = Array.from(container.querySelectorAll('button'));
            let minDist = Infinity;
            buttons.forEach((b, idx) => {
                const dist = Math.abs((b.offsetLeft + b.offsetWidth / 2) - center);
                if (dist < minDist) { minDist = dist; snapIndex = idx; }
            });
        }
        snapIndex = Math.max(0, Math.min(totalSections - 1, snapIndex));

        if (snapIndex !== currentSection) {
            onSectionChange(snapIndex);
        }
        scrollToIndex(snapIndex);
    };

    return (
        <div className="h-full bg-[#07070f] relative flex flex-col overflow-hidden" style={{ overflowX: 'hidden' }}>
            {/* Background decorative - hidden on mobile for performance */}
            {!layout.isMobile && (
                <div className="fixed inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Header - Responsive Padding & Safe Area - z-30 to stay ABOVE main content (z-10) but BELOW modals (z-[8888]) */}
                <div className={`sticky top-[4.5rem] z-30 bg-[#07070f]/95 backdrop-blur-xl border-b border-white/10 ${layout.isMobile
                    ? 'px-3 py-2 safe-area-inset-top'
                    : 'px-6 md:px-8 py-2'
                    }`}>
                    <div className={containerWidthClass}>
                        {/* Title & Subtitle */}
                        {(title || subtitle) && (
                            <div className={layout.isMobile ? 'mb-2' : 'mb-2'}>
                                {title && (
                                    <h1 className={`font-bold text-white ${layout.isMobile ? 'text-base' : 'text-xl'
                                        }`}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={`text-white/50 mt-0.5 ${layout.isMobile ? 'text-xs' : 'text-xs'
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
                                                onPointerDown={handlePointerDown}
                                                style={{ touchAction: 'pan-y' }}
                                                className={`relative flex items-center justify-center gap-1 py-1 px-0 transition-all overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                            >
                                                {/* Build a repeated array to simulate infinite looping */}
                                                {/* repeatedEmojis removed: using single-pass scroll-snap for improved UX */}

                                                {/* Gradient fade left - plus prononcé */}
                                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#07070f] via-[#07070f]/70 to-transparent z-10 pointer-events-none" />

                                                {/* Gradient fade right - plus prononcé */}
                                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#07070f] via-[#07070f]/70 to-transparent z-10 pointer-events-none" />

                                                {/* New Apple-like scroll-snap carousel (single pass, accessible) */}
                                                <div
                                                    ref={carouselRef}
                                                    className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-4"
                                                    style={{
                                                        scrollSnapType: 'x mandatory',
                                                        WebkitOverflowScrolling: 'touch'
                                                    }}
                                                >
                                                    {sectionEmojis.map((emoji, index) => {
                                                        const isActive = index === currentSection;
                                                        return (
                                                            <button
                                                                key={index}
                                                                role="tab"
                                                                aria-selected={isActive}
                                                                onClick={(e) => { e.preventDefault(); scrollToIndex(index); effectiveChangeSection(index); }}
                                                                className={`flex-shrink-0 scroll-item rounded-xl px-3 py-1 transition-all duration-200 ease-out text-xl font-medium ${isActive ? 'scale-110 backdrop-blur-md bg-white/6 border border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}
                                                                style={{
                                                                    scrollSnapAlign: 'center',
                                                                    minWidth: 64,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 8
                                                                }}
                                                            >
                                                                <span className="relative z-10">{emoji}</span>
                                                                {isActive && <span className="sr-only">Section active</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            // Desktop: Show all emojis in a wrap (si assez d'espace)
                                            <div className="flex gap-2 flex-1 justify-center flex-wrap px-4">
                                                {sectionEmojis.map((emoji, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        onClick={() => effectiveChangeSection(idx)}
                                                        className={`px-4 py-2 rounded-lg transition-all ${idx === currentSection
                                                            ? 'bg-purple-600 ring-2 ring-purple-400 scale-110'
                                                            : 'bg-white/10 hover:bg-white/20'
                                                            }`}
                                                    >
                                                        <span className="text-lg">{emoji}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}


                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content — pour les pipelines (wide), overflow-hidden + h-full pour éviter le scroll page */}
                <main
                    className={`flex-1 min-h-0 no-scrollbar ${wide ? 'overflow-hidden' : 'overflow-y-auto'} ${layout.isMobile
                        ? `px-3 ${wide ? 'py-0' : 'py-2 pb-16'}`
                        : `px-6 md:px-8 ${wide ? 'py-0' : 'py-2 pb-16'}`
                        }`}
                    onClick={(e) => {
                        const tag = (e.target && e.target.tagName && e.target.tagName.toLowerCase()) || '';
                        if (['input', 'textarea', 'select', 'button', 'a', 'svg', 'path'].includes(tag)) return;
                        if (e.target.closest && e.target.closest('.modal, .react-modal, .fixed')) return;
                        if (sectionEmojis.length) scrollToIndex(currentSection);
                    }}
                >
                    <div className={`${containerWidthClass} ${wide ? 'h-full' : ''}`}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Fixed at bottom, always visible */}
                <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#07070f] via-[#07070f] to-transparent border-t border-white/10 backdrop-blur-xl z-50 ${layout.isMobile ? 'safe-area-inset-bottom' : ''
                    }`}>
                    <div className={layout.isMobile ? 'px-3 py-1.5' : 'px-6 md:px-8 py-2'}>
                        <div className={containerWidthClass}>
                            <div className="flex items-center justify-between gap-2">
                                {/* Bouton Précédent */}
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentSection === 0}
                                    className={`flex items-center justify-center rounded-xl font-medium transition-all flex-shrink-0 ${layout.isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-base'} gap-2 ${currentSection === 0
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                                        }`}
                                >
                                    ←
                                </button>

                                {/* Section Indicator */}
                                <div className="text-center flex-1 min-w-0">
                                    <div className={`font-medium ${layout.isMobile ? 'text-xs text-white/50' : 'text-sm text-white/50'
                                        }`}>
                                        {currentSection + 1}/{totalSections}
                                    </div>
                                </div>

                                {/* Save button — greyed out when there is nothing new to persist */}
                                {onSave && (
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={onSave}
                                            disabled={!isDirty || saving}
                                            title={saving ? 'Sauvegarde en cours…' : isDirty ? 'Sauvegarder maintenant' : 'Déjà sauvegardé'}
                                            className={`rounded-xl transition-all font-medium flex items-center gap-1.5 ${layout.isMobile ? 'px-2 py-2' : 'px-3 py-2 text-sm'} ${isDirty && !saving
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {!layout.isMobile && <span>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>}
                                        </button>
                                    </div>
                                )}

                                {/* Mode automatique — bascule vers le wizard une-question-à-la-fois */}
                                {onEnableWizard && (
                                    <WizardModeToggle
                                        active={false}
                                        onClick={onEnableWizard}
                                        compact={layout.isMobile}
                                    />
                                )}

                                {/* Preview button */}
                                {onOpenPreview && (
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={onOpenPreview}
                                            className={`rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all font-medium flex items-center gap-1.5 ${layout.isMobile ? 'px-2 py-2' : 'px-3 py-2 text-sm'
                                                }`}
                                            title="Aperçu"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {!layout.isMobile && <span>Aperçu</span>}
                                        </button>
                                    </div>
                                )}

                                {/* Bouton Suivant */}
                                <button
                                    onClick={handleNext}
                                    disabled={currentSection === totalSections - 1}
                                    className={`flex items-center justify-center rounded-xl font-medium transition-all flex-shrink-0 ${layout.isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-base'} gap-2 ${currentSection === totalSections - 1
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                                        }`}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </div >
    );
};

export default ResponsiveCreateReviewLayout;


