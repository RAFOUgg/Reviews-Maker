/**
 * Liquid Preview - Apple/iPhone 18 Liquid Glass Design System
 * 
 * This page is a design sandbox to create and test the perfect UI
 * before applying it to the entire application.
 * 
 * Features:
 * - True liquid glass effects with refraction and sheen
 * - Glassmorphism with visible blur and reflections
 * - Animated glowing borders
 * - Water droplet-style cards
 * - Apple-like smooth animations
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Leaf,
    Flame,
    Droplets,
    Search,
    Plus,
    Check,
    X,
    Star,
    Settings,
    Download,
    Eye,
    Moon,
    Sun,
    ChevronDown,
    Palette,
    Zap,
    Heart,
    Coffee
} from 'lucide-react'

// Import the Apple Liquid Glass CSS
import '../../assets/apple-liquid-glass.css'

// ============================================
// LIQUID GLASS COMPONENTS
// ============================================

/**
 * LiquidCard - A glass card with liquid water droplet effect
 */
function LiquidCard({
    children,
    className = '',
    glow = 'purple', // purple | cyan | amber | green | pink | none
    animate = true,
    onClick
}) {
    const glowClass = glow !== 'none' ? `glow-${glow}` : ''

    return (
        <motion.div
            className={`liquid-card ${glowClass} ${animate ? 'liquid-card-animate' : ''} ${className}`}
            initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            onClick={onClick}
        >
            {/* Shimmer effect on hover */}
            <div className="liquid-card-shimmer" />

            {/* Card content */}
            <div className="liquid-card-content relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

/**
 * LiquidButton - A glass button with liquid effect
 */
function LiquidButton({
    children,
    variant = 'default', // default | primary | success | danger | ghost
    size = 'md', // sm | md | lg
    icon: Icon,
    className = '',
    ...props
}) {
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-5 py-3 text-sm',
        lg: 'px-7 py-4 text-base'
    }

    return (
        <motion.button
            className={`liquid-button ${variant} ${sizeClasses[size]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
                {children}
            </span>
        </motion.button>
    )
}

/**
 * LiquidInput - A glass input field
 */
function LiquidInput({ label, className = '', ...props }) {
    return (
        <div className={`liquid-input-wrapper ${className}`}>
            {label && <label className="liquid-input-label">{label}</label>}
            <input className="liquid-input" {...props} />
        </div>
    )
}

/**
 * LiquidSelect - A glass select dropdown
 */
function LiquidSelect({ label, options, className = '', ...props }) {
    return (
        <div className={`liquid-input-wrapper ${className}`}>
            {label && <label className="liquid-input-label">{label}</label>}
            <select className="liquid-input liquid-select" {...props}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}

/**
 * LiquidChip - A glass chip/tag
 */
function LiquidChip({
    children,
    active = false,
    color = 'purple', // purple | green | cyan | amber
    icon: Icon,
    onClick
}) {
    return (
        <motion.button
            className={`liquid-chip ${active ? `active ${color}` : ''}`}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {Icon && <Icon size={14} />}
            {children}
        </motion.button>
    )
}

/**
 * LiquidToggle - A glass toggle switch
 */
function LiquidToggle({ checked, onChange }) {
    return (
        <motion.button
            className={`liquid-toggle ${checked ? 'active' : ''}`}
            onClick={() => onChange?.(!checked)}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="liquid-toggle-knob"
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </motion.button>
    )
}

/**
 * LiquidRating - A glass rating bar
 */
function LiquidRating({ value, max = 10, label, color = 'purple' }) {
    const percentage = (value / max) * 100

    return (
        <div className="liquid-rating">
            <div className="liquid-rating-header">
                <span className="liquid-rating-label">{label}</span>
                <span className="liquid-rating-value">{value}/{max}</span>
            </div>
            <div className="liquid-rating-track">
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

/**
 * LiquidDivider - A glass divider line
 */
function LiquidDivider() {
    return <div className="liquid-divider my-6" />
}

// ============================================
// MAIN PREVIEW PAGE
// ============================================

export default function LiquidPreview() {
    const [productName, setProductName] = useState('')
    const [productType, setProductType] = useState('flower')
    const [darkMode, setDarkMode] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAromas, setSelectedAromas] = useState(['Agrumes', 'Pin'])
    const [selectedEffects, setSelectedEffects] = useState(['Relaxant'])

    const toggleAroma = (aroma) => {
        setSelectedAromas(prev =>
            prev.includes(aroma)
                ? prev.filter(a => a !== aroma)
                : [...prev, aroma]
        )
    }

    const toggleEffect = (effect) => {
        setSelectedEffects(prev =>
            prev.includes(effect)
                ? prev.filter(e => e !== effect)
                : [...prev, effect]
        )
    }

    return (
        <div className="min-h-screen bg-[#050508] text-white relative overflow-x-hidden liquid-scrollbar">

            {/* === ANIMATED BACKGROUND === */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Large ambient blobs */}
                <div
                    className="liquid-blob purple"
                    style={{
                        width: '60vw',
                        height: '60vw',
                        top: '-20%',
                        left: '-15%'
                    }}
                />
                <div
                    className="liquid-blob cyan"
                    style={{
                        width: '50vw',
                        height: '50vw',
                        bottom: '-25%',
                        right: '-15%'
                    }}
                />
                <div
                    className="liquid-blob pink"
                    style={{
                        width: '35vw',
                        height: '35vw',
                        top: '50%',
                        left: '40%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* === MAIN CONTENT === */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

                {/* === HEADER === */}
                <motion.header
                    className="flex items-center justify-between mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-5">
                        {/* Logo */}
                        <motion.div
                            className="relative w-14 h-14"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 blur-lg opacity-60" />
                            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl">
                                <Sparkles size={26} className="text-white" />
                            </div>
                        </motion.div>

                        <div>
                            <h1 className="text-3xl font-bold liquid-text-gradient">
                                Liquid Glass UI
                            </h1>
                            <p className="liquid-text-muted text-sm mt-0.5">
                                Apple Design System • iPhone 18 Style
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-2">
                            <Sun size={16} className="liquid-text-muted" />
                            <LiquidToggle checked={darkMode} onChange={setDarkMode} />
                            <Moon size={16} className={darkMode ? 'text-violet-400' : 'liquid-text-muted'} />
                        </div>
                        <LiquidButton variant="default" icon={Search}>
                            Rechercher
                        </LiquidButton>
                        <LiquidButton variant="primary" icon={Plus}>
                            Créer
                        </LiquidButton>
                    </div>
                </motion.header>

                {/* === MAIN GRID === */}
                <div className="grid grid-cols-12 gap-6">

                    {/* === LEFT COLUMN - Main Form === */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Form Card */}
                        <LiquidCard glow="purple" className="p-8">
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-semibold liquid-text-gradient">
                                            Nouvelle Review
                                        </h2>
                                        <p className="liquid-text-muted mt-2">
                                            Créez votre fiche technique avec le style Liquid Glass
                                        </p>
                                    </div>

                                    {/* Type chips */}
                                    <div className="flex gap-2">
                                        <LiquidChip
                                            icon={Leaf}
                                            active={productType === 'flower'}
                                            color="green"
                                            onClick={() => setProductType('flower')}
                                        >
                                            Fleur
                                        </LiquidChip>
                                        <LiquidChip
                                            icon={Flame}
                                            active={productType === 'hash'}
                                            color="amber"
                                            onClick={() => setProductType('hash')}
                                        >
                                            Hash
                                        </LiquidChip>
                                        <LiquidChip
                                            icon={Droplets}
                                            active={productType === 'concentrate'}
                                            color="cyan"
                                            onClick={() => setProductType('concentrate')}
                                        >
                                            Concentré
                                        </LiquidChip>
                                    </div>
                                </div>

                                <LiquidDivider />

                                {/* Form inputs */}
                                <div className="grid grid-cols-2 gap-6">
                                    <LiquidInput
                                        label="Nom du produit"
                                        placeholder="Ex: Purple Haze"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                    <LiquidSelect
                                        label="Type"
                                        options={[
                                            { value: 'flower', label: '🌿 Fleur' },
                                            { value: 'hash', label: '🟤 Hash' },
                                            { value: 'concentrate', label: '💧 Concentré' },
                                            { value: 'edible', label: '🍪 Comestible' }
                                        ]}
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value)}
                                    />
                                    <LiquidInput
                                        label="Farm / Producteur"
                                        placeholder="Ex: Cookies Fam"
                                    />
                                    <LiquidInput
                                        label="Cultivar(s)"
                                        placeholder="Ex: GSC x Purple Punch"
                                    />
                                </div>

                                {/* Ratings */}
                                <div className="grid grid-cols-2 gap-6">
                                    <LiquidRating value={8} max={10} label="Note Visuelle" color="purple" />
                                    <LiquidRating value={7} max={10} label="Densité" color="cyan" />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <LiquidButton
                                        variant="primary"
                                        size="lg"
                                        icon={Check}
                                        onClick={() => setModalOpen(true)}
                                    >
                                        Enregistrer
                                    </LiquidButton>
                                    <LiquidButton variant="ghost" size="lg">
                                        Annuler
                                    </LiquidButton>
                                </div>
                            </div>
                        </LiquidCard>

                        {/* Feature Cards Row */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Aromas Card */}
                            <LiquidCard glow="green" className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <Leaf size={18} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Arômes</h3>
                                        <p className="text-xs liquid-text-muted">Notes dominantes</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Agrumes', 'Pin', 'Épicé', 'Sucré', 'Terreux'].map(aroma => (
                                        <LiquidChip
                                            key={aroma}
                                            active={selectedAromas.includes(aroma)}
                                            color="green"
                                            onClick={() => toggleAroma(aroma)}
                                        >
                                            {aroma}
                                        </LiquidChip>
                                    ))}
                                </div>
                            </LiquidCard>

                            {/* Effects Card */}
                            <LiquidCard glow="purple" className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                        <Zap size={18} className="text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Effets</h3>
                                        <p className="text-xs liquid-text-muted">Ressentis</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Relaxant', 'Créatif', 'Euphorique', 'Focus'].map(effect => (
                                        <LiquidChip
                                            key={effect}
                                            active={selectedEffects.includes(effect)}
                                            color="purple"
                                            onClick={() => toggleEffect(effect)}
                                        >
                                            {effect}
                                        </LiquidChip>
                                    ))}
                                </div>
                            </LiquidCard>

                            {/* Pipeline Card */}
                            <LiquidCard glow="cyan" className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                        <Droplets size={18} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Pipeline</h3>
                                        <p className="text-xs liquid-text-muted">Traçabilité</p>
                                    </div>
                                </div>
                                <LiquidRating value={67} max={90} label="Progression" color="cyan" />
                                <p className="text-xs liquid-text-muted mt-3">Jour 67 / 90 de curing</p>
                            </LiquidCard>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN - Sidebar === */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* Quick Actions */}
                        <LiquidCard glow="cyan" className="p-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-3 mb-5">
                                <Settings size={18} className="text-cyan-400" />
                                Actions rapides
                            </h3>
                            <div className="space-y-3">
                                <LiquidButton variant="default" icon={Eye} className="w-full justify-start">
                                    Aperçu
                                </LiquidButton>
                                <LiquidButton variant="default" icon={Download} className="w-full justify-start">
                                    Exporter
                                </LiquidButton>
                                <LiquidButton variant="default" icon={Palette} className="w-full justify-start">
                                    Personnaliser
                                </LiquidButton>
                                <LiquidButton variant="danger" icon={X} className="w-full justify-start">
                                    Supprimer
                                </LiquidButton>
                            </div>
                        </LiquidCard>

                        {/* Ratings Overview */}
                        <LiquidCard glow="amber" className="p-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-3 mb-5">
                                <Star size={18} className="text-amber-400" />
                                Évaluations
                            </h3>
                            <div className="space-y-4">
                                <LiquidRating value={8} max={10} label="Visuel" color="purple" />
                                <LiquidRating value={9} max={10} label="Odeur" color="green" />
                                <LiquidRating value={7} max={10} label="Goût" color="amber" />
                                <LiquidRating value={8} max={10} label="Effet" color="cyan" />
                            </div>
                        </LiquidCard>

                        {/* Stats Card */}
                        <LiquidCard glow="pink" className="p-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-3 mb-5">
                                <Heart size={18} className="text-pink-400" />
                                Statistiques
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <p className="text-3xl font-bold text-white">42</p>
                                    <p className="text-xs liquid-text-muted mt-1">Reviews</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <p className="text-3xl font-bold text-white">8.4</p>
                                    <p className="text-xs liquid-text-muted mt-1">Moyenne</p>
                                </div>
                            </div>
                        </LiquidCard>
                    </div>
                </div>

                {/* === COMPONENT SHOWCASE === */}
                <motion.section
                    className="mt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-semibold liquid-text-gradient mb-8">
                        Composants du Design System
                    </h2>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Buttons showcase */}
                        <LiquidCard glow="none" className="col-span-12 md:col-span-6 p-6">
                            <h4 className="text-white font-semibold mb-4">Boutons</h4>
                            <div className="flex flex-wrap gap-3">
                                <LiquidButton>Default</LiquidButton>
                                <LiquidButton variant="primary">Primary</LiquidButton>
                                <LiquidButton variant="success">Success</LiquidButton>
                                <LiquidButton variant="danger">Danger</LiquidButton>
                                <LiquidButton variant="ghost">Ghost</LiquidButton>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <LiquidButton size="sm" icon={Coffee}>Small</LiquidButton>
                                <LiquidButton size="md" icon={Coffee}>Medium</LiquidButton>
                                <LiquidButton size="lg" icon={Coffee}>Large</LiquidButton>
                            </div>
                        </LiquidCard>

                        {/* Chips showcase */}
                        <LiquidCard glow="none" className="col-span-12 md:col-span-6 p-6">
                            <h4 className="text-white font-semibold mb-4">Chips / Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                <LiquidChip>Inactive</LiquidChip>
                                <LiquidChip active color="purple">Purple</LiquidChip>
                                <LiquidChip active color="green">Green</LiquidChip>
                                <LiquidChip active color="cyan">Cyan</LiquidChip>
                                <LiquidChip active color="amber">Amber</LiquidChip>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <LiquidChip icon={Leaf} active color="green">Avec icône</LiquidChip>
                                <LiquidChip icon={Flame} active color="amber">Hash</LiquidChip>
                                <LiquidChip icon={Droplets} active color="cyan">Concentré</LiquidChip>
                            </div>
                        </LiquidCard>

                        {/* Inputs showcase */}
                        <LiquidCard glow="none" className="col-span-12 md:col-span-6 p-6">
                            <h4 className="text-white font-semibold mb-4">Inputs</h4>
                            <div className="space-y-4">
                                <LiquidInput label="Avec label" placeholder="Entrez du texte..." />
                                <LiquidInput placeholder="Sans label" />
                                <LiquidSelect
                                    label="Select"
                                    options={[
                                        { value: '1', label: 'Option 1' },
                                        { value: '2', label: 'Option 2' },
                                        { value: '3', label: 'Option 3' }
                                    ]}
                                />
                            </div>
                        </LiquidCard>

                        {/* Ratings showcase */}
                        <LiquidCard glow="none" className="col-span-12 md:col-span-6 p-6">
                            <h4 className="text-white font-semibold mb-4">Ratings</h4>
                            <div className="space-y-4">
                                <LiquidRating value={9} max={10} label="Purple" color="purple" />
                                <LiquidRating value={7} max={10} label="Green" color="green" />
                                <LiquidRating value={8} max={10} label="Cyan" color="cyan" />
                                <LiquidRating value={6} max={10} label="Amber" color="amber" />
                            </div>
                        </LiquidCard>
                    </div>
                </motion.section>
            </div>

            {/* === MODAL === */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="liquid-modal-overlay absolute inset-0"
                            onClick={() => setModalOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Modal content */}
                        <motion.div
                            className="relative w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <LiquidCard glow="purple" animate={false} className="p-8">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <Check size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">
                                                Confirmer l'enregistrement
                                            </h2>
                                            <p className="liquid-text-muted text-sm">
                                                Review prête à être sauvegardée
                                            </p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="liquid-text-muted">Produit</span>
                                            <span className="text-white font-medium">
                                                {productName || 'Sans nom'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-3">
                                            <span className="liquid-text-muted">Type</span>
                                            <span className="text-white font-medium">
                                                {productType === 'flower' ? 'Fleur' :
                                                    productType === 'hash' ? 'Hash' :
                                                        productType === 'concentrate' ? 'Concentré' : 'Comestible'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-3">
                                            <span className="liquid-text-muted">Arômes</span>
                                            <span className="text-white font-medium">
                                                {selectedAromas.length} sélectionnés
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 justify-end pt-2">
                                        <LiquidButton
                                            variant="ghost"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Annuler
                                        </LiquidButton>
                                        <LiquidButton
                                            variant="success"
                                            icon={Check}
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Confirmer
                                        </LiquidButton>
                                    </div>
                                </div>
                            </LiquidCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
