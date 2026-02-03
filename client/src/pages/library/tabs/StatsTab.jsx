/**
 * StatsTab.jsx - Onglet Statistiques de la Bibliothèque
 * 
 * Conforme au CDC:
 * - Nombre de reviews créées
 * - Nombre d'exports réalisés
 * - Types de produits les plus recensés
 * - Notes moyennes données/reçues
 * - Engagements sur reviews publiques
 */

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard } from '@/components/ui/LiquidUI'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2,
    FileText, Download, Flower2, Hash, FlaskConical, Cookie,
    Star, Calendar, Award, Target, Activity, Users
} from 'lucide-react'

// Icônes par type de produit
const TYPE_ICONS = {
    Fleur: { icon: Flower2, color: 'green' },
    Hash: { icon: Hash, color: 'amber' },
    Concentré: { icon: FlaskConical, color: 'purple' },
    Comestible: { icon: Cookie, color: 'pink' },
}

export default function StatsTab({ userTier = 'amateur' }) {
    const toast = useToast()

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('all') // 'week', 'month', 'year', 'all'

    // Charger les statistiques
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/library/stats?range=${timeRange}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                // Utiliser des données mock si l'API n'existe pas encore
                setStats(getMockStats())
            }
        } catch (error) {
            // Fallback sur données mock
            setStats(getMockStats())
        } finally {
            setLoading(false)
        }
    }, [timeRange])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    // Données mock pour le développement
    const getMockStats = () => ({
        reviews: {
            total: 24,
            thisMonth: 5,
            byType: {
                Fleur: 12,
                Hash: 6,
                Concentré: 4,
                Comestible: 2
            },
            public: 18,
            private: 6
        },
        exports: {
            total: 89,
            thisMonth: 15,
            byFormat: {
                PNG: 45,
                PDF: 28,
                JPEG: 12,
                SVG: 4
            }
        },
        engagement: {
            views: 1250,
            likes: 89,
            comments: 34,
            shares: 12
        },
        ratings: {
            given: {
                average: 7.8,
                total: 24
            },
            received: {
                average: 8.2,
                total: 156
            }
        },
        topReviews: [
            { id: 1, name: 'Zkittlez Premium', type: 'Fleur', views: 324, likes: 28 },
            { id: 2, name: 'Temple Ball', type: 'Hash', views: 256, likes: 22 },
            { id: 3, name: 'Live Rosin OG', type: 'Concentré', views: 189, likes: 15 },
        ],
        activity: [
            { date: '2024-01', reviews: 3, exports: 12 },
            { date: '2024-02', reviews: 5, exports: 18 },
            { date: '2024-03', reviews: 4, exports: 15 },
            { date: '2024-04', reviews: 6, exports: 22 },
            { date: '2024-05', reviews: 3, exports: 10 },
            { date: '2024-06', reviews: 3, exports: 12 },
        ]
    })

    // Stat Card Component
    const StatCard = ({ icon: Icon, label, value, subValue, color = 'purple', trend }) => (
        <LiquidCard glow="none" padding="md" className="hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-white/50">{label}</div>
                {subValue && (
                    <div className="text-xs text-white/40 mt-1">{subValue}</div>
                )}
            </div>
        </LiquidCard>
    )

    // Progress bar pour types de produits
    const TypeDistribution = ({ data }) => {
        const total = Object.values(data).reduce((a, b) => a + b, 0)
        if (total === 0) return null

        return (
            <div className="space-y-3">
                {Object.entries(data).map(([type, count]) => {
                    const config = TYPE_ICONS[type] || { icon: FileText, color: 'gray' }
                    const Icon = config.icon
                    const percentage = Math.round((count / total) * 100)

                    return (
                        <div key={type} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-white/80">
                                    <Icon className={`w-4 h-4 text-${config.color}-400`} />
                                    {type}
                                </span>
                                <span className="text-white/50">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`h-full bg-${config.color}-500 rounded-full`}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <LiquidCard glow="none" padding="lg">
                <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Statistiques indisponibles</h3>
                    <p className="text-white/50">Créez des reviews pour voir vos statistiques</p>
                </div>
            </LiquidCard>
        )
    }

    return (
        <div className="space-y-6">
            {/* Sélecteur de période */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Vue d'ensemble
                </h2>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                    {[
                        { id: 'week', label: 'Semaine' },
                        { id: 'month', label: 'Mois' },
                        { id: 'year', label: 'Année' },
                        { id: 'all', label: 'Tout' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTimeRange(opt.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${timeRange === opt.id
                                    ? 'bg-purple-500 text-white'
                                    : 'text-white/50 hover:text-white'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    label="Reviews"
                    value={stats.reviews.total}
                    subValue={`${stats.reviews.thisMonth} ce mois`}
                    color="purple"
                    trend={15}
                />
                <StatCard
                    icon={Download}
                    label="Exports"
                    value={stats.exports.total}
                    subValue={`${stats.exports.thisMonth} ce mois`}
                    color="blue"
                    trend={8}
                />
                <StatCard
                    icon={Eye}
                    label="Vues totales"
                    value={stats.engagement.views}
                    color="green"
                    trend={22}
                />
                <StatCard
                    icon={Heart}
                    label="J'aime reçus"
                    value={stats.engagement.likes}
                    color="red"
                    trend={12}
                />
            </div>

            {/* Distribution et engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution par type */}
                <LiquidCard glow="none" padding="lg">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        Distribution par type
                    </h3>
                    <TypeDistribution data={stats.reviews.byType} />
                </LiquidCard>

                {/* Engagement */}
                <LiquidCard glow="none" padding="lg">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        Engagement
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.engagement.views}</div>
                            <div className="text-xs text-white/50">Vues</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.engagement.likes}</div>
                            <div className="text-xs text-white/50">J'aime</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <MessageCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.engagement.comments}</div>
                            <div className="text-xs text-white/50">Commentaires</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <Share2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.engagement.shares}</div>
                            <div className="text-xs text-white/50">Partages</div>
                        </div>
                    </div>
                </LiquidCard>
            </div>

            {/* Notes moyennes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiquidCard glow="none" padding="lg">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        Notes données
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-amber-400">
                            {stats.ratings.given.average.toFixed(1)}
                        </div>
                        <div>
                            <div className="text-white/60">Moyenne</div>
                            <div className="text-sm text-white/40">sur {stats.ratings.given.total} reviews</div>
                        </div>
                    </div>
                    <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(stats.ratings.given.average / 10) * 100}%` }}
                        />
                    </div>
                </LiquidCard>

                <LiquidCard glow="none" padding="lg">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-400" />
                        Notes reçues
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-green-400">
                            {stats.ratings.received.average.toFixed(1)}
                        </div>
                        <div>
                            <div className="text-white/60">Moyenne</div>
                            <div className="text-sm text-white/40">sur {stats.ratings.received.total} évaluations</div>
                        </div>
                    </div>
                    <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(stats.ratings.received.average / 10) * 100}%` }}
                        />
                    </div>
                </LiquidCard>
            </div>

            {/* Top reviews */}
            <LiquidCard glow="none" padding="lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    Top reviews
                </h3>

                {stats.topReviews.length === 0 ? (
                    <p className="text-center text-white/40 py-8">
                        Publiez des reviews pour voir votre classement
                    </p>
                ) : (
                    <div className="space-y-3">
                        {stats.topReviews.map((review, index) => {
                            const config = TYPE_ICONS[review.type] || { icon: FileText, color: 'gray' }
                            const Icon = config.icon

                            return (
                                <div
                                    key={review.id}
                                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                'bg-orange-700/20 text-orange-600'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <div className={`w-10 h-10 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{review.name}</div>
                                        <div className="text-sm text-white/50">{review.type}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-white/60">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {review.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {review.likes}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </LiquidCard>

            {/* Formats d'export */}
            <LiquidCard glow="none" padding="lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    Exports par format
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(stats.exports.byFormat).map(([format, count]) => (
                        <div key={format} className="text-center p-4 bg-white/5 rounded-xl">
                            <div className="text-2xl font-bold text-white">{count}</div>
                            <div className="text-xs text-white/50 mt-1">{format}</div>
                        </div>
                    ))}
                </div>
            </LiquidCard>

            {/* Note pour producteurs */}
            {userTier === 'producer' && (
                <LiquidCard glow="purple" padding="md">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-1">Statistiques Producteur</h3>
                            <p className="text-sm text-white/60">
                                En tant que Producteur, vous avez accès à des statistiques avancées sur vos cultures,
                                rendements et évolutions. Consultez l'onglet PipeLine pour plus de détails.
                            </p>
                        </div>
                    </div>
                </LiquidCard>
            )}
        </div>
    )
}
