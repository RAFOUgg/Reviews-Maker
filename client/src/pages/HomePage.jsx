import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function HomePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)
    const [selectedAuthor, setSelectedAuthor] = useState(null)

    // Filtres
    const [filters, setFilters] = useState({
        type: 'all', // all, Fleur, Hash, Concentré, Comestible
        minRating: 0,
        sortBy: 'date' // date, rating
    })

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/reviews')
            if (response.ok) {
                const data = await response.json()
                // Initialiser likesCount et dislikesCount si non définis
                const reviewsWithCounts = data.map(review => ({
                    ...review,
                    likesCount: review.likesCount || 0,
                    dislikesCount: review.dislikesCount || 0,
                    userLikeState: review.userLikeState || null
                }))
                setReviews(reviewsWithCounts)
            }
        } catch (error) {
            console.error('Erreur chargement reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const productTypes = [
        { name: 'Fleur', icon: '🌿', gradient: 'from-green-500 via-emerald-500 to-teal-500', color: 'green' },
        { name: 'Hash', icon: '🍫', gradient: 'from-amber-500 via-yellow-600 to-orange-500', color: 'amber' },
        { name: 'Concentré', icon: '🔮', gradient: 'from-purple-500 via-violet-500 to-indigo-500', color: 'purple' },
        { name: 'Comestible', icon: '🍰', gradient: 'from-pink-500 via-rose-500 to-red-500', color: 'pink' }
    ]

    const handleCreateReview = (type) => {
        if (!isAuthenticated) {
            alert('Vous devez être connecté pour créer une review')
            return
        }
        navigate(`/create?type=${type}`)
    }

    const handleLike = async (reviewId, e) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            alert('Connectez-vous pour liker')
            return
        }

        try {
            const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}/like`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Erreur lors du like')
            }

            const result = await response.json()

            // Mettre à jour localement les reviews
            setReviews(prevReviews =>
                prevReviews.map(review =>
                    review.id === reviewId
                        ? {
                            ...review,
                            likesCount: result.action === 'removed'
                                ? review.likesCount - 1
                                : result.action === 'added'
                                    ? review.likesCount + 1
                                    : review.dislikesCount > 0 && result.action === 'updated'
                                        ? review.likesCount + 1
                                        : review.likesCount,
                            dislikesCount: result.action === 'updated' && review.dislikesCount > 0
                                ? review.dislikesCount - 1
                                : review.dislikesCount,
                            userLikeState: result.action === 'removed' ? null : 'like'
                        }
                        : review
                )
            )
        } catch (error) {
            console.error('Erreur like:', error)
            alert('Erreur lors du like')
        }
    }

    const handleDislike = async (reviewId, e) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            alert('Connectez-vous pour disliker')
            return
        }

        try {
            const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}/dislike`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Erreur lors du dislike')
            }

            const result = await response.json()

            // Mettre à jour localement les reviews
            setReviews(prevReviews =>
                prevReviews.map(review =>
                    review.id === reviewId
                        ? {
                            ...review,
                            dislikesCount: result.action === 'removed'
                                ? review.dislikesCount - 1
                                : result.action === 'added'
                                    ? review.dislikesCount + 1
                                    : review.likesCount > 0 && result.action === 'updated'
                                        ? review.dislikesCount + 1
                                        : review.dislikesCount,
                            likesCount: result.action === 'updated' && review.likesCount > 0
                                ? review.likesCount - 1
                                : review.likesCount,
                            userLikeState: result.action === 'removed' ? null : 'dislike'
                        }
                        : review
                )
            )
        } catch (error) {
            console.error('Erreur dislike:', error)
            alert('Erreur lors du dislike')
        }
    }

    // Filtrer et trier les reviews
    const filteredReviews = reviews
        .filter(r => {
            if (filters.type !== 'all' && r.type !== filters.type) return false
            const rating = r.overallRating || r.note || 0
            if (rating < filters.minRating) return false
            return true
        })
        .sort((a, b) => {
            if (filters.sortBy === 'rating') {
                const ratingA = a.overallRating || a.note || 0
                const ratingB = b.overallRating || b.note || 0
                return ratingB - ratingA
            }
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Section avec animation */}
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="relative inline-block">
                        <h1 className="text-7xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                            Reviews-Maker
                        </h1>
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 blur-2xl -z-10"></div>
                    </div>
                    <p className="text-xl text-gray-300 font-light">
                        Créez et partagez vos avis sur les produits cannabis
                    </p>
                    {isAuthenticated && (
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                            <span className="text-gray-300">Bienvenue</span>
                            <span className="font-bold text-green-400">{user?.username}</span>
                            <span className="text-2xl">👋</span>
                        </div>
                    )}
                </div>

                {/* Create Review Section avec cards stylisées */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {isAuthenticated ? 'Créer une nouvelle review' : 'Connectez-vous pour créer'}
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Choisissez le type de produit à reviewer
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {productTypes.map((type) => (
                            <button
                                key={type.name}
                                onClick={() => handleCreateReview(type.name)}
                                disabled={!isAuthenticated}
                                className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform ${isAuthenticated
                                    ? 'hover:scale-110 hover:rotate-2 cursor-pointer shadow-2xl hover:shadow-green-500/50'
                                    : 'opacity-40 cursor-not-allowed'
                                    }`}
                            >
                                {/* Gradient Background avec animation */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                {/* Content */}
                                <div className="relative z-10 space-y-4">
                                    <div className="text-6xl transform group-hover:scale-125 transition-transform duration-500">
                                        {type.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-white drop-shadow-lg">
                                        {type.name}
                                    </h3>
                                </div>

                                {/* Shine effect on hover */}
                                {isAuthenticated && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider stylisé */}
                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-900 px-6 py-2 text-green-400 font-semibold text-lg rounded-full border border-green-500/30">
                            🎯 Galerie Publique
                        </span>
                    </div>
                </div>

                {/* Filtres stylisés */}
                <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700">
                    {/* Type Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters(f => ({ ...f, type: 'all' }))}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${filters.type === 'all'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Tous
                        </button>
                        {productTypes.map(type => (
                            <button
                                key={type.name}
                                onClick={() => setFilters(f => ({ ...f, type: type.name }))}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${filters.type === type.name
                                    ? `bg-${type.color}-600 text-white shadow-lg shadow-${type.color}-600/50`
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <span>{type.icon}</span>
                                <span className="hidden md:inline">{type.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Rating Filter */}
                    <div className="flex items-center gap-3 ml-auto">
                        <label className="text-gray-300 font-semibold">Note min:</label>
                        <select
                            value={filters.minRating}
                            onChange={(e) => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))}
                            className="px-4 py-2 rounded-xl bg-gray-700 text-white font-semibold border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none"
                        >
                            <option value={0}>Toutes</option>
                            <option value={5}>5+</option>
                            <option value={7}>7+</option>
                            <option value={8}>8+</option>
                            <option value={9}>9+</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                            className="px-4 py-2 rounded-xl bg-gray-700 text-white font-semibold border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none"
                        >
                            <option value="date">Plus récent</option>
                            <option value="rating">Mieux noté</option>
                        </select>
                    </div>
                </div>

                {/* Reviews Grid amélioré */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-green-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400 text-lg">Chargement des reviews...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="text-6xl">😕</div>
                        <p className="text-xl text-gray-400">Aucune review ne correspond aux filtres</p>
                        <button
                            onClick={() => setFilters({ type: 'all', minRating: 0, sortBy: 'date' })}
                            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(showAll ? filteredReviews : filteredReviews.slice(0, 8)).map((review) => {
                                const images = typeof review.images === 'string'
                                    ? JSON.parse(review.images)
                                    : (Array.isArray(review.images) ? review.images : [])

                                const rating = review.overallRating || review.note || 0
                                const ratingColor = rating >= 9 ? 'green' : rating >= 7 ? 'yellow' : rating >= 5 ? 'orange' : 'red'

                                return (
                                    <div
                                        key={review.id}
                                        className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] transform"
                                    >
                                        {/* Image Grid adaptatif selon le nombre d'images */}
                                        <div
                                            className="relative bg-gray-900 aspect-square"
                                            onClick={() => navigate(`/review/${review.id}`)}
                                        >
                                            {images && images.length > 0 ? (
                                                <div className={`h-full w-full ${images.length === 1 ? '' :
                                                    images.length === 2 ? 'grid grid-cols-2 gap-1' :
                                                        images.length === 3 ? 'grid grid-rows-2 gap-1' :
                                                            'grid grid-cols-2 grid-rows-2 gap-1'
                                                    }`}>
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

                                                    {images.length === 2 && images.slice(0, 2).map((img, idx) => (
                                                        <div key={idx} className="relative overflow-hidden">
                                                            <img
                                                                src={img}
                                                                alt={`${review.holderName} ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        </div>
                                                    ))}

                                                    {images.length === 3 && (
                                                        <>
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
                                                        </>
                                                    )}

                                                    {images.length >= 4 && images.slice(0, 4).map((img, idx) => (
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
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                                                    <span className="text-8xl opacity-20">
                                                        {review.type === 'Fleur' ? '🌿' :
                                                            review.type === 'Hash' ? '🍫' :
                                                                review.type === 'Concentré' ? '🔮' : '🍰'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rating badge flottant - Top Left */}
                                            <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-gradient-to-r ${rating >= 9 ? 'from-green-500 to-emerald-600' :
                                                rating >= 7 ? 'from-yellow-500 to-amber-600' :
                                                    rating >= 5 ? 'from-orange-500 to-red-600' : 'from-red-500 to-pink-600'
                                                } backdrop-blur-xl shadow-xl flex items-center gap-1`}>
                                                <span className="text-white font-black text-lg">{rating}</span>
                                                <span className="text-white/90 text-xs font-bold">/10</span>
                                            </div>
                                        </div>

                                        {/* Like/Dislike - À cheval sur la bordure (milieu droit) */}
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0 flex flex-col gap-2 z-20">
                                            <button
                                                onClick={(e) => handleLike(review.id, e)}
                                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-l-2xl shadow-2xl transition-all duration-300 group/like ${review.userLikeState === 'like'
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/50 scale-110'
                                                    : 'bg-gray-800/95 backdrop-blur-xl text-gray-400 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 hover:text-white hover:scale-110'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 group-hover/like:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                </svg>
                                                <span className="text-xs font-black mt-0.5">{review.likesCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDislike(review.id, e)}
                                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-l-2xl shadow-2xl transition-all duration-300 group/dislike ${review.userLikeState === 'dislike'
                                                    ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-500/50 scale-110'
                                                    : 'bg-gray-800/95 backdrop-blur-xl text-gray-400 hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 hover:text-white hover:scale-110'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 group-hover/dislike:scale-125 transition-transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                </svg>
                                                <span className="text-xs font-black mt-0.5">{review.dislikesCount || 0}</span>
                                            </button>
                                        </div>

                                        {/* Review Info - Redesign complet */}
                                        <div className="p-5 space-y-3">
                                            {/* Type en emoji + Nom de la variété */}
                                            <div onClick={() => navigate(`/review/${review.id}`)} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-3xl">
                                                        {review.type === 'Fleur' ? '🌿' :
                                                            review.type === 'Hash' ? '🍫' :
                                                                review.type === 'Concentré' ? '🔮' : '🍰'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                                        {review.type}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-white text-xl group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                                                    {review.holderName}
                                                </h3>
                                            </div>

                                            {/* Infos principales claires */}
                                            {review.description && (
                                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                    {review.description}
                                                </p>
                                            )}

                                            {/* Auteur en évidence avec encadrement stylé */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedAuthor(review.authorId || review.ownerId || review.author?.id)
                                                }}
                                                className="w-full mt-3 p-3 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-500/30 hover:border-green-400 backdrop-blur-xl transition-all duration-300 group/author hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-green-500/50 group-hover/author:scale-110 transition-transform">
                                                        {(review.ownerName || review.author?.username || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Créé par</div>
                                                        <div className="text-sm font-black text-white group-hover/author:text-green-400 transition-colors">
                                                            {review.ownerName || review.author?.username || 'Anonyme'}
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-green-500 group-hover/author:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {/* Date en bas */}
                                            <div className="flex items-center justify-center pt-2 text-xs text-gray-500 font-medium">
                                                📅 {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Show More Button amélioré */}
                        {filteredReviews.length > 8 && (
                            <div className="text-center pt-8">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-lg hover:from-green-700 hover:to-emerald-700 transition-all hover:scale-110 shadow-2xl hover:shadow-green-600/50 transform"
                                >
                                    <svg className={`w-6 h-6 transition-transform duration-500 ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span>{showAll ? 'Afficher moins' : `Afficher plus (${filteredReviews.length - 8} restantes)`}</span>
                                </button>
                            </div>
                        )}

                        {/* Author Stats Modal amélioré */}
                        {selectedAuthor && (
                            <div
                                className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
                                onClick={() => setSelectedAuthor(null)}
                            >
                                <div
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-3xl w-full border border-green-500/30 shadow-2xl shadow-green-500/20 transform scale-100 animate-scale-in"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <h3 className="text-3xl font-black text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                            📊 Statistiques Publiques
                                        </h3>
                                        <button
                                            onClick={() => setSelectedAuthor(null)}
                                            className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Author Info avec avatar stylisé */}
                                    <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-6 mb-6 border border-gray-700">
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-xl">
                                                    {(reviews.find(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)?.ownerName ||
                                                        reviews.find(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)?.author?.username ||
                                                        'A')[0].toUpperCase()}
                                                </div>
                                                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-emerald-600/50 rounded-full blur-xl -z-10"></div>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-white">
                                                    {reviews.find(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)?.ownerName ||
                                                        reviews.find(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)?.author?.username ||
                                                        'Anonyme'}
                                                </h4>
                                                <p className="text-green-400 font-semibold">🎖️ Membre Actif</p>
                                            </div>
                                        </div>

                                        {/* Stats Grid avec glassmorphism */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center border border-green-500/30 hover:scale-105 transition-transform">
                                                <p className="text-4xl font-black text-green-400 mb-2">
                                                    {reviews.filter(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor).length}
                                                </p>
                                                <p className="text-sm text-gray-400 font-semibold">📝 Reviews</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl p-6 text-center border border-purple-500/30 hover:scale-105 transition-transform">
                                                <p className="text-4xl font-black text-purple-400 mb-2">
                                                    {(reviews
                                                        .filter(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)
                                                        .reduce((acc, r) => acc + (r.overallRating || r.note || 0), 0) /
                                                        reviews.filter(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor).length
                                                    ).toFixed(1)}
                                                </p>
                                                <p className="text-sm text-gray-400 font-semibold">⭐ Note moy.</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 text-center border border-blue-500/30 hover:scale-105 transition-transform">
                                                <p className="text-4xl font-black text-blue-400 mb-2">
                                                    {reviews.filter(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor).reduce((acc, r) => acc + (r.views || 0), 0)}
                                                </p>
                                                <p className="text-sm text-gray-400 font-semibold">👁️ Vues</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Reviews */}
                                    <div>
                                        <h5 className="text-xl font-bold text-white mb-4">🔥 Reviews récentes</h5>
                                        <div className="space-y-3">
                                            {reviews
                                                .filter(r => r.ownerId === selectedAuthor || r.authorId === selectedAuthor)
                                                .slice(0, 3)
                                                .map(review => (
                                                    <button
                                                        key={review.id}
                                                        className="w-full bg-gray-900 rounded-xl p-4 flex justify-between items-center hover:bg-gray-800 transition-all border border-gray-700 hover:border-green-500 group"
                                                        onClick={() => {
                                                            setSelectedAuthor(null)
                                                            navigate(`/review/${review.id}`)
                                                        }}
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-white font-bold group-hover:text-green-400 transition-colors">{review.holderName}</p>
                                                            <p className="text-xs text-gray-400">{review.type}</p>
                                                        </div>
                                                        <span className="text-2xl font-black text-green-400">{review.overallRating || review.note}/10</span>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Animations CSS */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
