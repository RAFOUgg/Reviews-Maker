import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import ReviewCard from '../components/ReviewCard'
import Button from '../components/Button'

export default function HomePage() {
    const { reviews, loading, error, fetchReviews, filters, setFilters } = useStore()
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchReviews()
    }, [])    // Filter reviews based on search and type
    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.holderName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filters.type === 'all' || review.type === filters.type
        return matchesSearch && matchesType
    })

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-12"
            >
                <h1 className="text-5xl font-bold">
                    <span className="text-gradient">Reviews Maker</span>
                </h1>
                <p className="text-xl text-dark-muted max-w-2xl mx-auto">
                    Découvrez et partagez vos expériences avec les meilleures variétés de cannabis
                </p>
            </motion.div>

            {/* Search & Filters */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher une variété..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                        />
                    </div>

                    {/* Type filter */}
                    <div className="flex gap-2">
                        {['all', 'Indica', 'Sativa', 'Hybride', 'CBD'].map((type) => (
                            <Button
                                key={type}
                                variant={filters.type === type ? 'primary' : 'ghost'}
                                onClick={() => setFilters({ type })}
                                size="md"
                            >
                                {type === 'all' ? 'Tous' : type}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-dark-muted pt-4 border-t border-dark-border/30">
                    <span>{filteredReviews.length} review{filteredReviews.length > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Trier par: Date</span>
                </div>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-red-400">❌ Erreur: {error}</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-12 text-center space-y-4"
                >
                    <span className="text-6xl">🔍</span>
                    <h3 className="text-2xl font-bold text-dark-text">Aucune review trouvée</h3>
                    <p className="text-dark-muted">
                        {searchQuery ? 'Essayez une autre recherche' : 'Soyez le premier à créer une review !'}
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </motion.div>
            )}
        </div>
    )
}
