import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { LiquidCard, LiquidSkeleton, LiquidBadge } from '@/components/ui/LiquidUI'

export default function StatsPage() {
    const navigate = useNavigate()
    const { user } = useStore()
    const [stats, setStats] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }

        const fetchData = async () => {
            try {
                const [statsRes, reviewsRes] = await Promise.all([
                    fetch('/api/users/me/stats', { credentials: 'include' }),
                    fetch('/api/reviews/my', { credentials: 'include' })
                ])

                if (statsRes.ok) setStats(await statsRes.json())
                if (reviewsRes.ok) setReviews(await reviewsRes.json())
            } catch (error) {
                // Erreur silencieuse
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center">
                <p className="text-white/50">Erreur lors du chargement des statistiques</p>
            </div>
        )
    }

    // Calculate category averages from all reviews
    const calculateCategoryAverages = () => {
        if (reviews.length === 0) return { visual: 0, smell: 0, taste: 0, effects: 0 }

        const categoryFieldMap = {
            visual: ['densite', 'trichomes', 'malleabilite', 'transparence', 'pistils', 'moisissure', 'graines'],
            smell: ['aromas'],
            taste: ['tastes'],
            effects: ['effects', 'dureeEffet']
        }

        const totals = { visual: 0, smell: 0, taste: 0, effects: 0 }
        const counts = { visual: 0, smell: 0, taste: 0, effects: 0 }

        reviews.forEach(review => {
            // Visual
            categoryFieldMap.visual.forEach(field => {
                const value = parseFloat(review[field])
                if (!isNaN(value)) {
                    totals.visual += value
                    counts.visual++
                }
            })
        })

        return {
            visual: counts.visual > 0 ? Math.round((totals.visual / counts.visual) * 10) / 10 : 0,
            smell: 0, // Simplified for now
            taste: 0,
            effects: 0
        }
    }

    const categoryAvgs = calculateCategoryAverages()

    // Get top cultivars
    const getTopCultivars = () => {
        const cultivarCount = {}
        reviews.forEach(r => {
            if (r.cultivars) {
                const names = r.cultivars.split(',').map(n => n.trim())
                names.forEach(name => {
                    cultivarCount[name] = (cultivarCount[name] || 0) + 1
                })
            }
        })
        return Object.entries(cultivarCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
    }

    const topCultivars = getTopCultivars()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] py-8">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-2">
                        📊 Mes statistiques
                    </h1>
                    <p className="text-white/50">
                        Analyse détaillée de vos reviews et préférences
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <LiquidCard glow="purple" padding="lg">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/50">Total Reviews</p>
                        <p className="text-4xl font-bold text-white">{stats.totalReviews}</p>
                    </LiquidCard>

                    <LiquidCard glow="amber" padding="lg">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/50">Note moyenne</p>
                        <p className="text-4xl font-bold text-white">{stats.avgRating.toFixed(1)}<span className="text-2xl text-white/50">/10</span></p>
                    </LiquidCard>

                    <LiquidCard glow="cyan" padding="lg">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/50">Type préféré</p>
                        <p className="text-2xl font-bold text-white">
                            {Object.entries(stats.typeBreakdown || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </p>
                    </LiquidCard>

                    <LiquidCard glow="green" padding="lg">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/50">Membre depuis</p>
                        <p className="text-xl font-bold text-white">
                            {new Date(stats.memberSince).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </p>
                    </LiquidCard>
                </div>

                {/* Category Ratings */}
                <LiquidCard glow="default" padding="lg" className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Notes moyennes par catégorie</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { key: 'visual', label: 'Visuel', icon: '👁️', value: categoryAvgs.visual },
                            { key: 'smell', label: 'Odeurs', icon: '👃', value: categoryAvgs.smell },
                            { key: 'taste', label: 'Goûts', icon: '👅', value: categoryAvgs.taste },
                            { key: 'effects', label: 'Effets', icon: '⚡', value: categoryAvgs.effects }
                        ].map(cat => (
                            <div key={cat.key} className="text-center">
                                <div className="text-4xl mb-2">{cat.icon}</div>
                                <p className="text-sm text-white/50 mb-2">{cat.label}</p>
                                <div className="relative w-full h-2 bg-white/[0.05] rounded-full overflow-hidden mb-2">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                                        style={{ width: `${(cat.value / 10) * 100}%` }}
                                    />
                                </div>
                                <p className="text-2xl font-bold text-white">{cat.value.toFixed(1)}/10</p>
                            </div>
                        ))}
                    </div>
                </LiquidCard>

                {/* Type Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <LiquidCard glow="default" padding="lg">
                        <h2 className="text-xl font-bold text-white mb-6">Répartition par type</h2>
                        <div className="space-y-4">
                            {Object.entries(stats.typeBreakdown || {}).map(([type, count]) => (
                                <div key={type}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-white/70 font-medium">{type}</span>
                                        <span className="text-white font-bold">{count}</span>
                                    </div>
                                    <div className="relative w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                                            style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidCard>

                    {/* Top Cultivars */}
                    <LiquidCard glow="green" padding="lg">
                        <h2 className="text-xl font-bold text-white mb-6">🌿 Top Cultivars</h2>
                        {topCultivars.length > 0 ? (
                            <div className="space-y-4">
                                {topCultivars.map(([name, count], index) => (
                                    <div key={name} className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{name}</p>
                                            <p className="text-sm text-white/50">{count} review{count > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/50 text-center py-8">Aucun cultivar référencé</p>
                        )}
                    </LiquidCard>
                </div>

                {/* Recent Activity */}
                <LiquidCard glow="default" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-6">📈 Activité récente</h2>
                    <div className="space-y-3">
                        {reviews.slice(0, 5).map((review) => (
                            <div
                                key={review.id}
                                className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer border border-white/[0.06]"
                                onClick={() => navigate(`/review/${review.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl shadow-lg">
                                        {review.type === 'Fleur' ? '🌸' : review.type === 'Hash' ? '🧊' : review.type === 'Concentré' ? '💎' : '🍪'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{review.holderName}</p>
                                        <p className="text-sm text-white/50">
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400">⭐</span>
                                    <span className="font-bold text-white">{review.overallRating || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            </div>
        </div>
    )
}
