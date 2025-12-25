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
    const authorAvatar = author.author?.avatar || null
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
                className="rounded-3xl p-8 max-w-3xl w-full border-2 shadow-2xl transform scale-100 animate-scale-in"
                style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--primary)',
                    boxShadow: `0 25px 50px -12px var(--shadow-lg)`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-3xl font-black glow-text-subtle" style={{ color: 'var(--text-primary)' }}>
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
                <div
                    className="rounded-2xl p-6 mb-6 border-2"
                    style={{
                        background: 'var(--bg-tertiary)',
                        borderColor: 'var(--border)'
                    }}
                >
                    <div className="flex items-center gap-6 mb-6">
                        <div className="relative">
                            {authorAvatar ? (
                                <img
                                    src={authorAvatar}
                                    alt={authorName}
                                    className="w-24 h-24 rounded-full shadow-xl object-cover border-4"
                                    style={{ borderColor: 'var(--primary)' }}
                                    onError={(e) => {
                                        // Fallback si l'image ne charge pas
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    display: authorAvatar ? 'none' : 'flex'
                                }}
                            >
                                {authorName[0].toUpperCase()}
                            </div>
                            <div
                                className="absolute -inset-2 rounded-full blur-xl -z-10"
                                style={{ background: 'var(--gradient-primary)', opacity: 0.5 }}
                            />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                                {authorName}
                            </h4>
                            <p className="font-semibold" style={{ color: 'var(--primary)' }}>🎖️ Membre Actif</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className="rounded-xl p-6 text-center border-2 hover:scale-105 transition-transform glow-container-subtle"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--primary)'
                            }}
                        >
                            <p className="text-4xl font-black mb-2 glow-text" style={{ color: 'var(--primary)' }}>
                                {totalReviews}
                            </p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>📝 Reviews</p>
                        </div>
                        <div
                            className="rounded-xl p-6 text-center border-2 hover:scale-105 transition-transform glow-container-subtle"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--accent)'
                            }}
                        >
                            <p className="text-4xl font-black mb-2 glow-text" style={{ color: 'var(--accent)' }}>
                                {avgRating}
                            </p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>⭐ Note moy.</p>
                        </div>
                        <div
                            className="rounded-xl p-6 text-center border-2 hover:scale-105 transition-transform glow-container-subtle"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--primary)'
                            }}
                        >
                            <p className="text-4xl font-black mb-2 glow-text" style={{ color: 'var(--primary)' }}>
                                {totalViews}
                            </p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>👁️ Vues</p>
                        </div>
                    </div>
                </div>

                {/* Recent Reviews */}
                <div>
                    <h5 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🔥 Reviews récentes</h5>
                    <div className="space-y-3">
                        {authorReviews.slice(0, 3).map(review => (
                            <button
                                key={review.id}
                                className="w-full rounded-xl p-4 flex justify-between items-center transition-all border-2 group hover:scale-[1.02]"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary)'
                                    e.currentTarget.style.boxShadow = `0 0 20px var(--shadow)`
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                                onClick={() => handleReviewClick(review.id)}
                            >
                                <div className="text-left">
                                    <p
                                        className="font-bold transition-colors"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {review.holderName}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{review.type}</p>
                                </div>
                                <span className="text-2xl font-black glow-text" style={{ color: 'var(--primary)' }}>
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
