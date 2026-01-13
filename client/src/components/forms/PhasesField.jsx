import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * PhasesField - Champ pour sélectionner des phases d'application
 * 
 * @param {Array} value - ['Début croissance', 'Milieu floraison', ...]
 * @param {Function} onChange - Callback onChange
 * @param {Array} phases - Liste des phases disponibles
 */
const PhasesField = ({ value, onChange, phases = [] }) => {
    const [selectedPhases, setSelectedPhases] = useState(value || [])

    useEffect(() => {
        if (value) setSelectedPhases(value)
    }, [value])

    const togglePhase = (phase) => {
        let newSelection

        if (selectedPhases.includes(phase)) {
            newSelection = selectedPhases.filter(p => p !== phase)
        } else {
            newSelection = [...selectedPhases, phase]
        }

        setSelectedPhases(newSelection)
        onChange?.(newSelection)
    }

    const selectAll = () => {
        setSelectedPhases([...phases])
        onChange?.(phases)
    }

    const clearAll = () => {
        setSelectedPhases([])
        onChange?.([])
    }

    return (
        <div className="space-y-3">
            {/* Actions rapides */}
            <div className="flex gap-2">
                <button
                    onClick={selectAll}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-lg transition"
                >
                    ✅ Tout sélectionner
                </button>
                <button
                    onClick={clearAll}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                    ❌ Tout désélectionner
                </button>
            </div>

            {/* Grid de phases */}
            <div className="grid grid-cols-2 gap-2">
                {phases.map((phase, idx) => {
                    const isSelected = selectedPhases.includes(phase)

                    return (
                        <motion.button
                            key={idx}
                            onClick={() => togglePhase(phase)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                px-3 py-2 text-xs font-medium rounded-lg border-2 transition
                ${isSelected
                                    ? 'bg-purple-600 border-purple-500 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                                }
              `}
                        >
                            {isSelected && <span className="mr-1">✓</span>}
                            {phase}
                        </motion.button>
                    )
                })}
            </div>

            {/* Compteur */}
            <div className="text-xs text-gray-400">
                {selectedPhases.length > 0 ? (
                    <span>
                        📊 {selectedPhases.length}/{phases.length} phases sélectionnées
                    </span>
                ) : (
                    <span className="text-gray-500">Aucune phase sélectionnée</span>
                )}
            </div>
        </div>
    )
}

export default PhasesField


