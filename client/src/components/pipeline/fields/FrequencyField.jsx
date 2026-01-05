import { useState, useEffect } from 'react'
import { LiquidInput, LiquidSelect } from '../../liquid'

/**
 * FrequencyField - Champ pour saisir une fréquence (valeur + période)
 * 
 * @param {Object} value - { value: number, period: 'day'|'week'|'watering' }
 * @param {Function} onChange - Callback onChange
 * @param {Array} presets - Préréglages [{label, value}]
 */
const FrequencyField = ({ value, onChange, presets = [] }) => {
    const [frequency, setFrequency] = useState(value || { value: 1, period: 'day' })

    useEffect(() => {
        if (value) setFrequency(value)
    }, [value])

    const periods = [
        { value: 'hour', label: 'par heure' },
        { value: 'day', label: 'par jour' },
        { value: 'week', label: 'par semaine' },
        { value: 'watering', label: 'par arrosage' }
    ]

    const handleValueChange = (val) => {
        const newFreq = { ...frequency, value: parseFloat(val) || 0 }
        setFrequency(newFreq)
        onChange?.(newFreq)
    }

    const handlePeriodChange = (period) => {
        const newFreq = { ...frequency, period }
        setFrequency(newFreq)
        onChange?.(newFreq)
    }

    const applyPreset = (preset) => {
        setFrequency(preset.value)
        onChange?.(preset.value)
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                        Fréquence
                    </label>
                    <LiquidInput
                        type="number"
                        min="0"
                        step="0.5"
                        value={frequency.value}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                        Période
                    </label>
                    <LiquidSelect
                        value={frequency.period}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="w-full"
                    >
                        {periods.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </LiquidSelect>
                </div>
            </div>

            {presets && presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">Préréglages :</span>
                    {presets.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPreset(preset)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="text-xs text-gray-400">
                {frequency.value > 0 && (
                    <span>
                        📊 {frequency.value} fois {periods.find(p => p.value === frequency.period)?.label}
                    </span>
                )}
            </div>
        </div>
    )
}

export default FrequencyField
