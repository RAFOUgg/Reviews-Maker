import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Settings, Download, Star, Sparkles, Leaf, Flame, Droplets, ChevronDown, X, Check, Moon, Sun } from 'lucide-react'

/* =============================================================================
   LIQUID GLASS DESIGN SYSTEM - iPhone 18 / Apple Style
   Reviews-Maker V2 Preview Page
============================================================================= */

// === LIQUID GLASS CARD COMPONENT ===
const GlassCard = ({ children, className = '', hover = true, glow = false, glowColor = 'purple', padding = 'md', onClick }) => {
    const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' }
    const glowColors = {
        purple: 'group-hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)]',
        cyan: 'group-hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.4)]',
        green: 'group-hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.4)]',
        amber: 'group-hover:shadow-[0_0_60px_-10px_rgba(245,158,11,0.4)]',
    }

    return (
        <motion.div
            className={`group relative rounded-3xl overflow-hidden ${paddings[padding]} ${className}`}
            onClick={onClick}
            whileHover={hover ? { y: -4, scale: 1.01 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Glass layers */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
            
            {/* Border with gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/[0.08] group-hover:border-white/[0.15] transition-colors duration-500" />
            
            {/* Top highlight line */}
            <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />
            
            {/* Inner glow on hover */}
            {glow && <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColors[glowColor]}`} />}
            
            {/* Sheen effect */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/[0.08] to-transparent rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}

// === LIQUID GLASS BUTTON COMPONENT ===
const GlassButton = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', onClick, disabled = false }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-violet-500 hover:to-purple-500',
        secondary: 'bg-white/[0.06] hover:bg-white/[0.12] text-white/90 border border-white/[0.08] hover:border-white/[0.15]',
        ghost: 'hover:bg-white/[0.06] text-white/70 hover:text-white/90',
        outline: 'border border-white/[0.15] hover:border-white/[0.25] hover:bg-white/[0.04] text-white/80',
        danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35',
        success: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35',
    }
    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
        md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
    }

    return (
        <motion.button
            className={`inline-flex items-center justify-center font-medium transition-all duration-300 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
            onClick={disabled ? undefined : onClick}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
        >
            {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
            {children}
        </motion.button>
    )
}

// === LIQUID GLASS INPUT COMPONENT ===
const GlassInput = ({ value, onChange, placeholder, label, type = 'text', icon: Icon }) => (
    <div className="space-y-2">
        {label && <label className="text-white/50 text-sm font-medium">{label}</label>}
        <div className="relative group">
            {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/50 transition-colors" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/[0.15] rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-300 backdrop-blur-sm ${Icon ? 'pl-10' : ''}`}
            />
            {/* Focus glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]" />
        </div>
    </div>
)

// === LIQUID GLASS SELECT COMPONENT ===
const GlassSelect = ({ options = [], value, onChange, placeholder = 'Sélectionner', label }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef()
    const selected = options.find((o) => o.value === value)

    useEffect(() => {
        const handler = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    return (
        <div className="space-y-2" ref={ref}>
            {label && <label className="text-white/50 text-sm font-medium">{label}</label>}
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.12] rounded-xl px-4 py-3 text-left transition-all duration-300"
                >
                    <span className={selected ? 'text-white' : 'text-white/30'}>{selected?.label ?? placeholder}</span>
                    <ChevronDown size={18} className={`text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden"
                        >
                            <div className="bg-[#1a1a2e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-1.5 shadow-2xl shadow-black/50">
                                {options.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => { onChange(opt.value); setOpen(false) }}
                                        className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 ${value === opt.value ? 'bg-violet-600/20 text-violet-300' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}
                                    >
                                        {value === opt.value && <Check size={16} className="text-violet-400" />}
                                        <span className={value === opt.value ? '' : 'ml-6'}>{opt.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// === LIQUID GLASS CHIP/TAG COMPONENT ===
const GlassChip = ({ children, active = false, onClick, icon: Icon, color = 'default' }) => {
    const colors = {
        default: active ? 'bg-white/[0.12] border-white/[0.2] text-white' : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white/80',
        purple: active ? 'bg-violet-500/20 border-violet-400/30 text-violet-300' : 'bg-violet-500/5 border-violet-400/10 text-violet-300/60 hover:bg-violet-500/10',
        green: active ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-emerald-500/5 border-emerald-400/10 text-emerald-300/60 hover:bg-emerald-500/10',
        amber: active ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/5 border-amber-400/10 text-amber-300/60 hover:bg-amber-500/10',
    }

    return (
        <motion.button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${colors[color]}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            {Icon && <Icon size={14} />}
            {children}
        </motion.button>
    )
}

// === LIQUID GLASS TOGGLE COMPONENT ===
const GlassToggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-12 h-7 rounded-full transition-all duration-300 ${checked ? 'bg-violet-600' : 'bg-white/[0.08]'}`}>
                <motion.div
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                    animate={{ left: checked ? '26px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </div>
        </div>
        {label && <span className="text-white/70 group-hover:text-white/90 transition-colors">{label}</span>}
    </label>
)

// === LIQUID GLASS SLIDER/RATING COMPONENT ===
const GlassRating = ({ value = 0, max = 10, label, onChange }) => {
    const percentage = (value / max) * 100

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {label && <span className="text-white/50 text-sm">{label}</span>}
                <span className="text-white font-semibold">{value}/{max}</span>
            </div>
            <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {/* Glow effect */}
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500/50 to-purple-500/50 rounded-full blur-sm" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

// === MAIN PREVIEW PAGE ===
export default function LiquidPreview() {
    const [type, setType] = useState('Fleur')
    const [name, setName] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(true)
    const [selectedChips, setSelectedChips] = useState(['Agrumes'])
    const [rating, setRating] = useState(7)

    const toggleChip = (chip) => {
        setSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip])
    }

    return (
        <div className="min-h-screen bg-[#07070f] text-white relative overflow-hidden">
            {/* === AMBIENT BACKGROUND EFFECTS === */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Primary glow - top left */}
                <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[70%] bg-violet-600/10 rounded-full blur-[150px]" />
                {/* Secondary glow - bottom right */}
                <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-cyan-500/8 rounded-full blur-[130px]" />
                {/* Accent glow - center */}
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-50" />
            </div>

            {/* === MAIN CONTENT === */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                
                {/* === HEADER === */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                                Liquid Glass UI
                            </h1>
                            <p className="text-white/40 text-sm">Apple-like Design System • iPhone 18 Style</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <GlassToggle checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                        <GlassButton variant="secondary" size="md" icon={Search}>Recherche</GlassButton>
                        <GlassButton variant="primary" size="md" icon={Plus}>Créer</GlassButton>
                    </div>
                </div>

                {/* === MAIN GRID === */}
                <div className="grid grid-cols-12 gap-6">
                    
                    {/* === LEFT PANEL - Main Form === */}
                    <GlassCard className="col-span-12 lg:col-span-8" padding="lg" glow glowColor="purple">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">Nouvelle Review</h2>
                                    <p className="text-white/40 mt-1">Créez votre fiche technique détaillée</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GlassChip active icon={Leaf} color="green">Fleur</GlassChip>
                                    <GlassChip icon={Flame} color="amber">Hash</GlassChip>
                                    <GlassChip icon={Droplets} color="purple">Concentré</GlassChip>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <GlassInput 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Ex: Purple Haze" 
                                    label="Nom du produit"
                                />
                                <GlassSelect
                                    options={[
                                        { value: 'Fleur', label: '🌿 Fleur' },
                                        { value: 'Hash', label: '🟤 Hash' },
                                        { value: 'Concentre', label: '💧 Concentré' },
                                        { value: 'Comestible', label: '🍪 Comestible' }
                                    ]}
                                    value={type}
                                    onChange={setType}
                                    placeholder="Type de produit"
                                    label="Type"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <GlassInput placeholder="Ex: Cookies Fam" label="Farm / Producteur" />
                                <GlassInput placeholder="Ex: GSC x Purple Punch" label="Cultivar(s)" />
                            </div>

                            {/* Rating Demo */}
                            <GlassRating value={rating} max={10} label="Note Visuelle" />

                            <div className="flex items-center gap-3 pt-2">
                                <GlassButton variant="primary" size="lg" icon={Check} onClick={() => setModalOpen(true)}>
                                    Enregistrer
                                </GlassButton>
                                <GlassButton variant="ghost" size="lg">Annuler</GlassButton>
                            </div>
                        </div>
                    </GlassCard>

                    {/* === RIGHT PANEL - Quick Actions === */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <GlassCard padding="md" glow glowColor="cyan">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Settings size={18} className="text-cyan-400" />
                                    Actions rapides
                                </h3>
                                <div className="flex flex-col gap-2">
                                    <GlassButton variant="secondary" icon={Settings} className="justify-start">Paramètres</GlassButton>
                                    <GlassButton variant="outline" icon={Download} className="justify-start">Exporter</GlassButton>
                                    <GlassButton variant="danger" icon={X} className="justify-start">Supprimer</GlassButton>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard padding="md" glow glowColor="amber">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Star size={18} className="text-amber-400" />
                                    Notes rapides
                                </h3>
                                <div className="space-y-3">
                                    <GlassRating value={8} max={10} label="Odeur" />
                                    <GlassRating value={7} max={10} label="Goût" />
                                    <GlassRating value={9} max={10} label="Effet" />
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* === BOTTOM ROW - Feature Cards === */}
                    <GlassCard className="col-span-12 sm:col-span-4" padding="md" hover glow glowColor="green">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Leaf size={16} className="text-emerald-400" />
                            </div>
                            Arômes
                        </h4>
                        <p className="text-white/40 text-sm mb-3">Sélectionnez les arômes dominants</p>
                        <div className="flex gap-2 flex-wrap">
                            {['Agrumes', 'Épicé', 'Sucré', 'Terreux', 'Floral'].map(chip => (
                                <GlassChip 
                                    key={chip} 
                                    active={selectedChips.includes(chip)} 
                                    onClick={() => toggleChip(chip)}
                                    color="green"
                                >
                                    {chip}
                                </GlassChip>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="col-span-12 sm:col-span-4" padding="md" hover glow glowColor="purple">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <Flame size={16} className="text-violet-400" />
                            </div>
                            Effets
                        </h4>
                        <p className="text-white/40 text-sm mb-3">Caractéristiques des effets</p>
                        <div className="flex gap-2 flex-wrap">
                            {['Relaxant', 'Créatif', 'Euphorique', 'Focus'].map(chip => (
                                <GlassChip key={chip} color="purple">{chip}</GlassChip>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="col-span-12 sm:col-span-4" padding="md" hover glow glowColor="cyan">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <Droplets size={16} className="text-cyan-400" />
                            </div>
                            Pipeline
                        </h4>
                        <p className="text-white/40 text-sm mb-3">Traçabilité de culture</p>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                        </div>
                        <p className="text-white/50 text-xs mt-2">Jour 67 / 90</p>
                    </GlassCard>
                </div>

                {/* === MODAL DEMO === */}
                <AnimatePresence>
                    {modalOpen && (
                        <motion.div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                                onClick={() => setModalOpen(false)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                            <motion.div
                                className="relative w-full max-w-lg"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25 }}
                            >
                                <GlassCard padding="lg" hover={false}>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                                <Check size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-white">Confirmer l'enregistrement</h2>
                                                <p className="text-white/40 text-sm">Review prête à être sauvegardée</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/50">Produit</span>
                                                <span className="text-white font-medium">{name || 'Sans nom'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2">
                                                <span className="text-white/50">Type</span>
                                                <span className="text-white font-medium">{type}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 justify-end">
                                            <GlassButton variant="ghost" onClick={() => setModalOpen(false)}>Annuler</GlassButton>
                                            <GlassButton variant="success" icon={Check} onClick={() => setModalOpen(false)}>Confirmer</GlassButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
