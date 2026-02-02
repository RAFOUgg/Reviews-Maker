import { extractCategoryRatings, extractExtraData, extractPipelines, extractSubstrat, formatDate } from '../../utils/orchardHelpers'
import { LiquidCard, LiquidDivider, LiquidRating } from '../ui/LiquidUI'
import { Star, Calendar, User, Leaf, Factory, FlaskConical, Image as ImageIcon, MessageSquare } from 'lucide-react'

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
            <LiquidCard glow="purple" padding="lg">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Image principale */}
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                        {review.mainImageUrl ? (
                            <img
                                src={review.mainImageUrl}
                                alt={review.holderName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                <span className="text-8xl">🌿</span>
                            </div>
                        )}
                    </div>

                    {/* Infos principales */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-white/50 uppercase tracking-wider">{review.type}</span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">{review.holderName}</h1>
                        </div>

                        {/* Note globale */}
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {displayScore}
                                </div>
                                <div>
                                    <div className="text-lg text-white/60">sur 10</div>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.round(displayScore / 2) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Infos produit */}
                        <div className="space-y-3 text-sm">
                            {review.cultivars && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <Leaf className="w-4 h-4 text-green-400" />
                                    <span className="text-white/50">Cultivar:</span>
                                    <span className="text-white font-medium">{review.cultivars}</span>
                                </div>
                            )}
                            {(review.breeder || review.hashmaker) && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <User className="w-4 h-4 text-cyan-400" />
                                    <span className="text-white/50">{review.breeder ? 'Breeder' : 'Hashmaker'}:</span>
                                    <span className="text-white font-medium">{review.breeder || review.hashmaker}</span>
                                </div>
                            )}
                            {review.farm && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <Factory className="w-4 h-4 text-amber-400" />
                                    <span className="text-white/50">Farm:</span>
                                    <span className="text-white font-medium">{review.farm}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span className="text-white/50">Date:</span>
                                <span className="text-white">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                <User className="w-4 h-4 text-pink-400" />
                                <span className="text-white/50">Auteur:</span>
                                <span className="text-white">{review.author || review.ownerName || 'Anonyme'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {review.description && (
                    <>
                        <LiquidDivider className="my-6" />
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-bold text-white">Commentaire</h3>
                            </div>
                            <p className="text-white/60 leading-relaxed">{review.description}</p>
                        </div>
                    </>
                )}
            </LiquidCard>

            {/* Category Ratings */}
            {categoryRatings.length > 0 && (
                <LiquidCard glow="amber" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        Notes par Catégorie
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryRatings.map(cat => (
                            <div key={cat.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="font-semibold text-white">{cat.label}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-400">{cat.value}/10</span>
                                </div>
                                <LiquidRating value={cat.value / 10} max={1} color="amber" />
                                {cat.subDetails && cat.subDetails.length > 0 && (
                                    <div className="space-y-1 text-xs mt-3">
                                        {cat.subDetails.map(sub => (
                                            <div key={sub.key} className="flex justify-between text-white/50">
                                                <span>{sub.label}:</span>
                                                <span className="font-medium text-white/70">{sub.value}/10</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            )}

            {/* Extra Data (Champs techniques) */}
            {extraData.length > 0 && (
                <LiquidCard glow="cyan" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-cyan-400" />
                        Données Techniques
                    </h2>

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
                                <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-white/10 pb-2">
                                    {catNames[catKey]}
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {catData.map(field => (
                                        <div key={field.key} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                                            <span className="text-lg">{field.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-white/50">{field.label}</div>
                                                <div className="text-sm font-semibold text-white truncate">{field.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </LiquidCard>
            )}

            {/* Pipelines */}
            {pipelines.length > 0 && (
                <LiquidCard glow="green" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-green-400" />
                        Pipelines & Processus
                    </h2>
                    <div className="space-y-4">
                        {pipelines.map(pipeline => (
                            <div key={pipeline.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{pipeline.icon}</span>
                                    <h3 className="font-bold text-white">{pipeline.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pipeline.steps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/30">
                                                {idx + 1}. {step}
                                            </span>
                                            {idx < pipeline.steps.length - 1 && (
                                                <span className="text-white/40">→</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            )}

            {/* Cultivars List */}
            {cultivarsList.length > 0 && (
                <LiquidCard glow="green" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-400" />
                        Cultivars Utilisés
                    </h2>
                    <div className="space-y-3">
                        {cultivarsList.map((cult, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-bold text-white text-lg">
                                            {cult.cultivar || cult.name || `Cultivar ${idx + 1}`}
                                        </div>
                                        {cult.breeder && (
                                            <div className="text-sm text-white/50 mt-1">
                                                <span className="font-medium text-white/70">Breeder:</span> {cult.breeder}
                                            </div>
                                        )}
                                        {cult.matiere && (
                                            <div className="text-sm text-white/50 mt-1">
                                                <span className="font-medium text-white/70">Matière:</span> {cult.matiere}
                                            </div>
                                        )}
                                    </div>
                                    {cult.percentage && (
                                        <div className="text-2xl font-bold text-green-400">{cult.percentage}%</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            )}

            {/* Substrat */}
            {substrat && substrat.length > 0 && (
                <LiquidCard glow="amber" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-amber-400" />
                        Substrat
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {substrat.map((sub, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                                <div className="font-semibold text-white">{sub.name}</div>
                                {sub.percentage && (
                                    <div className="text-sm text-amber-400 font-bold">{sub.percentage}%</div>
                                )}
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            )}

            {/* Galerie d'images */}
            {review.images && review.images.length > 1 && (
                <LiquidCard glow="purple" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Galerie
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {review.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                <img
                                    src={img}
                                    alt={`${review.holderName} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            )}
        </div>
    )
}


