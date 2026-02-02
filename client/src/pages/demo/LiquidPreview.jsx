/**
 * Liquid Preview - Apple/iPhone 18 Liquid Glass Design System
 * 
 * Design sandbox to create and preview all UI components
 * before applying them to the entire application.
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
    Palette,
    Zap,
    Heart,
    Coffee,
    Bell,
    User,
    Mail,
    Lock,
    Info
} from 'lucide-react'

// Import Liquid Glass CSS
import '../../assets/apple-liquid-glass.css'

// Import Liquid UI Components
import {
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
} from '../../components/ui/LiquidUI'

// ============================================
// MAIN PREVIEW PAGE
// ============================================

export default function LiquidPreview() {
    // Form state
    const [productName, setProductName] = useState('')
    const [productType, setProductType] = useState('flower')
    const [farm, setFarm] = useState('')
    const [cultivar, setCultivar] = useState('')
    const [description, setDescription] = useState('')

    // UI state
    const [darkMode, setDarkMode] = useState(true)
    const [notifications, setNotifications] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('general')

    // Selection state
    const [selectedAromas, setSelectedAromas] = useState(['Agrumes', 'Pin'])
    const [selectedEffects, setSelectedEffects] = useState(['Relaxant'])

    const productOptions = [
        { value: 'flower', label: '🌿 Fleur', icon: '🌿' },
        { value: 'hash', label: '🟤 Hash', icon: '🟤' },
        { value: 'concentrate', label: '💧 Concentré', icon: '💧' },
        { value: 'edible', label: '🍪 Comestible', icon: '🍪' }
    ]

    const tabs = [
        { id: 'general', label: 'Général', icon: Info },
        { id: 'visual', label: 'Visuel', icon: Eye },
        { id: 'effects', label: 'Effets', icon: Zap },
        { id: 'settings', label: 'Paramètres', icon: Settings }
    ]

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
                <div
                    className="liquid-blob purple"
                    style={{ width: '60vw', height: '60vw', top: '-20%', left: '-15%' }}
                />
                <div
                    className="liquid-blob cyan"
                    style={{ width: '50vw', height: '50vw', bottom: '-25%', right: '-15%' }}
                />
                <div
                    className="liquid-blob pink"
                    style={{ width: '35vw', height: '35vw', top: '50%', left: '40%', transform: 'translate(-50%, -50%)' }}
                />
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px'
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
                                Apple Design System • Composants réutilisables
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LiquidToggle checked={darkMode} onChange={setDarkMode} label="Mode sombre" />
                        <LiquidButton variant="default" icon={Search}>Rechercher</LiquidButton>
                        <LiquidButton variant="primary" icon={Plus}>Créer</LiquidButton>
                    </div>
                </motion.header>

                {/* === TABS === */}
                <div className="mb-8">
                    <LiquidTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        variant="pills"
                    />
                </div>

                {/* === MAIN GRID === */}
                <div className="grid grid-cols-12 gap-6">

                    {/* === LEFT COLUMN - Main Form === */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Form Card */}
                        <LiquidCard glow="purple" padding="lg">
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-semibold liquid-text-gradient">
                                            Nouvelle Review
                                        </h2>
                                        <p className="liquid-text-muted mt-2">
                                            Créez votre fiche technique avec les composants Liquid Glass
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <LiquidBadge variant="info">Beta</LiquidBadge>
                                        <LiquidBadge variant="success">v2.0</LiquidBadge>
                                    </div>
                                </div>

                                {/* Type chips */}
                                <div className="flex gap-2 flex-wrap">
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
                                    <LiquidChip
                                        icon={Coffee}
                                        active={productType === 'edible'}
                                        color="pink"
                                        onClick={() => setProductType('edible')}
                                    >
                                        Comestible
                                    </LiquidChip>
                                </div>

                                <LiquidDivider />

                                {/* Form inputs */}
                                <div className="grid grid-cols-2 gap-6">
                                    <LiquidInput
                                        label="Nom du produit"
                                        placeholder="Ex: Purple Haze"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        icon={Leaf}
                                    />
                                    <LiquidSelect
                                        label="Type de produit"
                                        options={productOptions}
                                        value={productType}
                                        onChange={setProductType}
                                        placeholder="Sélectionner un type..."
                                        searchable
                                    />
                                    <LiquidInput
                                        label="Farm / Producteur"
                                        placeholder="Ex: Cookies Fam"
                                        value={farm}
                                        onChange={(e) => setFarm(e.target.value)}
                                        icon={User}
                                    />
                                    <LiquidInput
                                        label="Cultivar(s)"
                                        placeholder="Ex: GSC x Purple Punch"
                                        value={cultivar}
                                        onChange={(e) => setCultivar(e.target.value)}
                                    />
                                </div>

                                <LiquidTextarea
                                    label="Description"
                                    placeholder="Décrivez le produit..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    hint="Maximum 500 caractères"
                                />

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
                                    <LiquidTooltip content="Cette action est irréversible" position="top">
                                        <LiquidButton variant="danger" size="lg" icon={X}>
                                            Supprimer
                                        </LiquidButton>
                                    </LiquidTooltip>
                                </div>
                            </div>
                        </LiquidCard>

                        {/* Feature Cards Row */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Aromas Card */}
                            <LiquidCard glow="green" padding="md">
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
                                            size="sm"
                                        >
                                            {aroma}
                                        </LiquidChip>
                                    ))}
                                </div>
                            </LiquidCard>

                            {/* Effects Card */}
                            <LiquidCard glow="purple" padding="md">
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
                                            size="sm"
                                        >
                                            {effect}
                                        </LiquidChip>
                                    ))}
                                </div>
                            </LiquidCard>

                            {/* Pipeline Card */}
                            <LiquidCard glow="cyan" padding="md">
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
                        <LiquidCard glow="cyan" padding="md">
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
                                <LiquidButton
                                    variant="danger"
                                    icon={X}
                                    className="w-full justify-start"
                                    onClick={() => setConfirmModalOpen(true)}
                                >
                                    Supprimer
                                </LiquidButton>
                            </div>
                        </LiquidCard>

                        {/* Settings Card */}
                        <LiquidCard glow="purple" padding="md">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-3 mb-5">
                                <Bell size={18} className="text-violet-400" />
                                Paramètres
                            </h3>
                            <div className="space-y-4">
                                <LiquidToggle
                                    checked={notifications}
                                    onChange={setNotifications}
                                    label="Notifications"
                                />
                                <LiquidToggle
                                    checked={darkMode}
                                    onChange={setDarkMode}
                                    label="Mode sombre"
                                />
                                <LiquidDivider className="my-3" />
                                <LiquidSelect
                                    label="Langue"
                                    options={[
                                        { value: 'fr', label: '🇫🇷 Français' },
                                        { value: 'en', label: '🇬🇧 English' },
                                        { value: 'es', label: '🇪🇸 Español' }
                                    ]}
                                    value="fr"
                                    onChange={() => { }}
                                />
                            </div>
                        </LiquidCard>

                        {/* Ratings Overview */}
                        <LiquidCard glow="amber" padding="md">
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

                        {/* User Card with Avatar */}
                        <LiquidCard glow="pink" padding="md">
                            <div className="flex items-center gap-4">
                                <LiquidAvatar
                                    src="https://i.pravatar.cc/100"
                                    alt="User"
                                    size="lg"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">RAFOU.</h4>
                                    <p className="text-xs liquid-text-muted">Compte Producteur</p>
                                    <div className="flex gap-2 mt-2">
                                        <LiquidBadge variant="success" size="sm">PRO</LiquidBadge>
                                        <LiquidBadge variant="info" size="sm">42 reviews</LiquidBadge>
                                    </div>
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
                        Catalogue des Composants
                    </h2>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Buttons showcase */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
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
                            <div className="flex flex-wrap gap-3 mt-4">
                                <LiquidButton loading>Loading...</LiquidButton>
                                <LiquidButton disabled>Disabled</LiquidButton>
                            </div>
                        </LiquidCard>

                        {/* Chips showcase */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
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
                                <LiquidChip active color="purple" onRemove={() => { }}>Supprimable</LiquidChip>
                            </div>
                            <h4 className="text-white font-semibold mt-6 mb-4">Badges</h4>
                            <div className="flex flex-wrap gap-2">
                                <LiquidBadge>Default</LiquidBadge>
                                <LiquidBadge variant="success">Success</LiquidBadge>
                                <LiquidBadge variant="warning">Warning</LiquidBadge>
                                <LiquidBadge variant="danger">Danger</LiquidBadge>
                                <LiquidBadge variant="info">Info</LiquidBadge>
                            </div>
                        </LiquidCard>

                        {/* Inputs showcase */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
                            <h4 className="text-white font-semibold mb-4">Inputs</h4>
                            <div className="space-y-4">
                                <LiquidInput label="Avec label" placeholder="Entrez du texte..." icon={Mail} />
                                <LiquidInput placeholder="Sans label" />
                                <LiquidInput label="Avec erreur" placeholder="Email..." error="Email invalide" />
                                <LiquidInput label="Avec hint" placeholder="Mot de passe..." hint="8 caractères minimum" icon={Lock} type="password" />
                            </div>
                        </LiquidCard>

                        {/* Select showcase */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
                            <h4 className="text-white font-semibold mb-4">Select Custom</h4>
                            <div className="space-y-4">
                                <LiquidSelect
                                    label="Select basique"
                                    options={[
                                        { value: '1', label: 'Option 1' },
                                        { value: '2', label: 'Option 2' },
                                        { value: '3', label: 'Option 3' }
                                    ]}
                                    value=""
                                    onChange={() => { }}
                                    placeholder="Sélectionner..."
                                />
                                <LiquidSelect
                                    label="Select avec recherche"
                                    options={productOptions}
                                    value={productType}
                                    onChange={setProductType}
                                    searchable
                                />
                                <LiquidSelect
                                    label="Select désactivé"
                                    options={[{ value: '1', label: 'Option 1' }]}
                                    value="1"
                                    onChange={() => { }}
                                    disabled
                                />
                            </div>
                        </LiquidCard>

                        {/* Ratings & Progress */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
                            <h4 className="text-white font-semibold mb-4">Ratings & Progress</h4>
                            <div className="space-y-4">
                                <LiquidRating value={9} max={10} label="Purple" color="purple" />
                                <LiquidRating value={7} max={10} label="Green" color="green" />
                                <LiquidRating value={8} max={10} label="Cyan" color="cyan" />
                                <LiquidRating value={6} max={10} label="Amber" color="amber" />
                            </div>
                        </LiquidCard>

                        {/* Skeleton & Loading */}
                        <LiquidCard glow="none" padding="md" className="col-span-12 md:col-span-6">
                            <h4 className="text-white font-semibold mb-4">Skeleton Loading</h4>
                            <div className="space-y-3">
                                <LiquidSkeleton width="100%" height={20} rounded="md" />
                                <LiquidSkeleton width="80%" height={20} rounded="md" />
                                <LiquidSkeleton width="60%" height={20} rounded="md" />
                                <div className="flex items-center gap-3 mt-4">
                                    <LiquidSkeleton width={48} height={48} rounded="full" />
                                    <div className="flex-1 space-y-2">
                                        <LiquidSkeleton width="50%" height={16} rounded="md" />
                                        <LiquidSkeleton width="30%" height={12} rounded="md" />
                                    </div>
                                </div>
                            </div>
                        </LiquidCard>
                    </div>
                </motion.section>
            </div>

            {/* === SAVE MODAL === */}
            <LiquidModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                size="md"
            >
                <LiquidModal.Header>
                    <LiquidModal.Title icon={Check}>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Confirmer l'enregistrement</h2>
                            <p className="liquid-text-muted text-sm mt-1">Review prête à être sauvegardée</p>
                        </div>
                    </LiquidModal.Title>
                </LiquidModal.Header>

                <LiquidModal.Body>
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="liquid-text-muted">Produit</span>
                            <span className="text-white font-medium">{productName || 'Sans nom'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="liquid-text-muted">Type</span>
                            <span className="text-white font-medium">
                                {productOptions.find(o => o.value === productType)?.label || productType}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="liquid-text-muted">Arômes</span>
                            <span className="text-white font-medium">{selectedAromas.length} sélectionnés</span>
                        </div>
                    </div>
                </LiquidModal.Body>

                <LiquidModal.Footer>
                    <LiquidButton variant="ghost" onClick={() => setModalOpen(false)}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="success" icon={Check} onClick={() => setModalOpen(false)}>
                        Confirmer
                    </LiquidButton>
                </LiquidModal.Footer>
            </LiquidModal>

            {/* === CONFIRM DELETE MODAL === */}
            <LiquidModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                size="sm"
            >
                <LiquidModal.Header>
                    <LiquidModal.Title icon={X}>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Supprimer ?</h2>
                            <p className="liquid-text-muted text-sm mt-1">Cette action est irréversible</p>
                        </div>
                    </LiquidModal.Title>
                </LiquidModal.Header>

                <LiquidModal.Body>
                    <p className="text-white/70">
                        Êtes-vous sûr de vouloir supprimer cet élément ? Toutes les données associées seront perdues.
                    </p>
                </LiquidModal.Body>

                <LiquidModal.Footer>
                    <LiquidButton variant="ghost" onClick={() => setConfirmModalOpen(false)}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="danger" icon={X} onClick={() => setConfirmModalOpen(false)}>
                        Supprimer
                    </LiquidButton>
                </LiquidModal.Footer>
            </LiquidModal>
        </div>
    )
}
