/**
 * LibraryPage.jsx - Page Bibliothèque Utilisateur Refactorisée
 * 
 * Conforme au CDC:
 * - Onglets: Reviews, Cultivars (Producteur), Templates, Filigranes, Données (Producteur), Stats
 * - Filtres par type de produit (Fleur, Hash, Concentré, Comestible)
 * - Vue Grid/List/Timeline pour les reviews
 * - Partage templates par code unique
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton, LiquidChip } from '@/components/ui/LiquidUI'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Library, FileText, Leaf, Palette, Database, BarChart3,
    Grid3X3, List, Calendar, Plus, Settings, Download, Upload,
    ChevronRight
} from 'lucide-react'

// Import des onglets
import ReviewsTab from './tabs/ReviewsTab'
import CultivarsTab from './tabs/CultivarsTab'
import TemplatesTab from './tabs/TemplatesTab'
import WatermarksTab from './tabs/WatermarksTab'
import DataTab from './tabs/DataTab'
import StatsTab from './tabs/StatsTab'

// Configuration des onglets
const TABS = [
    {
        id: 'reviews',
        label: 'Mes Reviews',
        icon: FileText,
        all: true,
        description: 'Gérez vos reviews sauvegardées'
    },
    {
        id: 'cultivars',
        label: 'Cultivars & Génétiques',
        icon: Leaf,
        producerOnly: true,
        description: 'Bibliothèque de cultivars et arbres généalogiques'
    },
    {
        id: 'templates',
        label: 'Templates Export',
        icon: Palette,
        all: true,
        description: 'Templates d\'export prédéfinis et personnalisés'
    },
    {
        id: 'watermarks',
        label: 'Filigranes',
        icon: Settings,
        all: true,
        description: 'Gérez vos filigranes personnalisés'
    },
    {
        id: 'data',
        label: 'Données Récurrentes',
        icon: Database,
        producerOnly: true,
        description: 'Substrats, engrais, techniques sauvegardés'
    },
    {
        id: 'stats',
        label: 'Statistiques',
        icon: BarChart3,
        all: true,
        description: 'Statistiques de votre bibliothèque'
    },
]

export default function LibraryPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user } = useStore()
    const [activeTab, setActiveTab] = useState('reviews')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Vérifier authentification
    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user, navigate])

    // Déterminer les onglets disponibles selon le type de compte
    const isProducer = user?.accountType === 'producer'
    const isInfluencer = user?.accountType === 'influencer' || user?.accountType === 'influencer_basic' || user?.accountType === 'influencer_pro'
    const availableTabs = TABS.filter(t => t.all || (t.producerOnly && isProducer))

    // Rendu de l'onglet actif
    const renderTab = () => {
        switch (activeTab) {
            case 'reviews':
                return <ReviewsTab />
            case 'cultivars':
                return isProducer ? <CultivarsTab /> : null
            case 'templates':
                return <TemplatesTab />
            case 'watermarks':
                return <WatermarksTab />
            case 'data':
                return isProducer ? <DataTab /> : null
            case 'stats':
                return <StatsTab />
            default:
                return <ReviewsTab />
        }
    }

    const currentTab = TABS.find(t => t.id === activeTab)

    if (!user) {
        return (
            <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#07070f]">
            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-white/[0.02] border-r border-white/10 transition-all duration-300 flex flex-col`}>
                    {/* Header Sidebar */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Library className="w-5 h-5 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <div>
                                    <h1 className="text-lg font-bold text-white">Bibliothèque</h1>
                                    <p className="text-xs text-white/50">{user?.username}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Onglets */}
                    <nav className="flex-1 p-2 space-y-1">
                        {availableTabs.map((tab) => {
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
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                                    {!sidebarCollapsed && (
                                        <>
                                            <span className="flex-1 text-left text-sm font-medium">{tab.label}</span>
                                            {tab.producerOnly && (
                                                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">PRO</span>
                                            )}
                                        </>
                                    )}
                                </button>
                            )
                        })}
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

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Header de la section */}
                    <header className="sticky top-0 z-10 bg-[#07070f]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                        <div className="flex items-center justify-between">
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
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTab()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    )
}
