/**
 * Liquid Glass UI Components
 * 
 * A complete design system with Apple/iPhone 18 inspired glassmorphism
 * Import and use these components throughout the application
 * 
 * Usage:
 * import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidModal, ... } from '@/components/ui/LiquidUI'
 */

import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, X } from 'lucide-react'
import { createPortal } from 'react-dom'

// ============================================
// LIQUID CARD - with cursor tracking effect
// ============================================

export function LiquidCard({
    children,
    className = '',
    glow = 'purple', // purple | cyan | amber | green | pink | none
    animate = true,
    padding = 'md', // none | sm | md | lg
    onClick,
    as: Component = 'div',
    liquidEffect = true // enable/disable cursor tracking
}) {
    const cardRef = useRef(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const glowClass = glow !== 'none' ? `glow-${glow}` : ''
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    const handleMouseMove = (e) => {
        if (!cardRef.current || !liquidEffect) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
    }

    return (
        <motion.div
            ref={cardRef}
            as={Component}
            className={`liquid-card ${glowClass} ${paddingClasses[padding]} ${className}`}
            initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            whileHover={onClick ? { scale: 1.01 } : {}}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                '--mouse-x': `${mousePosition.x}%`,
                '--mouse-y': `${mousePosition.y}%`
            }}
        >
            {/* Liquid cursor-tracking effect */}
            {liquidEffect && (
                <div 
                    className="liquid-cursor-glow"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            rgba(139, 92, 246, 0.15), 
                            rgba(6, 182, 212, 0.08) 40%,
                            transparent 70%)`,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}
            {/* Liquid ripple highlight */}
            {liquidEffect && (
                <div 
                    className="liquid-highlight"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(300px circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            rgba(255, 255, 255, 0.12), 
                            transparent 60%)`,
                        transition: 'opacity 0.2s ease'
                    }}
                />
            )}
            <div className="liquid-card-shimmer" />
            <div className="liquid-card-content relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

// ============================================
// LIQUID BUTTON
// ============================================

export function LiquidButton({
    children,
    variant = 'default', // default | primary | success | danger | ghost | outline
    size = 'md', // sm | md | lg
    icon: Icon,
    iconPosition = 'left',
    className = '',
    disabled = false,
    loading = false,
    ...props
}) {
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs gap-1.5',
        md: 'px-5 py-3 text-sm gap-2',
        lg: 'px-7 py-4 text-base gap-2.5'
    }

    const iconSizes = { sm: 14, md: 16, lg: 20 }

    return (
        <motion.button
            className={`liquid-button ${variant} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            disabled={disabled || loading}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                ) : (
                    <>
                        {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
                        {children}
                        {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
                    </>
                )}
            </span>
        </motion.button>
    )
}

// ============================================
// LIQUID INPUT
// ============================================

export function LiquidInput({
    label,
    error,
    hint,
    icon: Icon,
    className = '',
    wrapperClassName = '',
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
            {label && (
                <label className="text-[13px] font-medium text-white/60 ml-1 block">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`liquid-input w-full ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
            {hint && !error && <p className="text-white/40 text-xs ml-1">{hint}</p>}
        </div>
    )
}

// ============================================
// LIQUID TEXTAREA
// ============================================

export function LiquidTextarea({
    label,
    error,
    hint,
    className = '',
    wrapperClassName = '',
    rows = 4,
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
            {label && (
                <label className="text-[13px] font-medium text-white/60 ml-1 block">
                    {label}
                </label>
            )}
            <textarea
                className={`liquid-input w-full resize-none ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
                rows={rows}
                {...props}
            />
            {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
            {hint && !error && <p className="text-white/40 text-xs ml-1">{hint}</p>}
        </div>
    )
}

// ============================================
// LIQUID SELECT (Custom Dropdown)
// ============================================

export function LiquidSelect({
    label,
    options = [], // [{ value, label, icon?, disabled? }]
    value,
    onChange,
    placeholder = 'Sélectionner...',
    error,
    disabled = false,
    searchable = false,
    className = '',
    wrapperClassName = ''
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef(null)
    const inputRef = useRef(null)

    const selectedOption = options.find(opt => opt.value === value)

    const filteredOptions = searchable && search
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
        : options

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchable && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen, searchable])

    const handleSelect = (option) => {
        if (option.disabled) return
        onChange?.(option.value)
        setIsOpen(false)
        setSearch('')
    }

    return (
        <div className={`liquid-input-wrapper ${wrapperClassName}`} ref={containerRef}>
            {label && <label className="liquid-input-label">{label}</label>}

            {/* Trigger */}
            <button
                type="button"
                className={`liquid-select-trigger ${isOpen ? 'open' : ''} ${error ? 'border-red-500/50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className={selectedOption ? 'text-white' : 'text-white/40'}>
                    {selectedOption?.label || placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={18} className="text-white/50" />
                </motion.div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="liquid-select-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* Search input */}
                        {searchable && (
                            <div className="p-2 border-b border-white/10">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="liquid-select-search"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Options */}
                        <div className="liquid-select-options">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-white/40 text-sm text-center">
                                    Aucun résultat
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`liquid-select-option ${option.value === value ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {option.icon && <span className="mr-2">{option.icon}</span>}
                                        <span className="flex-1 text-left">{option.label}</span>
                                        {option.value === value && (
                                            <Check size={16} className="text-violet-400" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>
    )
}

// ============================================
// LIQUID CHIP
// ============================================

export function LiquidChip({
    children,
    active = false,
    color = 'purple', // purple | green | cyan | amber | pink
    icon: Icon,
    onRemove,
    onClick,
    size = 'md' // sm | md | lg
}) {
    const sizeClasses = {
        sm: 'px-2.5 py-1 text-xs gap-1',
        md: 'px-3.5 py-1.5 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2'
    }
    const iconSizes = { sm: 12, md: 14, lg: 16 }

    return (
        <motion.button
            type="button"
            className={`liquid-chip ${sizeClasses[size]} ${active ? `active ${color}` : ''}`}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {Icon && <Icon size={iconSizes[size]} />}
            <span>{children}</span>
            {onRemove && (
                <button
                    type="button"
                    className="ml-1 hover:bg-white/10 rounded-full p-0.5"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                >
                    <X size={iconSizes[size] - 2} />
                </button>
            )}
        </motion.button>
    )
}

// ============================================
// LIQUID TOGGLE
// ============================================

export function LiquidToggle({
    checked,
    onChange,
    label,
    disabled = false,
    size = 'md' // sm | md | lg
}) {
    const sizes = {
        sm: { width: 40, height: 24, knob: 18 },
        md: { width: 52, height: 30, knob: 24 },
        lg: { width: 64, height: 36, knob: 30 }
    }
    const s = sizes[size]

    return (
        <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <motion.button
                type="button"
                className={`liquid-toggle ${checked ? 'active' : ''}`}
                style={{ width: s.width, height: s.height }}
                onClick={() => !disabled && onChange?.(!checked)}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                disabled={disabled}
            >
                <motion.div
                    className="liquid-toggle-knob"
                    style={{ width: s.knob, height: s.knob }}
                    animate={{ x: checked ? s.width - s.knob - 6 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </motion.button>
            {label && <span className="text-white/80 text-sm">{label}</span>}
        </label>
    )
}

// ============================================
// LIQUID RATING
// ============================================

export function LiquidRating({
    value,
    max = 10,
    label,
    color = 'purple', // purple | green | cyan | amber
    showValue = true,
    size = 'md' // sm | md | lg
}) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const heights = { sm: 6, md: 8, lg: 10 }

    return (
        <div className="liquid-rating">
            {(label || showValue) && (
                <div className="liquid-rating-header">
                    {label && <span className="liquid-rating-label">{label}</span>}
                    {showValue && <span className="liquid-rating-value">{value}/{max}</span>}
                </div>
            )}
            <div className="liquid-rating-track" style={{ height: heights[size] }}>
                <motion.div
                    className={`liquid-rating-fill ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                />
            </div>
        </div>
    )
}

// ============================================
// LIQUID DIVIDER
// ============================================

export function LiquidDivider({ className = '' }) {
    return <div className={`liquid-divider ${className}`} />
}

// ============================================
// LIQUID MODAL
// ============================================

const ModalContext = createContext(null)

export function LiquidModal({
    isOpen,
    onClose,
    children,
    size = 'md', // sm | md | lg | xl | full
    closeOnOverlay = true,
    closeOnEsc = true,
    showCloseButton = true
}) {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-4xl'
    }

    // Handle ESC key
    useEffect(() => {
        if (!closeOnEsc) return
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onClose?.()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose, closeOnEsc])

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (typeof window === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <ModalContext.Provider value={{ onClose }}>
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="liquid-modal-overlay absolute inset-0"
                            onClick={() => closeOnOverlay && onClose?.()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Modal content */}
                        <motion.div
                            className={`relative w-full ${sizeClasses[size]}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="liquid-card glow-purple p-0 overflow-hidden">
                                <div className="liquid-card-shimmer" />
                                <div className="liquid-card-content relative z-10">
                                    {showCloseButton && (
                                        <button
                                            type="button"
                                            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                            onClick={onClose}
                                        >
                                            <X size={18} className="text-white/60" />
                                        </button>
                                    )}
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </ModalContext.Provider>
            )}
        </AnimatePresence>,
        document.body
    )
}

// Modal sub-components
LiquidModal.Header = function ModalHeader({ children, className = '' }) {
    return (
        <div className={`px-6 pt-6 pb-4 ${className}`}>
            {children}
        </div>
    )
}

LiquidModal.Title = function ModalTitle({ children, icon: Icon, className = '' }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {Icon && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Icon size={24} className="text-white" />
                </div>
            )}
            <div>
                {typeof children === 'string' ? (
                    <h2 className="text-xl font-semibold text-white">{children}</h2>
                ) : children}
            </div>
        </div>
    )
}

LiquidModal.Body = function ModalBody({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    )
}

LiquidModal.Footer = function ModalFooter({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-t border-white/10 flex justify-end gap-3 ${className}`}>
            {children}
        </div>
    )
}

// ============================================
// LIQUID TOOLTIP
// ============================================

export function LiquidTooltip({
    children,
    content,
    position = 'top' // top | bottom | left | right
}) {
    const [show, setShow] = useState(false)

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    }

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        className={`absolute ${positions[position]} z-50 px-3 py-2 text-sm text-white bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl whitespace-nowrap`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ============================================
// LIQUID BADGE
// ============================================

export function LiquidBadge({
    children,
    variant = 'default', // default | success | warning | danger | info
    size = 'md' // sm | md | lg
}) {
    const variants = {
        default: 'bg-white/10 text-white/80',
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
        info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    }

    return (
        <span className={`inline-flex items-center rounded-full border border-white/10 font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    )
}

// ============================================
// LIQUID TABS
// ============================================

export function LiquidTabs({
    tabs, // [{ id, label, icon?, disabled? }]
    activeTab,
    onChange,
    variant = 'default' // default | pills | underline
}) {
    return (
        <div className={`liquid-tabs ${variant}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    className={`liquid-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                    onClick={() => !tab.disabled && onChange?.(tab.id)}
                    disabled={tab.disabled}
                >
                    {tab.icon && <tab.icon size={16} />}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    )
}

// ============================================
// LIQUID SKELETON
// ============================================

export function LiquidSkeleton({
    width,
    height = 20,
    rounded = 'md', // sm | md | lg | full
    className = ''
}) {
    const roundedClasses = {
        sm: 'rounded',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full'
    }

    return (
        <div
            className={`liquid-skeleton ${roundedClasses[rounded]} ${className}`}
            style={{ width, height }}
        />
    )
}

// ============================================
// LIQUID AVATAR
// ============================================

export function LiquidAvatar({
    src,
    alt = '',
    fallback,
    size = 'md', // sm | md | lg | xl
    className = ''
}) {
    const [error, setError] = useState(false)

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    }

    return (
        <div className={`relative ${sizes[size]} rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10 ${className}`}>
            {src && !error ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <span className="font-medium text-white/60">
                    {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
                </span>
            )}
        </div>
    )
}

// ============================================
// EXPORT ALL
// ============================================

export default {
    LiquidCard,
    LiquidButton,
    LiquidInput,
    LiquidTextarea,
    LiquidSelect,
    LiquidChip,
    LiquidToggle,
    LiquidRating,
    LiquidDivider,
    LiquidModal,
    LiquidTooltip,
    LiquidBadge,
    LiquidTabs,
    LiquidSkeleton,
    LiquidAvatar
}
