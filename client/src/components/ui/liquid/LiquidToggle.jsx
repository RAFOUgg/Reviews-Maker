import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LiquidToggle - Switch/Toggle glassmorphique avec animation slide
 * @param {boolean} checked - État activé
 * @param {function} onChange - Callback de changement
 * @param {boolean} disabled - État désactivé
 * @param {string} label - Label du toggle
 * @param {string} description - Description optionnelle
 * @param {string} size - Taille (sm, md, lg)
 */
const LiquidToggle = forwardRef(({
    checked = false,
    onChange,
    disabled = false,
    label,
    description,
    size = 'md',
    className = '',
    ...props
}, ref) => {
    const handleChange = () => {
        if (disabled) return;
        onChange?.(!checked);
    };

    // Size configurations
    const sizes = {
        sm: {
            track: 'w-9 h-5',
            thumb: 'w-3.5 h-3.5',
            translateX: 16,
        },
        md: {
            track: 'w-11 h-6',
            thumb: 'w-4 h-4',
            translateX: 20,
        },
        lg: {
            track: 'w-14 h-7',
            thumb: 'w-5 h-5',
            translateX: 28,
        },
    };

    const sizeConfig = sizes[size];

    return (
        <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            {/* Hidden native checkbox for accessibility */}
            <input
                ref={ref}
                type="checkbox"
                role="switch"
                aria-checked={checked}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                className="sr-only"
                {...props}
            />

            {/* Toggle track */}
            <div className="relative flex items-center">
                <motion.div
                    className={`
            ${sizeConfig.track} rounded-full
            liquid-glass
            border transition-all duration-300
            ${checked
                            ? 'bg-gradient-to-r from-primary-500/30 to-primary-600/30 border-primary-500/50 shadow-[0_0_12px_rgba(147,51,234,0.3)]'
                            : 'bg-white/5 border-white/20 group-hover:border-white/30'
                        }
          `}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.98 } : {}}
                >
                    {/* Thumb (sliding circle) */}
                    <motion.div
                        className={`
              ${sizeConfig.thumb} rounded-full
              absolute top-1/2 -translate-y-1/2 left-1
              shadow-lg
            `}
                        style={{
                            background: checked
                                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                                : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                        }}
                        animate={{
                            x: checked ? sizeConfig.translateX : 0,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                    >
                        {/* Inner glow */}
                        <motion.div
                            className="absolute inset-0.5 rounded-full blur-sm"
                            style={{
                                background: checked
                                    ? 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'
                                    : 'transparent',
                            }}
                            animate={{
                                opacity: checked ? 0.8 : 0,
                            }}
                        />
                    </motion.div>

                    {/* Track glow effect when checked */}
                    {checked && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{
                                background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                            }}
                        />
                    )}
                </motion.div>

                {/* Ripple effect on click */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileTap={{ scale: 2, opacity: 0.2 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            background: checked
                                ? 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(148, 163, 184, 0.4) 0%, transparent 70%)',
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

LiquidToggle.displayName = 'LiquidToggle';

export default LiquidToggle;
