import React from 'react'

/**
 * Flower Detailed Template (16:9 ratio)
 * - Hero image
 * - Detailed scores and info
 * - Effect badges
 */
export default function FlowerDetailedTemplate({ review, customModules, isDark = false }) {
    const data = review.extraData || {}
    const categoryRatings = review.categoryRatings ? JSON.parse(typeof review.categoryRatings === 'string' ? review.categoryRatings : JSON.stringify(review.categoryRatings)) : {}

    const scoreColor = (score) => {
        if (!score) return 'bg-gray-500'
        if (score >= 7) return 'bg-green-500'
        if (score >= 4) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const effects = review.effects ? (Array.isArray(review.effects) ? review.effects : review.effects.split(', ')) : []

    return (
        <div className={`w-full aspect-video rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="h-full flex flex-col">
                {/* Hero Image */}
                <div className="flex-1 relative bg-gradient-to-br overflow-hidden">
                    {review.mainImageUrl ? (
                        <img
                            src={review.mainImageUrl}
                            alt={review.nomCommercial}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                </div>

                {/* Info Section */}
                <div className={`flex-1 p-6 flex flex-col justify-between ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                    <div>
                        {/* Title & Basic Info */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">
                                    {review.nomCommercial || review.title}
                                </h2>
                                <p className={`text-sm opacity-75`}>
                                    {review.farm || review.breeder || 'Unknown'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${scoreColor(review.note)}`} style={{
                                    color: review.note >= 7 ? '#22c55e' : review.note >= 4 ? '#eab308' : '#ef4444'
                                }}>
                                    {review.note || '0'}/10
                                </div>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        {Object.keys(categoryRatings).length > 0 && (
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {Object.entries(categoryRatings).map(([category, score]) => (
                                    <div key={category} className="text-center">
                                        <div className={`text-xs font-semibold mb-1 ${scoreColor(score).replace('bg-', 'text-')}`}>
                                            {['visual', 'smell', 'texture', 'taste', 'effects'].includes(category)
                                                ? ['👁️', '👃', '🤚', '👅', '⚡'][['visual', 'smell', 'texture', 'taste', 'effects'].indexOf(category)]
                                                : category.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`text-sm font-bold ${scoreColor(score).replace('bg-', 'text-')}`}>
                                            {score}/10
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Effects & Details */}
                    <div className="flex items-center justify-between text-xs">
                        {effects.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {effects.slice(0, 4).map((effect, i) => (
                                    <span key={i} className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${isDark ? '' : ''}`}>
                                        {effect}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className={`opacity-60 text-xs`}>Reviews-Maker</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

