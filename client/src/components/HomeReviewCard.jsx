/**
 * HomeReviewCard Component
 * Card d'affichage d'une review dans la galerie HomePage
 * Utilise l'aperçu Orchard défini si disponible, sinon affiche les images
 */

import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { parseImages } from '../utils/imageUtils'
import TemplateRenderer from './TemplateRenderer'

export default function HomeReviewCard({
    review,
    onLike,
    onDislike,
    onAuthorClick
}) {
    const navigate = useNavigate()
    const images = parseImages(review.images)
    const rating = review.overallRating || review.note || 0

    // Parser orchardConfig si c'est une string JSON
    const getOrchardConfig = () => {
        if (!review.orchardConfig) return null
        if (typeof review.orchardConfig === 'string') {
            try {
                return JSON.parse(review.orchardConfig)
            } catch {
                return null
            }
        }
        return review.orchardConfig
    }

    const orchardConfig = getOrchardConfig()
    const hasOrchardPreview = !!orchardConfig && (review.orchardPreset || review.orchardLayoutMode)

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Fleur': return '🌿'
            case 'Hash': return '🍫'
            case 'Concentré': return '🔮'
            default: return '🍰'
        }
    }

    const handleCardClick = () => {
        navigate(`/review/${review.id}`)
    }

    // Préparer les données pour le template Orchard
    const getOrchardReviewData = () => {
        // Parser les champs JSON si nécessaire
        const safeParseJSON = (value) => {
            if (!value) return []
            if (Array.isArray(value)) return value
            if (typeof value === 'string') {
                try { return JSON.parse(value) } catch { return [] }
            }
            return []
        }

        return {
            ...review,
            title: review.holderName,
            rating: review.overallRating || review.note || 0,
            imageUrl: review.mainImageUrl || (images && images.length > 0 ? images[0] : null),
            images: images || [],
            terpenes: safeParseJSON(review.terpenes),
            aromas: safeParseJSON(review.aromas),
            tastes: safeParseJSON(review.tastes),
            effects: safeParseJSON(review.effects),
            tags: [
                ...safeParseJSON(review.terpenes),
                ...safeParseJSON(review.aromas),
                ...safeParseJSON(review.tastes),
                ...safeParseJSON(review.effects)
            ].slice(0, 10),
            category: review.type,
            ownerName: review.ownerName || review.author?.username || 'Anonyme',
            date: review.createdAt,
            cultivar: review.cultivars,
            breeder: review.breeder || review.hashmaker,
            farm: review.farm
        }
    }

    return (
        <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] transform">
            {/* Image Grid adaptatif - Toujours afficher les vraies images */}
            <div
                className="relative bg-gray-900 aspect-square overflow-hidden"
                onClick={handleCardClick}
            >
                {images && images.length > 0 ? (
                    <>
                        {/* 1 image - Pleine largeur */}
                        {images.length === 1 && (
                            <div className="relative w-full h-full overflow-hidden">
                                <img
                                    src={images[0]}
                                    alt={review.holderName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        )}

                        {/* 2 images - Gauche / Droite */}
                        {images.length === 2 && (
                            <div className="grid grid-cols-2 gap-1 h-full">
                                {images.slice(0, 2).map((img, idx) => (
                                    <div key={idx} className="relative overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`${review.holderName} ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3 images - 2 en haut (gauche/droite), 1 en dessous (horizontal pleine largeur) */}
                        {images.length === 3 && (
                            <div className="grid grid-rows-[1fr,1fr] gap-1 h-full">
                                <div className="grid grid-cols-2 gap-1">
                                    {images.slice(0, 2).map((img, idx) => (
                                        <div key={idx} className="relative overflow-hidden">
                                            <img
                                                src={img}
                                                alt={`${review.holderName} ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative overflow-hidden">
                                    <img
                                        src={images[2]}
                                        alt={`${review.holderName} 3`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </div>
                        )}

                        {/* 4+ images - Une dans chaque coin (2x2) */}
                        {images.length >= 4 && (
                            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                                {images.slice(0, 4).map((img, idx) => (
                                    <div key={idx} className="relative overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`${review.holderName} ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                        <span className="text-8xl opacity-20">
                            {getTypeIcon(review.type)}
                        </span>
                    </div>
                )}

                {/* Rating badge flottant - toujours visible */}
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-gradient-to-r ${rating >= 9 ? 'from-green-500 to-emerald-600' : rating >= 7 ? 'from-yellow-500 to-amber-600' : rating >= 5 ? 'from-orange-500 to-red-600' : 'from-red-500 ' } backdrop-blur-xl shadow-xl flex items-center gap-1`}>
                    <span className="text-white font-black text-lg">{rating}</span>
                    <span className="text-white/90 text-xs font-bold">/10</span>
                </div>
            </div>

            {/* Like/Dislike buttons */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0 flex flex-col gap-2 z-20">
                <button
                    onClick={(e) => onLike(review.id, e)}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-l-2xl shadow-2xl transition-all duration-300 group/like ${review.userLikeState === 'like' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/50 scale-110' : 'bg-gray-800/95 backdrop-blur-xl text-gray-400 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 hover:text-white hover:scale-110' }`}
                >
                    <svg className="w-5 h-5 group-hover/like:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-xs font-black mt-0.5">{review.likesCount || 0}</span>
                </button>
                <button
                    onClick={(e) => onDislike(review.id, e)}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-l-2xl shadow-2xl transition-all duration-300 group/dislike ${review.userLikeState === 'dislike' ? 'bg-gradient-to-br from-red-500 text-white shadow-red-500/50 scale-110' : 'bg-gray-800/95 backdrop-blur-xl text-gray-400 hover:bg-gradient-to-br hover:from-red-500 hover: hover:text-white hover:scale-110' }`}
                >
                    <svg className="w-5 h-5 group-hover/dislike:scale-125 transition-transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-xs font-black mt-0.5">{review.dislikesCount || 0}</span>
                </button>
            </div>

            {/* Review Info */}
            <div className="p-5 space-y-3">
                {/* Type + Nom */}
                <div onClick={handleCardClick} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">
                            {getTypeIcon(review.type)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r /20 /20 border /30 text-xs font-bold uppercase tracking-wider">
                            {review.type}
                        </span>
                    </div>
                    <h3 className="font-black text-white text-xl group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                        {review.holderName}
                    </h3>
                </div>

                {/* Description */}
                {review.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {review.description}
                    </p>
                )}

                {/* Auteur - Avatar avec première lettre clairement visible */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onAuthorClick(review.authorId || review.ownerId || review.author?.id)
                    }}
                    className="w-full mt-3 p-3 rounded-2xl bg-theme-accent border-2 border-theme-accent hover:border-[rgb(var(--color-accent))] backdrop-blur-xl transition-all duration-300 group/author hover:shadow-lg hover:shadow-[rgba(var(--color-accent),0.3)] hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-3">
                        {review.author?.avatar ? (
                            <img
                                src={review.author.avatar}
                                alt={review.author.username}
                                className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-[rgba(var(--color-accent),0.5)] group-hover/author:scale-110 transition-transform"
                                onError={(e) => {
                                    // Fallback to initial if image fails to load
                                    e.target.style.display = 'none'
                                    e.target.nextElementSibling.style.display = 'flex'
                                }}
                            />
                        ) : null}
                        <div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] flex items-center justify-center text-white text-base font-black shadow-lg shadow-[rgba(var(--color-accent),0.5)] group-hover/author:scale-110 transition-transform"
                            style={{ display: review.author?.avatar ? 'none' : 'flex' }}
                        >
                            {(review.ownerName || review.author?.username || 'A')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-xs text-[rgb(var(--text-secondary))] opacity-70 font-medium uppercase tracking-wide">Créé par</div>
                            <div className="text-sm font-black text-[rgb(var(--text-primary))] group-hover/author:text-[rgb(var(--color-accent))] transition-colors">
                                {review.ownerName || review.author?.username || 'Anonyme'}
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-[rgb(var(--color-accent))] group-hover/author:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* Date */}
                <div className="flex items-center justify-center pt-2 text-xs text-gray-500 font-medium">
                    📅 {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            </div>
        </div>
    )
}

HomeReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        holderName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        description: PropTypes.string,
        images: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        overallRating: PropTypes.number,
        note: PropTypes.number,
        likesCount: PropTypes.number,
        dislikesCount: PropTypes.number,
        userLikeState: PropTypes.oneOf(['like', 'dislike', null]),
        createdAt: PropTypes.string.isRequired,
        ownerName: PropTypes.string,
        ownerId: PropTypes.string,
        authorId: PropTypes.string,
        author: PropTypes.shape({
            id: PropTypes.string,
            username: PropTypes.string
        })
    }).isRequired,
    onLike: PropTypes.func.isRequired,
    onDislike: PropTypes.func.isRequired,
    onAuthorClick: PropTypes.func.isRequired
}

