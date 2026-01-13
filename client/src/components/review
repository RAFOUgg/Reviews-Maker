import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ReviewCard({ review }) {
    const typeColors = {
        Indica: ' ',
        Sativa: 'from-green-600 to-emerald-800',
        Hybride: 'from-amber-600 to-orange-800',
        CBD: ' ',
    }

    const typeEmojis = {
        Indica: '🌙',
        Sativa: '☀️',
        Hybride: '⚖️',
        CBD: '💊',
    }

    // Parse categoryRatings si c'est une string
    let categoryRatings = {}
    try {
        if (typeof review.categoryRatings === 'string') {
            categoryRatings = JSON.parse(review.categoryRatings)
        } else if (typeof review.categoryRatings === 'object' && review.categoryRatings !== null) {
            categoryRatings = review.categoryRatings
        }
    } catch (e) {
        // Ignore parsing errors
    }

    // Calculer moyennes des catégories
    const categories = [
        { key: 'visual', label: 'Visuel', icon: '👁️' },
        { key: 'smell', label: 'Odeur', icon: '👃' },
        { key: 'texture', label: 'Texture', icon: '✋' },
        { key: 'taste', label: 'Goût', icon: '👅' },
        { key: 'effects', label: 'Effets', icon: '⚡' },
    ]

    const topCategories = categories
        .map(cat => {
            const value = categoryRatings[cat.key]
            let avg = 0
            if (typeof value === 'number') {
                avg = value
            } else if (typeof value === 'object' && value !== null) {
                const vals = Object.values(value).filter(v => typeof v === 'number')
                if (vals.length > 0) {
                    avg = vals.reduce((sum, v) => sum + v, 0) / vals.length
                }
            }
            return { ...cat, avg: Math.round(avg * 10) / 10 }
        })
        .filter(cat => cat.avg > 0)
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/review/${review.id}`} className="block card group">
                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                    {review.mainImageUrl ? (
                        <img
                            src={review.mainImageUrl}
                            alt={review.holderName}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${typeColors[review.type] || typeColors.Hybride} flex items-center justify-center`}>
                            <span className="text-6xl">{typeEmojis[review.type] || '🌿'}</span>
                        </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${typeColors[review.type] || typeColors.Hybride} text-white backdrop-blur-sm`}>
                            {typeEmojis[review.type]} {review.type}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-dark-text group-hover:text-primary-400 transition-colors">
                        {review.holderName}
                    </h3>

                    {/* Breeder/Hashmaker/Farm */}
                    {(review.breeder || review.hashmaker || review.farm) && (
                        <div className="text-sm text-dark-muted flex items-center gap-2">
                            <span className="text-primary-400">🧑‍🌾</span>
                            <span>{review.breeder || review.hashmaker || review.farm}</span>
                        </div>
                    )}

                    {/* Rating */}
                    {(() => {
                        const displayScore = review.computedOverall || review.overallRating || review.note || 0
                        const stars = Math.round(displayScore / 2)
                        return (
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < stars ? 'text-amber-400' : 'text-gray-600'}>⭐</span>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-dark-text">{displayScore}/10</span>
                            </div>
                        )
                    })()}

                    {/* Top Category Ratings */}
                    {topCategories.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {topCategories.map(cat => (
                                <span
                                    key={cat.key}
                                    className="px-2 py-1 text-xs rounded-lg bg-dark-surface border border-dark-border flex items-center gap-1"
                                    title={`${cat.label}: ${cat.avg}/10`}
                                >
                                    <span>{cat.icon}</span>
                                    <span className="font-semibold text-primary-300">{cat.avg}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Description preview */}
                    {review.description && (
                        <p className="text-sm text-dark-muted line-clamp-2">
                            {review.description}
                        </p>
                    )}

                    {/* Tags/Terpenes preview */}
                    {review.terpenes && review.terpenes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {review.terpenes.slice(0, 3).map((terpene, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-lg bg-primary-500/20 text-primary-300 border border-primary-500/30"
                                >
                                    {terpene}
                                </span>
                            ))}
                            {review.terpenes.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded-lg bg-dark-surface text-dark-muted">
                                    +{review.terpenes.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center justify-between text-xs text-dark-muted pt-2 border-t border-dark-border/30">
                        <span>Par {review.author || 'Anonyme'}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
