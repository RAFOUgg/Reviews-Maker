import { useState, useEffect } from 'react'
import aromasData from '../data/aromas.json'
import tastesData from '../data/tastes-wheel.json'

/**
 * Composant de sélection en roue pour les odeurs et saveurs
 * Remplace les champs textarea par un système de sélection visuelle
 */
export default function WheelSelector({ 
    value = [], 
    onChange, 
    type = 'aromas', // 'aromas' ou 'tastes'
    label = 'Sélectionner',
    maxSelections = 5
}) {
    const [selectedItems, setSelectedItems] = useState([])
    const [expandedCategory, setExpandedCategory] = useState(null)

    // Charger les données appropriées selon le type
    const data = type === 'aromas' ? aromasData : tastesData

    // Initialiser depuis la valeur fournie (si c'est une string, la convertir en array)
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
                // Remplacer le plus ancien
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

    return (
        <div className="space-y-4">
            {/* Sélections actuelles */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    {selectedItems.map((item, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-600/40 rounded-full text-green-400 text-sm cursor-pointer hover:bg-green-600/30 transition-colors"
                            onClick={() => toggleItem(item)}
                        >
                            <span>{item}</span>
                            <span className="text-green-500">×</span>
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
                {selectedItems.length} / {maxSelections} sélectionné{selectedItems.length > 1 ? 's' : ''}
            </div>

            {/* Roue de sélection par catégories */}
            <div className="space-y-2">
                {Object.entries(data.categories || data).map(([categoryKey, category]) => {
                    const isExpanded = expandedCategory === categoryKey
                    const items = category.items || category

                    return (
                        <div key={categoryKey} className="border border-gray-700 rounded-lg overflow-hidden">
                            {/* En-tête de catégorie */}
                            <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-white font-medium">
                                    {category.label || categoryKey}
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
                                <div className="p-3 bg-gray-900/30 flex flex-wrap gap-2">
                                    {Array.isArray(items) ? items.map((item) => {
                                        const isSelected = selectedItems.includes(item)
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleItem(item)}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    isSelected
                                                        ? 'bg-green-600 text-white border-2 border-green-400 shadow-lg shadow-green-600/20'
                                                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    }) : null}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
