import React from 'react'
import LiquidCard from '../../../components/LiquidCard'
import ColorWheelPicker from '../../../components/ui/ColorWheelPicker'

const VISUAL_FIELDS = [
    { key: 'couleur', label: 'Couleur', max: 10 },
    { key: 'densite', label: 'Densité visuelle', max: 10 },
    { key: 'trichomes', label: 'Trichomes', max: 10 },
    { key: 'pistils', label: 'Pistils', max: 10 },
    { key: 'manucure', label: 'Manucure', max: 10 },
    { key: 'moisissure', label: 'Moisissure (10=aucune)', max: 10 },
    { key: 'graines', label: 'Graines (10=aucune)', max: 10 }
]

export default function VisuelTechnique({ formData, handleChange }) {
    const handleColorChange = (colors) => {
        handleChange('selectedColors', colors)
    }

    return (
        <LiquidCard title="👁️ Visuel & Technique" bordered>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Color selection */}
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-gray-900/20 rounded-xl border border-gray-700 w-full">
                        <h4 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <span className="text-lg">🎨</span>
                            Sélection colorimétrique
                        </h4>
                        <ColorWheelPicker
                            value={formData.selectedColors || []}
                            onChange={handleColorChange}
                            maxSelections={5}
                        />
                    </div>
                </div>

                {/* Right: Score sliders */}
                <div className="space-y-4">
                    {VISUAL_FIELDS.filter(field => field.key !== 'couleur').map(field => (
                        <div key={field.key} className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                                {field.label}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max={field.max}
                                value={formData[field.key] || 0}
                                onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                            />
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-1/6 text-center">
                                {formData[field.key] || 0}/{field.max}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </LiquidCard>
    )
}
