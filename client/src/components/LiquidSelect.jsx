import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Select
 * Select avec effet glassmorphism Apple-like
 */

const LiquidSelect = React.forwardRef(({
    label,
    options = [],
    value,
    onChange,
    error,
    hint,
    placeholder = 'Sélectionnez une option',
    fullWidth = true,
    className = '',
    ...props
}, ref) => {
    const selectClasses = `
    liquid-glass w-full px-4 py-3 pr-10 rounded-xl
    text-[var(--text-primary)] 
    border border-[var(--border-primary)]
    focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
    transition-smooth outline-none appearance-none
    cursor-pointer
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${className}
  `;

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    className={selectClasses}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>{placeholder}</option>
                    )}
                    {options.map((option, index) => (
                        <option
                            key={option.value || index}
                            value={option.value}
                            className="bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom Arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                >
                    {error}
                </motion.p>
            )}

            {hint && !error && (
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">{hint}</p>
            )}
        </div>
    );
});

LiquidSelect.displayName = 'LiquidSelect';

export default LiquidSelect;

