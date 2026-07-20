/**
 * LibraryPage.jsx - Page Bibliothèque Utilisateur Refactorisée
 *
 * Onglets:
 * - Groupe principal: Vue d'ensemble, Mes Reviews, Templates Export (incl. Filigranes), Statistiques
 * - Groupe PRO (producteur uniquement): Arbres Généalogiques, Chaîne de production, Données Récurrentes
 * - Filtres par type de produit (Fleur, Hash, Concentré, Comestible)
 * - Vue Grid/List/Timeline pour les reviews
 * - Partage templates par code unique
 *
 * Mobile:
 * - Sidebar masquée, remplacée par une barre de navigation inférieure fixe
 * - FAB "Nouvelle Review" flottant au-dessus de la barre de navigation
 * - Header compact affichant uniquement la section courante
 * - Padding réduit pour maximiser l'espace d'affichage
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useAccountFeatures } from '../../hooks/useAccountFeatures'
import { useToast } from '../../components/shared/ToastContainer'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Library, LayoutDashboard, FileText, Leaf, Palette, Database, BarChart3,
    Plus, Download, Upload,
    ChevronRight, Brain, ExternalLink, GitBranch, Dna, Building2
} from 'lucide-react'

// Import des onglets
import OverviewTab from './tabs/OverviewTab'
import ReviewsTab from './tabs/ReviewsTab'
import CultivarsTab from './tabs/CultivarsTab'
import TemplatesTab from './tabs/TemplatesTab'
import DataTab from './tabs/DataTab'
import StatsTab from './tabs/StatsTab'
import ProductionChainTab from './tabs/ProductionChainTab'
import CompanyTab from './tabs/CompanyTab'

// Configuration des onglets. `group` détermine le placement dans la sidebar :
// 'main' en haut, 'pro' regroupé sous un séparateur "PRO" (producteur uniquement).
const TABS = [
    {
        id: 'overview',
        label: 'Vue d\'ensemble',
        mobileLabel: 'Accueil',
        icon: LayoutDashboard,
        all: true,
        group: 'main',
        description: 'Aperçu global de votre bibliothèque'
    },
    {
        id: 'reviews',
        label: 'Mes Reviews',
        mobileLabel: 'Reviews',
        icon: FileText,
        all: true,
        group: 'main',
        description: 'Gérez vos reviews sauvegardées'
    },
    {
        id: 'templates',
        label: 'Templates Export',
        mobileLabel: 'Templates',
        icon: Palette,
        all: true,
        group: 'main',
        description: 'Templates d\'export, filigranes et personnalisation'
    },
    {
        id: 'stats',
        label: 'Statistiques',
        mobileLabel: 'Stats',
        icon: BarChart3,
        all: true,
        group: 'main',
        description: 'Statistiques de votre bibliothèque'
    },
    {
        id: 'company',
        label: 'Entreprise',
        mobileLabel: 'Équipe',
        icon: Building2,
        producerOnly: true,
        group: 'pro',
        // N'apparaît que si le compte appartient réellement à une entreprise (titulaire ou employé).
        requiresCompany: true,
        description: 'Votre équipe et les données partagées'
    },
    {
        id: 'cultivars',
        label: 'Arbres Généalogiques',
        mobileLabel: 'Génétiques',
        icon: Dna,
        producerOnly: true,
        group: 'pro',
        description: 'Construisez et explorez vos lignées généalogiques (PhenoHunt)'
    },
    {
        id: 'production-chain',
        label: 'Chaîne de production',
        mobileLabel: 'Chaîne',
        icon: GitBranch,
        producerOnly: true,
        group: 'pro',
        description: 'Liez vos fiches techniques entre elles et documentez chaque transformation'
    },
    {
        id: 'data',
        label: 'Données Récurrentes',
        mobileLabel: 'Données',
        icon: Database,
        producerOnly: true,
        group: 'pro',
        description: 'Substrats, engrais, techniques sauvegardés'
    },
]

export default function LibraryPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const toast = useToast()
    const { user } = useStore()
    const { isProducteur: isProducer } = useAccountFeatures()
    const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Vérifier authentification
    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user, navigate])

    // Déterminer les onglets disponibles selon le type de compte
    // `access.company` vient du serveur (/api/auth/me) : titulaire d'un ProducerProfile ou employé actif.
    const hasCompany = Boolean(user?.access?.company)
    const availableTabs = TABS
        .filter(t => t.all || (t.producerOnly && isProducer))
        .filter(t => !t.requiresCompany || hasCompany)
    const mainTabs = availableTabs.filter(t => t.group === 'main')
    const proTabs = availableTabs.filter(t => t.group === 'pro')

    // Rendu de l'onglet actif
    const renderTab = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab isProducer={isProducer} username={user?.username} onNavigate={setActiveTab} />
            case 'reviews':
                return <ReviewsTab />
            case 'company':
                return isProducer ? <CompanyTab onNavigate={setActiveTab} /> : null
            case 'cultivars':
                return isProducer ? <CultivarsTab /> : null
            case 'templates':
                return <TemplatesTab userTier={user?.accountType} />
            case 'production-chain':
                return isProducer ? <ProductionChainTab /> : null
            case 'data':
                return isProducer ? <DataTab /> : null
            case 'stats':
                return <StatsTab />
            default:
                return <OverviewTab isProducer={isProducer} username={user?.username} onNavigate={setActiveTab} />
        }
    }

    const currentTab = TABS.find(t => t.id === activeTab)

    if (!user) {
        return (
            <div className="min-h-[50vh] bg-[#07070f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#07070f]">
            <div className="flex-1 flex overflow-hidden">
                {/* ─── Sidebar – Desktop uniquement ─── */}
                <aside className={`hidden md:flex h-full ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/[0.02] border-r border-white/10 transition-all duration-300 flex-col`}>
                    {/* Header Sidebar */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
                                <Library className="w-5 h-5 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-white">Bibliothèque</h1>
                                    <p className="text-xs text-white/50 truncate">{user?.username}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Onglets */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                        {mainTabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    title={sidebarCollapsed ? tab.label : undefined}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                                    {!sidebarCollapsed && (
                                        <span className="flex-1 text-left text-sm font-medium truncate">{tab.label}</span>
                                    )}
                                </button>
                            )
                        })}

                        {proTabs.length > 0 && (
                            <>
                                <div className={`pt-3 pb-1 ${sidebarCollapsed ? 'px-0' : 'px-3'}`}>
                                    {sidebarCollapsed ? (
                                        <div className="h-px bg-white/10" />
                                    ) : (
                                        <span className="text-[10px] font-bold tracking-wider text-amber-400/80">PRO</span>
                                    )}
                                </div>
                                {proTabs.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = activeTab === tab.id
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}
                                            title={sidebarCollapsed ? tab.label : undefined}
                                        >
                                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                                            {!sidebarCollapsed && (
                                                <span className="flex-1 text-left text-sm font-medium truncate">{tab.label}</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </>
                        )}
                    </nav>

                    {/* Actions rapides */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        {!sidebarCollapsed && (
                            <>
                                <button
                                    onClick={() => navigate('/create')}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nouvelle Review
                                </button>
                                {isProducer && (
                                    <a
                                        href="https://growbrain.terpologie.eu"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 rounded-xl transition-colors text-sm font-medium"
                                        title="Relevés automatiques & IA de culture"
                                    >
                                        <Brain className="w-4 h-4" />
                                        GrowBrain
                                        <ExternalLink className="w-3 h-3 ml-auto" />
                                    </a>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toast.info('Export bibliothèque bientôt disponible')}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors text-xs"
                                        title="Exporter bibliothèque"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => toast.info('Import bibliothèque bientôt disponible')}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors text-xs"
                                        title="Importer bibliothèque"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Import
                                    </button>
                                </div>
                            </>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center p-2 text-white/40 hover:text-white/60 transition-colors"
                        >
                            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                </aside>

                {/* ─── Contenu principal ─── */}
                <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
                    {/* Header */}
                    <header className="shrink-0 bg-[#07070f]/90 backdrop-blur-xl border-b border-white/10">
                        {/* Mobile : titre compact centré */}
                        <div className="flex md:hidden items-center gap-3 px-4 py-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow shadow-purple-500/30 shrink-0">
                                <Library className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold text-white leading-tight truncate">{currentTab?.label}</h1>
                                <p className="text-[11px] text-white/40 truncate">{user?.username}</p>
                            </div>
                        </div>

                        {/* Desktop : breadcrumb + description */}
                        <div className="hidden md:flex items-center justify-between px-6 py-4">
                            <div>
                                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                                    <Library className="w-4 h-4" />
                                    <span>Bibliothèque</span>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-white">{currentTab?.label}</span>
                                </div>
                                <p className="text-white/40 text-sm">{currentTab?.description}</p>
                            </div>
                        </div>
                    </header>

                    {/* Contenu de l'onglet */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18 }}
                            >
                                {renderTab()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* ─── FAB Nouvelle Review – Mobile ─── */}
            <motion.button
                onClick={() => navigate('/create')}
                className="md:hidden fixed bottom-[72px] right-4 z-50 w-13 h-13 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/40 active:scale-95 transition-transform"
                whileTap={{ scale: 0.92 }}
                aria-label="Nouvelle Review"
                style={{ width: 52, height: 52 }}
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>

            {/* ─── Barre de navigation inférieure – Mobile ─── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d1a]/95 backdrop-blur-xl border-t border-white/10">
                <div className="flex items-stretch overflow-x-auto scrollbar-none">
                    {availableTabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[60px] flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition-all relative ${isActive
                                    ? 'text-purple-400'
                                    : 'text-white/40 active:text-white/70'
                                    }`}
                            >
                                {/* Indicateur actif */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-400 rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-all ${isActive ? 'bg-purple-500/20' : ''}`}>
                                    <Icon className="w-4 h-4" />
                                    {/* Badge PRO */}
                                    {tab.producerOnly && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center bg-amber-500 rounded-full">
                                            <span className="text-[6px] font-bold text-black leading-none">P</span>
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-purple-400' : 'text-white/40'}`}>
                                    {tab.mobileLabel}
                                </span>
                            </button>
                        )
                    })}
                </div>
                {/* Safe area iOS */}
                <div className="h-safe-bottom bg-transparent" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </nav>
        </div>
    )
}
