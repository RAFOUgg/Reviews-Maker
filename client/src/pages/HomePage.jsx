import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function HomePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

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

                {/* Reviews Grid */}
                {loading ? (
                    <div className="text-center text-gray-400 py-12">
                        Chargement des reviews...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <p className="text-xl mb-2">Aucune review pour le moment</p>
                        <p className="text-sm">Soyez le premier à créer une review !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => navigate(`/review/${review.id}`)}
                                className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-green-600 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-green-600/20"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                                            {review.holderName}
                                        </h3>
                                        <p className="text-sm text-gray-400">{review.type}</p>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">
                                        {review.overallRating || review.note}/10
                                    </div>
                                </div>

                                <p className="text-gray-300 mb-4 line-clamp-3">
                                    {review.description || 'Pas de description'}
                                </p>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        Par {review.ownerName || review.author || 'Anonyme'}
                                    </span>
                                    <span className="text-gray-600">
                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
