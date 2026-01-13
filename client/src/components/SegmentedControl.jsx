import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

/**
 * SegmentedControl - Composant de sélection exclusive style iOS
 * Utilisé pour les choix mutuellement exclusifs (type génétique, tolérance, moment journée, etc.)
 */
export default function SegmentedControl({
    options = [],
    value,
    onChange,
    className = '',
    size = 'md',
    fullWidth = false,
    showEmoji = true,
    disabled = false
}) {
    const sizeClasses = {
        sm: 'text-sm py-2 px-3',
        md: 'text-base py-2.5 px-4',
        lg: 'text-lg py-3 px-5'
    }

    const handleSelect = (optionId) => {
        if (!disabled) {
            onChange?.(optionId)
        }
    }

    // Use grid layout when fullWidth to allow responsive columns on horizontal screens
    const containerClasses = fullWidth
        ? `grid gap-2 p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 w-full ${className} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
        : `inline-grid grid-flow-col auto-cols-max gap-1 p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 ${className}`

    return (
        <div className={containerClasses + (disabled ? ' opacity-50 cursor-not-allowed' : '')} role="radiogroup">
            {options.map((option, index) => {
                const isSelected = value === option.id

                return (
                    <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelect(option.id)}
                        disabled={disabled}
                        className={`relative flex items-center justify-center gap-2 ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} rounded-lg font-medium transition-all duration-300 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    >
                        {/* Background animé pour option sélectionnée */}
                        {isSelected && (
                            <motion.div
                                layoutId="segmented-background"
                                className="absolute inset-0 bg-gradient-to-br rounded-lg"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
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
                )
            })}
        </div>
    )
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
    disabled: PropTypes.bool
}
