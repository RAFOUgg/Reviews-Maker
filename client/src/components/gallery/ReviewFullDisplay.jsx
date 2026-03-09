import { useState } from 'react'
import { extractCategoryRatings, extractExtraData, extractPipelines, extractSubstrat, formatDate } from '../../utils/orchardHelpers'
import { LiquidCard, LiquidDivider, LiquidRating } from '../ui/LiquidUI'
import { Star, Calendar, User, Leaf, Factory, FlaskConical, Image as ImageIcon, MessageSquare, X, ChevronLeft, ChevronRight, Flower2, Droplets, Wind } from 'lucide-react'
import InteractivePipelineViewer from './InteractivePipelineViewer'

export default function ReviewFullDisplay({ review }) {
    const [lightboxImg, setLightboxImg] = useState(null)
    const [lightboxIdx, setLightboxIdx] = useState(0)
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

    // Parse arrays from review (may be JSON strings)
    const parseArray = (val) => {
        if (!val) return []
        if (Array.isArray(val)) return val
        if (typeof val === 'string') {
            try { return JSON.parse(val) } catch { return val.split(',').map(s => s.trim()).filter(Boolean) }
        }
        return []
    }
    const extractLabel = (item) => {
        if (typeof item === 'string') return item
        return item?.label || item?.name || item?.value || String(item)
    }

    const aromas = parseArray(review.aromas)
    const secondaryAromas = parseArray(review.secondaryAromas)
    const tastes = parseArray(review.tastes)
    const dryPuffNotes = parseArray(review.dryPuffNotes)
    const inhalationNotes = parseArray(review.inhalationNotes)
    const exhalationNotes = parseArray(review.exhalationNotes)
    const effects = parseArray(review.effects)
    const terpenes = parseArray(review.terpenes)
    const images = parseArray(review.images)

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
                                <span className="text-white">{(typeof review.author === 'object' ? review.author?.username : review.author) || review.ownerName || 'Anonyme'}</span>
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

            {/* Pipelines - Interactive */}
            {pipelines.length > 0 && (
                <LiquidCard glow="green" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-green-400" />
                        Pipelines & Processus
                    </h2>
                    <div className="space-y-6">
                        {pipelines.map(pipeline => {
                            // Get the raw pipeline data for interactive viewer
                            const rawData = review[pipeline.key] || pipeline;
                            return (
                                <InteractivePipelineViewer
                                    key={pipeline.key}
                                    pipeline={rawData}
                                    pipelineName={pipeline.name}
                                    pipelineIcon={pipeline.icon}
                                />
                            );
                        })}
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

            {/* Profil Sensoriel - Arômes, Goûts, Effets, Terpènes */}
            {(aromas.length > 0 || secondaryAromas.length > 0 || tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || effects.length > 0 || terpenes.length > 0) && (
                <LiquidCard glow="pink" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                        <Flower2 className="w-5 h-5 text-pink-400" />
                        Profil Sensoriel
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Arômes */}
                        {aromas.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    🌸 Arômes dominants
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {aromas.map((a, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-pink-500/15 text-pink-300 text-sm font-medium border border-pink-500/25">
                                            {extractLabel(a)}
                                        </span>
                                    ))}
                                </div>
                                {secondaryAromas.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-xs text-white/40 block mb-2">Arômes secondaires</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {secondaryAromas.map((a, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                                                    {extractLabel(a)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Goûts */}
                        {(dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0 || tastes.length > 0) && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    👅 Goûts
                                </h3>
                                {dryPuffNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">💨 Tirage à sec</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dryPuffNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {inhalationNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">🌬️ Inhalation</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {inhalationNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {exhalationNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">↩️ Arrière-goût</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {exhalationNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {tastes.length > 0 && dryPuffNotes.length === 0 && inhalationNotes.length === 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tastes.map((t, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                {extractLabel(t)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Effets */}
                        {effects.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    ⚡ Effets ressentis
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {effects.map((e, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-300 text-sm font-medium border border-violet-500/25">
                                            {extractLabel(e)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terpènes */}
                        {terpenes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    🧪 Terpènes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {terpenes.map((t, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-sm font-medium border border-cyan-500/25">
                                            {extractLabel(t)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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

            {/* Galerie d'images - interactive with lightbox */}
            {images.length > 1 && (
                <LiquidCard glow="purple" padding="lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Galerie
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setLightboxImg(img); setLightboxIdx(idx); }}
                                className="aspect-square rounded-xl overflow-hidden border border-white/10 group relative cursor-pointer"
                            >
                                <img
                                    src={img}
                                    alt={`${review.holderName} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                        Agrandir
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </LiquidCard>
            )}

            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <button
                        onClick={() => setLightboxImg(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); const prev = (lightboxIdx - 1 + images.length) % images.length; setLightboxIdx(prev); setLightboxImg(images[prev]); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); const next = (lightboxIdx + 1) % images.length; setLightboxIdx(next); setLightboxImg(images[next]); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    <img
                        src={lightboxImg}
                        alt="Agrandir"
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 text-white/50 text-sm">
                        {lightboxIdx + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    )
}


