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

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/reviews')
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            }
        } catch (error) {
            console.error('Erreur chargement reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const productTypes = [
        { name: 'Fleur', icon: '🌿', gradient: 'from-green-600 to-green-400' },
        { name: 'Hash', icon: '🟫', gradient: 'from-amber-600 to-amber-400' },
        { name: 'Concentré', icon: '🔮', gradient: 'from-purple-600 to-purple-400' },
        { name: 'Comestible', icon: '🍰', gradient: 'from-pink-600 to-pink-400' }
    ]

    const handleCreateReview = (type) => {
        if (!isAuthenticated) {
            alert('Vous devez être connecté pour créer une review')
            return
        }
        navigate(`/create?type=${type}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Reviews-Maker
                    </h1>
                    <p className="text-xl text-gray-300">
                        Créez et partagez vos avis sur les produits cannabis
                    </p>
                    {isAuthenticated && (
                        <p className="text-lg text-green-400 flex items-center justify-center gap-2">
                            <span>Bienvenue</span>
                            <span className="font-semibold">{user?.username}</span>
                            <span>👋</span>
                        </p>
                    )}
                </div>

                {/* Create Review Section */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isAuthenticated ? 'Créer une nouvelle review' : 'Connectez-vous pour créer une review'}
                        </h2>
                        <p className="text-gray-400">
                            Choisissez le type de produit à reviewer
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {productTypes.map((type) => (
                            <button
                                key={type.name}
                                onClick={() => handleCreateReview(type.name)}
                                disabled={!isAuthenticated}
                                className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${isAuthenticated
                                    ? 'hover:scale-105 hover:shadow-2xl cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                                {/* Content */}
                                <div className="relative z-10 space-y-3">
                                    <div className="text-5xl">{type.icon}</div>
                                    <h3 className="text-xl font-bold text-white">{type.name}</h3>
                                </div>

                                {/* Hover Effect */}
                                {isAuthenticated && (
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-semibold">Créer une review</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {!isAuthenticated && (
                        <p className="text-center text-gray-500 text-sm">
                            Connectez-vous avec Discord pour commencer à créer des reviews
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-900 px-4 text-gray-400 text-sm">
                            Galerie publique
                        </span>
                    </div>
                </div>

                {/* Reviews Grid - 4x2 avec expand */}
                {loading ? (
                    <div className="text-center text-gray-400 py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4">Chargement des reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <p className="text-xl mb-2">Aucune review pour le moment</p>
                        <p className="text-sm">Soyez le premier à créer une review !</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(showAll ? reviews : reviews.slice(0, 8)).map((review) => (
                                <div
                                    key={review.id}
                                    className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 hover:border-green-600 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-green-600/20"
                                >
                                    {/* Image Grid 2x2 */}
                                    <div className="grid grid-cols-2 gap-1 bg-gray-900 aspect-square">
                                        {review.images && review.images.length > 0 ? (
                                            <>
                                                {review.images.slice(0, 4).map((img, idx) => (
                                                    <div key={idx} className="bg-gray-700 aspect-square overflow-hidden">
                                                        <img
                                                            src={img}
                                                            alt={`${review.holderName} ${idx + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ))}
                                                {/* Fill remaining spaces if less than 4 images */}
                                                {Array.from({ length: Math.max(0, 4 - (review.images?.length || 0)) }).map((_, idx) => (
                                                    <div key={`empty-${idx}`} className="bg-gray-700 aspect-square flex items-center justify-center">
                                                        <span className="text-gray-600 text-4xl">🌿</span>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            // No images - show product emoji
                                            <div className="col-span-2 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                <span className="text-6xl">
                                                    {review.type === 'Fleur' ? '🌿' :
                                                        review.type === 'Hash' ? '🟫' :
                                                            review.type === 'Concentré' ? '🔮' : '🍰'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Info */}
                                    <div 
                                        className="p-4 space-y-2"
                                        onClick={() => navigate(`/review/${review.id}`)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">
                                                    {review.holderName}
                                                </h3>
                                                <p className="text-xs text-gray-400">{review.type}</p>
                                            </div>
                                            <div className="text-lg font-bold text-green-400">
                                                {review.overallRating || review.note || '—'}/10
                                            </div>
                                        </div>

                                        {/* Author (clickable to view stats) */}
                                        <div 
                                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-400 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedAuthor(review.ownerId)
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="hover:underline">
                                                {review.ownerName || review.author || 'Anonyme'}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-600">
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Show More Button */}
                        {reviews.length > 8 && (
                            <div className="text-center pt-6">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all hover:scale-105 shadow-lg hover:shadow-green-600/50"
                                >
                                    <svg className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {showAll ? 'Afficher moins' : `Afficher plus (${reviews.length - 8} restantes)`}
                                </button>
                            </div>
                        )}

                        {/* Author Stats Modal */}
                        {selectedAuthor && (
                            <div 
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setSelectedAuthor(null)}
                            >
                                <div 
                                    className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-2xl font-bold text-white">
                                            Statistiques publiques
                                        </h3>
                                        <button 
                                            onClick={() => setSelectedAuthor(null)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Author Info */}
                                    <div className="bg-gray-900 rounded-xl p-6 mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white">
                                                    {reviews.find(r => r.ownerId === selectedAuthor)?.ownerName}
                                                </h4>
                                                <p className="text-gray-400">Membre</p>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-gray-800 rounded-lg p-4 text-center">
                                                <p className="text-3xl font-bold text-green-400">
                                                    {reviews.filter(r => r.ownerId === selectedAuthor).length}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">Reviews</p>
                                            </div>
                                            <div className="bg-gray-800 rounded-lg p-4 text-center">
                                                <p className="text-3xl font-bold text-purple-400">
                                                    {(reviews
                                                        .filter(r => r.ownerId === selectedAuthor)
                                                        .reduce((acc, r) => acc + (r.overallRating || r.note || 0), 0) /
                                                        reviews.filter(r => r.ownerId === selectedAuthor).length
                                                    ).toFixed(1)}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">Note moyenne</p>
                                            </div>
                                            <div className="bg-gray-800 rounded-lg p-4 text-center">
                                                <p className="text-3xl font-bold text-blue-400">
                                                    {reviews.filter(r => r.ownerId === selectedAuthor).reduce((acc, r) => acc + (r.views || 0), 0)}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">Vues totales</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Reviews Preview */}
                                    <div>
                                        <h5 className="text-lg font-semibold text-white mb-4">Reviews récentes</h5>
                                        <div className="space-y-2">
                                            {reviews
                                                .filter(r => r.ownerId === selectedAuthor)
                                                .slice(0, 3)
                                                .map(review => (
                                                    <div 
                                                        key={review.id}
                                                        className="bg-gray-900 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                                                        onClick={() => {
                                                            setSelectedAuthor(null)
                                                            navigate(`/review/${review.id}`)
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="text-white font-medium">{review.holderName}</p>
                                                            <p className="text-xs text-gray-400">{review.type}</p>
                                                        </div>
                                                        <span className="text-green-400 font-bold">{review.overallRating || review.note}/10</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
