import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Eye, Heart, MessageSquare, ArrowRight } from 'lucide-react'
import { reviewsService } from '../../services/apiService'
import LoadingSpinner from '../LoadingSpinner'

/**
 * Section "Mes Reviews Récentes" - Affiche les 6 dernières reviews de l'utilisateur
 * Conforme CDC : "Mes Reviews Récentes (6 dernières reviews en grid)"
 */
export default function RecentReviewsSection({ userId }) {
    const navigate = useNavigate()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchRecentReviews = async () => {
            try {
                setLoading(true)
                // Fetch 6 dernières reviews de l'utilisateur
                const response = await reviewsService.getUserReviews(userId, { limit: 6, sort: 'createdAt_desc' })
                setReviews(response.reviews || [])
            } catch (error) {
                console.error('Erreur chargement reviews récentes:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentReviews()
    }, [userId])

    if (!userId) return null

    if (loading) {
        return (
            <section className="glass p-8 rounded-3xl">
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" message="Chargement de vos reviews..." />
                </div>
            </section>
        )
    }

    if (reviews.length === 0) {
        return (
            <section className="glass p-8 rounded-3xl">
                <h2 className="text-2xl font-black text-[rgb(var(--color-accent))] mb-6 flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    Mes Reviews Récentes
                </h2>
                <div className="text-center py-12 space-y-4">
                    <div className="text-6xl opacity-30">📄</div>
                    <p className="text-lg text-theme-text-secondary">
                        Vous n'avez pas encore créé de review
                    </p>
                    <button
                        onClick={() => navigate('/create/flower')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r text-white rounded-xl font-semibold hover:scale-105 transition-transform"
                    >
                        Créer ma première review
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="glass p-8 rounded-3xl space-y-6">
            {/* Titre */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[rgb(var(--color-accent))] flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    Mes Reviews Récentes
                </h2>
                <button
                    onClick={() => navigate('/library')}
                    className="text-sm font-semibold text-[rgb(var(--color-accent))] hover:underline flex items-center gap-2"
                >
                    Voir toutes mes reviews
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Grid 3 colonnes (responsive: 1 col mobile, 2 tablet, 3 desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/review/${review.id}`)}
                    >
                        <div className="glass rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(var(--color-accent),0.3)] transition-all duration-300">
                            {/* Image principale */}
                            {review.photos?.[0] ? (
                                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                    <img
                                        src={`/api/images/${review.photos[0]}`}
                                        alt={review.nomCommercial || review.nom || 'Review'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Badge type produit */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                                            {review.productType === 'Fleur' && '🌿'}
                                            {review.productType === 'Hash' && '🧊'}
                                            {review.productType === 'Concentré' && '💧'}
                                            {review.productType === 'Comestible' && '🍪'}
                                            {' '}{review.productType}
                                        </span>
                                    </div>
                                    {/* Badge visibilité */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 backdrop-blur-sm text-white text-xs font-bold rounded-full border ${review.visibility === 'public' ? 'bg-green-500/60 border-green-300/40' : 'bg-gray-500/60 border-gray-300/40' }`}>
                                            {review.visibility === 'public' ? '🌐 Public' : '🔒 Privé'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-gradient-to-br flex items-center justify-center">
                                    <div className="text-6xl opacity-30">
                                        {review.productType === 'Fleur' && '🌿'}
                                        {review.productType === 'Hash' && '🧊'}
                                        {review.productType === 'Concentré' && '💧'}
                                        {review.productType === 'Comestible' && '🍪'}
                                    </div>
                                </div>
                            )}

                            {/* Contenu */}
                            <div className="p-4 space-y-3">
                                {/* Nom */}
                                <h3 className="text-lg font-bold text-theme-text-primary truncate">
                                    {review.nomCommercial || review.nom || 'Sans nom'}
                                </h3>

                                {/* Cultivar/Hashmaker/etc */}
                                {(review.cultivar || review.hashmaker || review.fabricant) && (
                                    <p className="text-sm text-theme-text-secondary truncate">
                                        {review.cultivar || review.hashmaker || review.fabricant}
                                    </p>
                                )}

                                {/* Métadonnées */}
                                <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                        {review.views > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {review.views}
                                            </span>
                                        )}
                                    </div>
                                    {review.likes > 0 && (
                                        <span className="flex items-center gap-1 text-red-400">
                                            <Heart className="w-3 h-3 fill-current" />
                                            {review.likes}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
