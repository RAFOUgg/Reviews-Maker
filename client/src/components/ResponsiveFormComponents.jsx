import React from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * MobileResponsiveWrapper - Conteneur responsive pour sections de formulaire
 * 
 * Applique automatiquement:
 * - Stack vertical sur mobile
 * - Grilles sur tablette/desktop
 * - Espacements adaptatifs
 * - Overflow scroll sur mobile si nécessaire
 */

export const ResponsiveFormSection = ({
    children,
    title,
    subtitle,
    className = '',
    columns = 'auto',
    spacing = 'all'
}) => {
    const layout = useResponsiveLayout();

    // Colonne mapping
    const columnClasses = {
        auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        auto2: 'grid-cols-1 md:grid-cols-2',
        full: 'grid-cols-1',
        double: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        triple: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    };

    const gapClasses = {
        compact: 'gap-2 md:gap-3 lg:gap-4',
        normal: 'gap-3 md:gap-4 lg:gap-6',
        loose: 'gap-4 md:gap-6 lg:gap-8',
    };

    const spacingValue = spacing.all || spacing;

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            {(title || subtitle) && (
                <div className="mb-4 md:mb-6">
                    {title && (
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Grille responsif */}
            <div className={`grid ${columnClasses[columns]} ${gapClasses[spacingValue]}`}>
                {children}
            </div>
        </div>
    );
};

/**
 * ResponsiveFormField - Wrapper champ individuel
 * 
 * Gère automatiquement:
 * - Label above input (mobile)
 * - Validation messages visibles
 * - Touch-friendly sizing
 */

export const ResponsiveFormField = ({
    label,
    required = false,
    error = null,
    hint = null,
    children,
    className = '',
    fullWidth = true,
}) => {
    return (
        <div className={`flex flex-col w-${fullWidth ? 'full' : 'auto'} ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Hint sous label */}
            {hint && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 -mt-1">
                    {hint}
                </p>
            )}

            {/* Input/Contenu */}
            <div className="flex-1">
                {children}
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-xs text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}
        </div>
    );
};

/**
 * MobileResponsiveModal - Modal responsive pour mobile
 * 
 * Caractéristiques:
 * - Fullscreen sur mobile (< 640px)
 * - Modal normal sur desktop
 * - Bottom sheet animation sur mobile
 * - Scroll interne avec safe area padding
 */

export const MobileResponsiveModal = ({
    isOpen = false,
    onClose,
    title,
    children,
    actions = null,
    maxWidth = 'max-w-2xl',
    closeOnBackdrop = true,
}) => {
    const layout = useResponsiveLayout();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeOnBackdrop ? onClose : undefined}
            />

            {/* Modal Container */}
            <div
                className={`relative w-full md:w-auto md:${maxWidth} bg-white dark:bg-gray-900 
                    ${layout.isMobile
                        ? 'rounded-t-2xl max-h-[90vh]'
                        : 'rounded-2xl max-h-[85vh]'
                    } 
                    shadow-2xl flex flex-col`}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
                    {children}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 md:px-6 py-4 flex gap-3 rounded-b-2xl">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponsiveFormSection;

