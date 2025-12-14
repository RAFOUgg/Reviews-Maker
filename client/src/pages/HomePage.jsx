import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import FilterBar from '../components/FilterBar'
import HeroSection from '../components/HeroSection'
import ProductTypeCards from '../components/ProductTypeCards'
import HomeReviewCard from '../components/HomeReviewCard'
import AuthorStatsModal from '../components/AuthorStatsModal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function HomePage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated, reviews, loading, error, fetchReviews, likeReview, dislikeReview } = useStore()
    const [filteredReviews, setFilteredReviews] = useState([])
    const [showAll, setShowAll] = useState(false)
    const [selectedAuthor, setSelectedAuthor] = useState(null)

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    useEffect(() => {
        setFilteredReviews(reviews)
    }, [reviews])

    const handleCreateReview = (type) => {
        if (!isAuthenticated) {
            toast.warning('Vous devez être connecté pour créer une review')
            return
        }

        // Mapping des noms français vers les routes anglaises
        const typeMap = {
            'Fleur': 'flower',
            'Hash': 'hash',
            'Concentré': 'concentrate',
            'Comestible': 'edible'
        }

        const route = typeMap[type] || type.toLowerCase()
        navigate(`/create/${route}`)
    }

    const handleLike = async (reviewId, e) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            toast.warning('Connectez-vous pour liker')
            return
        }

        try {
            await likeReview(reviewId)
            toast.success('Review likée !')
        } catch (error) {
            toast.error(error.message || 'Erreur lors du like')
        }
    }

    const handleDislike = async (reviewId, e) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            toast.warning('Connectez-vous pour disliker')
            return
        }

        try {
            await dislikeReview(reviewId)
            toast.success('Review dislikée !')
        } catch (error) {
            toast.error(error.message || 'Erreur lors du dislike')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Section */}
                <HeroSection user={user} isAuthenticated={isAuthenticated} />

                {/* Create Review Section */}
                <ProductTypeCards
                    isAuthenticated={isAuthenticated}
                    onCreateReview={handleCreateReview}
                />

                {/* Divider */}
                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-theme-accent"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-theme-tertiary backdrop-blur-md px-6 py-2 text-[rgb(var(--color-accent))] font-semibold text-lg rounded-full border border-theme-accent shadow-[0_0_20px_rgba(var(--color-accent),0.3)]">
                            🎯 Galerie Publique
                        </span>
                    </div>
                </div>

                {/* FilterBar */}
                <FilterBar reviews={reviews} onFilteredChange={setFilteredReviews} />

                {/* Reviews Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" message="Chargement des reviews..." />
                    </div>
                ) : error ? (
                    <EmptyState
                        icon="❌"
                        title="Erreur de chargement"
                        message={error.message || 'Impossible de charger les reviews'}
                        actionLabel="Réessayer"
                        onAction={fetchReviews}
                    />
                ) : filteredReviews.length === 0 ? (
                    <EmptyState
                        icon="😕"
                        title="Aucune review trouvée"
                        message="Aucune review ne correspond aux filtres sélectionnés"
                        actionLabel="Réinitialiser les filtres"
                        onAction={() => fetchReviews()}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(showAll ? filteredReviews : filteredReviews.slice(0, 8)).map((review) => (
                                <HomeReviewCard
                                    key={review.id}
                                    review={review}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                    onAuthorClick={setSelectedAuthor}
                                />
                            ))}
                        </div>

                        {/* Show More Button */}
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

                        {/* Author Stats Modal */}
                        <AuthorStatsModal
                            authorId={selectedAuthor}
                            reviews={reviews}
                            onClose={() => setSelectedAuthor(null)}
                        />
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
