import React, { useState, useEffect } from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function Effets({ formData, handleChange }) {
    const [effects, setEffects] = useState([])
    const [filter, setFilter] = useState('tous')
    const [selectedEffects, setSelectedEffects] = useState(formData.effets || [])

    useEffect(() => {
        // Load effects from data/effects.json
        fetch('/data/effects.json')
            .then(res => res.json())
            .then(data => setEffects(data))
            .catch(err => console.error('Failed to load effects:', err))
    }, [])

    const toggleEffect = (effect) => {
        if (selectedEffects.includes(effect)) {
            const updated = selectedEffects.filter(e => e !== effect)
            setSelectedEffects(updated)
            handleChange('effets', updated)
        } else if (selectedEffects.length < 8) {
            const updated = [...selectedEffects, effect]
            setSelectedEffects(updated)
            handleChange('effets', updated)
        }
    }

    const filteredEffects = effects.filter(effect => {
        if (filter === 'tous') return true
        return effect.type === filter
    })

    return (
        <LiquidCard title="💥 Effets ressentis" bordered>
            <div className="space-y-6">
                {/* Montée rapidité */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Montée (rapidité)
                        </label>
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                            {formData.montee || 0}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.montee || 0}
                        onChange={(e) => handleChange('montee', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                </div>

                {/* Intensité */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intensité
                        </label>
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                            {formData.intensiteEffet || 0}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.intensiteEffet || 0}
                        onChange={(e) => handleChange('intensiteEffet', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                </div>

                {/* Filtres par type */}
                <div className="flex gap-2 mb-4">
                    {['tous', 'mental', 'physique', 'therapeutique', 'positif', 'negatif'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Sélection des effets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Sélection des effets (max 8) : {selectedEffects.length}/8
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {filteredEffects.map(effect => (
                            <button
                                key={effect.name}
                                type="button"
                                onClick={() => toggleEffect(effect.name)}
                                aria-pressed={selectedEffects.includes(effect.name)}
                                className={`effect-tile ${selectedEffects.includes(effect.name) ? 'effect-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedEffects.includes(effect.name) && selectedEffects.length >= 8}
                            >
                                {effect.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
