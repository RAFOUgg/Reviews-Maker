import React from 'react';
import { motion } from 'framer-motion';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Badge
 * Badge/Tag avec glassmorphism pour statuts, catégories, etc.
 */

const LiquidBadge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    removable = false,
    onRemove,
    className = '',
    ...props
}) => {
    const variants = {
        default: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 dark:text-gray-300',
        primary: 'bg-gradient-to-r /20 /20  dark:',
        success: 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-700 dark:text-green-300',
        warning: 'bg-gradient-to-r from-orange-500/20 to-amber-600/20 text-orange-700 dark:text-orange-300',
        error: 'bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-700 dark:text-red-300',
        info: 'bg-gradient-to-r /20 /20  dark:',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    const dotColors = {
        default: 'bg-gray-500',
        primary: '',
        success: 'bg-green-500',
        warning: 'bg-orange-500',
        error: 'bg-red-500',
        info: '',
    };

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`liquid-glass inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {dot && (
                <span className={`w-2 h-2 rounded-full ${dotColors[variant]} animate-pulse`} />
            )}
            <span>{children}</span>
            {removable && onRemove && (
                <button
                    onClick={onRemove}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </motion.span>
    );
};

export default LiquidBadge;
