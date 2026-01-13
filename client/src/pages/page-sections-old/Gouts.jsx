import React, { useState, useEffect } from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function Gouts({ formData, handleChange }) {
    const [tastes, setTastes] = useState([])
    const [selectedDryPuff, setSelectedDryPuff] = useState(formData.dryPuff || [])
    const [selectedInhalation, setSelectedInhalation] = useState(formData.inhalation || [])
    const [selectedExpiration, setSelectedExpiration] = useState(formData.expiration || [])

    useEffect(() => {
        // Load tastes from data/tastes.json
        fetch('/data/tastes.json')
            .then(res => res.json())
            .then(data => setTastes(data))
            .catch(err => console.error('Failed to load tastes:', err))
    }, [])

    const toggleTaste = (taste, type) => {
        const lists = {
            'dryPuff': [selectedDryPuff, setSelectedDryPuff, 'dryPuff'],
            'inhalation': [selectedInhalation, setSelectedInhalation, 'inhalation'],
            'expiration': [selectedExpiration, setSelectedExpiration, 'expiration']
        }
        const [list, setList, field] = lists[type]

        if (list.includes(taste)) {
            const updated = list.filter(t => t !== taste)
            setList(updated)
            handleChange(field, updated)
        } else if (list.length < 7) {
            const updated = [...list, taste]
            setList(updated)
            handleChange(field, updated)
        }
    }

    return (
        <LiquidCard title="😋 Goûts" bordered>
            <div className="space-y-6">
                {/* Intensité */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intensité
                        </label>
                        <span className="text-sm font-bold dark:">
                            {formData.intensiteGout || 0}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.intensiteGout || 0}
                        onChange={(e) => handleChange('intensiteGout', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                </div>

                {/* Agressivité/piquant */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Agressivité/piquant
                        </label>
                        <span className="text-sm font-bold dark:">
                            {formData.agressivite || 0}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.agressivite || 0}
                        onChange={(e) => handleChange('agressivite', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                </div>

                {/* Dry puff */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Dry puff / tirage à sec (max 7) : {selectedDryPuff.length}/7
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <button
                                key={taste}
                                type="button"
                                onClick={() => toggleTaste(taste, 'dryPuff')}
                                aria-pressed={selectedDryPuff.includes(taste)}
                                className={`tag-tile ${selectedDryPuff.includes(taste) ? 'tag-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedDryPuff.includes(taste) && selectedDryPuff.length >= 7}
                            >
                                {taste}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inhalation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Inhalation (max 7) : {selectedInhalation.length}/7
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <button
                                key={taste}
                                type="button"
                                onClick={() => toggleTaste(taste, 'inhalation')}
                                aria-pressed={selectedInhalation.includes(taste)}
                                className={`tag-tile ${selectedInhalation.includes(taste) ? 'tag-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedInhalation.includes(taste) && selectedInhalation.length >= 7}
                            >
                                {taste}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expiration/arrière-goût */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Expiration / arrière-goût (max 7) : {selectedExpiration.length}/7
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <button
                                key={taste}
                                type="button"
                                onClick={() => toggleTaste(taste, 'expiration')}
                                aria-pressed={selectedExpiration.includes(taste)}
                                className={`tag-tile ${selectedExpiration.includes(taste) ? 'tag-tile--selected px-5 py-3 font-semibold' : ''}`}
                                disabled={!selectedExpiration.includes(taste) && selectedExpiration.length >= 7}
                            >
                                {taste}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
