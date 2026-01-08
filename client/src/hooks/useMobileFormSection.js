/**
 * useMobileFormSection - Hook pour adapter les sections de formulaire au mobile
 * 
 * Gère:
 * - Dimensionnement adaptif des containers
 * - Réduction du scroll (max-height adapté)
 * - Responsivité des grilles et espacements
 * - Modes expandable/collapsible pour grouper les contenus
 */

import { useState, useCallback } from 'react';
import { useResponsiveLayout } from './useResponsiveLayout';

export const useMobileFormSection = (sectionName, defaultExpanded = true) => {
    const { isMobile, isTablet, isDesktop } = useResponsiveLayout();
    const [isExpanded, setIsExpanded] = useState(!isMobile ? defaultExpanded : defaultExpanded);

    // Dimensionnement adaptatif
    const containerClasses = {
        wrapper: isMobile 
            ? 'max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent'
            : 'max-h-none',
        section: isMobile
            ? 'p-3 bg-slate-900/60 rounded-xl border border-slate-700/50'
            : 'p-4 md:p-6 bg-slate-900/60 rounded-xl border border-slate-700/50',
        header: isMobile
            ? 'flex items-center justify-between gap-2 mb-3 cursor-pointer'
            : 'flex items-center justify-between gap-3 mb-4',
        title: isMobile
            ? 'text-base font-semibold text-white'
            : 'text-lg md:text-xl font-semibold text-white',
        content: isMobile && !isExpanded
            ? 'hidden'
            : 'block',
    };

    // Grille adaptative
    const gridClasses = {
        auto: isMobile
            ? 'grid-cols-1 gap-3'
            : isTablet
            ? 'grid-cols-2 gap-4'
            : 'grid-cols-2 lg:grid-cols-3 gap-6',
        auto2: isMobile
            ? 'grid-cols-1 gap-3'
            : 'grid-cols-2 gap-4 md:gap-6',
        full: 'grid-cols-1',
        double: isMobile
            ? 'grid-cols-1 gap-3'
            : isTablet
            ? 'grid-cols-2 gap-4'
            : 'grid-cols-3 lg:grid-cols-4 gap-6',
        triple: isMobile
            ? 'grid-cols-1 gap-3'
            : isTablet
            ? 'grid-cols-2 gap-4'
            : 'grid-cols-3 gap-6',
    };

    // Espacements adaptatifs
    const spacing = {
        padding: isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6',
        gap: isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6',
        mb: isMobile ? 'mb-3' : 'mb-4',
    };

    // Input/Select sizing
    const inputClasses = {
        base: isMobile
            ? 'w-full px-3 py-2 text-sm rounded-lg border border-slate-600 bg-slate-800 text-white'
            : 'w-full px-4 py-3 text-base rounded-lg border border-slate-600 bg-slate-800 text-white',
        small: isMobile
            ? 'px-2 py-1.5 text-xs'
            : 'px-3 py-2 text-sm',
    };

    // Button sizing
    const buttonClasses = {
        sm: isMobile
            ? 'px-2 py-1.5 text-xs rounded-lg'
            : 'px-3 py-2 text-sm rounded-lg',
        md: isMobile
            ? 'px-3 py-2 text-sm rounded-lg'
            : 'px-4 py-2.5 text-base rounded-lg',
        lg: isMobile
            ? 'px-4 py-2.5 text-sm rounded-lg'
            : 'px-6 py-3 text-base rounded-lg',
    };

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return {
        isMobile,
        isTablet,
        isDesktop,
        isExpanded,
        toggleExpanded,
        containerClasses,
        gridClasses,
        spacing,
        inputClasses,
        buttonClasses,
    };
};

export default useMobileFormSection;
