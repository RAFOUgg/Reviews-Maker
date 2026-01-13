import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Multi-Select
 * Multi-select avec chips et effet glassmorphism
 */

const LiquidMultiSelect = ({
    label,
    options = [],
    value = [],
    onChange,
    maxSelections,
    placeholder = 'Sélectionnez...',
    error,
    hint,
    showCount = true,
    className = '',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleOption = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            if (maxSelections && value.length >= maxSelections) {
                return; // Max selections reached
            }
            onChange([...value, optionValue]);
        }
    };

    const handleRemoveChip = (optionValue, e) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                        {label}
                    </label>
                    {showCount && maxSelections && (
                        <span className="text-xs text-[var(--text-tertiary)]">
                            {value.length}/{maxSelections}
                        </span>
                    )}
                </div>
            )}

            {/* Selected chips */}
            <AnimatePresence mode="popLayout">
                {selectedOptions.length > 0 && (
                    <motion.div
                        className="flex flex-wrap gap-2 mb-2"
                        layout
                    >
                        {selectedOptions.map((option) => (
                            <motion.span
                                key={option.value}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="liquid-glass px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer hover:scale-105 transition-smooth"
                                onClick={(e) => handleRemoveChip(option.value, e)}
                            >
                                <span>{option.emoji} {option.label}</span>
                                <button
                                    type="button"
                                    className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </motion.span>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dropdown trigger */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            liquid-glass w-full px-4 py-3 rounded-xl text-left
            flex items-center justify-between
            border border-[var(--border-primary)]
            focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
            transition-smooth outline-none
            ${error ? 'border-red-500' : ''}
          `}
                >
                    <span className={value.length === 0 ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}>
                        {value.length === 0 ? placeholder : `${value.length} sélectionné${value.length > 1 ? 's' : ''}`}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </motion.div>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 liquid-glass rounded-xl border border-[var(--border-primary)] max-h-60 overflow-y-auto shadow-glass-lg"
                        >
                            {options.map((option) => {
                                const isSelected = value.includes(option.value);
                                const isDisabled = !isSelected && maxSelections && value.length >= maxSelections;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => !isDisabled && handleToggleOption(option.value)}
                                        disabled={isDisabled}
                                        className={`
                      w-full px-4 py-3 text-left flex items-center justify-between
                      hover:bg-white/10 dark:hover:bg-black/10 transition-colors
                      ${isSelected ? 'bg-[var(--accent-primary)]/10' : ''}
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                                    >
                                        <span className="flex items-center gap-2">
                                            {option.emoji && <span className="text-xl">{option.emoji}</span>}
                                            <span className="font-medium">{option.label}</span>
                                        </span>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-[var(--accent-primary)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
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
};

export default LiquidMultiSelect;
