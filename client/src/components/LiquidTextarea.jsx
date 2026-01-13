import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiquidTextarea - Textarea glassmorphique avec auto-resize et compteur de caractères
 * @param {string} label - Label du textarea
 * @param {string} placeholder - Texte placeholder
 * @param {string} error - Message d'erreur
 * @param {string} hint - Texte d'aide
 * @param {number} maxLength - Nombre max de caractères
 * @param {boolean} autoResize - Active le redimensionnement automatique
 * @param {number} minRows - Nombre minimum de lignes
 * @param {boolean} showCount - Afficher le compteur de caractères
 */
const LiquidTextarea = forwardRef(({
    label,
    placeholder,
    error,
    hint,
    maxLength = 500,
    autoResize = true,
    minRows = 3,
    showCount = true,
    value = '',
    onChange,
    className = '',
    ...props
}, ref) => {
    const [charCount, setCharCount] = useState(value?.length || 0);
    const textareaRef = useRef(null);
    const innerRef = ref || textareaRef;

    // Auto-resize functionality
    useEffect(() => {
        if (autoResize && innerRef.current) {
            const textarea = innerRef.current;
            // Reset height to recalculate
            textarea.style.height = 'auto';
            // Set new height based on scrollHeight
            const newHeight = Math.max(
                textarea.scrollHeight,
                minRows * 24 // Approximate line height
            );
            textarea.style.height = `${newHeight}px`;
        }
    }, [value, autoResize, minRows, innerRef]);

    const handleChange = (e) => {
        const newValue = e.target.value;

        // Check maxLength
        if (maxLength && newValue.length > maxLength) {
            return;
        }

        setCharCount(newValue.length);

        if (onChange) {
            onChange(e);
        }
    };

    // Calculate progress percentage for visual indicator
    const progressPercentage = maxLength ? (charCount / maxLength) * 100 : 0;

    // Color based on progress
    const getCountColor = () => {
        if (progressPercentage >= 90) return 'text-red-400';
        if (progressPercentage >= 75) return 'text-orange-400';
        return 'text-gray-400';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-200">
                    {label}
                    {props.required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {/* Textarea wrapper with glassmorphism */}
            <div className="relative">
                <textarea
                    ref={innerRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    rows={minRows}
                    className={`
            w-full px-4 py-3 rounded-lg
            liquid-glass
            border border-white/10
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
            transition-all duration-300
            resize-none
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${autoResize ? 'overflow-hidden' : 'overflow-auto'}
          `}
                    style={{
                        minHeight: `${minRows * 24}px`,
                    }}
                    {...props}
                />

                {/* Character count indicator */}
                {showCount && maxLength && (
                    <motion.div
                        className="absolute bottom-2 right-3 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Visual progress bar */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${progressPercentage >= 90 ? 'bg-red-400' :
                                        progressPercentage >= 75 ? 'bg-orange-400' :
                                            'bg-primary-400'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>

                        {/* Count text */}
                        <span className={`text-xs font-medium ${getCountColor()}`}>
                            {charCount}/{maxLength}
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-400 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Hint text */}
            {hint && !error && (
                <p className="text-sm text-gray-400">{hint}</p>
            )}
        </div>
    );
});

LiquidTextarea.displayName = 'LiquidTextarea';

export default LiquidTextarea;

