/**
 * OverviewTab.jsx - Vue d'ensemble de la Bibliothèque
 *
 * Page d'accueil de la Bibliothèque : agrège les indicateurs clés (reviews,
 * répartition par type, cultivars, chaînes de production) et propose un accès
 * rapide vers chaque section, sans dupliquer la logique métier de chaque onglet.
 */

import { useState, useEffect, useCallback } from 'react'
import { LiquidCard } from '@/components/ui/LiquidUI'
import { motion } from 'framer-motion'
import { parseImages } from '../../../utils/imageUtils'
import useProductionChainStore from '../../../store/useProductionChainStore'
import useGeneticsStore from '../../../store/useGeneticsStore'
import {
    FileText, TrendingUp, Eye, EyeOff, Dna, GitBranch, Database,
    Palette, BarChart3, Flower2, Hash, FlaskConical, Cookie,
    ArrowRight, Clock
} from 'lucide-react'

// Mêmes IDs bruts que review.type (cf. ReviewsTab.jsx) : pas de casse uniforme entre types
const TYPE_META = {
    Fleurs: { label: 'Fleurs', icon: Flower2, color: 'text-green-400', bg: 'bg-green-500/15' },
    hash: { label: 'Hash', icon: Hash, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    concentrate: { label: 'Concentrés', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/15' },
    edible: { label: 'Comestibles', icon: Cookie, color: 'text-pink-400', bg: 'bg-pink-500/15' },
}

// Classes littérales (pas d'interpolation) : Tailwind ne génère que les classes
// détectées telles quelles dans le code source, une classe construite dynamiquement
// (ex: `bg-${color}-500`) ne serait pas produite par le build.
const COLOR_CLASSES = {
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
    green: { bg: 'bg-green-500/15', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    gray: { bg: 'bg-gray-500/15', text: 'text-gray-400' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    pink: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
}

const StatCard = ({ icon: Icon, label, value, color = 'purple' }) => {
    const c = COLOR_CLASSES[color] || COLOR_CLASSES.purple
    return (
        <LiquidCard glow="none" padding="md" className="hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-2xl font-bold text-white leading-tight">{value}</p>
                    <p className="text-xs text-white/50 truncate">{label}</p>
                </div>
            </div>
        </LiquidCard>
    )
}

const QuickAccessCard = ({ icon: Icon, label, description, color, locked, onClick, index }) => {
    const c = COLOR_CLASSES[color] || COLOR_CLASSES.purple
    return (
    <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        onClick={onClick}
        className="text-left w-full"
    >
        <LiquidCard glow="none" padding="md" className="h-full hover:border-white/20 transition-all group cursor-pointer">
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{label}</h3>
                        {locked && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded shrink-0">
                                PRO
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
        </LiquidCard>
    </motion.button>
    )
}

export default function OverviewTab({ isProducer, username, onNavigate }) {
    const [stats, setStats] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const { chains, fetchChains } = useProductionChainStore()
    const { trees, fetchTrees } = useGeneticsStore()

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true)
            const [statsRes, reviewsRes] = await Promise.all([
                fetch('/api/library/stats?range=all', { credentials: 'include' }),
                fetch('/api/reviews/my', { credentials: 'include' }),
            ])
            if (statsRes.ok) setStats(await statsRes.json())
            if (reviewsRes.ok) {
                const reviews = await reviewsRes.json()
                setRecentReviews(
                    [...reviews]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                )
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOverview()
    }, [fetchOverview])

    useEffect(() => {
        if (isProducer) {
            fetchChains()
            fetchTrees()
        }
    }, [isProducer, fetchChains, fetchTrees])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    const total = stats?.reviews?.total ?? 0
    const thisMonth = stats?.reviews?.thisMonth ?? 0
    const publicCount = stats?.reviews?.public ?? 0
    const privateCount = stats?.reviews?.private ?? 0
    const byType = stats?.reviews?.byType ?? {}

    return (
        <div className="space-y-8">
            {/* Salutation */}
            <div>
                <h2 className="text-xl font-bold text-white">Bonjour {username} 👋</h2>
                <p className="text-sm text-white/50 mt-1">Voici un aperçu de votre bibliothèque</p>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Reviews au total" value={total} color="purple" />
                <StatCard icon={TrendingUp} label="Ce mois-ci" value={thisMonth} color="green" />
                <StatCard icon={Eye} label="Publiques" value={publicCount} color="blue" />
                <StatCard icon={EyeOff} label="Privées" value={privateCount} color="gray" />
            </div>

            {/* Répartition par type */}
            {total > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Répartition par type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(TYPE_META).map(([id, meta]) => {
                            const Icon = meta.icon
                            const count = byType[id] || 0
                            return (
                                <LiquidCard key={id} glow="none" padding="sm" className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-4 h-4 ${meta.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white">{count}</p>
                                        <p className="text-[11px] text-white/50 truncate">{meta.label}</p>
                                    </div>
                                </LiquidCard>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stats producteur */}
            {isProducer && (
                <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-1.5">
                        Outils Producteur
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">PRO</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon={Dna} label="Arbres généalogiques" value={trees?.length ?? 0} color="emerald" />
                        <StatCard icon={GitBranch} label="Chaînes de production" value={chains?.length ?? 0} color="emerald" />
                    </div>
                </div>
            )}

            {/* Reviews récentes */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/70">Reviews récentes</h3>
                    {recentReviews.length > 0 && (
                        <button
                            onClick={() => onNavigate('reviews')}
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                            Voir tout <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {recentReviews.length === 0 ? (
                    <LiquidCard glow="none" padding="lg" className="text-center py-10">
                        <FileText className="w-10 h-10 mx-auto text-white/20 mb-3" />
                        <p className="text-white/50">Aucune review pour le moment</p>
                    </LiquidCard>
                ) : (
                    <div className="space-y-2">
                        {recentReviews.map((review, idx) => {
                            const meta = TYPE_META[review.type] || TYPE_META.Fleurs
                            const Icon = meta.icon
                            const images = parseImages(review.images)
                            return (
                                <motion.button
                                    key={review.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => onNavigate('reviews')}
                                    className="w-full text-left"
                                >
                                    <LiquidCard glow="none" padding="sm" className="flex items-center gap-3 hover:border-white/20 transition-all">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                            {images[0] ? (
                                                <img src={images[0]} alt={review.holderName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon className={`w-5 h-5 ${meta.color}`} />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate">{review.holderName}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-white/40">
                                                <span className={meta.color}>{meta.label}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </LiquidCard>
                                </motion.button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Accès rapide */}
            <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">Accès rapide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <QuickAccessCard
                        index={0}
                        icon={FileText}
                        label="Mes Reviews"
                        description="Gérez vos reviews sauvegardées"
                        color="purple"
                        onClick={() => onNavigate('reviews')}
                    />
                    <QuickAccessCard
                        index={1}
                        icon={Palette}
                        label="Templates Export"
                        description="Templates d'export et filigranes"
                        color="pink"
                        onClick={() => onNavigate('templates')}
                    />
                    <QuickAccessCard
                        index={2}
                        icon={BarChart3}
                        label="Statistiques"
                        description="Statistiques de votre bibliothèque"
                        color="blue"
                        onClick={() => onNavigate('stats')}
                    />
                    {isProducer && (
                        <>
                            <QuickAccessCard
                                index={3}
                                icon={Dna}
                                label="Arbres Généalogiques"
                                description="Construisez et explorez vos lignées généalogiques (PhenoHunt)"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('cultivars')}
                            />
                            <QuickAccessCard
                                index={4}
                                icon={GitBranch}
                                label="Chaîne de production"
                                description="Liez vos fiches techniques entre elles"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('production-chain')}
                            />
                            <QuickAccessCard
                                index={5}
                                icon={Database}
                                label="Données Récurrentes"
                                description="Substrats, engrais, techniques sauvegardés"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('data')}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
