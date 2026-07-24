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
    BarChart3, TrendingUp, Eye, Heart, MessageCircle,
    FileText, Download, Flower2, Hash, FlaskConical, Cookie,
    Target, Activity, Users
} from 'lucide-react'

// Icônes par type de produit
const TYPE_ICONS = {
    Fleur: { icon: Flower2, color: 'green' },
    Hash: { icon: Hash, color: 'amber' },
    Concentré: { icon: FlaskConical, color: 'purple' },
    Comestible: { icon: Cookie, color: 'pink' },
}

// Les types stockés en base ('Fleurs', 'hash', 'concentrate', 'edible', cf. flower/hash/
// concentrate/edible-reviews.js) ne correspondent pas à la casse attendue par TYPE_ICONS.
const TYPE_LABELS = {
    Fleurs: 'Fleur',
    hash: 'Hash',
    concentrate: 'Concentré',
    edible: 'Comestible',
}
const displayType = (rawType) => TYPE_LABELS[rawType] || rawType || 'Autre'

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
                setStats(null)
            }
        } catch (error) {
            console.error('Erreur récupération des stats', error)
            setStats(null)
        } finally {
            setLoading(false)
        }
    }, [timeRange])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

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
                    const label = displayType(type)
                    const config = TYPE_ICONS[label] || { icon: FileText, color: 'gray' }
                    const Icon = config.icon
                    const percentage = Math.round((count / total) * 100)

                    return (
                        <div key={type} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-white/80">
                                    <Icon className={`w-4 h-4 text-${config.color}-400`} />
                                    {label}
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
                />
                <StatCard
                    icon={Download}
                    label="Exports"
                    value={stats.exports.total}
                    subValue={`${stats.exports.thisMonth} ce mois`}
                    color="blue"
                />
                <StatCard
                    icon={Eye}
                    label="Vues totales"
                    value={stats.engagement.views}
                    color="green"
                />
                <StatCard
                    icon={Heart}
                    label="J'aime reçus"
                    value={stats.engagement.likes}
                    color="red"
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
                    <div className="grid grid-cols-3 gap-4">
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
                            const label = displayType(review.type)
                            const config = TYPE_ICONS[label] || { icon: FileText, color: 'gray' }
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
                                        <div className="text-sm text-white/50">{label}</div>
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
