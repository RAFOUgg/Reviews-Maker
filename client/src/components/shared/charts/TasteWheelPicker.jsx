import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { TASTE_FAMILIES, getAllTasteNotes, getNotesByFamily } from '../../../data/tasteNotes'
import CategoryCarousel, { useCategoryLayout } from './CategoryCarousel'

/**
 * TasteWheelPicker - Sélecteur de notes gustatives CATA (Check-All-That-Apply)
 * Roue gustative interactive avec familles et sous-catégories
 * Basé sur AromaWheelPicker pour une UX cohérente
 */
export default function TasteWheelPicker({
    selectedTastes = [],
    onChange,
    max = 7,
    title = 'Sélectionner des goûts',
    helper = '',
    className = ''
}) {
    const [selectedFamily, setSelectedFamily] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('categories') // 'categories' | 'all' | 'selected'

    // Toutes les notes gustatives
    const allTastes = useMemo(() => getAllTasteNotes(), [])

    // Liste des familles
    const tasteFamilies = useMemo(() => Object.values(TASTE_FAMILIES), [])

    // Filtrer notes par recherche
    const filteredTastes = useMemo(() => {
        if (!searchQuery) return allTastes

        const query = searchQuery.toLowerCase()
        return allTastes.filter(taste =>
            taste.name.toLowerCase().includes(query) ||
            taste.familyLabel.toLowerCase().includes(query) ||
            (taste.intensity && taste.intensity.toLowerCase().includes(query))
        )
    }, [searchQuery, allTastes])

    // Notes de la famille sélectionnée
    const familyTastes = useMemo(() => {
        if (!selectedFamily) return []
        return getNotesByFamily(selectedFamily)
    }, [selectedFamily])

    const canAddMore = selectedTastes.length < max

    const toggleTaste = (tasteId) => {
        if (selectedTastes.includes(tasteId)) {
            // Retirer
            onChange?.(selectedTastes.filter(id => id !== tasteId))
        } else if (canAddMore) {
            // Ajouter
            onChange?.([...selectedTastes, tasteId])
        }
    }

    const removeTaste = (tasteId) => {
        onChange?.(selectedTastes.filter(id => id !== tasteId))
    }

    const clearAll = () => {
        onChange?.([])
    }

    // Récupérer les objets complets des notes sélectionnées
    const selectedTastesObjects = useMemo(() => {
        return selectedTastes
            .map(id => allTastes.find(t => t.id === id))
            .filter(Boolean)
    }, [selectedTastes, allTastes])

    const categoriesPourCarrousel = tasteFamilies.map((f) => {
        const notes = f.notes || [];
        return {
            id: f.id, label: f.label, emoji: f.icon, color: f.color,
            __total: notes.length,
            selectedCount: notes.filter((n) => selectedTastes.includes(n.id)).length,
        };
    });
    const enGalerie = useCategoryLayout();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {title}
                        <span className="text-sm font-normal text-white/50">
                            ({selectedTastes.length}/{max})
                        </span>
                    </h3>
                    {helper && (
                        <p className="text-sm text-white/50 mt-1">{helper}</p>
                    )}
                </div>

                {selectedTastes.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-red-500 hover:text-red-600 underline"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            {/* Notes sélectionnées */}
            {selectedTastes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 rounded-xl">
                    <AnimatePresence>
                        {selectedTastesObjects.map((taste) => (
                            <motion.div
                                key={taste.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
                                style={{ backgroundColor: taste.familyColor }}
                            >
                                <span>{taste.icon}</span>
                                <span>{taste.name}</span>
                                <button
                                    onClick={() => removeTaste(taste.id)}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Rechercher un goût..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    {['categories', 'all', 'selected'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${viewMode === mode
                                ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'}`}
                        >
                            {mode === 'categories' && '🎨 Familles'}
                            {mode === 'all' && '📋 Tous'}
                            {mode === 'selected' && `✅ Sélectionnés (${selectedTastes.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Limite atteinte */}
            {!canAddMore && (
                <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-orange-300">
                    ⚠️ Limite atteinte : {max} goûts maximum. Retirez-en pour en ajouter d'autres.
                </div>
            )}

            {/* Vue par familles */}
            {viewMode === 'categories' && !searchQuery && (
                <div className="space-y-3">
                    {selectedFamily ? (
                        // Notes de la famille
                        <div>
                            <button
                                onClick={() => setSelectedFamily(null)}
                                className="mb-3 text-sm text-white/60 hover:text-white underline"
                            >
                                ← Retour aux familles
                            </button>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {familyTastes.map(taste => {
                                    const isSelected = selectedTastes.includes(taste.id)
                                    const family = TASTE_FAMILIES[selectedFamily]

                                    return (
                                        <button
                                            key={taste.id}
                                            onClick={() => toggleTaste(taste.id)}
                                            disabled={!canAddMore && !isSelected}
                                            className={`p-3 rounded-xl text-left transition-all ${isSelected
                                                ? 'text-white shadow-lg scale-105'
                                                : 'bg-white/5 hover:bg-white/10 border-2 border-white/10'} 
                                                ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                            style={isSelected ? { backgroundColor: family?.color } : {}}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{taste.icon}</span>
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                {taste.name}
                                            </div>
                                            {taste.intensity && (
                                                <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                                                    {taste.intensity}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        // Familles principales
                                                <>
                        {/* CARROUSEL par défaut sur téléphone (galerie au-delà de `sm`, ou partout
                            si la préférence « Catégories en galerie » est active). */}
                        {!enGalerie && (
                            <div className="sm:hidden">
                                <CategoryCarousel
                                    categories={categoriesPourCarrousel}
                                    countOf={(c) => c.__total}
                                    unitLabel="goûts"
                                    onSelect={setSelectedFamily}
                                />
                            </div>
                        )}
                        <div className={enGalerie ? '' : 'hidden sm:block'}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {tasteFamilies.map(family => {
                                const notesInFamily = family.notes || []
                                const selectedCount = notesInFamily.filter(n =>
                                    selectedTastes.includes(n.id)
                                ).length

                                return (
                                    <button
                                        key={family.id}
                                        onClick={() => setSelectedFamily(family.id)}
                                        className="p-4 bg-white/5 border-2 border-white/10 rounded-xl hover:shadow-lg hover:bg-white/10 transition-all text-left group"
                                        style={{
                                            borderColor: selectedCount > 0 ? family.color : undefined
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl">{family.icon}</span>
                                            {selectedCount > 0 && (
                                                <span
                                                    className="text-xs font-bold px-2 py-1 rounded-full text-white"
                                                    style={{ backgroundColor: family.color }}
                                                >
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-white text-sm mb-1">
                                            {family.label}
                                        </h4>
                                        <p className="text-xs text-white/50">
                                            {notesInFamily.length} goûts
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                        </div>
                        </>

                    )}
                </div>
            )}

            {/* Vue tous les goûts */}
            {(viewMode === 'all' || searchQuery) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2">
                    {filteredTastes.map(taste => {
                        const isSelected = selectedTastes.includes(taste.id)

                        return (
                            <button
                                key={taste.id}
                                onClick={() => toggleTaste(taste.id)}
                                disabled={!canAddMore && !isSelected}
                                className={`p-3 rounded-xl text-left transition-all ${isSelected
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-white/5 hover:bg-white/10 border-2 border-white/10'} 
                                    ${!canAddMore && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={isSelected ? { backgroundColor: taste.familyColor } : { borderColor: taste.familyColor }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{taste.icon}</span>
                                    {isSelected && <span className="text-xs">✓</span>}
                                </div>
                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                    {taste.name}
                                </div>
                                <div
                                    className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-white/50'}`}
                                    style={{ color: !isSelected ? taste.familyColor : undefined }}
                                >
                                    {taste.familyLabel}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Vue sélectionnés uniquement */}
            {viewMode === 'selected' && selectedTastes.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    <p>Aucun goût sélectionné</p>
                </div>
            )}
        </div>
    )
}

TasteWheelPicker.propTypes = {
    selectedTastes: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    max: PropTypes.number,
    title: PropTypes.string,
    helper: PropTypes.string,
    className: PropTypes.string
}
