import { useState, useEffect } from 'react'
import effectsData from '../data/effects-wheel.json'

/**
 * Composant de sélection pour les effets
 * Organisé par catégories (mental, physique, thérapeutique)
 */
export default function EffectSelector({ 
    value = [], 
    onChange, 
    maxSelections = 8
}) {
    const [selectedEffects, setSelectedEffects] = useState([])
    const [expandedCategory, setExpandedCategory] = useState(null)

    // Initialiser depuis la valeur fournie
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
                // Remplacer le plus ancien
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
    }

    return (
        <div className="space-y-4">
            {/* Effets sélectionnés */}
            {selectedEffects.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    {selectedEffects.map((effect, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 border border-purple-600/40 rounded-full text-purple-400 text-sm cursor-pointer hover:bg-purple-600/30 transition-colors"
                            onClick={() => toggleEffect(effect)}
                        >
                            <span>{effect}</span>
                            <span className="text-purple-500">×</span>
                        </span>
                    ))}
                    <button
                        type="button"
                        onClick={clearAll}
                        className="px-3 py-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                        Tout effacer
                    </button>
                </div>
            )}

            {/* Indicateur de limite */}
            <div className="text-xs text-gray-400 text-right">
                {selectedEffects.length} / {maxSelections} sélectionné{selectedEffects.length > 1 ? 's' : ''}
            </div>

            {/* Catégories d'effets */}
            <div className="space-y-2">
                {Object.entries(effectsData).map(([categoryKey, category]) => {
                    const isExpanded = expandedCategory === categoryKey

                    return (
                        <div key={categoryKey} className="border border-gray-700 rounded-lg overflow-hidden">
                            {/* En-tête de catégorie */}
                            <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-white font-medium flex items-center gap-2">
                                    {categoryKey === 'mental' && '🧠'}
                                    {categoryKey === 'physical' && '💪'}
                                    {categoryKey === 'therapeutic' && '💊'}
                                    {category.label}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Items de la catégorie */}
                            {isExpanded && (
                                <div className="bg-gray-900/30">
                                    {/* Effets positifs */}
                                    {category.positive && (
                                        <div className="p-3 border-b border-gray-700">
                                            <div className="text-xs text-green-400 font-semibold mb-2">✓ Effets Positifs</div>
                                            <div className="flex flex-wrap gap-2">
                                                {category.positive.map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                                isSelected
                                                                    ? 'bg-green-600 text-white border-2 border-green-400 shadow-lg shadow-green-600/20'
                                                                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-green-600/30'
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
                                    {category.negative && (
                                        <div className="p-3 border-b border-gray-700">
                                            <div className="text-xs text-red-400 font-semibold mb-2">⚠ Effets Négatifs</div>
                                            <div className="flex flex-wrap gap-2">
                                                {category.negative.map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                                isSelected
                                                                    ? 'bg-red-600 text-white border-2 border-red-400 shadow-lg shadow-red-600/20'
                                                                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-red-600/30'
                                                            }`}
                                                        >
                                                            {effect}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items généraux (pour therapeutic) */}
                                    {category.items && (
                                        <div className="p-3">
                                            <div className="flex flex-wrap gap-2">
                                                {category.items.map((effect) => {
                                                    const isSelected = selectedEffects.includes(effect)
                                                    return (
                                                        <button
                                                            key={effect}
                                                            type="button"
                                                            onClick={() => toggleEffect(effect)}
                                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                                isSelected
                                                                    ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-600/20'
                                                                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-purple-600/30'
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
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
