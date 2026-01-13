import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Star, Heart } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

/**
 * Section "Statistiques Rapides" - Affiche 4 stats principales
 * Conforme CDC : "Statistiques Rapides (4 cards : total reviews, total exports, type favori, total likes)"
 */
export default function QuickStatsSection({ userId }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchQuickStats = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/quick/${userId}`, {
                    credentials: 'include'
                })
                const data = await response.json()

                if (response.ok) {
                    setStats(data.stats)
                } else {
                    console.error('Erreur chargement stats:', data.error)
                }
            } catch (error) {
                console.error('Erreur chargement stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuickStats()
    }, [userId])

    if (!userId) return null

    if (loading) {
        return (
            <section className="glass p-8 rounded-3xl">
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" message="Chargement de vos statistiques..." />
                </div>
            </section>
        )
    }

    // Données par défaut si pas de stats
    const defaultStats = {
        totalReviews: 0,
        totalExports: 0,
        favoriteType: 'Aucun',
        totalLikes: 0
    }

    const displayStats = stats || defaultStats

    const statsCards = [
        {
            icon: FileText,
            label: 'Reviews Créées',
            value: displayStats.totalReviews,
            color: ' ',
            iconBg: '',
            iconColor: ''
        },
        {
            icon: Download,
            label: 'Exports Réalisés',
            value: displayStats.totalExports,
            color: ' ',
            iconBg: '',
            iconColor: ''
        },
        {
            icon: Star,
            label: 'Type Favori',
            value: displayStats.favoriteType,
            color: 'from-amber-500 to-orange-600',
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            emoji: displayStats.favoriteType === 'Fleur' ? '🌿' :
                displayStats.favoriteType === 'Hash' ? '🧊' :
                    displayStats.favoriteType === 'Concentré' ? '💧' :
                        displayStats.favoriteType === 'Comestible' ? '🍪' : '❓'
        },
        {
            icon: Heart,
            label: 'Likes Reçus',
            value: displayStats.totalLikes,
            color: ' to-rose-600',
            iconBg: '',
            iconColor: ''
        }
    ]

    return (
        <section className="space-y-6">
            {/* Titre */}
            <h2 className="text-2xl font-black text-[rgb(var(--color-accent))] flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Statistiques Rapides
            </h2>

            {/* Grid 4 colonnes (responsive: 2x2 mobile, 4 cols desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-6 rounded-2xl space-y-4 hover:shadow-[0_0_30px_rgba(var(--color-accent),0.2)] transition-all duration-300"
                        >
                            {/* Icône */}
                            <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2.5} />
                            </div>

                            {/* Valeur */}
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-theme-text-primary flex items-center gap-2">
                                    {stat.emoji && <span className="text-2xl">{stat.emoji}</span>}
                                    <span>{stat.value}</span>
                                </div>
                                <p className="text-sm font-medium text-theme-text-secondary">
                                    {stat.label}
                                </p>
                            </div>

                            {/* Gradient bar au bas */}
                            <div className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}


