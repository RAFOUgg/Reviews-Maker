import { useState, useEffect } from 'react'
import aromasData from '../data/aromas.json'
import tastesData from '../data/tastes-wheel.json'

/**
 * WheelSelector - Version Compacte Horizontale Optimisée
 * Layout en rangées: [Icône + Label] | [Badges inline scrollables]
 * Interface sans scroll inutile, tout visible d'un coup d'œil
 */
export default function WheelSelector({
    value = [],
    onChange,
    type = 'aromas',
    label = 'Sélectionner',
    maxSelections = 5
}) {
    const [selectedItems, setSelectedItems] = useState([])
    const [searchFilter, setSearchFilter] = useState('')

    const data = type === 'aromas' ? aromasData : tastesData

    // Palette de couleurs pour chaque catégorie
    const categoryThemes = {
        citrus: { gradient: 'from-yellow-500 to-amber-500', icon: '🍋', color: 'yellow' },
        fruity: { gradient: ' ', icon: '🍇', color: 'pink' },
        earthy: { gradient: 'from-amber-700 to-stone-600', icon: '🌱', color: 'amber' },
        woody: { gradient: 'from-orange-800 to-yellow-900', icon: '🌲', color: 'orange' },
        spicy: { gradient: 'from-red-600 to-orange-500', icon: '🌶️', color: 'red' },
        floral: { gradient: ' ', icon: '🌸', color: 'purple' },
        sweet: { gradient: ' to-fuchsia-400', icon: '🍬', color: 'pink' },
        chemical: { gradient: ' to-emerald-500', icon: '⚗️', color: 'cyan' },
        other: { gradient: 'from-gray-600 to-slate-600', icon: '🔮', color: 'gray' }
    }

    useEffect(() => {
        if (typeof value === 'string') {
            const items = value.split(',').map(s => s.trim()).filter(Boolean)
            setSelectedItems(items)
        } else if (Array.isArray(value)) {
            setSelectedItems(value)
        }
    }, [value])

    const toggleItem = (item) => {
        let newItems
        if (selectedItems.includes(item)) {
            newItems = selectedItems.filter(i => i !== item)
        } else {
            if (selectedItems.length >= maxSelections) {
                // Remplacer le premier
                newItems = [...selectedItems.slice(1), item]
            } else {
                newItems = [...selectedItems, item]
            }
        }
        setSelectedItems(newItems)
        onChange(newItems.join(', '))
    }

    const clearAll = () => {
        setSelectedItems([])
        onChange('')
        setSearchFilter('')
    }

    const getFilteredItems = (items) => {
        if (!searchFilter) return items
        return items.filter(item => item.toLowerCase().includes(searchFilter.toLowerCase()))
    }

    const filteredCategories = Object.entries(data.categories || data).filter(([key, category]) => {
        if (!searchFilter) return true
        const items = category.items || category
        const categoryLabel = (category.label || key).toLowerCase()
        return categoryLabel.includes(searchFilter.toLowerCase()) ||
            (Array.isArray(items) && items.some(item => item.toLowerCase().includes(searchFilter.toLowerCase())))
    })

    return (
        <div className="space-y-3">
            {/* Header avec recherche et compteur */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="🔍 Rechercher..."
                        className="w-full px-4 py-2 pl-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all text-sm"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Compteur */}
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${selectedItems.length >= maxSelections ? 'bg-transparent border-amber-400/40 text-amber-400 glow-text-subtle' : 'bg-transparent border-white/30 text-white glow-text-subtle' }`}>
                    {selectedItems.length}/{maxSelections}
                </div>

                {selectedItems.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="px-3 py-2 text-sm bg-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.3)] text-[rgb(220,38,38)] rounded-lg transition-colors border border-[rgba(220,38,38,0.3)]"
                    >
                        × Effacer
                    </button>
                )}
            </div>

            {/* Sélections actives */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-transparent rounded-lg border border-white/20 glow-border">
                    {selectedItems.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleItem(item)}
                            className="group px-3 py-1.5 bg-transparent border border-white/30 hover:border-white/50 rounded-lg text-white text-sm font-medium transition-all glow-text-subtle"
                        >
                            {item}
                            <span className="ml-2 opacity-60 group-hover:opacity-100">×</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Catégories en rangées horizontales */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredCategories.map(([categoryKey, category]) => {
                    const theme = categoryThemes[categoryKey] || categoryThemes.other
                    const items = Array.isArray(category.items) ? category.items : category
                    const filteredItems = getFilteredItems(items)
                    const categoryHasSelection = items.some(item => selectedItems.includes(item))

                    return (
                        <div
                            key={categoryKey}
                            className={`flex items-center gap-3 p-3 rounded-xl bg-theme-surface border transition-all ${categoryHasSelection ? 'border-theme-accent shadow-[0_0_15px_rgba(var(--color-accent),0.2)]' : 'border-theme' }`}
                        >
                            {/* Label fixe - TEXTE SOLIDE SANS GRADIENT pour lisibilité */}
                            <div className="flex-shrink-0 w-32 flex items-center gap-2">
                                <span className="text-2xl">{theme.icon}</span>
                                <span className="text-sm font-bold text-[rgb(var(--color-accent))]">
                                    {category.label || categoryKey}
                                </span>
                            </div>

                            {/* Items en badges scrollables */}
                            <div className="flex-1 overflow-x-auto">
                                <div className="flex gap-2 pb-2">
                                    {filteredItems.map((item) => {
                                        const isSelected = selectedItems.includes(item)
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleItem(item)}
                                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected ? 'bg-[rgb(var(--color-accent))] text-white shadow-lg shadow-[rgba(var(--color-accent),0.4)]' : 'bg-theme-secondary text-[rgb(var(--text-primary))] hover:bg-theme-tertiary border border-theme' }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Compteur pour cette catégorie */}
                            {categoryHasSelection && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgb(var(--color-accent))] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                    {items.filter(item => selectedItems.includes(item)).length}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Message si aucun résultat */}
            {searchFilter && filteredCategories.length === 0 && (
                <div className="text-center p-6 text-gray-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm">Aucun résultat pour "{searchFilter}"</p>
                    <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="mt-2 text-xs text-green-400 hover:text-green-300"
                    >
                        Effacer la recherche
                    </button>
                </div>
            )}
        </div>
    )
}
