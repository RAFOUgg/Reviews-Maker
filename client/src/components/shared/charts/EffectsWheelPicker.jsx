import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'
import { EFFECTS_CATEGORIES, getAllEffects } from '../../../data/effectsCategories'

/**
 * EffectsWheelPicker - Sélecteur d'effets CATA (Check-All-That-Apply)
 * Roue d'effets interactive avec catégories et sentiment (positif/négatif)
 * Basé sur AromaWheelPicker pour une UX cohérente
 */
export default function EffectsWheelPicker({
    selectedEffects = [],
    onChange,
    max = 8,
    title = 'Sélectionner des effets',
    helper = '',
    className = ''
}) {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('categories') // 'categories' | 'all' | 'selected'
    const [sentimentFilter, setSentimentFilter] = useState('all') // 'all' | 'positive' | 'negative' | 'neutral'

    // Toutes les effets
    const allEffects = useMemo(() => getAllEffects(), [])

    // Liste des catégories
    const effectCategories = useMemo(() => Object.values(EFFECTS_CATEGORIES), [])

    // Filtrer effets par recherche et sentiment
    const filteredEffects = useMemo(() => {
        let effects = allEffects

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            effects = effects.filter(effect =>
                effect.name.toLowerCase().includes(query) ||
                effect.category.toLowerCase().includes(query)
            )
        }

        if (sentimentFilter !== 'all') {
            effects = effects.filter(effect => effect.sentiment === sentimentFilter)
        }

        return effects
    }, [searchQuery, allEffects, sentimentFilter])

    // Effets de la catégorie sélectionnée
    const categoryEffects = useMemo(() => {
        if (!selectedCategory) return []
        
        const category = EFFECTS_CATEGORIES[selectedCategory]
        if (!category) return []

        let effects = []
        
        if (category.positive) {
            effects = [...effects, ...category.positive.map(e => ({ ...e, category: selectedCategory, sentiment: 'positive' }))]
        }
        if (category.negative) {
            effects = [...effects, ...category.negative.map(e => ({ ...e, category: selectedCategory, sentiment: 'negative' }))]
        }
        if (category.items) {
            effects = [...effects, ...category.items.map(e => ({ ...e, category: selectedCategory, sentiment: 'neutral' }))]
        }

        // Appliquer filtre sentiment
        if (sentimentFilter !== 'all') {
            effects = effects.filter(e => e.sentiment === sentimentFilter)
        }

        return effects
    }, [selectedCategory, sentimentFilter])

    const canAddMore = selectedEffects.length < max

    const toggleEffect = (effectId) => {
        if (selectedEffects.includes(effectId)) {
            onChange?.(selectedEffects.filter(id => id !== effectId))
        } else if (canAddMore) {
            onChange?.([...selectedEffects, effectId])
        }
    }

    const removeEffect = (effectId) => {
        onChange?.(selectedEffects.filter(id => id !== effectId))
    }

    const clearAll = () => {
        onChange?.([])
    }

    // Récupérer les objets complets des effets sélectionnés
    const selectedEffectsObjects = useMemo(() => {
        return selectedEffects
            .map(id => allEffects.find(e => e.id === id))
            .filter(Boolean)
    }, [selectedEffects, allEffects])

    // Helper pour obtenir couleur selon catégorie
    const getCategoryColor = (categoryId) => {
        return EFFECTS_CATEGORIES[categoryId]?.color || '#8B5CF6'
    }

    // Helper pour obtenir icône sentiment
    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive':
                return <ThumbsUp className="w-3 h-3 text-green-400" />
            case 'negative':
                return <ThumbsDown className="w-3 h-3 text-red-400" />
            default:
                return <Sparkles className="w-3 h-3 text-blue-400" />
        }
    }

    // Helper pour obtenir bordure selon sentiment
    const getSentimentStyle = (sentiment, isSelected) => {
        if (isSelected) return {}
        switch (sentiment) {
            case 'positive':
                return { borderColor: 'rgba(34, 197, 94, 0.5)' }
            case 'negative':
                return { borderColor: 'rgba(239, 68, 68, 0.5)' }
            default:
                return { borderColor: 'rgba(59, 130, 246, 0.5)' }
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {title}
                        <span className="text-sm font-normal text-white/50">
                            ({selectedEffects.length}/{max})
                        </span>
                    </h3>
                    {helper && (
                        <p className="text-sm text-white/50 mt-1">{helper}</p>
                    )}
                </div>

                {selectedEffects.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-red-500 hover:text-red-600 underline"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            {/* Effets sélectionnés */}
            {selectedEffects.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 rounded-xl">
                    <AnimatePresence>
                        {selectedEffectsObjects.map((effect) => (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
                                style={{ backgroundColor: getCategoryColor(effect.category) }}
                            >
                                {getSentimentIcon(effect.sentiment)}
                                <span>{effect.name}</span>
                                <button
                                    onClick={() => removeEffect(effect.id)}
                                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Rechercher un effet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['categories', 'all', 'selected'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${viewMode === mode
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'}`}
                            >
                                {mode === 'categories' && '🧠 Catégories'}
                                {mode === 'all' && '📋 Tous'}
                                {mode === 'selected' && `✅ Sélectionnés (${selectedEffects.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtres de sentiment */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { value: 'all', label: 'Tous', icon: '🔄' },
                        { value: 'positive', label: 'Positifs', icon: '👍', color: 'text-green-400' },
                        { value: 'negative', label: 'Négatifs', icon: '👎', color: 'text-red-400' },
                        { value: 'neutral', label: 'Thérapeutiques', icon: '⚕️', color: 'text-blue-400' }
                    ].map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setSentimentFilter(filter.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sentimentFilter === filter.value
                                ? 'bg-white/15 text-white border-white/20'
                                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
                        >
                            <span className={filter.color}>{filter.icon}</span> {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Limite atteinte */}
            {!canAddMore && (
                <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-orange-300">
                    ⚠️ Limite atteinte : {max} effets maximum. Retirez-en pour en ajouter d'autres.
                </div>
            )}

            {/* Vue par catégories */}
            {viewMode === 'categories' && !searchQuery && (
                <div className="space-y-3">
                    {selectedCategory ? (
                        // Effets de la catégorie
                        <div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mb-3 text-sm text-white/60 hover:text-white underline"
                            >
                                ← Retour aux catégories
                            </button>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {categoryEffects.map(effect => {
                                    const isSelected = selectedEffects.includes(effect.id)
                                    const category = EFFECTS_CATEGORIES[effect.category]

                                    return (
                                        <button
                                            key={effect.id}
                                            onClick={() => toggleEffect(effect.id)}
                                            disabled={!canAddMore && !isSelected}
                                            className={`p-3 rounded-xl text-left transition-all ${isSelected 
                                                ? 'text-white shadow-lg scale-105' 
                                                : 'bg-white/5 hover:bg-white/10 border-2'} 
                                                ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                            style={isSelected 
                                                ? { backgroundColor: category?.color } 
                                                : getSentimentStyle(effect.sentiment, isSelected)}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {getSentimentIcon(effect.sentiment)}
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                {effect.name}
                                            </div>
                                            <div className={`text-xs mt-1 capitalize ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                                                {effect.sentiment === 'positive' && '✓ Positif'}
                                                {effect.sentiment === 'negative' && '⚠ Négatif'}
                                                {effect.sentiment === 'neutral' && '⚕ Thérapeutique'}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        // Catégories principales
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {effectCategories.map(category => {
                                const categoryId = category.id
                                const allCatEffects = [
                                    ...(category.positive || []),
                                    ...(category.negative || []),
                                    ...(category.items || [])
                                ]
                                const selectedCount = allCatEffects.filter(e =>
                                    selectedEffects.includes(e.id)
                                ).length

                                return (
                                    <button
                                        key={categoryId}
                                        onClick={() => setSelectedCategory(categoryId)}
                                        className="p-4 bg-white/5 border-2 border-white/10 rounded-xl hover:shadow-lg hover:bg-white/10 transition-all text-left group"
                                        style={{
                                            borderColor: selectedCount > 0 ? category.color : undefined
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl">{category.icon}</span>
                                            {selectedCount > 0 && (
                                                <span
                                                    className="text-xs font-bold px-2 py-1 rounded-full text-white"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-white text-sm mb-1">
                                            {category.label}
                                        </h4>
                                        <p className="text-xs text-white/50">
                                            {allCatEffects.length} effets
                                        </p>
                                        {/* Indicateurs de types */}
                                        <div className="flex gap-2 mt-2 text-xs">
                                            {category.positive && (
                                                <span className="text-green-400">👍 {category.positive.length}</span>
                                            )}
                                            {category.negative && (
                                                <span className="text-red-400">👎 {category.negative.length}</span>
                                            )}
                                            {category.items && (
                                                <span className="text-blue-400">⚕ {category.items.length}</span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Vue tous les effets */}
            {(viewMode === 'all' || searchQuery) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2">
                    {filteredEffects.map(effect => {
                        const isSelected = selectedEffects.includes(effect.id)

                        return (
                            <button
                                key={effect.id}
                                onClick={() => toggleEffect(effect.id)}
                                disabled={!canAddMore && !isSelected}
                                className={`p-3 rounded-xl text-left transition-all ${isSelected 
                                    ? 'text-white shadow-lg scale-105' 
                                    : 'bg-white/5 hover:bg-white/10 border-2'} 
                                    ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={isSelected 
                                    ? { backgroundColor: getCategoryColor(effect.category) } 
                                    : getSentimentStyle(effect.sentiment, isSelected)}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {getSentimentIcon(effect.sentiment)}
                                    {isSelected && <span className="text-xs">✓</span>}
                                </div>
                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                    {effect.name}
                                </div>
                                <div
                                    className={`text-xs mt-1 ${isSelected ? 'text-white/80' : ''}`}
                                    style={{ color: !isSelected ? getCategoryColor(effect.category) : undefined }}
                                >
                                    {EFFECTS_CATEGORIES[effect.category]?.label}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Vue sélectionnés uniquement */}
            {viewMode === 'selected' && selectedEffects.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    <p>Aucun effet sélectionné</p>
                </div>
            )}
        </div>
    )
}

EffectsWheelPicker.propTypes = {
    selectedEffects: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    max: PropTypes.number,
    title: PropTypes.string,
    helper: PropTypes.string,
    className: PropTypes.string
}
