import { extractCategoryRatings, extractExtraData, extractPipelines, extractSubstrat, formatDate } from '../../utils/orchardHelpers'

export default function ReviewFullDisplay({ review }) {
    if (!review) return null

    // Parse des données JSON avec protection contre les erreurs
    let categoryRatings = []
    let extraData = []
    let pipelines = []
    let substrat = null

    try {
        categoryRatings = extractCategoryRatings(review.categoryRatings, review) || []
    } catch (e) {
        console.error('Error extracting category ratings:', e)
    }

    try {
        extraData = extractExtraData(review.extraData, review) || []
    } catch (e) {
        console.error('Error extracting extra data:', e)
    }

    try {
        pipelines = extractPipelines(review) || []
    } catch (e) {
        console.error('Error extracting pipelines:', e)
    }

    try {
        substrat = extractSubstrat(review.substratMix)
    } catch (e) {
        console.error('Error extracting substrat:', e)
    }

    // Parse cultivars list
    let cultivarsList = []
    try {
        if (typeof review.cultivarsList === 'string') {
            cultivarsList = JSON.parse(review.cultivarsList)
        } else if (Array.isArray(review.cultivarsList)) {
            cultivarsList = review.cultivarsList
        }
    } catch (e) {
        // Ignore
    }

    const displayScore = review.computedOverall || review.overallRating || review.note || 0

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="card">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Image principale */}
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                        {review.mainImageUrl ? (
                            <img
                                src={review.mainImageUrl}
                                alt={review.holderName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <span className="text-8xl">🌿</span>
                            </div>
                        )}
                    </div>

                    {/* Infos principales */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-dark-muted uppercase tracking-wider">{review.type}</span>
                            <h1 className="text-4xl font-bold text-dark-text mt-1">{review.holderName}</h1>
                        </div>

                        {/* Note globale */}
                        <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="text-6xl font-black text-primary-400">{displayScore}</div>
                                <div>
                                    <div className="text-lg text-dark-muted">sur 10</div>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Math.round(displayScore / 2) ? 'text-amber-400 text-xl' : 'text-gray-600 text-xl'}>⭐</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Infos produit */}
                        <div className="space-y-2 text-sm">
                            {review.cultivars && (
                                <div className="flex items-start gap-2">
                                    <span className="text-dark-muted">🌱 Cultivar:</span>
                                    <span className="text-dark-text font-medium">{review.cultivars}</span>
                                </div>
                            )}
                            {(review.breeder || review.hashmaker) && (
                                <div className="flex items-start gap-2">
                                    <span className="text-dark-muted">🧑‍🌾 {review.breeder ? 'Breeder' : 'Hashmaker'}:</span>
                                    <span className="text-dark-text font-medium">{review.breeder || review.hashmaker}</span>
                                </div>
                            )}
                            {review.farm && (
                                <div className="flex items-start gap-2">
                                    <span className="text-dark-muted">🏡 Farm:</span>
                                    <span className="text-dark-text font-medium">{review.farm}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <span className="text-dark-muted">📅 Date:</span>
                                <span className="text-dark-text">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-dark-muted">✍️ Auteur:</span>
                                <span className="text-dark-text">{review.author || review.ownerName || 'Anonyme'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {review.description && (
                    <div className="mt-6 pt-6 border-t border-dark-border">
                        <h3 className="text-lg font-bold text-dark-text mb-3">💬 Commentaire</h3>
                        <p className="text-dark-muted leading-relaxed">{review.description}</p>
                    </div>
                )}
            </div>

            {/* Category Ratings */}
            {categoryRatings.length > 0 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">📊 Notes par Catégorie</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryRatings.map(cat => (
                            <div key={cat.key} className="bg-dark-surface rounded-xl p-4 border border-dark-border">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="font-semibold text-dark-text">{cat.label}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-primary-400">{cat.value}/10</span>
                                </div>
                                {cat.subDetails && cat.subDetails.length > 0 && (
                                    <div className="space-y-1 text-xs">
                                        {cat.subDetails.map(sub => (
                                            <div key={sub.key} className="flex justify-between text-dark-muted">
                                                <span>{sub.label}:</span>
                                                <span className="font-medium">{sub.value}/10</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Extra Data (Champs techniques) */}
            {extraData.length > 0 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">🔬 Données Techniques</h2>

                    {/* Group par catégorie */}
                    {['culture', 'visual', 'quality', 'texture', 'smoke', 'sensory', 'effects', 'process'].map(catKey => {
                        const catData = extraData.filter(d => d.category === catKey)
                        if (catData.length === 0) return null

                        const catNames = {
                            culture: 'Culture',
                            visual: 'Visuel',
                            quality: 'Qualité',
                            texture: 'Texture',
                            smoke: 'Fumée',
                            sensory: 'Sensoriel',
                            effects: 'Effets',
                            process: 'Process'
                        }

                        return (
                            <div key={catKey} className="mb-6 last:mb-0">
                                <h3 className="text-lg font-bold text-primary-400 mb-3 border-b border-dark-border pb-2">
                                    {catNames[catKey]}
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {catData.map(field => (
                                        <div key={field.key} className="flex items-center gap-2 bg-dark-surface rounded-lg px-3 py-2">
                                            <span className="text-lg">{field.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-dark-muted">{field.label}</div>
                                                <div className="text-sm font-semibold text-dark-text truncate">{field.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pipelines */}
            {pipelines.length > 0 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">⚗️ Pipelines & Processus</h2>
                    <div className="space-y-4">
                        {pipelines.map(pipeline => (
                            <div key={pipeline.key} className="bg-dark-surface rounded-xl p-4 border border-dark-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{pipeline.icon}</span>
                                    <h3 className="font-bold text-dark-text">{pipeline.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pipeline.steps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm font-medium border border-primary-500/30">
                                                {idx + 1}. {step}
                                            </span>
                                            {idx < pipeline.steps.length - 1 && (
                                                <span className="text-dark-muted">→</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cultivars List */}
            {cultivarsList.length > 0 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">🌱 Cultivars Utilisés</h2>
                    <div className="space-y-3">
                        {cultivarsList.map((cult, idx) => (
                            <div key={idx} className="bg-dark-surface rounded-xl p-4 border border-dark-border">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-bold text-dark-text text-lg">
                                            {cult.cultivar || cult.name || `Cultivar ${idx + 1}`}
                                        </div>
                                        {cult.breeder && (
                                            <div className="text-sm text-dark-muted mt-1">
                                                <span className="font-medium">Breeder:</span> {cult.breeder}
                                            </div>
                                        )}
                                        {cult.matiere && (
                                            <div className="text-sm text-dark-muted mt-1">
                                                <span className="font-medium">Matière:</span> {cult.matiere}
                                            </div>
                                        )}
                                    </div>
                                    {cult.percentage && (
                                        <div className="text-2xl font-bold text-primary-400">{cult.percentage}%</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Substrat */}
            {substrat.length > 0 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">🪴 Substrat</h2>
                    <div className="flex flex-wrap gap-3">
                        {substrat.map((sub, idx) => (
                            <div key={idx} className="bg-dark-surface rounded-xl px-4 py-3 border border-dark-border">
                                <div className="font-semibold text-dark-text">{sub.name}</div>
                                {sub.percentage && (
                                    <div className="text-sm text-primary-400 font-bold">{sub.percentage}%</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Galerie d'images */}
            {review.images && review.images.length > 1 && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">📸 Galerie</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {review.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-dark-border">
                                <img
                                    src={img}
                                    alt={`${review.holderName} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}


