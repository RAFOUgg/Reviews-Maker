import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ReviewDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReview()
    }, [id])

    const fetchReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${id}`)
            if (response.ok) {
                const data = await response.json()
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
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>←</span>
                    <span>Retour</span>
                </button>

                {/* Review Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{review.holderName}</h1>
                            <p className="text-gray-400 text-lg">{review.type}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-green-400">
                                {review.overallRating}/10
                            </div>
                            <p className="text-gray-500 text-sm mt-1">Note globale</p>
                        </div>
                    </div>

                    {/* Description */}
                    {review.description && (
                        <div className="border-t border-gray-700 pt-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                            <p className="text-gray-300 leading-relaxed">{review.description}</p>
                        </div>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div className="border-t border-gray-700 pt-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Photos</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {review.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`${review.holderName} ${index + 1}`}
                                        className="rounded-lg w-full h-48 object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="border-t border-gray-700 pt-6 flex justify-between text-sm">
                        <span className="text-gray-400">
                            Par <span className="text-white font-medium">{review.ownerName || 'Anonyme'}</span>
                        </span>
                        <span className="text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
