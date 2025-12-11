import React from 'react'

/**
 * Flower Compact Template (1:1 ratio)
 * - Minimal info
 * - Main image
 * - Key ratings
 */
export default function FlowerCompactTemplate({ review, customModules, isDark = false }) {
    const data = review.extraData || {}

    return (
        <div className={`w-80 aspect-square rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
            <div className="h-full flex flex-col items-center justify-center p-6 text-white text-center">
                {/* Main Image or Placeholder */}
                {review.mainImageUrl ? (
                    <img
                        src={review.mainImageUrl}
                        alt={review.nomCommercial}
                        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 mb-4 flex items-center justify-center border-4 border-white">
                        <span className="text-3xl">🌿</span>
                    </div>
                )}

                {/* Title */}
                <h2 className="font-bold text-lg mb-2 line-clamp-2">
                    {review.nomCommercial || review.title}
                </h2>

                {/* Key Ratings */}
                <div className="flex gap-3 justify-center text-sm font-semibold">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                        ⭐ {data.overallRating || review.note || '0'}/10
                    </div>
                </div>

                {/* Farm/Breeder */}
                {(review.farm || review.breeder) && (
                    <p className="text-xs opacity-80 mt-3">
                        {review.farm || review.breeder}
                    </p>
                )}

                {/* Footer */}
                <div className="text-xs opacity-60 mt-4 border-t border-white/30 pt-2 w-full">
                    Reviews-Maker
                </div>
            </div>
        </div>
    )
}
