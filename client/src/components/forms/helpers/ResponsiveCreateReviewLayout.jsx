import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    children,
    title,
    subtitle,
    showProgress = true,
    sectionEmojis = [], // Array d'émojis pour chaque section
    // Optional callback to open a global preview/orchard panel from the footer
    onOpenPreview,
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
    const FALLBACK_ITEM_WIDTH = 70; // px (emoji button width + gap)
    const CONTAINER_CENTER = VISIBLE_ITEMS / 2; // Position du centre (2.5 = centre between two)

    // Measured sizes (dynamic): use DOM measurements for correct centering
    const [itemWidth, setItemWidth] = useState(FALLBACK_ITEM_WIDTH);
    const [containerWidthState, setContainerWidthState] = useState(0);
    const [maxScrollState, setMaxScrollState] = useState(0);

    // Backwards compatibility fallback: some bundles or older code paths may reference ITEM_WIDTH
    // Defining it here prevents ReferenceError in case an uppercase variant is emitted by minifier.
    const ITEM_WIDTH = itemWidth || FALLBACK_ITEM_WIDTH;

    // Compute/measure widths to calculate exact centering and maxScroll
    useEffect(() => {
        const measure = () => {
            try {
                if (!containerRef.current) return;
                const containerWidth = containerRef.current.offsetWidth - 24; // account for small padding
                setContainerWidthState(containerWidth);

                // Try to detect a real item width from the first emoji button
                const firstBtn = carouselRef.current?.querySelector('button');
                let measuredItemWidth = FALLBACK_ITEM_WIDTH;
                if (firstBtn) {
                    const btnStyle = window.getComputedStyle(firstBtn);
                    const marginRight = parseFloat(btnStyle.marginRight || '8') || 8;
                    measuredItemWidth = Math.round(firstBtn.offsetWidth + marginRight);
                }
                setItemWidth(measuredItemWidth);

                const totalWidth = sectionEmojis.length * measuredItemWidth;
                const maxScroll = Math.max(0, totalWidth - containerWidth);
                setMaxScrollState(maxScroll);
            } catch (err) {
                // ignore measurement failures
            }
        };

        measure();
        const t = setTimeout(measure, 150);
        window.addEventListener('resize', measure);
        return () => { clearTimeout(t); window.removeEventListener('resize', measure); };
    }, [sectionEmojis.length]);

    const handlePrevious = () => {
        if (currentSection > 0) onSectionChange(currentSection - 1);
    };

    const handleNext = () => {
        if (currentSection < totalSections - 1) onSectionChange(currentSection + 1);
    };

    // Scroll-snap helpers (Apple-like UX)
    const scrollTimeoutRef = React.useRef(null);
    const scrollLockRef = React.useRef(false);

    const scrollToIndex = (index) => {
        if (!carouselRef.current) return;
        const buttons = Array.from(carouselRef.current.querySelectorAll('button'));
        const btn = buttons[index];
        if (!btn) return;
        // center using native API
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    const handleScroll = () => {
        if (!carouselRef.current || scrollLockRef.current) return;
        const container = carouselRef.current;
        const center = container.scrollLeft + container.offsetWidth / 2;
        const buttons = Array.from(container.querySelectorAll('button'));
        if (!buttons.length) return;
        let closest = 0;
        let minDist = Infinity;
        buttons.forEach((b, idx) => {
            const bCenter = b.offsetLeft + b.offsetWidth / 2;
            const dist = Math.abs(bCenter - center);
            if (dist < minDist) { minDist = dist; closest = idx; }
        });
        const logicalIndex = closest % totalSections;
        if (logicalIndex !== currentSection) {
            onSectionChange(logicalIndex);
        }
    };

    const handleScrollDebounced = () => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => handleScroll(), 80);
    };

    React.useEffect(() => {
        if (!carouselRef.current) return;
        // center the active item when index changes
        scrollToIndex(currentSection);
    }, [currentSection]);

    // Apply calculated scrollPosition to the container (smooth)
    React.useEffect(() => {
        if (!carouselRef.current) return;
        try {
            carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        } catch (e) {
            // Fallback si scrollTo avec options n'est pas supporté
            carouselRef.current.scrollLeft = scrollPosition;
        }
    }, [scrollPosition]);
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

    // Auto-position carousel to center selected section (using middle repetition)
    useEffect(() => {
        if (!sectionEmojis.length) return;
        const w = itemWidth || FALLBACK_ITEM_WIDTH;
        const containerW = containerWidthState || (VISIBLE_ITEMS * w);
        const totalWidth = sectionEmojis.length * w;
        const maxScroll = maxScrollState || Math.max(0, totalWidth - containerW);

        // center the currentSection
        const itemCenter = (currentSection * w) + (w / 2);
        const targetScroll = Math.max(0, Math.min(maxScroll, itemCenter - (containerW / 2)));

        if (!isDragging) {
            setScrollPosition(targetScroll);
        }
    }, [currentSection, isDragging, maxScrollState, itemWidth, containerWidthState, sectionEmojis.length]);

    // Pointer-enabled handlers - Improved touch responsiveness and softer snap
    // Use a ref-based drag state and rAF for smooth updates, avoid passive scroll interference
    const dragStateRef = React.useRef({ active: false, startX: 0, lastX: 0, offset: 0, raf: null });

    const handlePointerDown = (e) => {
        if (sectionEmojis.length <= VISIBLE_ITEMS) return;
        // Normaliser clientX pour mouse/touch/pointer events
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        // Prevent accidental text selection / page pan for horizontal drags
        e.preventDefault?.();
        // Record initial scroll so we can apply offset live while dragging
        const startScroll = carouselRef.current ? carouselRef.current.scrollLeft : 0;
        dragStateRef.current = { active: true, startX: clientX, lastX: clientX, startScroll, offset: 0, raf: null };
        setIsDragging(true);
        setDragOffset(0);

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

        // rAF throttle updates for smoother visual feedback and apply live scroll
        if (!dragStateRef.current.raf) {
            dragStateRef.current.raf = requestAnimationFrame(() => {
                setDragOffset(dragStateRef.current.offset);
                if (carouselRef.current) {
                    carouselRef.current.scrollLeft = dragStateRef.current.startScroll + dragStateRef.current.offset;
                }
                dragStateRef.current.raf = null;
            });
        }

        // Prevent vertical page scrolling when significant horizontal move is detected
        if (Math.abs(offset) > 6) e.preventDefault?.();
    };

    const handlePointerUp = (e) => {
        if (!dragStateRef.current.active) return;
        dragStateRef.current.active = false;
        setIsDragging(false);

        const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStateRef.current.lastX;
        const diff = dragStateRef.current.startX - clientX;

        // Use real scroll position from the container (more reliable) or fallback
        let newScroll = carouselRef.current ? carouselRef.current.scrollLeft : (scrollPosition + diff);
        const maxScroll = maxScrollState || Math.max(0, (sectionEmojis.length * itemWidth) - (containerWidthState || (VISIBLE_ITEMS * itemWidth)));
        newScroll = Math.max(0, Math.min(maxScroll, newScroll));

        // Déterminer l'index scrolled selon la position du centre du conteneur
        const containerCenter = (containerWidthState || (VISIBLE_ITEMS * itemWidth)) / 2;
        const scrolledIndex = (newScroll + containerCenter - (itemWidth / 2)) / itemWidth;
        const movedSections = scrolledIndex - currentSection;
        const absMoved = Math.abs(movedSections);

        let snapIndex;
        if (absMoved < 0.35) {
            snapIndex = currentSection;
        } else {
            snapIndex = Math.max(0, Math.min(totalSections - 1, Math.round(scrolledIndex)));
        }

        // If we've hit the max scroll clamp, ensure we snap to the last section (avoid getting stuck before the end)
        if (carouselRef.current) {
            const currentScroll = carouselRef.current.scrollLeft;
            if (Math.abs(currentScroll - maxScroll) <= 1) {
                snapIndex = totalSections - 1;
            }
        }

        const snappedScroll = Math.max(0, Math.min(maxScroll, (snapIndex * itemWidth + (itemWidth / 2)) - containerCenter));

        // Appliquer snapping et réinitialiser offset
        setScrollPosition(snappedScroll);
        setDragOffset(0);

        // Nettoyer raf et listeners
        if (dragStateRef.current.raf) {
            cancelAnimationFrame(dragStateRef.current.raf);
            dragStateRef.current.raf = null;
        }
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);

        // Déclencher le changement de section si nécessaire (use snapIndex)
        if (snapIndex !== currentSection) {
            onSectionChange(snapIndex);
            // assurer le recentrage visuel
            scrollToIndex(snapIndex);
        }
    };

    return (
        <div className="min-h-screen bg-[#07070f] relative flex flex-col" style={{ overflowX: 'hidden' }}>
            {/* Background decorative - hidden on mobile for performance */}
            {!layout.isMobile && (
                <div className="fixed inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Responsive Padding & Safe Area - z-30 to stay BELOW main navbar (z-[100]) */}
                <div className={`sticky top-[4.5rem] z-30 bg-[#07070f]/95 backdrop-blur-xl border-b border-white/10 ${layout.isMobile
                    ? 'px-3 py-3 safe-area-inset-top'
                    : 'px-6 md:px-8 py-6'
                    }`}>
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {/* Title & Subtitle */}
                        {(title || subtitle) && (
                            <div className={layout.isMobile ? 'mb-3' : 'mb-4'}>
                                {title && (
                                    <h1 className={`font-bold text-white ${layout.isMobile ? 'text-lg' : 'text-3xl'
                                        }`}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={`text-white/50 mt-0.5 ${layout.isMobile ? 'text-xs' : 'text-sm'
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
                                                className={`relative flex items-center justify-center gap-1 py-4 px-0 transition-all overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                                                    onScroll={() => handleScrollDebounced()}
                                                    className="flex items-center gap-3 overflow-x-auto no-scrollbar py-4 px-4"
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
                                                                onClick={(e) => { e.preventDefault(); scrollToIndex(index); onSectionChange(index); }}
                                                                className={`flex-shrink-0 scroll-item rounded-xl px-4 py-3 transition-all duration-200 ease-out text-2xl font-medium ${isActive ? 'scale-110 backdrop-blur-md bg-white/6 border border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}
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
                                                        onClick={() => onSectionChange(idx)}
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

                {/* Main Content - Flex-grow to push footer down, with padding-bottom for fixed footer */}
                <main
                    className={`relative z-20 flex-1 overflow-y-auto ${layout.isMobile
                        ? 'px-3 py-4 pb-20'
                        : 'px-6 md:px-8 py-8 pb-24'
                        }`}
                    onClick={(e) => {
                        // Recenter carousel when clicking elsewhere in the section
                        // Ignore clicks on form controls to avoid interfering with interactions
                        const tag = (e.target && e.target.tagName && e.target.tagName.toLowerCase()) || '';
                        if (['input', 'textarea', 'select', 'button', 'a', 'svg', 'path'].includes(tag)) return;
                        // Also ignore clicks inside modal-like elements (closest check)
                        if (e.target.closest && e.target.closest('.modal, .react-modal, .fixed')) return;

                        // center the carousel to the active section
                        if (!sectionEmojis.length) return;
                        const w = itemWidth || FALLBACK_ITEM_WIDTH;
                        const containerW = containerWidthState || (VISIBLE_ITEMS * w);
                        const totalWidth = sectionEmojis.length * w;
                        const maxScroll = maxScrollState || Math.max(0, totalWidth - containerW);
                        // Center on the real current index
                        const targetIndex = currentSection;
                        const itemCenter = (targetIndex * w) + (w / 2);
                        const targetScroll = Math.max(0, Math.min(maxScroll, itemCenter - (containerW / 2)));
                        setScrollPosition(targetScroll);
                    }}
                >
                    <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
                        {children}
                    </div>
                </main>

                {/* Navigation Footer - Fixed at bottom, always visible */}
                <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#07070f] via-[#07070f] to-transparent border-t border-white/10 backdrop-blur-xl z-50 ${layout.isMobile ? 'safe-area-inset-bottom' : ''
                    }`}>
                    <div className={layout.isMobile ? 'px-3 py-2' : 'px-6 md:px-8 py-4'}>
                        <div className={layout.isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
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
                                <div className="text-center flex-1">
                                    <div className={`font-medium ${layout.isMobile ? 'text-xs text-white/50' : 'text-sm text-white/50'
                                        }`}>
                                        {currentSection + 1}/{totalSections}
                                    </div>
                                </div>

                                {/* Secondary Preview button (hotfix) - rendered only when parent passes handler */}
                                {onOpenPreview && (
                                    <div className="flex-shrink-0 ml-3 hidden md:block">
                                        <button
                                            onClick={onOpenPreview}
                                            className="px-3 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm font-medium"
                                            title="Aperçu"
                                        >
                                            <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Aperçu
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


