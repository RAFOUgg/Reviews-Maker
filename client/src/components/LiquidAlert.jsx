import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Toast/Alert
 * Système de notifications avec glassmorphism
 */

const iconMap = {
    success: Check,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
};

const colorMap = {
    success: 'from-green-500 to-emerald-600',
    info: ' ',
    warning: 'from-orange-500 to-amber-600',
    error: 'from-red-500 to-rose-600',
};

const LiquidAlert = ({
    type = 'info',
    title,
    message,
    onClose,
    closable = true,
    action,
    className = '',
    ...props
}) => {
    const Icon = iconMap[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`liquid-glass rounded-2xl p-4 border border-[var(--border-primary)] shadow-glass-lg ${className}`}
            {...props}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[type]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                            {title}
                        </h4>
                    )}
                    {message && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            {message}
                        </p>
                    )}
                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>

                {/* Close button */}
                {closable && onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default LiquidAlert;

