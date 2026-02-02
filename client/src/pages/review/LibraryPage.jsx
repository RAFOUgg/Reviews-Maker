import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton, LiquidChip } from '@/components/ui/LiquidUI'
import FilterBar from '../../components/shared/ui-helpers/FilterBar'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Eye, EyeOff, ExternalLink, Edit, Trash2, Clock, Library } from 'lucide-react'

export default function LibraryPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user } = useStore()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, public, private
    const [filteredReviews, setFilteredReviews] = useState([])

    const fetchMyReviews = async () => {
        try {
            const response = await fetch('/api/reviews/my', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            } else {
                const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
                toast.error(`Erreur de chargement: ${error.message}`)
            }
        } catch (error) {
            toast.error('Erreur de connexion au serveur')
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
                toast.success(currentVisibility ? 'Review rendue privée' : 'Review rendue publique')
            } else {
                toast.error('Erreur lors du changement de visibilité')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        }
    }

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette review ?')) return

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setReviews(reviews.filter(r => r.id !== reviewId))
                toast.success('Review supprimée avec succès')
            } else {
                toast.error('Erreur lors de la suppression')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
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
            <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#07070f] relative pb-20 pt-8 px-4 md:px-8">
            <div className="relative max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Library className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Ma Bibliothèque
                            </h1>
                            <p className="text-white/50 mt-1">
                                Gérez vos reviews et exports ({reviews.length})
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['all', 'public', 'private'].map((f) => (
                            <LiquidChip
                                key={f}
                                active={filter === f}
                                onClick={() => setFilter(f)}
                                color="purple"
                            >
                                {f === 'all' ? 'Toutes' : f === 'public' ? 'Publiques' : 'Privées'}
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* FilterBar avancé */}
                <FilterBar reviews={visibilityFilteredReviews} onFilteredChange={setFilteredReviews} />

                {/* Reviews list */}
                {filteredReviews.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <LiquidCard glow="purple" padding="lg">
                            <div className="text-center py-16">
                                <div className="max-w-sm mx-auto px-6">
                                    <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                        <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        Aucune review pour le moment
                                    </h3>
                                    <LiquidButton
                                        onClick={() => navigate('/create')}
                                        variant="primary"
                                        size="lg"
                                        leftIcon={<Plus className="w-5 h-5" />}
                                    >
                                        Créer ma première review
                                    </LiquidButton>
                                </div>
                            </div>
                        </LiquidCard>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 gap-4"
                    >
                        <AnimatePresence>
                            {filteredReviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <LiquidCard glow="none" padding="md" className="hover:border-purple-500/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                                        {review.holderName}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${review.isPublic ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/10 text-white/60 border-white/20'}`}>
                                                        {review.isPublic ? 'Publique' : 'Privée'}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                        {review.type}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-white/50 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        {review.views || 0} vues
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleVisibility(review.id, review.isPublic)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
                                                    title={review.isPublic ? 'Rendre privée' : 'Rendre publique'}
                                                >
                                                    {review.isPublic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/review/${review.id}`)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-400 transition-colors border border-white/10"
                                                    title="Voir"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit/${review.type.toLowerCase()}/${review.id}`)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-400 transition-colors border border-white/10"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteReview(review.id)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors border border-white/10"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </LiquidCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
