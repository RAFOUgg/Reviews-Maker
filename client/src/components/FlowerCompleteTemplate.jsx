import React from 'react'

/**
 * Flower Complete Template (A4 / Full Page)
 * - Comprehensive review data
 * - All scores, effects, genetics
 * - Culture & curing pipelines
 */
export default function FlowerCompleteTemplate({ review, customModules, isDark = false }) {
    const data = review.extraData || {}
    const categoryRatings = review.categoryRatings ? JSON.parse(typeof review.categoryRatings === 'string' ? review.categoryRatings : JSON.stringify(review.categoryRatings)) : {}

    const scoreColor = (score) => {
        if (!score) return 'bg-gray-200 text-gray-700'
        if (score >= 7) return 'bg-green-200 text-green-900'
        if (score >= 4) return 'bg-yellow-200 text-yellow-900'
        return 'bg-red-200 text-red-900'
    }

    const effects = review.effects ? (Array.isArray(review.effects) ? review.effects : review.effects.split(', ')) : []
    const aromas = review.aromas ? (Array.isArray(review.aromas) ? review.aromas : review.aromas.split(', ')) : []
    const tastes = review.tastes ? (Array.isArray(review.tastes) ? review.tastes : review.tastes.split(', ')) : []

    return (
        <div className={`w-full max-w-4xl rounded-lg shadow-lg ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-8">
                {/* Header */}
                <div className="flex gap-6 mb-8 pb-8 border-b border-gray-300 dark:border-gray-700">
                    {review.mainImageUrl && (
                        <img
                            src={review.mainImageUrl}
                            alt={review.nomCommercial}
                            className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">{review.nomCommercial || review.title}</h1>
                        <p className={`text-lg opacity-75 mb-4`}>
                            {review.farm || review.breeder || 'Unknown Producer'}
                        </p>
                        <div className="flex gap-4 mb-4">
                            <div className="dark: px-4 py-2 rounded-lg">
                                <div className="text-xs opacity-75">Overall Rating</div>
                                <div className="text-2xl font-bold dark:">
                                    {review.note || '0'}/10
                                </div>
                            </div>
                            {review.cultivars && (
                                <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className="text-xs opacity-75">Cultivar</div>
                                    <div className="font-semibold">{review.cultivars}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Ratings Grid */}
                {Object.keys(categoryRatings).length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Category Scores</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {Object.entries(categoryRatings).map(([category, score]) => (
                                <div key={category} className={`p-4 rounded-lg text-center ${scoreColor(score)}`}>
                                    <div className="text-lg font-bold">{score}/10</div>
                                    <div className="text-xs opacity-75 mt-1 capitalize">{category}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Technical Scores */}
                {(data.densite || data.trichome || data.pistil) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Visual & Technical</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {data.couleur && <ScoreCard label="Color" score={data.couleur} />}
                            {data.densite && <ScoreCard label="Density" score={data.densite} />}
                            {data.trichome && <ScoreCard label="Trichomes" score={data.trichome} />}
                            {data.pistil && <ScoreCard label="Pistils" score={data.pistil} />}
                            {data.manucure && <ScoreCard label="Manicure" score={data.manucure} />}
                            {data.moisissure && <ScoreCard label="Mold Free" score={data.moisissure} />}
                        </div>
                    </div>
                )}

                {/* Sensory Profile */}
                {(aromas.length > 0 || tastes.length > 0 || effects.length > 0) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Sensory Profile</h2>

                        {aromas.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Aromas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {aromas.map((aroma, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? ' ' : ' '}`}>
                                            {aroma}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tastes.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Tastes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tastes.map((taste, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? ' ' : ' '}`}>
                                            {taste}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {effects.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Effects</h3>
                                <div className="flex flex-wrap gap-2">
                                    {effects.map((effect, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-900'}`}>
                                            {effect}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Texture Scores */}
                {(data.durete || data.densiteTexture || data.elasticite || data.collant) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Texture Profile</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {data.durete && <ScoreCard label="Hardness" score={data.durete} />}
                            {data.densiteTexture && <ScoreCard label="Density" score={data.densiteTexture} />}
                            {data.elasticite && <ScoreCard label="Elasticity" score={data.elasticite} />}
                            {data.collant && <ScoreCard label="Sticky" score={data.collant} />}
                        </div>
                    </div>
                )}

                {/* Taste Profile */}
                {(data.intensiteFumee || data.agressivite || data.montee) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Consumption Profile</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {data.intensiteFumee && <ScoreCard label="Smoke Intensity" score={data.intensiteFumee} />}
                            {data.agressivite && <ScoreCard label="Aggressiveness" score={data.agressivite} />}
                            {data.montee && <ScoreCard label="Onset Speed" score={data.montee} />}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={`border-t border-gray-300 dark:border-gray-700 pt-6 mt-8 text-center opacity-60 text-sm`}>
                    <p>Reviews-Maker | Complete Review Export</p>
                    <p>{new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
}

function ScoreCard({ label, score }) {
    const color = score >= 7 ? 'green' : score >= 4 ? 'yellow' : 'red'
    const colorMap = {
        green: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200',
        yellow: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
        red: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200'
    }

    return (
        <div className={`p-4 rounded-lg text-center ${colorMap[color]}`}>
            <div className="text-2xl font-bold">{score}/10</div>
            <div className="text-xs opacity-75 mt-1">{label}</div>
        </div>
    )
}

