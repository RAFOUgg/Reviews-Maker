import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import FilterBar from '../components/FilterBar'

export default function LibraryPage() {
    const navigate = useNavigate()
    const { user } = useStore()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, public, private
    const [filteredReviews, setFilteredReviews] = useState([])

    const fetchMyReviews = async () => {
        try {
            console.log('👤 User connecté:', user)
            const response = await fetch('/api/reviews/my', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                console.log('📚 Reviews chargées:', data.length)
                console.log('📋 Données reviews:', data)
                setReviews(data)
            } else {
                console.error('❌ Erreur HTTP:', response.status)
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
        fetchMyReviews()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate])

    const toggleVisibility = async (reviewId, currentVisibility) => {
        try {
            const response = await fetch(`/api/reviews/${reviewId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isPublic: !currentVisibility })
            })

            if (response.ok) {
                setReviews(reviews.map(r =>
                    r.id === reviewId ? { ...r, isPublic: !currentVisibility } : r
                ))
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la visibilité:', error)
        }
    }

    const deleteReview = async (reviewId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette review ?')) return

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setReviews(reviews.filter(r => r.id !== reviewId))
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        }
    }

    // Appliquer le filtre de visibilité sur les reviews avant de les passer au FilterBar
    const visibilityFilteredReviews = reviews.filter(r => {
        if (filter === 'public' && !r.isPublic) return false
        if (filter === 'private' && r.isPublic) return false
        return true
    })

    // Mettre à jour filteredReviews quand visibilityFilteredReviews change
    useEffect(() => {
        setFilteredReviews(visibilityFilteredReviews)
    }, [visibilityFilteredReviews])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-primary))]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Ma bibliothèque
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))] opacity-90">
                        Gérez vos reviews, leur visibilité et consultez vos statistiques
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[rgba(var(--color-primary),0.1)] backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[rgba(var(--color-primary),0.2)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80">Total</p>
                                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{reviews.length}</p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--color-primary),0.2)] rounded-lg">
                                <svg className="w-6 h-6 text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[rgba(var(--color-accent),0.1)] backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[rgba(var(--color-accent),0.2)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80">Publiques</p>
                                <p className="text-2xl font-bold text-[rgb(var(--color-accent))]">
                                    {reviews.filter(r => r.isPublic).length}
                                </p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--color-accent),0.2)] rounded-lg">
                                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[rgba(var(--color-primary),0.15)] backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[rgba(var(--color-primary),0.3)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80">Privées</p>
                                <p className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                                    {reviews.filter(r => !r.isPublic).length}
                                </p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--color-primary),0.25)] rounded-lg">
                                <svg className="w-6 h-6 text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[rgba(var(--color-accent),0.15)] backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[rgba(var(--color-accent),0.3)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80">Vues totales</p>
                                <p className="text-2xl font-bold text-[rgb(var(--color-accent))]">
                                    {reviews.reduce((acc, r) => acc + (r.views || 0), 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--color-accent),0.25)] rounded-lg">
                                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="space-y-4 mb-6">
                    {/* Visibility filters */}
                    <div>
                        <label className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2 block">
                            Visibilité
                        </label>
                        <div className="flex gap-2">
                            {['all', 'public', 'private'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                        ? 'bg-[rgb(var(--color-primary))] text-white shadow-[0_0_20px_rgba(var(--color-primary),0.5)]'
                                        : 'bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--text-primary))] hover:bg-[rgba(var(--color-primary),0.2)] border border-[rgba(var(--color-primary),0.2)]'
                                        }`}
                                >
                                    {f === 'all' ? 'Toutes' : f === 'public' ? 'Publiques' : 'Privées'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FilterBar avancé */}
                <FilterBar reviews={visibilityFilteredReviews} onFilteredChange={setFilteredReviews} />

                {/* Reviews list */}
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-16 bg-[rgba(var(--color-primary),0.05)] backdrop-blur-sm rounded-xl border border-[rgba(var(--color-primary),0.2)]">
                        <div className="max-w-sm mx-auto px-6">
                            <svg className="w-20 h-20 mx-auto text-[rgb(var(--color-accent))] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                                Aucune review pour le moment
                            </h3>
                            <p className="text-[rgb(var(--text-secondary))] opacity-80 mb-6">
                                Commencez à créer vos premières reviews pour les voir apparaître ici
                            </p>
                            <button
                                onClick={() => navigate('/create')}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white rounded-xl hover:shadow-[0_0_30px_rgba(var(--color-accent),0.6)] transition-all shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Créer ma première review
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map(review => (
                            <div
                                key={review.id}
                                className="bg-[rgba(var(--color-primary),0.05)] backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[rgba(var(--color-primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:border-[rgba(var(--color-primary),0.4)] transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                                                {review.holderName}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${review.isPublic
                                                ? 'bg-[rgba(var(--color-accent),0.15)] text-[rgb(var(--color-accent))] border border-[rgba(var(--color-accent),0.3)]'
                                                : 'bg-[rgba(var(--color-primary),0.15)] text-[rgb(var(--color-primary))] border border-[rgba(var(--color-primary),0.3)]'
                                                }`}>
                                                {review.isPublic ? 'Publique' : 'Privée'}
                                            </span>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--color-primary),0.2)] text-[rgb(var(--color-primary))] border border-[rgba(var(--color-primary),0.3)]">
                                                {review.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-[rgb(var(--text-secondary))] opacity-80 mb-2">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {review.views || 0} vues
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleVisibility(review.id, review.isPublic)}
                                            className="p-2 rounded-lg hover:bg-[rgba(var(--color-primary),0.2)] transition-colors"
                                            title={review.isPublic ? 'Rendre privée' : 'Rendre publique'}
                                        >
                                            <svg className="w-5 h-5 text-[rgb(var(--text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {review.isPublic ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                )}
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => navigate(`/review/${review.id}`)}
                                            className="p-2 rounded-lg hover:bg-[rgba(var(--color-primary),0.2)] transition-colors"
                                            title="Voir"
                                        >
                                            <svg className="w-5 h-5 text-[rgb(var(--text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => navigate(`/edit/${review.id}`)}
                                            className="p-2 rounded-lg hover:bg-[rgba(var(--color-primary),0.2)] transition-colors"
                                            title="Modifier"
                                        >
                                            <svg className="w-5 h-5 text-[rgb(var(--text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            className="p-2 rounded-lg bg-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.3)] transition-colors border border-[rgba(220,38,38,0.3)]"
                                            title="Supprimer"
                                        >
                                            <svg className="w-5 h-5 text-[rgb(220,38,38)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
