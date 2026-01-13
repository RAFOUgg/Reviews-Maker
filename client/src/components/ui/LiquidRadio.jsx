import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LiquidRadio - Radio button glassmorphique avec animation de sélection
 * @param {string} label - Label du radio
 * @param {string} value - Valeur du radio
 * @param {boolean} checked - État sélectionné
 * @param {function} onChange - Callback de changement
 * @param {boolean} disabled - État désactivé
 * @param {string} description - Description optionnelle
 */
const LiquidRadio = forwardRef(({
    label,
    value,
    checked = false,
    onChange,
    disabled = false,
    description,
    className = '',
    ...props
}, ref) => {
    const handleChange = (e) => {
        if (disabled) return;
        onChange?.(value);
    };

    return (
        <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Hidden native radio for accessibility */}
                <input
                    ref={ref}
                    type="radio"
                    value={value}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    className="sr-only"
                    {...props}
                />

                {/* Custom radio visual - outer circle */}
                <motion.div
                    className={`
            w-5 h-5 rounded-full
            liquid-glass
            border-2 transition-all duration-200
            flex items-center justify-center
            ${checked
                            ? 'border-primary-500 shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                            : 'border-white/20 group-hover:border-white/40'
                        }
          `}
                    whileHover={!disabled ? { scale: 1.1 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                >
                    {/* Inner dot with scale animation */}
                    <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600"
                        initial={false}
                        animate={{
                            scale: checked ? 1 : 0,
                            opacity: checked ? 1 : 0,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                    />
                </motion.div>

                {/* Ripple effect on click */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileTap={{ scale: 2.5, opacity: 0.2 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, transparent 70%)',
                        }}
                    />
                )}

                {/* Glow ring on checked */}
                {checked && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-400/30"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                )}
            </div>

            {/* Label and description */}
            {(label || description) && (
                <div className="flex-1 select-none">
                    {label && (
                        <span className="text-sm font-medium text-gray-200 block">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-gray-400 block mt-0.5">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
});

LiquidRadio.displayName = 'LiquidRadio';

export default LiquidRadio;


