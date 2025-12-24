import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Filter } from 'lucide-react'
import { AROMA_CATEGORIES, AROMAS, getAromasByCategory, getSubcategories } from '../../data/aromasWheel'

/**
 * AromaWheelPicker - Sélecteur d'arômes CATA (Check-All-That-Apply)
 * Roue aromatique interactive avec catégories et sous-catégories
 */
export default function AromaWheelPicker({
    selectedAromas = [],
    onChange,
    max = 7,
    title = 'Sélectionner des arômes',
    helper = '',
    className = ''
}) {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('categories') // 'categories' | 'all' | 'selected'

    // Filtrer arômes par recherche
    const filteredAromas = useMemo(() => {
        if (!searchQuery) return AROMAS

        const query = searchQuery.toLowerCase()
        return AROMAS.filter(aroma =>
            aroma.label.toLowerCase().includes(query) ||
            aroma.category.toLowerCase().includes(query) ||
            (aroma.subcategory && aroma.subcategory.toLowerCase().includes(query))
        )
    }, [searchQuery])

    // Arômes de la catégorie sélectionnée
    const categoryAromas = useMemo(() => {
        if (!selectedCategory) return []
        return getAromasByCategory(selectedCategory)
    }, [selectedCategory])

    const canAddMore = selectedAromas.length < max

    const toggleAroma = (aromaId) => {
        if (selectedAromas.includes(aromaId)) {
            // Retirer
            onChange?.(selectedAromas.filter(id => id !== aromaId))
        } else if (canAddMore) {
            // Ajouter
            onChange?.([...selectedAromas, aromaId])
        }
    }

    const removeAroma = (aromaId) => {
        onChange?.(selectedAromas.filter(id => id !== aromaId))
    }

    const clearAll = () => {
        onChange?.([])
    }

    // Récupérer les objets complets des arômes sélectionnés
    const selectedAromasObjects = useMemo(() => {
        return selectedAromas
            .map(id => AROMAS.find(a => a.id === id))
            .filter(Boolean)
    }, [selectedAromas])

    return (
        <div className={`space-y-4 ${className}`}>
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        {title}
                        <span className="text-sm font-normal text-gray-500">
                            ({selectedAromas.length}/{max})
                        </span>
                    </h3>
                    {helper && (
                        <p className="text-sm text-gray-500 mt-1">{helper}</p>
                    )}
                </div>

                {selectedAromas.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-red-500 hover:text-red-600 underline"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            {/* Arômes sélectionnés */}
            {selectedAromas.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 rounded-xl">
                    <AnimatePresence>
                        {selectedAromasObjects.map((aroma) => {
                            const category = AROMA_CATEGORIES.find(c => c.id === aroma.category)

                            return (
                                <motion.div
                                    key={aroma.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
                                    style={{ backgroundColor: category?.color }}
                                >
                                    <span>{aroma.emoji}</span>
                                    <span>{aroma.label}</span>
                                    <button
                                        onClick={() => removeAroma(aroma.id)}
                                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Barre de recherche et filtres */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un arôme..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus: focus:border-transparent"
                    />
                </div>

                <div className="flex gap-2">
                    {['categories', 'all', 'selected'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode ? ' text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }`}
                        >
                            {mode === 'categories' && '🎨 Catégories'}
                            {mode === 'all' && '📋 Tous'}
                            {mode === 'selected' && `✅ Sélectionnés (${selectedAromas.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Limite atteinte */}
            {!canAddMore && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                    ⚠️ Limite atteinte : {max} arômes maximum. Retirez-en pour en ajouter d'autres.
                </div>
            )}

            {/* Vue par catégories */}
            {viewMode === 'categories' && !searchQuery && (
                <div className="space-y-3">
                    {selectedCategory ? (
                        // Arômes de la catégorie
                        <div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mb-3 text-sm hover: underline"
                            >
                                ← Retour aux catégories
                            </button>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {categoryAromas.map(aroma => {
                                    const isSelected = selectedAromas.includes(aroma.id)
                                    const category = AROMA_CATEGORIES.find(c => c.id === aroma.category)

                                    return (
                                        <button
                                            key={aroma.id}
                                            onClick={() => toggleAroma(aroma.id)}
                                            disabled={!canAddMore && !isSelected}
                                            className={`p-3 rounded-xl text-left transition-all ${isSelected ? 'bg-gradient-to-br text-white shadow-lg scale-105' : 'bg-white hover:bg-gray-50 border-2 border-gray-200' } ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{aroma.emoji}</span>
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                {aroma.label}
                                            </div>
                                            {aroma.subcategory && (
                                                <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {aroma.subcategory}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        // Catégories principales
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {AROMA_CATEGORIES.map(category => {
                                const aromasInCategory = getAromasByCategory(category.id)
                                const selectedCount = aromasInCategory.filter(a =>
                                    selectedAromas.includes(a.id)
                                ).length

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all text-left group"
                                        style={{
                                            borderColor: selectedCount > 0 ? category.color : undefined
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl">{category.emoji}</span>
                                            {selectedCount > 0 && (
                                                <span
                                                    className="text-xs font-bold px-2 py-1 rounded-full text-white"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-gray-800 text-sm mb-1">
                                            {category.label}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {aromasInCategory.length} arômes
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Vue tous les arômes */}
            {(viewMode === 'all' || searchQuery) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2">
                    {filteredAromas.map(aroma => {
                        const isSelected = selectedAromas.includes(aroma.id)
                        const category = AROMA_CATEGORIES.find(c => c.id === aroma.category)

                        return (
                            <button
                                key={aroma.id}
                                onClick={() => toggleAroma(aroma.id)}
                                disabled={!canAddMore && !isSelected}
                                className={`p-3 rounded-xl text-left transition-all ${isSelected ? 'bg-gradient-to-br text-white shadow-lg scale-105' : 'bg-white hover:bg-gray-50 border-2' } ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                    borderColor: !isSelected ? category?.color : undefined
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{aroma.emoji}</span>
                                    {isSelected && <span className="text-xs">✓</span>}
                                </div>
                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {aroma.label}
                                </div>
                                <div
                                    className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
                                    style={{ color: !isSelected ? category?.color : undefined }}
                                >
                                    {category?.label}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Vue sélectionnés uniquement */}
            {viewMode === 'selected' && selectedAromas.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>Aucun arôme sélectionné</p>
                </div>
            )}
        </div>
    )
}

AromaWheelPicker.propTypes = {
    selectedAromas: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    max: PropTypes.number,
    title: PropTypes.string,
    helper: PropTypes.string,
    className: PropTypes.string
}
