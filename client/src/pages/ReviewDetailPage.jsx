import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseImages } from '../utils/imageUtils'
import TemplateRenderer from '../components/orchard/TemplateRenderer'
import ReviewFullDisplay from '../components/ReviewFullDisplay'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'

export default function ReviewDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated } = useStore()
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(null)
    const [viewMode, setViewMode] = useState('full') // 'full' or 'orchard'

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
                    // Erreur silencieuse lors du parsing JSON
                }

                setReview(data)
            } else {
                const error = await response.json().catch(() => ({ message: 'Review non trouvée' }))
                toast.error(error.message || 'Review non trouvée')
                navigate('/')
            }
        } catch (error) {
            toast.error('Erreur lors du chargement de la review')
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

                {/* View Mode Switcher - Only show if Orchard config exists */}
                {review.orchardConfig && (
                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={() => setViewMode('full')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${viewMode === 'full'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                }`}
                        >
                            📋 Vue Détaillée
                        </button>
                        <button
                            onClick={() => setViewMode('orchard')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${viewMode === 'orchard'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                }`}
                        >
                            🎨 Aperçu Orchard
                        </button>
                    </div>
                )}

                {/* Orchard Template Preview */}
                {viewMode === 'orchard' && review.orchardConfig ? (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <TemplateRenderer
                            config={typeof review.orchardConfig === 'string' ? (() => {
                                try { return JSON.parse(review.orchardConfig) } catch { return review.orchardConfig }
                            })() : review.orchardConfig}
                            reviewData={{
                                // Start from raw review so fields like mainImageUrl are present
                                ...review,

                                // Mapping des données de review aux propriétés attendues par les templates (override)
                                title: review.holderName,
                                rating: review.overallRating || review.note || 0,
                                imageUrl: review.mainImageUrl || (review.images && review.images.length > 0 ? review.images[0] : null),
                                images: review.images || [],
                                tags: [
                                    ...(review.terpenes || []),
                                    ...(review.aromas || []),
                                    ...(review.tastes || []),
                                    ...(review.effects || [])
                                ].slice(0, 10), // Limiter à 10 tags
                                category: review.type,
                                description: review.description,
                                ownerName: review.ownerName || review.author?.username || 'Anonyme',
                                date: review.createdAt,
                                cultivar: review.cultivars,
                                breeder: review.breeder || review.hashmaker,
                                farm: review.farm
                            }}
                        />
                    </div>
                ) : (
                    /* Full Review Display - Always show by default or if no Orchard config */
                    <ReviewFullDisplay review={review} />
                )}
            </div>
        </div>
    )
}
