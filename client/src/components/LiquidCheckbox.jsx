import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

/**
 * LiquidCheckbox - Checkbox glassmorphique avec états checked/unchecked/indeterminate
 * @param {string} label - Label du checkbox
 * @param {boolean} checked - État coché
 * @param {boolean} indeterminate - État indéterminé (ni coché ni décoché)
 * @param {function} onChange - Callback de changement
 * @param {boolean} disabled - État désactivé
 * @param {string} description - Description optionnelle
 */
const LiquidCheckbox = forwardRef(({
    label,
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    description,
    className = '',
    ...props
}, ref) => {
    const handleChange = (e) => {
        if (disabled) return;
        onChange?.(e.target.checked);
    };

    return (
        <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Hidden native checkbox for accessibility */}
                <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    className="sr-only"
                    {...props}
                />

                {/* Custom checkbox visual */}
                <motion.div
                    className={`
            w-5 h-5 rounded-md
            liquid-glass
            border-2 transition-all duration-200
            flex items-center justify-center
            ${checked || indeterminate
                            ? 'border-primary-500 bg-primary-500/20'
                            : 'border-white/20 group-hover:border-white/40'
                        }
            ${!disabled && 'group-hover:scale-110'}
          `}
                    whileHover={!disabled ? { scale: 1.1 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                >
                    {/* Check icon animation */}
                    <motion.div
                        initial={false}
                        animate={{
                            scale: checked && !indeterminate ? 1 : 0,
                            opacity: checked && !indeterminate ? 1 : 0,
                        }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        <Check size={14} className="text-primary-400" strokeWidth={3} />
                    </motion.div>

                    {/* Indeterminate icon animation */}
                    <motion.div
                        initial={false}
                        animate={{
                            scale: indeterminate ? 1 : 0,
                            opacity: indeterminate ? 1 : 0,
                        }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute"
                    >
                        <Minus size={14} className="text-primary-400" strokeWidth={3} />
                    </motion.div>
                </motion.div>

                {/* Ripple effect on click */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 rounded-md"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileTap={{ scale: 2, opacity: 0.2 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
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

LiquidCheckbox.displayName = 'LiquidCheckbox';

export default LiquidCheckbox;

