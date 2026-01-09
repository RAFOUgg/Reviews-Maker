import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import { LiquidButton } from '../components/liquid'
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
    // Local UI state for compact preferences gallery
    const [visibility, setVisibility] = useState('Publique')
    const [exportFormat, setExportFormat] = useState('PNG (Image)')
    const [compactView, setCompactView] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
            <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Section */}
                <div className="glass liquid-glass--card">
                    <HeroSection user={user} isAuthenticated={isAuthenticated} title="Terpologie" />
                </div>

                {/* Account Info + Preferences (compact gallery) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass liquid-glass--card p-4 flex items-start gap-4 md:col-span-1">
                        <img src={user?.avatar || '/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full border border-theme-accent" />
                        <div>
                            <div className="text-xl font-bold text-white">{user?.displayName || user?.name || 'Utilisateur'}</div>
                            <div className="text-sm text-gray-300">{user?.email || '—'}</div>
                            <div className="text-xs text-gray-400 mt-2">Connecté via {user?.provider || 'Discord'} • Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="glass p-3 flex flex-col justify-between">
                                <div className="text-sm text-gray-300 font-medium">Visibilité par défaut</div>
                                <div className="mt-2 text-white font-semibold">{visibility}</div>
                                <div className="mt-3">
                                    <button className="btn-small" onClick={() => setVisibility(visibility === 'Publique' ? 'Privée' : 'Publique')}>Toggle</button>
                                </div>
                            </div>

                            <div className="glass p-3 flex flex-col justify-between">
                                <div className="text-sm text-gray-300 font-medium">Format d'export par défaut</div>
                                <div className="mt-2 text-white font-semibold">{exportFormat}</div>
                                <div className="mt-3">
                                    <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full bg-theme-tertiary rounded px-2 py-1">
                                        <option>PNG (Image)</option>
                                        <option>JPEG (Image)</option>
                                        <option>PDF</option>
                                    </select>
                                </div>
                            </div>

                            <div className="glass p-3 flex flex-col justify-between">
                                <div className="text-sm text-gray-300 font-medium">Vue compacte</div>
                                <div className="mt-2 text-white font-semibold">{compactView ? 'Activée' : 'Désactivée'}</div>
                                <div className="mt-3">
                                    <label className="switch">
                                        <input type="checkbox" checked={compactView} onChange={() => setCompactView(!compactView)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="glass p-3 flex flex-col justify-between">
                                <div className="text-sm text-gray-300 font-medium">Notifications</div>
                                <div className="mt-2 text-white font-semibold">{notificationsEnabled ? 'Actives' : 'Inactives'}</div>
                                <div className="mt-3">
                                    <label className="switch">
                                        <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="btn-primary" onClick={() => toast.success('Préférences mises à jour (local)')}>Enregistrer</button>
                        </div>
                    </div>
                </div>

                {/* Create Review Section */}
                <div className="glass liquid-glass--card">
                    <ProductTypeCards
                        isAuthenticated={isAuthenticated}
                        onCreateReview={handleCreateReview}
                    />
                </div>

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
                <div className="glass p-4">
                    <FilterBar reviews={reviews} onFilteredChange={setFilteredReviews} />
                </div>

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
                                    <div className="glass p-3">
                                        <HomeReviewCard
                                            review={review}
                                            onLike={handleLike}
                                            onDislike={handleDislike}
                                            onAuthorClick={setSelectedAuthor}
                                        />
                                    </div>
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
                                    leftIcon={
                                        <svg className={`w-6 h-6 transition-transform duration-500 ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    }
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

                {/* PhénoHunt Navigation Button */}
                <div className="text-center pt-8">
                    <LiquidButton
                        onClick={handleNavigateToPhenoHunt}
                        variant="secondary"
                        size="lg"
                    >
                        Accéder à PhénoHunt
                    </LiquidButton>
                </div>
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
