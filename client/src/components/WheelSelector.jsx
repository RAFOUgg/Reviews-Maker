import { useState, useEffect } from 'react'
import aromasData from '../data/aromas.json'
import tastesData from '../data/tastes-wheel.json'

/**
 * Composant immersif de sélection en roue visuelle pour les odeurs et saveurs
 * Interface Apple-like avec roue colorée interactive et filtres rapides
 */
export default function WheelSelector({
    value = [],
    onChange,
    type = 'aromas',
    label = 'Sélectionner',
    maxSelections = 5
}) {
    const [selectedItems, setSelectedItems] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [searchFilter, setSearchFilter] = useState('')
    const [viewMode, setViewMode] = useState('wheel')

    const data = type === 'aromas' ? aromasData : tastesData

    // Palette de couleurs immersive pour chaque catégorie
    const categoryThemes = {
        citrus: { 
            gradient: 'from-yellow-500 via-orange-400 to-amber-500', 
            glow: 'shadow-yellow-500/50',
            icon: '🍋',
            bg: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
        },
        fruity: { 
            gradient: 'from-pink-500 via-rose-400 to-purple-500', 
            glow: 'shadow-pink-500/50',
            icon: '🍇',
            bg: 'bg-gradient-to-br from-pink-500/10 to-purple-500/10'
        },
        earthy: { 
            gradient: 'from-amber-700 via-yellow-800 to-stone-600', 
            glow: 'shadow-amber-600/50',
            icon: '🌱',
            bg: 'bg-gradient-to-br from-amber-700/10 to-stone-600/10'
        },
        woody: { 
            gradient: 'from-orange-800 via-amber-700 to-yellow-900', 
            glow: 'shadow-orange-700/50',
            icon: '🌲',
            bg: 'bg-gradient-to-br from-orange-800/10 to-yellow-900/10'
        },
        spicy: { 
            gradient: 'from-red-600 via-orange-500 to-yellow-500', 
            glow: 'shadow-red-500/50',
            icon: '🌶️',
            bg: 'bg-gradient-to-br from-red-600/10 to-orange-600/10'
        },
        floral: { 
            gradient: 'from-purple-500 via-pink-400 to-fuchsia-500', 
            glow: 'shadow-purple-500/50',
            icon: '🌸',
            bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
        },
        sweet: { 
            gradient: 'from-pink-400 via-rose-400 to-fuchsia-400', 
            glow: 'shadow-pink-400/50',
            icon: '🍬',
            bg: 'bg-gradient-to-br from-pink-400/10 to-fuchsia-400/10'
        },
        chemical: { 
            gradient: 'from-cyan-600 via-teal-500 to-emerald-500', 
            glow: 'shadow-cyan-500/50',
            icon: '⚗️',
            bg: 'bg-gradient-to-br from-cyan-600/10 to-teal-600/10'
        },
        other: { 
            gradient: 'from-gray-600 via-slate-500 to-zinc-600', 
            glow: 'shadow-gray-500/50',
            icon: '🔮',
            bg: 'bg-gradient-to-br from-gray-600/10 to-slate-600/10'
        }
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
        setActiveCategory(null)
    }

    // Filtrer les catégories et items selon la recherche
    const filteredCategories = Object.entries(data.categories || data).filter(([key, category]) => {
        if (!searchFilter) return true
        const items = category.items || category
        const categoryLabel = (category.label || key).toLowerCase()
        const searchLower = searchFilter.toLowerCase()
        
        return categoryLabel.includes(searchLower) || 
               (Array.isArray(items) && items.some(item => item.toLowerCase().includes(searchLower)))
    })

    const getFilteredItems = (items) => {
        if (!searchFilter) return items
        return items.filter(item => item.toLowerCase().includes(searchFilter.toLowerCase()))
    }

    return (
        <div className="space-y-4">
            {/* Barre de recherche et contrôles */}
            <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="🔍 Rechercher..."
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    
                    {/* Boutons vue */}
                    <div className="flex gap-2 bg-black/30 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('wheel')}
                            className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'wheel' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Compteur de sélections avec barre de progression */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Sélectionné{selectedItems.length > 1 ? 's' : ''}</span>
                        <span className={`font-bold ${selectedItems.length >= maxSelections ? 'text-amber-400' : 'text-green-400'}`}>
                            {selectedItems.length} / {maxSelections}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-300 ${selectedItems.length >= maxSelections ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                            style={{ width: `${(selectedItems.length / maxSelections) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Sélections actives avec badges immersifs */}
            {selectedItems.length > 0 && (
                <div className="glass rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Sélection active
                        </h4>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Tout effacer
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedItems.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleItem(item)}
                                className="group relative px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white text-sm font-medium shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105 transition-all duration-200"
                            >
                                <span>{item}</span>
                                <span className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity">×</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Vue roue - Grille de catégories */}
            {viewMode === 'wheel' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredCategories.map(([categoryKey, category]) => {
                        const theme = categoryThemes[categoryKey] || categoryThemes.other
                        const items = Array.isArray(category.items) ? category.items : category
                        const filteredItems = getFilteredItems(items)
                        const isActive = activeCategory === categoryKey
                        const categoryHasSelection = items.some(item => selectedItems.includes(item))

                        return (
                            <button
                                key={categoryKey}
                                type="button"
                                onClick={() => setActiveCategory(isActive ? null : categoryKey)}
                                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${theme.bg} border-2 ${isActive ? 'border-green-500 scale-105' : categoryHasSelection ? 'border-green-500/30' : 'border-gray-700/30'} hover:scale-105 hover:shadow-xl ${theme.glow}`}
                            >
                                <div className="relative z-10 text-center space-y-2">
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                        {theme.icon}
                                    </div>
                                    <div className={`text-sm font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                        {category.label || categoryKey}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {filteredItems.length} option{filteredItems.length > 1 ? 's' : ''}
                                    </div>
                                    {categoryHasSelection && (
                                        <div className="absolute top-2 right-2">
                                            <span className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full text-white text-xs font-bold">
                                                {items.filter(item => selectedItems.includes(item)).length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Vue liste compacte */}
            {viewMode === 'list' && (
                <div className="space-y-2">
                    {filteredCategories.map(([categoryKey, category]) => {
                        const theme = categoryThemes[categoryKey] || categoryThemes.other
                        const items = Array.isArray(category.items) ? category.items : category
                        const filteredItems = getFilteredItems(items)
                        const isActive = activeCategory === categoryKey

                        return (
                            <div key={categoryKey} className="glass rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategory(isActive ? null : categoryKey)}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-all ${isActive ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{theme.icon}</span>
                                        <span className={`font-semibold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                            {category.label || categoryKey}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({filteredItems.length})
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isActive && (
                                    <div className="p-3 bg-black/20 border-t border-gray-700/30">
                                        <div className="flex flex-wrap gap-2">
                                            {filteredItems.map((item) => {
                                                const isSelected = selectedItems.includes(item)
                                                return (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleItem(item)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            isSelected
                                                                ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg ${theme.glow}`
                                                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                                        }`}
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Panneau détaillé pour la catégorie active */}
            {activeCategory && viewMode === 'wheel' && (
                <div className="glass rounded-2xl p-6">
                    {(() => {
                        const category = (data.categories || data)[activeCategory]
                        const theme = categoryThemes[activeCategory] || categoryThemes.other
                        const items = Array.isArray(category.items) ? category.items : category
                        const filteredItems = getFilteredItems(items)

                        return (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{theme.icon}</span>
                                        <h3 className={`text-xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                            {category.label || activeCategory}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveCategory(null)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filteredItems.map((item) => {
                                        const isSelected = selectedItems.includes(item)
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleItem(item)}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                    isSelected
                                                        ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg ${theme.glow} scale-105`
                                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* Message si aucun résultat */}
            {searchFilter && filteredCategories.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">Aucun résultat pour "{searchFilter}"</p>
                    <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="mt-4 text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                        Effacer la recherche
                    </button>
                </div>
            )}
        </div>
    )
}
