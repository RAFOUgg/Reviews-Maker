/**
 * SegmentedControl - Composant de sélection exclusive style iOS
 * Utilisé pour les choix mutuellement exclusifs (type génétique, tolérance, moment journée, etc.)
 * Liquid Glass UI Design System
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function SegmentedControl({
    options = [],
    value,
    onChange,
    className = '',
    size = 'md',
    fullWidth = false,
    showEmoji = true,
    disabled = false,
    glowColor = 'violet'
}) {
    const sizeClasses = {
        sm: 'text-sm py-2 px-3',
        md: 'text-base py-2.5 px-4',
        lg: 'text-lg py-3 px-5'
    };

    const glowColors = {
        violet: 'from-violet-500/30 to-purple-500/30 border-violet-500/50',
        green: 'from-green-500/30 to-emerald-500/30 border-green-500/50',
        blue: 'from-blue-500/30 to-cyan-500/30 border-blue-500/50',
        amber: 'from-amber-500/30 to-orange-500/30 border-amber-500/50',
        rose: 'from-rose-500/30 to-pink-500/30 border-rose-500/50'
    };

    const handleSelect = (optionId) => {
        if (!disabled) {
            onChange?.(optionId);
        }
    };

    const containerClasses = fullWidth
        ? `grid gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-full ${className} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
        : `inline-grid grid-flow-col auto-cols-max gap-1 p-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 ${className}`;

    return (
        <div
            className={containerClasses + (disabled ? ' opacity-50 cursor-not-allowed' : '')}
            role="radiogroup"
        >
            {options.map((option) => {
                const isSelected = value === option.id;

                return (
                    <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelect(option.id)}
                        disabled={disabled}
                        className={`relative flex items-center justify-center gap-2 ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} rounded-lg font-medium transition-all duration-300 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        {/* Background animé pour option sélectionnée */}
                        {isSelected && (
                            <motion.div
                                layoutId="segmented-background"
                                className={`absolute inset-0 bg-gradient-to-br ${glowColors[glowColor]} rounded-lg border`}
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                                style={{
                                    boxShadow: `0 0 20px ${glowColor === 'violet' ? 'rgba(139, 92, 246, 0.3)' : glowColor === 'green' ? 'rgba(34, 197, 94, 0.3)' : glowColor === 'blue' ? 'rgba(59, 130, 246, 0.3)' : glowColor === 'amber' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                                }}
                            />
                        )}

                        {/* Contenu */}
                        <span className="relative z-10 flex items-center gap-2">
                            {showEmoji && option.emoji && (
                                <span className="text-lg">{option.emoji}</span>
                            )}
                            <span>{option.label}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

SegmentedControl.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            emoji: PropTypes.string
        })
    ).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    fullWidth: PropTypes.bool,
    showEmoji: PropTypes.bool,
    disabled: PropTypes.bool,
    glowColor: PropTypes.oneOf(['violet', 'green', 'blue', 'amber', 'rose'])
};


