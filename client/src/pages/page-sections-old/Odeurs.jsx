import React, { useState, useEffect } from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function Odeurs({ formData, handleChange }) {
    const [aromas, setAromas] = useState([])
    const [selectedDominant, setSelectedDominant] = useState(formData.odeursDominantes || [])
    const [selectedSecondary, setSelectedSecondary] = useState(formData.odeursSecondaires || [])

    useEffect(() => {
        // Load aromas from data/aromas.json
        fetch('/data/aromas.json')
            .then(res => res.json())
            .then(data => setAromas(data))
            .catch(err => console.error('Failed to load aromas:', err))
    }, [])

    const toggleAroma = (aroma, type) => {
        const list = type === 'dominant' ? selectedDominant : selectedSecondary
        const setList = type === 'dominant' ? setSelectedDominant : setSelectedSecondary
        const field = type === 'dominant' ? 'odeursDominantes' : 'odeursSecondaires'

        if (list.includes(aroma)) {
            const updated = list.filter(a => a !== aroma)
            setList(updated)
            handleChange(field, updated)
        } else if (list.length < 7) {
            const updated = [...list, aroma]
            setList(updated)
            handleChange(field, updated)
        }
    }

    return (
        <LiquidCard title="👃 Odeurs" bordered>
            <div className="space-y-6">
                {/* Intensité aromatique */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intensité aromatique
                        </label>
                        <span className="text-sm font-bold dark:">
                            {formData.intensiteOdeur || 0}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.intensiteOdeur || 0}
                        onChange={(e) => handleChange('intensiteOdeur', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                </div>

                {/* Notes dominantes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Notes dominantes (max 7) : {selectedDominant.length}/7
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {aromas.map(aroma => (
                            <button
                                key={aroma}
                                type="button"
                                onClick={() => toggleAroma(aroma, 'dominant')}
                                aria-pressed={selectedDominant.includes(aroma)}
                                className={`tag-tile ${selectedDominant.includes(aroma) ? 'tag-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedDominant.includes(aroma) && selectedDominant.length >= 7}
                            >
                                {aroma}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes secondaires */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Notes secondaires (max 7) : {selectedSecondary.length}/7
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {aromas.map(aroma => (
                            <button
                                key={aroma}
                                type="button"
                                onClick={() => toggleAroma(aroma, 'secondary')}
                                aria-pressed={selectedSecondary.includes(aroma)}
                                className={`tag-tile ${selectedSecondary.includes(aroma) ? 'tag-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedSecondary.includes(aroma) && selectedSecondary.length >= 7}
                            >
                                {aroma}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
