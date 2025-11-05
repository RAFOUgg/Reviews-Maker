import { useState, useEffect } from 'react'
import effectsData from '../data/effects-wheel.json'

/**
 * Composant immersif de sélection pour les effets
 * Interface Apple-like avec catégorisation visuelle et code couleur
 */
export default function EffectSelector({ 
    value = [], 
    onChange, 
    maxSelections = 8
}) {
    const [selectedEffects, setSelectedEffects] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [searchFilter, setSearchFilter] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all', 'positive', 'negative'

    // Thèmes visuels pour chaque catégorie
    const categoryThemes = {
        mental: {
            gradient: 'from-purple-500 via-indigo-500 to-blue-500',
            glow: 'shadow-purple-500/50',
            icon: '🧠',
            bg: 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10',
            label: 'Effets Mentaux'
        },
        physical: {
            gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
            glow: 'shadow-emerald-500/50',
            icon: '💪',
            bg: 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
            label: 'Effets Physiques'
        },
        therapeutic: {
            gradient: 'from-pink-500 via-rose-500 to-red-500',
            glow: 'shadow-pink-500/50',
            icon: '💊',
            bg: 'bg-gradient-to-br from-pink-500/10 to-rose-500/10',
            label: 'Effets Thérapeutiques'
        }
    }

    useEffect(() => {
        if (typeof value === 'string') {
            const effects = value.split(',').map(s => s.trim()).filter(Boolean)
            setSelectedEffects(effects)
        } else if (Array.isArray(value)) {
            setSelectedEffects(value)
        }
    }, [value])

    const toggleEffect = (effect) => {
        let newEffects
        if (selectedEffects.includes(effect)) {
            newEffects = selectedEffects.filter(e => e !== effect)
        } else {
            if (selectedEffects.length >= maxSelections) {
                newEffects = [...selectedEffects.slice(1), effect]
            } else {
                newEffects = [...selectedEffects, effect]
            }
        }
        setSelectedEffects(newEffects)
        onChange(newEffects.join(', '))
    }

    const clearAll = () => {
        setSelectedEffects([])
        onChange('')
        setSearchFilter('')
        setActiveCategory(null)
    }

    // Filtrer selon recherche
    const getFilteredEffects = (effects) => {
        if (!searchFilter) return effects
        return effects.filter(effect => 
            effect.toLowerCase().includes(searchFilter.toLowerCase())
        )
    }

    return (
        <div className="space-y-4">
            {/* Barre de recherche et filtres */}
            <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="🔍 Rechercher un effet..."
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filtres rapides */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            filterType === 'all' 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30' 
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                    >
                        Tous
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('positive')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            filterType === 'positive' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30' 
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                    >
                        ✓ Positifs
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('negative')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            filterType === 'negative' 
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30' 
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                    >
                        ⚠ Négatifs
                    </button>
                </div>

                {/* Compteur avec barre de progression */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Effets sélectionnés</span>
                        <span className={`font-bold ${selectedEffects.length >= maxSelections ? 'text-amber-400' : 'text-purple-400'}`}>
                            {selectedEffects.length} / {maxSelections}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-300 ${selectedEffects.length >= maxSelections ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                            style={{ width: `${(selectedEffects.length / maxSelections) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Effets sélectionnés */}
            {selectedEffects.length > 0 && (
                <div className="glass rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            Effets actifs
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
                        {selectedEffects.map((effect, idx) => {
                            // Déterminer la couleur selon le type d'effet
                            let gradient = 'from-purple-600 to-indigo-600'
                            let glow = 'shadow-purple-600/30'
                            
                            Object.entries(effectsData).forEach(([catKey, category]) => {
                                if (category.positive && category.positive.includes(effect)) {
                                    gradient = 'from-green-600 to-emerald-600'
                                    glow = 'shadow-green-600/30'
                                } else if (category.negative && category.negative.includes(effect)) {
                                    gradient = 'from-red-600 to-orange-600'
                                    glow = 'shadow-red-600/30'
                                }
                            })

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleEffect(effect)}
                                    className={`group relative px-4 py-2 bg-gradient-to-r ${gradient} rounded-xl text-white text-sm font-medium shadow-lg ${glow} hover:shadow-xl hover:scale-105 transition-all duration-200`}
                                >
                                    <span>{effect}</span>
                                    <span className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity">×</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Grille de catégories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(effectsData).map(([categoryKey, category]) => {
                    const theme = categoryThemes[categoryKey]
                    if (!theme) return null

                    const isActive = activeCategory === categoryKey
                    const totalEffects = (category.positive?.length || 0) + (category.negative?.length || 0) + (category.items?.length || 0)
                    const categoryHasSelection = [...(category.positive || []), ...(category.negative || []), ...(category.items || [])].some(effect => selectedEffects.includes(effect))

                    return (
                        <button
                            key={categoryKey}
                            type="button"
                            onClick={() => setActiveCategory(isActive ? null : categoryKey)}
                            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${theme.bg} border-2 ${isActive ? 'border-purple-500 scale-105' : categoryHasSelection ? 'border-purple-500/30' : 'border-gray-700/30'} hover:scale-105 hover:shadow-xl ${theme.glow}`}
                        >
                            <div className="relative z-10 text-center space-y-2">
                                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                    {theme.icon}
                                </div>
                                <div className={`text-sm font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                    {theme.label}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {totalEffects} effet{totalEffects > 1 ? 's' : ''}
                                </div>
                                {categoryHasSelection && (
                                    <div className="absolute top-2 right-2">
                                        <span className="flex items-center justify-center w-6 h-6 bg-purple-500 rounded-full text-white text-xs font-bold">
                                            {[...(category.positive || []), ...(category.negative || []), ...(category.items || [])].filter(effect => selectedEffects.includes(effect)).length}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        </button>
                    )
                })}
            </div>

            {/* Panneau détaillé de la catégorie active */}
            {activeCategory && (
                <div className="glass rounded-2xl p-6">
                    {(() => {
                        const category = effectsData[activeCategory]
                        const theme = categoryThemes[activeCategory]

                        return (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{theme.icon}</span>
                                        <h3 className={`text-xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                            {theme.label}
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

                                <div className="space-y-6">
                                    {/* Effets positifs */}
                                    {category.positive && (filterType === 'all' || filterType === 'positive') && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Effets Positifs
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getFilteredEffects(category.positive).map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30 scale-105'
                                                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-green-600/30 hover:border-green-600/60'
                                                            }`}
                                                        >
                                                            {effect}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Effets négatifs */}
                                    {category.negative && (filterType === 'all' || filterType === 'negative') && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Effets Négatifs
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getFilteredEffects(category.negative).map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 scale-105'
                                                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-red-600/30 hover:border-red-600/60'
                                                            }`}
                                                        >
                                                            {effect}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Effets neutres/thérapeutiques */}
                                    {category.items && filterType === 'all' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Effets Thérapeutiques
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getFilteredEffects(category.items).map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                                isSelected
                                                                    ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg ${theme.glow} scale-105`
                                                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-purple-600/30 hover:border-purple-600/60'
                                                            }`}
                                                        >
                                                            {effect}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* Message si aucun résultat */}
            {searchFilter && !Object.values(effectsData).some(cat => 
                [...(cat.positive || []), ...(cat.negative || []), ...(cat.items || [])].some(effect => 
                    effect.toLowerCase().includes(searchFilter.toLowerCase())
                )
            ) && (
                <div className="glass rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400">Aucun effet trouvé pour "{searchFilter}"</p>
                    <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        Effacer la recherche
                    </button>
                </div>
            )}
        </div>
    )
}
