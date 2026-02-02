import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/shared/ToastContainer'
import { LiquidButton, LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI'
import FilterBar from '../../components/shared/ui-helpers/FilterBar'
import HeroSection from '../../components/shared/ui-helpers/HeroSection'
import ProductTypeCards from '../../components/shared/ui-helpers/ProductTypeCards'
import HomeReviewCard from '../../components/gallery/HomeReviewCard'
import AuthorStatsModal from '../../components/account/AuthorStatsModal'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import { ChevronDown, ChevronUp, Dna } from 'lucide-react'

export default function HomePage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated, reviews, loading, error, fetchReviews, likeReview, dislikeReview } = useStore()
    const { hasFeature } = usePermissions()
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

    const handleNavigateToPhenoHunt = () => {
        navigate('/phenohunt');
    };

    return (
        <div className="min-h-screen relative">
            <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Hero Section */}
                <LiquidCard glow="purple" padding="lg" className="overflow-hidden">
                    <HeroSection user={user} isAuthenticated={isAuthenticated} title="Terpologie" />
                </LiquidCard>

                {/* Create Review Section */}
                <LiquidCard glow="cyan" padding="md">
                    <ProductTypeCards
                        isAuthenticated={isAuthenticated}
                        onCreateReview={handleCreateReview}
                    />
                </LiquidCard>

                {/* Divider - Galerie Publique */}
                <div className="relative py-6">
                    <LiquidDivider />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-6 py-2 bg-[#0a0a1a]/90 backdrop-blur-xl text-violet-300 font-semibold text-lg rounded-full border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        >
                            🎯 Galerie Publique
                        </motion.span>
                    </div>
                </div>

                {/* FilterBar */}
                <LiquidCard glow="none" padding="sm">
                    <FilterBar reviews={reviews} onFilteredChange={setFilteredReviews} />
                </LiquidCard>

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
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            {(showAll ? filteredReviews : filteredReviews.slice(0, 8)).map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <LiquidCard glow="none" padding="sm" className="h-full">
                                        <HomeReviewCard
                                            review={review}
                                            onLike={handleLike}
                                            onDislike={handleDislike}
                                            onAuthorClick={setSelectedAuthor}
                                        />
                                    </LiquidCard>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Show More Button */}
                        {filteredReviews.length > 8 && (
                            <div className="text-center pt-8">
                                <LiquidButton
                                    onClick={() => setShowAll(!showAll)}
                                    variant="primary"
                                    size="lg"
                                    glow="purple"
                                    icon={showAll ? ChevronUp : ChevronDown}
                                >
                                    {showAll ? 'Afficher moins' : `Afficher plus (${filteredReviews.length - 8} restantes)`}
                                </LiquidButton>
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

                {/* PhénoHunt Navigation Button - Producer only */}
                {hasFeature('phenohunt') && (
                    <div className="text-center pt-8">
                        <LiquidButton
                            onClick={handleNavigateToPhenoHunt}
                            variant="secondary"
                            size="lg"
                            glow="cyan"
                            icon={Dna}
                        >
                            Accéder à PhénoHunt
                        </LiquidButton>
                    </div>
                )}
            </div>
        </div>
    )
}
