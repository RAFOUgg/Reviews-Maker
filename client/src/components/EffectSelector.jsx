import { useState, useEffect } from 'react'
import effectsData from '../data/effects-wheel.json'

/**
 * EffectSelector - Version 3 Colonnes Inline Simplifiée
 * Layout: Mental | Physical | Therapeutic
 * Tous les effets visibles d'un coup, pas de modal
 */
export default function EffectSelector({
    value = [],
    onChange,
    maxSelections = 8
}) {
    const [selectedItems, setSelectedItems] = useState([])
    const [filterType, setFilterType] = useState('all') // 'all', 'positive', 'negative'

    const categoryThemes = {
        mental: {
            gradient: 'from-purple-500 to-pink-500',
            icon: '🧠',
            positiveColor: 'bg-purple-500',
            negativeColor: 'bg-pink-600'
        },
        physical: {
            gradient: 'from-blue-500 to-cyan-500',
            icon: '💪',
            positiveColor: 'bg-blue-500',
            negativeColor: 'bg-cyan-600'
        },
        therapeutic: {
            gradient: 'from-green-500 to-emerald-500',
            icon: '🌿',
            color: 'bg-green-500'
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
    }

    const isItemVisible = (item, type) => {
        if (filterType === 'all') return true
        if (filterType === 'positive' && type === 'positive') return true
        if (filterType === 'negative' && type === 'negative') return true
        return false
    }

    return (
        <div className="space-y-3">
            {/* Header avec filtres et compteur */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Filtres */}
                <div className="flex gap-2 bg-gray-900/50 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${filterType === 'all' ? 'bg-transparent border-white/40 text-white glow-text-subtle' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('positive')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${filterType === 'positive' ? 'bg-transparent border-white/40 text-white glow-text-subtle' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20'
                            }`}
                    >
                        ✓ Positifs
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('negative')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${filterType === 'negative' ? 'bg-transparent border-red-400/40 text-red-400 glow-text-subtle' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20'
                            }`}
                    >
                        ✗ Négatifs
                    </button>
                </div>

                {/* Compteur */}
                <div className={`ml-auto px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${selectedItems.length >= maxSelections ? 'bg-transparent border-amber-400/40 text-amber-400 glow-text-subtle' : 'bg-transparent border-white/30 text-white glow-text-subtle'
                    }`}>
                    {selectedItems.length}/{maxSelections}
                </div>

                {selectedItems.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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

            {/* Grille 3 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mental */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                        <span className="text-2xl">{categoryThemes.mental.icon}</span>
                        <h3 className={`font-semibold bg-gradient-to-r ${categoryThemes.mental.gradient} bg-clip-text text-transparent`}>
                            {effectsData.mental.label}
                        </h3>
                    </div>

                    {/* Effets positifs */}
                    {(filterType === 'all' || filterType === 'positive') && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Positifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.mental.positive.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                                ? `${categoryThemes.mental.positiveColor} text-white shadow-md text-stroke-white-thin`
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
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
                    {(filterType === 'all' || filterType === 'negative') && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Négatifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.mental.negative.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                                ? `${categoryThemes.mental.negativeColor} text-white shadow-md text-stroke-white-thin`
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
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

                {/* Physical */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                        <span className="text-2xl">{categoryThemes.physical.icon}</span>
                        <h3 className={`font-semibold bg-gradient-to-r ${categoryThemes.physical.gradient} bg-clip-text text-transparent`}>
                            {effectsData.physical.label}
                        </h3>
                    </div>

                    {(filterType === 'all' || filterType === 'positive') && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Positifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.physical.positive.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                                ? `${categoryThemes.physical.positiveColor} text-white shadow-md text-stroke-white-thin`
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                                                }`}
                                        >
                                            {effect}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {(filterType === 'all' || filterType === 'negative') && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Négatifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.physical.negative.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                                ? `${categoryThemes.physical.negativeColor} text-white shadow-md text-stroke-white-thin`
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
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

                {/* Therapeutic */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                        <span className="text-2xl">{categoryThemes.therapeutic.icon}</span>
                        <h3 className={`font-semibold bg-gradient-to-r ${categoryThemes.therapeutic.gradient} bg-clip-text text-transparent`}>
                            {effectsData.therapeutic.label}
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {effectsData.therapeutic.items.map(effect => {
                            const isSelected = selectedItems.includes(effect)
                            return (
                                <button
                                    key={effect}
                                    type="button"
                                    onClick={() => toggleItem(effect)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                        ? `${categoryThemes.therapeutic.color} text-white shadow-md text-stroke-white-thin`
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                                        }`}
                                >
                                    {effect}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
