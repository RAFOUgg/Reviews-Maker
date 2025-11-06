import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseImages } from '../utils/imageUtils'
import { useStore } from '../store/useStore'

export default function ReviewDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(null)

    useEffect(() => {
        fetchReview()
    }, [id])

    const fetchReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${id}`)
            if (response.ok) {
                const data = await response.json()
                // Parse images to full URLs
                data.images = parseImages(data.images)

                // Parse JSON fields
                try {
                    if (typeof data.categoryRatings === 'string') {
                        data.categoryRatings = JSON.parse(data.categoryRatings)
                    }
                    if (typeof data.aromas === 'string') {
                        data.aromas = JSON.parse(data.aromas)
                    }
                    if (typeof data.tastes === 'string') {
                        data.tastes = JSON.parse(data.tastes)
                    }
                    if (typeof data.effects === 'string') {
                        data.effects = JSON.parse(data.effects)
                    }
                    if (typeof data.cultivarsList === 'string') {
                        data.cultivarsList = JSON.parse(data.cultivarsList)
                    }
                    if (typeof data.pipelineExtraction === 'string') {
                        data.pipelineExtraction = JSON.parse(data.pipelineExtraction)
                    }
                    if (typeof data.pipelineSeparation === 'string') {
                        data.pipelineSeparation = JSON.parse(data.pipelineSeparation)
                    }
                } catch (e) {
                    console.error('Error parsing JSON fields:', e)
                }

                setReview(data)
            } else {
                navigate('/')
            }
        } catch (error) {
            console.error('Erreur:', error)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating / 2)
        const hasHalfStar = (rating % 2) >= 0.5
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-xl">⭐</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400 text-xl">✨</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-600 text-xl">⭐</span>
                ))}
                <span className="ml-2 text-gray-400 text-sm font-medium">{rating}/10</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-xl">Chargement...</div>
            </div>
        )
    }

    if (!review) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back & Edit Buttons */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Retour à la galerie</span>
                    </button>

                    {isAuthenticated && user?.id === review.authorId && (
                        <button
                            onClick={() => navigate(`/edit/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Éditer</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Meta */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Main Image / Gallery */}
                        {review.images && review.images.length > 0 && (
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700">
                                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
                                    <img
                                        src={review.images[0]}
                                        alt={review.holderName}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onClick={() => setSelectedImage(review.images[0])}
                                    />
                                </div>
                                {review.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {review.images.slice(1, 5).map((image, index) => (
                                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-900">
                                                <img
                                                    src={image}
                                                    alt={`${review.holderName} ${index + 2}`}
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-200"
                                                    onClick={() => setSelectedImage(image)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Meta Info Card */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 space-y-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Type de produit</p>
                                <p className="text-white font-medium text-lg">{review.type}</p>
                            </div>
                            {review.cultivars && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Cultivar</p>
                                    <p className="text-white font-medium">{review.cultivars}</p>
                                </div>
                            )}
                            {review.breeder && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Breeder</p>
                                    <p className="text-white font-medium">{review.breeder}</p>
                                </div>
                            )}
                            {review.farm && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Farm</p>
                                    <p className="text-white font-medium">{review.farm}</p>
                                </div>
                            )}
                            {review.hashmaker && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Hash Maker</p>
                                    <p className="text-white font-medium">{review.hashmaker}</p>
                                </div>
                            )}
                            {review.dureeEffet && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">⏱️ Durée des effets</p>
                                    <p className="text-white font-medium">{review.dureeEffet}</p>
                                </div>
                            )}
                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <p className="text-gray-500 text-xs mb-1">Publié par</p>
                                <p className="text-white font-medium">{review.ownerName || 'Anonyme'}</p>
                                <p className="text-gray-500 text-xs mt-2">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                            <h1 className="text-4xl font-bold text-white mb-4">{review.holderName}</h1>

                            {/* Overall Rating */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-green-400 mb-2">
                                        {review.overallRating || review.note}/10
                                    </div>
                                    <p className="text-gray-400 text-sm">Note globale</p>
                                </div>
                                <div className="flex-1">
                                    {renderStars(review.overallRating || review.note || 0)}
                                </div>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        {review.categoryRatings && Object.keys(review.categoryRatings).length > 0 && (
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span>📊</span>
                                    <span>Évaluations Détaillées</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {review.categoryRatings.visual && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-300 font-medium">👁️ Visuel & Technique</span>
                                                <span className="text-green-400 font-bold text-lg">{review.categoryRatings.visual}/10</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${(review.categoryRatings.visual / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {review.categoryRatings.smell && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-300 font-medium">👃 Intensité Odeurs & Arômes</span>
                                                <span className="text-green-400 font-bold text-lg">{review.categoryRatings.smell}/10</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${(review.categoryRatings.smell / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {review.categoryRatings.taste && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-300 font-medium">👅 Intensité Goûts & Saveurs</span>
                                                <span className="text-green-400 font-bold text-lg">{review.categoryRatings.taste}/10</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${(review.categoryRatings.taste / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {review.categoryRatings.effects && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-300 font-medium">⚡ Intensité des Effets</span>
                                                <span className="text-green-400 font-bold text-lg">{review.categoryRatings.effects}/10</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${(review.categoryRatings.effects / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Aromas, Tastes, Effects */}
                        {(review.aromas?.length > 0 || review.tastes?.length > 0 || review.effects?.length > 0) && (
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                                <h2 className="text-2xl font-bold text-white mb-6">🌿 Profil Sensoriel</h2>
                                <div className="space-y-6">
                                    {review.aromas?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-300 mb-3">🌸 Arômes</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {review.aromas.map((aroma, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-700/50">
                                                        {aroma}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {review.tastes?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-300 mb-3">👅 Saveurs</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {review.tastes.map((taste, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-amber-900/30 text-amber-300 rounded-full text-sm border border-amber-700/50">
                                                        {taste}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {review.effects?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-300 mb-3">⚡ Effets</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {review.effects.map((effect, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-700/50">
                                                        {effect}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cultivars List (for Hash/Concentré) */}
                        {review.cultivarsList && review.cultivarsList.length > 0 && (
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                                <h2 className="text-2xl font-bold text-white mb-6">🌱 Cultivars Utilisés</h2>
                                <div className="space-y-4">
                                    {review.cultivarsList.map((cultivar, idx) => (
                                        <div key={idx} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-white">{cultivar.cultivar}</h3>
                                                {cultivar.percentage && (
                                                    <span className="text-green-400 font-bold">{cultivar.percentage}%</span>
                                                )}
                                            </div>
                                            {cultivar.breeder && (
                                                <p className="text-gray-400 text-sm">Breeder: {cultivar.breeder}</p>
                                            )}
                                            {cultivar.matiere && (
                                                <p className="text-gray-400 text-sm">Matière: {cultivar.matiere}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            ×
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
