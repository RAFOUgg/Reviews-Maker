import { useState, useEffect } from 'react'
import { LiquidInput } from './liquid'

/**
 * PhotoperiodField - Champ pour saisir photopériode (heures ON/OFF)
 * 
 * @param {Object} value - { on: number, off: number }
 * @param {Function} onChange - Callback onChange
 * @param {Array} presets - Préréglages [{label, value}]
 */
const PhotoperiodField = ({ value, onChange, presets = [] }) => {
    const [photoperiod, setPhotoperiod] = useState(value || { on: 18, off: 6 })

    useEffect(() => {
        if (value) setPhotoperiod(value)
    }, [value])

    const handleChange = (field, val) => {
        let newValue = parseInt(val) || 0
        if (newValue < 0) newValue = 0
        if (newValue > 24) newValue = 24

        const newPhoto = { ...photoperiod }

        if (field === 'on') {
            newPhoto.on = newValue
            newPhoto.off = 24 - newValue
        } else {
            newPhoto.off = newValue
            newPhoto.on = 24 - newValue
        }

        setPhotoperiod(newPhoto)
        onChange?.(newPhoto)
    }

    const applyPreset = (preset) => {
        setPhotoperiod(preset.value)
        onChange?.(preset.value)
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                        <span>🌞</span> Heures ON
                    </label>
                    <LiquidInput
                        type="number"
                        min="0"
                        max="24"
                        step="1"
                        value={photoperiod.on}
                        onChange={(e) => handleChange('on', e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                        <span>🌙</span> Heures OFF
                    </label>
                    <LiquidInput
                        type="number"
                        min="0"
                        max="24"
                        step="1"
                        value={photoperiod.off}
                        onChange={(e) => handleChange('off', e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Visualisation */}
            <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                    style={{ width: `${(photoperiod.on / 24) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-lg">
                    {photoperiod.on}/{photoperiod.off}
                </div>
            </div>

            {/* Préréglages */}
            {presets && presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">Préréglages :</span>
                    {presets.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPreset(preset)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition ${photoperiod.on === preset.value.on && photoperiod.off === preset.value.off
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PhotoperiodField

