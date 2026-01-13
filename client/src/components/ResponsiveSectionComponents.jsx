import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileFormSection } from '../hooks/useMobileFormSection';

/**
 * ResponsiveSection - Conteneur section adaptatif mobile
 * 
 * Features:
 * - Collapsible sur mobile pour réduire le scroll
 * - Grid adaptatif (1 col mobile, 2-3 desktop)
 * - Spacing serré sur mobile
 * - Header avec chevron
 */

export const ResponsiveSection = ({
    title,
    icon,
    children,
    defaultExpanded = true,
    className = '',
    noPadding = false,
}) => {
    const { isMobile, containerClasses, spacing } = useMobileFormSection(title, defaultExpanded);
    const [isExpanded, setIsExpanded] = React.useState(!isMobile || defaultExpanded);

    return (
        <div className={`${containerClasses.section} ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${containerClasses.header} w-full`}
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="text-lg">{icon}</span>}
                    <h3 className={containerClasses.title}>{title}</h3>
                </div>
                {isMobile && (
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown size={20} className="text-slate-400" />
                    </motion.div>
                )}
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={noPadding ? '' : spacing.mt || 'mt-3'}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * ResponsiveGrid - Grid adaptatif
 */
export const ResponsiveGrid = ({
    children,
    columns = 'auto',
    className = '',
}) => {
    const { gridClasses } = useMobileFormSection('grid');

    const gridClass = gridClasses[columns] || gridClasses.auto;

    return (
        <div className={`grid ${gridClass} ${className}`}>
            {children}
        </div>
    );
};

/**
 * ResponsiveFormField - Champ form adaptatif
 */
export const ResponsiveFormField = ({
    label,
    children,
    required = false,
    hint = null,
    className = '',
    error = null,
}) => {
    const { isMobile, spacing } = useMobileFormSection('field');

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white`}>
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {children}

            {hint && (
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-slate-400`}>
                    {hint}
                </p>
            )}

            {error && (
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-red-400`}>
                    {error}
                </p>
            )}
        </div>
    );
};

/**
 * ResponsiveInput - Input adaptatif
 */
export const ResponsiveInput = React.forwardRef((props, ref) => {
    const { isMobile, inputClasses } = useMobileFormSection('input');
    const { size = 'md', ...rest } = props;

    const baseClass = size === 'sm' 
        ? inputClasses.small 
        : inputClasses.base;

    return (
        <input
            ref={ref}
            className={baseClass}
            {...rest}
        />
    );
});

ResponsiveInput.displayName = 'ResponsiveInput';

/**
 * ResponsiveSelect - Select adaptatif
 */
export const ResponsiveSelect = React.forwardRef((props, ref) => {
    const { isMobile, inputClasses } = useMobileFormSection('select');

    return (
        <select
            ref={ref}
            className={inputClasses.base}
            {...props}
        />
    );
});

ResponsiveSelect.displayName = 'ResponsiveSelect';

/**
 * ResponsiveButton - Bouton adaptatif
 */
export const ResponsiveButton = ({
    children,
    size = 'md',
    variant = 'primary',
    className = '',
    ...props
}) => {
    const { isMobile, buttonClasses } = useMobileFormSection('button');

    const baseClass = buttonClasses[size] || buttonClasses.md;

    const variantClasses = {
        primary: 'bg-purple-600 hover:bg-purple-700 text-white',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
        danger: 'bg-red-600/20 hover:bg-red-600/40 text-red-400',
        success: 'bg-green-600/20 hover:bg-green-600/40 text-green-400',
    };

    return (
        <button
            className={`
                ${baseClass}
                ${variantClasses[variant]}
                rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * ResponsiveCard - Carte adaptatif avec contenu
 */
export const ResponsiveCard = ({
    children,
    className = '',
    hoverable = false,
}) => {
    const { isMobile } = useMobileFormSection('card');

    return (
        <div
            className={`
                p-3 rounded-lg border border-slate-700/50 bg-slate-800/40
                ${hoverable ? 'hover:bg-slate-800/60 cursor-pointer transition-colors' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

/**
 * ResponsiveSlider - Slider adaptatif avec labels
 */
export const ResponsiveSlider = ({
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    label = null,
    showValue = true,
    unit = '',
    className = '',
}) => {
    const { isMobile } = useMobileFormSection('slider');

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {(label || showValue) && (
                <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {label && <span className="text-slate-300">{label}</span>}
                    {showValue && <span className="text-purple-400 font-semibold">{value}{unit}</span>}
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`
                    w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-slate-700 to-slate-600
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-0
                `}
            />
        </div>
    );
};

export default ResponsiveSection;

