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

    // Icônes pour les catégories d'effets
    const categoryThemes = {
        mental: { icon: '🧠' },
        physical: { icon: '💪' },
        therapeutic: { icon: '🌿' }
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
                <div className="flex gap-2 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-all border"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: filterType === 'all' ? 'var(--border)' : 'transparent',
                            color: filterType === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                    >
                        Tous
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('positive')}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-all border"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: filterType === 'positive' ? 'var(--border)' : 'transparent',
                            color: filterType === 'positive' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                    >
                        ✓ Positifs
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('negative')}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-all border"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: filterType === 'negative' ? 'var(--border)' : 'transparent',
                            color: filterType === 'negative' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                    >
                        ✗ Négatifs
                    </button>
                </div>

                {/* Compteur */}
                <div
                    className="ml-auto px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                        backgroundColor: 'transparent',
                        borderColor: selectedItems.length >= maxSelections ? 'var(--accent)' : 'var(--border)',
                        color: selectedItems.length >= maxSelections ? 'var(--accent)' : 'var(--text-primary)'
                    }}
                >
                    {selectedItems.length}/{maxSelections}
                </div>

                {selectedItems.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="px-3 py-1.5 text-sm bg-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.3)] text-[rgb(220,38,38)] rounded-lg transition-colors border border-[rgba(220,38,38,0.3)]"
                    >
                        × Effacer
                    </button>
                )}
            </div>

            {/* Sélections actives */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-transparent rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    {selectedItems.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleItem(item)}
                            className="group px-3 py-1.5 bg-transparent border rounded-lg text-sm font-medium transition-all"
                            style={{
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)'
                            }}
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
                    <div className="flex items-center gap-2 pb-2 border-b border-theme">
                        <span className="text-2xl">{categoryThemes.mental.icon}</span>
                        <h3 className="font-bold text-[rgb(var(--color-primary))]">
                            {effectsData.mental.label}
                        </h3>
                    </div>

                    {/* Effets positifs */}
                    {(filterType === 'all' || filterType === 'positive') && (
                        <div className="space-y-2">
                            <div className="text-xs text-[rgb(var(--text-secondary))] opacity-70 uppercase tracking-wide">Positifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.mental.positive.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isSelected
                                                ? 'bg-[rgb(var(--color-accent))] text-white shadow-lg shadow-[rgba(var(--color-accent),0.4)]'
                                                : 'bg-theme-secondary text-[rgb(var(--text-primary))] hover:bg-theme-tertiary border border-theme'
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
                            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Négatifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.mental.negative.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)'
                                            }}
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
                    <div className="flex items-center gap-2 pb-2 border-b border-theme">
                        <span className="text-2xl">{categoryThemes.physical.icon}</span>
                        <h3 className="font-bold text-[rgb(var(--color-primary))]">
                            {effectsData.physical.label}
                        </h3>
                    </div>

                    {(filterType === 'all' || filterType === 'positive') && (
                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Positifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.physical.positive.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)'
                                            }}
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
                            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Négatifs</div>
                            <div className="flex flex-wrap gap-2">
                                {effectsData.physical.negative.map(effect => {
                                    const isSelected = selectedItems.includes(effect)
                                    return (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleItem(effect)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)'
                                            }}
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
                    <div className="flex items-center gap-2 pb-2 border-b border-theme">
                        <span className="text-2xl">{categoryThemes.therapeutic.icon}</span>
                        <h3 className="font-bold text-[rgb(var(--color-primary))]">
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
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-tertiary)',
                                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                                    }}
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
