/**
 * ReviewsTab.jsx - Onglet Reviews de la Bibliothèque
 * 
 * Conforme au CDC:
 * - Filtres par type produit (Fleur, Hash, Concentré, Comestible)
 * - Filtres par visibilité (publique/privée)
 * - Filtres par statut (brouillon, finalisée, publiée)
 * - Vue Grid/List/Timeline
 * - Actions: Édition, Duplication, Suppression, Toggle visibilité
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton, LiquidChip } from '@/components/ui/LiquidUI'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Grid3X3, List, Calendar, Eye, EyeOff, Edit, Trash2, Copy,
    ExternalLink, Clock, Search, Filter, SlidersHorizontal,
    Flower2, Hash, FlaskConical, Cookie, Plus, MoreVertical, FileText,
    Link2, ArrowRight
} from 'lucide-react'

// Types de produits avec icônes (IDs = valeurs exactes stockées en DB)
const PRODUCT_TYPES = [
    { id: 'all', label: 'Tous', icon: null },
    { id: 'Fleurs', label: 'Fleurs', icon: Flower2, color: 'green' },
    { id: 'Hash', label: 'Hash', icon: Hash, color: 'amber' },
    { id: 'Concentrés', label: 'Concentrés', icon: FlaskConical, color: 'purple' },
    { id: 'Comestibles', label: 'Comestibles', icon: Cookie, color: 'pink' },
]

// Mapping DB type → slug de route d'édition
const TYPE_TO_ROUTE = {
    'Fleurs': 'flower',
    'Hash': 'hash',
    'Concentrés': 'concentrate',
    'Comestibles': 'edible',
    'Concentré': 'concentrate',
}

// Hash/Concentrate/Edible n'ont pas de champ mainImage sur la review de base (stocké sur leur
// propre sous-table) — mainImageUrl/images sont déjà des URLs complètes remontées par le backend
const getCardImageSrc = (review) => {
    if (review.mainImageUrl) return review.mainImageUrl
    if (review.mainImage) return `/api/images/${review.mainImage}`
    if (Array.isArray(review.images) && review.images.length > 0) return review.images[0]
    return null
}

const VIEW_MODES = [
    { id: 'grid', icon: Grid3X3, label: 'Grille' },
    { id: 'list', icon: List, label: 'Liste' },
    { id: 'timeline', icon: Calendar, label: 'Timeline' },
]

const VISIBILITY_FILTERS = [
    { id: 'all', label: 'Toutes' },
    { id: 'public', label: 'Publiques' },
    { id: 'private', label: 'Privées' },
]

export default function ReviewsTab() {
    const navigate = useNavigate()
    const toast = useToast()

    // État
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('grid')
    const [confirmDelete, setConfirmDelete] = useState({ open: false, reviewId: null })
    const [typeFilter, setTypeFilter] = useState('all')
    const [visibilityFilter, setVisibilityFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

    // Construire les cartes de lignée (parent→enfant) à partir du sourceLineage
    const { parentsOf, childrenOf, lineageChains, reviewMap } = useMemo(() => {
        const parentsOf = {}
        const childrenOf = {}
        const reviewMap = {}
        const reviewIds = new Set(reviews.map(r => r.id))

        reviews.forEach(r => { reviewMap[r.id] = r })

        reviews.forEach(review => {
            const lineage = Array.isArray(review.sourceLineage) ? review.sourceLineage : []
            if (!lineage.length) return
            parentsOf[review.id] = lineage
            lineage.forEach(src => {
                if (reviewIds.has(src.id)) {
                    if (!childrenOf[src.id]) childrenOf[src.id] = []
                    if (!childrenOf[src.id].includes(review.id)) childrenOf[src.id].push(review.id)
                }
            })
        })

        // Trouver les racines (reviews sans parent dans la collection) qui ont des enfants
        const visited = new Set()
        const chains = []
        reviews.forEach(r => {
            const parents = parentsOf[r.id] || []
            const hasParentInSet = parents.some(p => reviewIds.has(p.id))
            if (!hasParentInSet && childrenOf[r.id]) {
                const chain = []
                const walk = (id) => {
                    if (visited.has(id)) return
                    visited.add(id)
                    chain.push(id)
                    ;(childrenOf[id] || []).forEach(walk)
                }
                walk(r.id)
                if (chain.length > 1) chains.push(chain)
            }
        })

        return { parentsOf, childrenOf, lineageChains: chains, reviewMap }
    }, [reviews])

    // Charger les reviews
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/reviews/my', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            } else {
                console.error('Failed to load reviews:', response.status)
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // deps vides : ne jamais re-créer cette fonction

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    // Filtrer et trier les reviews
    const filteredReviews = reviews
        .filter(review => {
            // Filtre par type
            if (typeFilter !== 'all' && review.type !== typeFilter) return false
            // Filtre par visibilité
            if (visibilityFilter === 'public' && !review.isPublic) return false
            if (visibilityFilter === 'private' && review.isPublic) return false
            // Filtre par recherche
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return (
                    review.holderName?.toLowerCase().includes(query) ||
                    review.cultivars?.toLowerCase().includes(query) ||
                    review.description?.toLowerCase().includes(query)
                )
            }
            return true
        })
        .sort((a, b) => {
            const aVal = a[sortBy]
            const bVal = b[sortBy]
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1
            }
            return aVal < bVal ? 1 : -1
        })

    // Actions
    const toggleVisibility = async (reviewId, currentVisibility) => {
        // Gate : pour publier publiquement, un aperçu (orchardPreset) est obligatoire
        if (!currentVisibility) {
            const review = reviews.find(r => r.id === reviewId)
            if (review && !review.orchardPreset) {
                toast.error(
                    '⚠️ Un aperçu est requis pour publier. Ouvrez la review en édition et définissez un aperçu via "Créer aperçu".'
                )
                return
            }
        }

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
        setConfirmDelete({ open: true, reviewId })
    }

    const confirmDeleteNow = async () => {
        const reviewId = confirmDelete.reviewId
        setConfirmDelete({ open: false, reviewId: null })
        if (!reviewId) return

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

    const duplicateReview = async (review) => {
        toast.info('Duplication en cours de développement')
        // TODO: Implémenter la duplication côté API
    }

    // Rendu d'une carte review
    const renderReviewCard = (review, index) => {
        const typeConfig = PRODUCT_TYPES.find(t => t.id === review.type)
        const TypeIcon = typeConfig?.icon || Flower2

        if (viewMode === 'list') {
            return (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                >
                    <LiquidCard glow="none" padding="sm" className="hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            {/* Image */}
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                {getCardImageSrc(review) ? (
                                    <img
                                        src={getCardImageSrc(review)}
                                        alt={review.holderName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <TypeIcon className="w-6 h-6 text-white/30" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{review.holderName}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${review.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                                        }`}>
                                        {review.isPublic ? 'Publique' : 'Privée'}
                                    </span>
                                    {!review.isPublic && !review.orchardPreset && (
                                        <button
                                            onClick={() => navigate(`/edit/${TYPE_TO_ROUTE[review.type] || review.type.toLowerCase()}/${review.id}?openExport=1`)}
                                            className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                                            title="Créer un aperçu avec Export Maker pour pouvoir publier"
                                        >
                                            📸 Aperçu requis
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/50 flex-wrap">
                                    <span className={`flex items-center gap-1 text-${typeConfig?.color || 'purple'}-400`}>
                                        <TypeIcon className="w-3.5 h-3.5" />
                                        {review.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                    {parentsOf[review.id]?.length > 0 && (
                                        <span className="flex items-center gap-1 text-white/30">
                                            <Link2 className="w-3 h-3" />
                                            {parentsOf[review.id].map((src, i) => {
                                                const srcReview = reviewMap[src.id]
                                                return (
                                                    <span key={i} className="text-xs">
                                                        {i > 0 ? ' + ' : ''}{srcReview?.holderName || src.label}
                                                    </span>
                                                )
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => navigate(`/review/${review.id}`)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                    title="Voir"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/edit/${TYPE_TO_ROUTE[review.type] || review.type.toLowerCase()}/${review.id}`)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors"
                                    title="Modifier"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleVisibility(review.id, review.isPublic)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-purple-400 transition-colors"
                                    title={review.isPublic ? 'Rendre privée' : 'Rendre publique'}
                                >
                                    {review.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => duplicateReview(review)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors"
                                    title="Dupliquer"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </LiquidCard>
                </motion.div>
            )
        }

        // Vue Grid
        return (
            <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group"
            >
                <LiquidCard glow="none" padding="none" className="overflow-hidden hover:border-purple-500/30 transition-all">
                    {/* Image */}
                    <div className="aspect-square bg-white/5 relative overflow-hidden">
                        {getCardImageSrc(review) ? (
                            <img
                                src={getCardImageSrc(review)}
                                alt={review.holderName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <TypeIcon className="w-12 h-12 text-white/20" />
                            </div>
                        )}

                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1">
                                <button
                                    onClick={() => navigate(`/review/${review.id}`)}
                                    className="p-2 rounded-lg bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/edit/${TYPE_TO_ROUTE[review.type] || review.type.toLowerCase()}/${review.id}`)}
                                    className="p-2 rounded-lg bg-white/10 backdrop-blur text-white hover:bg-amber-500/50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleVisibility(review.id, review.isPublic)}
                                    className="p-2 rounded-lg bg-white/10 backdrop-blur text-white hover:bg-purple-500/50 transition-colors"
                                >
                                    {review.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="p-2 rounded-lg bg-white/10 backdrop-blur text-white hover:bg-red-500/50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Badge type */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg bg-${typeConfig?.color || 'purple'}-500/80 backdrop-blur text-white text-xs font-bold flex items-center gap-1`}>
                            <TypeIcon className="w-3 h-3" />
                            {review.type}
                        </div>

                        {/* Badge visibilité */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur text-xs font-bold ${review.isPublic ? 'bg-green-500/80 text-white' : 'bg-white/20 text-white/80'
                            }`}>
                            {review.isPublic ? 'Publique' : 'Privée'}
                        </div>

                        {/* Badge aperçu (manquant = avertissement) — placé sous le badge visibilité (top-right),
                            jamais en bas où il chevaucherait la barre d'actions au survol (bottom-2, pleine largeur) */}
                        {!review.isPublic && !review.orchardPreset && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit/${TYPE_TO_ROUTE[review.type] || review.type.toLowerCase()}/${review.id}?openExport=1`);
                                }}
                                className="absolute top-11 right-2 px-2 py-1 rounded-lg bg-amber-500/80 backdrop-blur text-white text-xs font-bold hover:bg-amber-500 transition-colors"
                                title="Créer un aperçu avec Export Maker pour pouvoir publier"
                            >
                                📸 Aperçu
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                        <h3 className="font-bold text-white truncate text-sm mb-0.5">{review.holderName}</h3>
                        <div className="flex items-center justify-between text-xs text-white/50 mb-0">
                            <span className="truncate mr-1">{review.cultivars || 'Non spécifié'}</span>
                            <span className="shrink-0">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>

                        {/* Lignée : sources dont est issue cette review */}
                        {parentsOf[review.id]?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                                <Link2 className="w-2.5 h-2.5 text-white/25 flex-shrink-0" />
                                <div className="flex items-center gap-0.5 overflow-hidden">
                                    {parentsOf[review.id].map((src, i) => {
                                        const srcReview = reviewMap[src.id]
                                        const srcType = PRODUCT_TYPES.find(t => t.id === srcReview?.type)
                                        const SrcIcon = srcType?.icon || Flower2
                                        const name = srcReview?.holderName || src.label
                                        return (
                                            <span key={i} className="flex items-center gap-0.5">
                                                {i > 0 && <span className="text-white/20 text-xs">+</span>}
                                                <span className={`flex items-center gap-0.5 text-xs text-${srcType?.color || 'green'}-400/80`}>
                                                    <SrcIcon className="w-2.5 h-2.5 flex-shrink-0" />
                                                    <span className="truncate max-w-[55px]">{name}</span>
                                                </span>
                                            </span>
                                        )
                                    })}
                                </div>
                                {childrenOf[review.id]?.length > 0 && (
                                    <ArrowRight className="w-2.5 h-2.5 text-white/20 ml-auto flex-shrink-0" />
                                )}
                            </div>
                        )}
                        {/* Marque si cette review est utilisée comme source dans d'autres (sans avoir elle-même des parents) */}
                        {!parentsOf[review.id]?.length && childrenOf[review.id]?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                                <span className={`text-xs text-${typeConfig?.color || 'green'}-400/60`}>Base de la chaîne</span>
                                <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                            </div>
                        )}

                        {/* Actions visibles en permanence sur mobile (pas de hover tactile) */}
                        <div className="flex items-center justify-around gap-0.5 mt-2 pt-2 border-t border-white/10 md:hidden">
                            <button
                                onClick={() => navigate(`/review/${review.id}`)}
                                className="p-1.5 rounded-lg bg-white/5 text-white/60 active:bg-white/15 text-xs flex flex-col items-center gap-0.5"
                                title="Voir"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => navigate(`/edit/${TYPE_TO_ROUTE[review.type] || review.type.toLowerCase()}/${review.id}`)}
                                className="p-1.5 rounded-lg bg-white/5 text-amber-400/70 active:bg-amber-500/20 text-xs flex flex-col items-center gap-0.5"
                                title="Modifier"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => toggleVisibility(review.id, review.isPublic)}
                                className="p-1.5 rounded-lg bg-white/5 text-purple-400/70 active:bg-purple-500/20 text-xs flex flex-col items-center gap-0.5"
                                title={review.isPublic ? 'Rendre privée' : 'Rendre publique'}
                            >
                                {review.isPublic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={() => deleteReview(review.id)}
                                className="p-1.5 rounded-lg bg-white/5 text-red-400/70 active:bg-red-500/20 text-xs flex flex-col items-center gap-0.5"
                                title="Supprimer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    // Vue Timeline
    const renderTimeline = () => {
        const groupedByDate = filteredReviews.reduce((acc, review) => {
            const date = new Date(review.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long'
            })
            if (!acc[date]) acc[date] = []
            acc[date].push(review)
            return acc
        }, {})

        return (
            <div className="space-y-8">
                {Object.entries(groupedByDate).map(([date, dateReviews]) => (
                    <div key={date}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            {date}
                            <span className="text-sm font-normal text-white/50">({dateReviews.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {dateReviews.map((review, idx) => renderReviewCard(review, idx))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* ── Filtres par type – défilants sur mobile ── */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
                {PRODUCT_TYPES.map((type) => {
                    const Icon = type.icon
                    const isActive = typeFilter === type.id
                    const count = type.id === 'all'
                        ? reviews.length
                        : reviews.filter(r => r.type === type.id).length

                    return (
                        <button
                            key={type.id}
                            onClick={() => setTypeFilter(type.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${isActive
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                                }`}
                        >
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            <span className="text-sm font-medium">{type.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-purple-500/30' : 'bg-white/10'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* ── Barre de recherche + contrôles ── */}
            <div className="flex items-center gap-2">
                {/* Recherche – pleine largeur sur mobile */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Visibilité */}
                <select
                    value={visibilityFilter}
                    onChange={(e) => setVisibilityFilter(e.target.value)}
                    className="py-2 px-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm focus:outline-none focus:border-purple-500/50 shrink-0"
                >
                    {VISIBILITY_FILTERS.map(f => (
                        <option key={f.id} value={f.id} className="bg-[#1a1a2e]">{f.label}</option>
                    ))}
                </select>

                {/* Vue */}
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 shrink-0">
                    {VIEW_MODES.map((mode) => {
                        const Icon = mode.icon
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id)}
                                className={`p-2 rounded-lg transition-colors ${viewMode === mode.id
                                    ? 'bg-purple-500 text-white'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                                title={mode.label}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Bannière chaînes de production */}
            {lineageChains.length > 0 && (
                <div className="bg-white/3 border border-white/10 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium uppercase tracking-wide">
                        <Link2 className="w-3 h-3" />
                        Chaînes de production
                    </div>
                    {lineageChains.map((chain, chainIdx) => (
                        <div key={chainIdx} className="flex items-center gap-1.5 flex-wrap">
                            {chain.map((reviewId, i) => {
                                const r = reviewMap[reviewId]
                                if (!r) return null
                                const tc = PRODUCT_TYPES.find(t => t.id === r.type)
                                const Icon = tc?.icon || Flower2
                                return (
                                    <div key={reviewId} className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => navigate(`/edit/${TYPE_TO_ROUTE[r.type] || r.type?.toLowerCase()}/${r.id}`)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-${tc?.color || 'purple'}-500/20 text-${tc?.color || 'purple'}-300 text-xs font-medium hover:bg-${tc?.color || 'purple'}-500/30 transition-colors border border-${tc?.color || 'purple'}-500/20`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {r.holderName}
                                        </button>
                                        {i < chain.length - 1 && (
                                            <ArrowRight className="w-3.5 h-3.5 text-white/25" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* Contenu */}
            {filteredReviews.length === 0 ? (
                <LiquidCard glow="purple" padding="lg">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <FileText className="w-8 h-8 text-white/30" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {reviews.length === 0 ? 'Aucune review' : 'Aucun résultat'}
                        </h3>
                        <p className="text-white/50 mb-6">
                            {reviews.length === 0
                                ? 'Commencez par créer votre première review'
                                : 'Essayez de modifier vos filtres de recherche'
                            }
                        </p>
                        {reviews.length === 0 && (
                            <LiquidButton
                                onClick={() => navigate('/create')}
                                variant="primary"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Créer ma première review
                            </LiquidButton>
                        )}
                    </div>
                </LiquidCard>
            ) : viewMode === 'timeline' ? (
                renderTimeline()
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                    : 'space-y-2'
                }>
                    <AnimatePresence>
                        {filteredReviews.map((review, index) => renderReviewCard(review, index))}
                    </AnimatePresence>
                </div>
            )}

            {/* Stats rapides */}
            {reviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{reviews.length}</div>
                        <div className="text-xs text-white/50">Reviews totales</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{reviews.filter(r => r.isPublic).length}</div>
                        <div className="text-xs text-white/50">Publiques</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white/60">{reviews.filter(r => !r.isPublic).length}</div>
                        <div className="text-xs text-white/50">Privées</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                            {[...new Set(reviews.map(r => r.type))].length}
                        </div>
                        <div className="text-xs text-white/50">Types</div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={confirmDelete.open}
                title="Supprimer cette review"
                message="Cette action est irréversible. La review et toutes ses données seront définitivement supprimées."
                confirmLabel="Supprimer"
                onCancel={() => setConfirmDelete({ open: false, reviewId: null })}
                onConfirm={confirmDeleteNow}
            />
        </div>
    )
}
