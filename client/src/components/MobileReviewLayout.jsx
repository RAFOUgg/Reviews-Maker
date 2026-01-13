import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../hooks/useMobileFormSection';

/**
 * MobileReviewLayout - Wrapper pour adapter les pages de review au mobile
 * 
 * Gère:
 * - Layout responsive (1 col mobile, 2 col tablet, full desktop)
 * - Réduction du scroll (sections collapsibles)
 * - Dimensionnement adaptatif des éléments
 * - Progress indicator adapté
 */

export const MobileReviewLayout = ({
    children,
    title,
    currentSection = 1,
    totalSections = 10,
    isPreview = false,
}) => {
    const { isMobile, isTablet, isDesktop } = useResponsiveLayout();
    const { spacing } = useMobileFormSection('layout');

    return (
        <div className={`w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950`}>
            {/* Header */}
            <div className={`
                sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50
                ${isMobile ? 'px-3 py-2' : 'px-6 py-4'}
            `}>
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex-1">
                        <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white truncate`}>
                            {title}
                        </h1>
                        {!isPreview && (
                            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                                {currentSection}/{totalSections} sections
                            </p>
                        )}
                    </div>

                    {/* Progress bar */}
                    {!isPreview && (
                        <div className="flex-shrink-0">
                            <div className={`
                                ${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full
                                border-4 border-slate-700/50 flex items-center justify-center
                                relative overflow-hidden
                            `}>
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                            from 0deg,
                                            #a855f7 0deg,
                                            #a855f7 ${(currentSection / totalSections) * 360}deg,
                                            transparent ${(currentSection / totalSections) * 360}deg
                                        )`,
                                    }}
                                />
                                <div className={`
                                    absolute inset-1 rounded-full bg-slate-950
                                    flex items-center justify-center text-xs font-bold text-purple-400
                                `}>
                                    {Math.round((currentSection / totalSections) * 100)}%
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                    ${isMobile ? 'px-3 pb-8' : isTablet ? 'px-4 pb-12' : 'px-6 pb-16'}
                    max-w-7xl mx-auto
                `}
            >
                {children}
            </motion.div>
        </div>
    );
};

/**
 * MobileSectionContainer - Conteneur pour une section d'un formulaire
 */
export const MobileSectionContainer = ({
    children,
    gap = 3,
}) => {
    const { isMobile } = useResponsiveLayout();

    return (
        <div className={`
            flex flex-col gap-${gap}
            ${isMobile ? 'max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500' : ''}
        `}>
            {children}
        </div>
    );
};

/**
 * MobileFormRow - Ligne de formulaire responsive
 */
export const MobileFormRow = ({
    children,
    columns = 2,
}) => {
    const { isMobile, isTablet } = useResponsiveLayout();

    // Détermine le nombre de colonnes
    let gridCols = 'grid-cols-1';
    if (!isMobile && columns === 2) gridCols = 'grid-cols-2';
    if (!isMobile && !isTablet && columns === 3) gridCols = 'grid-cols-3';
    if (!isMobile && !isTablet && columns >= 4) gridCols = 'grid-cols-4';

    return (
        <div className={`grid ${gridCols} gap-3 md:gap-4 lg:gap-6`}>
            {children}
        </div>
    );
};

/**
 * CollapsibleMobileSection - Section collapsible optimisée mobile
 */
export const CollapsibleMobileSection = ({
    title,
    icon,
    children,
    defaultOpen = false,
    forceOpen = false,
}) => {
    const { isMobile } = useResponsiveLayout();
    const [isOpen, setIsOpen] = React.useState(isMobile ? defaultOpen : true);

    // Sur desktop/tablet, toujours ouvert
    const shouldBeOpen = forceOpen || !isMobile || isOpen;

    return (
        <motion.div
            className={`
                rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden
                ${isMobile ? 'p-3' : 'p-4'}
            `}
        >
            <button
                onClick={() => isMobile && setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 mb-3"
                disabled={!isMobile}
            >
                <div className="flex items-center gap-2 text-left flex-1">
                    {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                        {title}
                    </h3>
                </div>

                {isMobile && (
                    <motion.svg
                        animate={{ rotate: shouldBeOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-5 h-5 text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </motion.svg>
                )}
            </button>

            <motion.div
                initial={false}
                animate={{ opacity: shouldBeOpen ? 1 : 0, height: shouldBeOpen ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

/**
 * MobileFormGroup - Groupe de champs avec label
 */
export const MobileFormGroup = ({
    label,
    children,
    required = false,
    hint = null,
    error = null,
    className = '',
}) => {
    const { isMobile } = useResponsiveLayout();

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {children}

            {hint && (
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-slate-400`}>
                    💡 {hint}
                </p>
            )}

            {error && (
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-red-400`}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
};

/**
 * MobileActionBar - Barre d'actions collante au bas
 */
export const MobileActionBar = ({
    children,
    sticky = true,
}) => {
    return (
        <div className={`
            ${sticky ? 'fixed bottom-0 left-0 right-0 z-40' : ''}
            bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent
            border-t border-slate-800/50 backdrop-blur-sm p-4
            flex gap-3 justify-center sm:justify-end
            max-w-7xl mx-auto w-full
        `}>
            {children}
        </div>
    );
};

export default MobileReviewLayout;


