import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { parseImages, getMainImageUrl } from '../utils/imageUtils'
import FilterBar from '../components/FilterBar'

export default function HomePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [reviews, setReviews] = useState([])
    const [filteredReviews, setFilteredReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)
    const [selectedAuthor, setSelectedAuthor] = useState(null)

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/reviews')
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
                setFilteredReviews(data)
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
        // TODO: Implémenter like API
        console.log('Like:', reviewId)
    }

    const handleDislike = async (reviewId, e) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            alert('Connectez-vous pour disliker')
            return
        }
        // TODO: Implémenter dislike API
        console.log('Dislike:', reviewId)
    }

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

                {/* FilterBar Component */}
                <FilterBar reviews={reviews} onFilteredChange={setFilteredReviews} />

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
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(showAll ? filteredReviews : filteredReviews.slice(0, 8)).map((review) => {
                                const images = parseImages(review.images)

                                const rating = review.overallRating || review.note || 0
                                const ratingColor = rating >= 9 ? 'green' : rating >= 7 ? 'yellow' : rating >= 5 ? 'orange' : 'red'

                                return (
                                    <div
                                        key={review.id}
                                        className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105 transform"
                                    >
                                        {/* Image Grid 2x2 avec overlay gradient */}
                                        <div
                                            className="relative grid grid-cols-2 gap-1 bg-gray-900 aspect-square"
                                            onClick={() => navigate(`/review/${review.id}`)}
                                        >
                                            {images && images.length > 0 ? (
                                                <>
                                                    {images.slice(0, 4).map((img, idx) => (
                                                        <div key={idx} className="relative aspect-square overflow-hidden">
                                                            <img
                                                                src={img}
                                                                alt={`${review.holderName} ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        </div>
                                                    ))}
                                                    {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, idx) => (
                                                        <div key={`empty-${idx}`} className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-square flex items-center justify-center">
                                                            <span className="text-gray-600 text-4xl">🌿</span>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="col-span-2 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                                                    <span className="text-8xl opacity-20">
                                                        {review.type === 'Fleur' ? '🌿' :
                                                            review.type === 'Hash' ? '🍫' :
                                                                review.type === 'Concentré' ? '🔮' : '🍰'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rating badge flottant */}
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-${ratingColor}-500 to-${ratingColor}-600 backdrop-blur-xl shadow-lg flex items-center gap-1`}>
                                                <span className="text-white font-black text-sm">{rating}</span>
                                                <span className="text-white/80 text-xs">/10</span>
                                            </div>

                                            {/* Type badge */}
                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl text-white text-xs font-semibold">
                                                {review.type}
                                            </div>
                                        </div>

                                        {/* Review Info avec glassmorphism */}
                                        <div className="p-4 space-y-3">
                                            <div onClick={() => navigate(`/review/${review.id}`)}>
                                                <h3 className="font-black text-white text-lg group-hover:text-green-400 transition-colors line-clamp-1">
                                                    {review.holderName}
                                                </h3>
                                            </div>

                                            {/* Author avec hover effect */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedAuthor(review.authorId || review.ownerId || review.author?.id)
                                                }}
                                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-all group/author"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold group-hover/author:scale-110 transition-transform">
                                                    {(review.ownerName || review.author?.username || 'A')[0].toUpperCase()}
                                                </div>
                                                <span className="font-semibold group-hover/author:underline">
                                                    {review.ownerName || review.author?.username || 'Anonyme'}
                                                </span>
                                            </button>

                                            {/* Actions (Like/Dislike) */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleLike(review.id, e)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white transition-all group/like"
                                                    >
                                                        <svg className="w-4 h-4 group-hover/like:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                        </svg>
                                                        <span className="text-xs font-bold">{review.likes || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDislike(review.id, e)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-all group/dislike"
                                                    >
                                                        <svg className="w-4 h-4 group-hover/dislike:scale-125 transition-transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                        </svg>
                                                        <span className="text-xs font-bold">{review.dislikes || 0}</span>
                                                    </button>
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
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
