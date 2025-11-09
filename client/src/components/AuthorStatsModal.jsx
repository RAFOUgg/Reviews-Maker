/**
 * AuthorStatsModal Component
 * Modale affichant les stats d'un auteur de review
 */

import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

export default function AuthorStatsModal({
    authorId,
    reviews,
    onClose
}) {
    const navigate = useNavigate()

    if (!authorId) return null

    const authorReviews = reviews.filter(r =>
        r.ownerId === authorId || r.authorId === authorId
    )

    if (authorReviews.length === 0) return null

    const author = authorReviews[0]
    const authorName = author.ownerName || author.author?.username || 'Anonyme'
    const totalReviews = authorReviews.length
    const avgRating = (
        authorReviews.reduce((acc, r) => acc + (r.overallRating || r.note || 0), 0) /
        totalReviews
    ).toFixed(1)
    const totalViews = authorReviews.reduce((acc, r) => acc + (r.views || 0), 0)

    const handleReviewClick = (reviewId) => {
        onClose()
        navigate(`/review/${reviewId}`)
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-3xl w-full border border-green-500/30 shadow-2xl shadow-green-500/20 transform scale-100 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-3xl font-black text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        📊 Statistiques Publiques
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Author Info */}
                <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-6 mb-6 border border-gray-700">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-xl">
                                {authorName[0].toUpperCase()}
                            </div>
                            <div className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-emerald-600/50 rounded-full blur-xl -z-10"></div>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white">
                                {authorName}
                            </h4>
                            <p className="text-green-400 font-semibold">🎖️ Membre Actif</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center border border-green-500/30 hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-green-400 mb-2">
                                {totalReviews}
                            </p>
                            <p className="text-sm text-gray-400 font-semibold">📝 Reviews</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl p-6 text-center border border-purple-500/30 hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-purple-400 mb-2">
                                {avgRating}
                            </p>
                            <p className="text-sm text-gray-400 font-semibold">⭐ Note moy.</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 text-center border border-blue-500/30 hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-blue-400 mb-2">
                                {totalViews}
                            </p>
                            <p className="text-sm text-gray-400 font-semibold">👁️ Vues</p>
                        </div>
                    </div>
                </div>

                {/* Recent Reviews */}
                <div>
                    <h5 className="text-xl font-bold text-white mb-4">🔥 Reviews récentes</h5>
                    <div className="space-y-3">
                        {authorReviews.slice(0, 3).map(review => (
                            <button
                                key={review.id}
                                className="w-full bg-gray-900 rounded-xl p-4 flex justify-between items-center hover:bg-gray-800 transition-all border border-gray-700 hover:border-green-500 group"
                                onClick={() => handleReviewClick(review.id)}
                            >
                                <div className="text-left">
                                    <p className="text-white font-bold group-hover:text-green-400 transition-colors">
                                        {review.holderName}
                                    </p>
                                    <p className="text-xs text-gray-400">{review.type}</p>
                                </div>
                                <span className="text-2xl font-black text-green-400">
                                    {review.overallRating || review.note}/10
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

AuthorStatsModal.propTypes = {
    authorId: PropTypes.string,
    reviews: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        holderName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        overallRating: PropTypes.number,
        note: PropTypes.number,
        views: PropTypes.number,
        ownerId: PropTypes.string,
        authorId: PropTypes.string,
        ownerName: PropTypes.string,
        author: PropTypes.shape({
            username: PropTypes.string
        })
    })).isRequired,
    onClose: PropTypes.func.isRequired
}
