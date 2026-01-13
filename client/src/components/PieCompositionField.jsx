import { useState, useEffect } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts'

/**
 * PieCompositionField - Champ pour définir composition en % (pie chart)
 * 
 * @param {Object} value - { soil: 50, coco: 30, perlite: 20, ... }
 * @param {Function} onChange - Callback onChange
 * @param {Array} components - [{id, label, color}]
 */
const PieCompositionField = ({ value, onChange, components = [] }) => {
    const [composition, setComposition] = useState(value || {})
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        if (value) setComposition(value)
    }, [value])

    // Calculer le total
    const total = Object.values(composition).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)

    // Données pour le pie chart
    const chartData = components
        .filter(comp => composition[comp.id] > 0)
        .map(comp => ({
            name: comp.label,
            value: parseFloat(composition[comp.id]) || 0,
            color: comp.color
        }))

    const handleChange = (componentId, val) => {
        const newComp = { ...composition, [componentId]: parseFloat(val) || 0 }
        setComposition(newComp)
        onChange?.(newComp)
    }

    const normalize = () => {
        if (total === 0) return

        const normalized = {}
        Object.keys(composition).forEach(key => {
            normalized[key] = ((composition[key] / total) * 100).toFixed(1)
        })

        setComposition(normalized)
        onChange?.(normalized)
    }

    const reset = () => {
        setComposition({})
        onChange?.({})
    }

    return (
        <div className="space-y-3">
            {/* Pie Chart */}
            {chartData.length > 0 && (
                <div className="relative">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-2 right-2 text-xs">
                        <span className={`font-semibold ${total === 100 ? 'text-green-400' : 'text-orange-400'}`}>
                            Total: {total.toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}

            {/* Toggle Edit Mode */}
            <button
                onClick={() => setEditMode(!editMode)}
                className="text-xs text-purple-400 hover:text-purple-300 transition"
            >
                {editMode ? '✅ Fermer l\'édition' : '✏️ Modifier la composition'}
            </button>

            {/* Edit Mode */}
            {editMode && (
                <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    {components.map(comp => (
                        <div key={comp.id} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                            <label className="text-xs flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: comp.color }}
                                />
                                {comp.label}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={composition[comp.id] || 0}
                                onChange={(e) => handleChange(comp.id, e.target.value)}
                                className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    ))}

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={normalize}
                            className="flex-1 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                            disabled={total === 0}
                        >
                            📊 Normaliser à 100%
                        </button>
                        <button
                            onClick={reset}
                            className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 rounded-lg transition"
                        >
                            🗑️ Réinitialiser
                        </button>
                    </div>

                    {total !== 100 && total > 0 && (
                        <div className="text-xs text-orange-400 mt-2">
                            ⚠️ Le total n'est pas 100%. Cliquez sur "Normaliser" pour ajuster.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PieCompositionField

