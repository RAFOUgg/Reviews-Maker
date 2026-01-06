import React from 'react'
import LiquidCard from '../../../components/LiquidCard'
import ColorWheelPicker from '../../../components/ui/ColorWheelPicker'
import WeedPreview from '../../../components/ui/WeedPreview'

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
            <div className="space-y-6">
                {VISUAL_FIELDS.map(field => (
                    <div key={field.key}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {formData[field.key] || 0}/{field.max}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={field.max}
                            value={formData[field.key] || 0}
                            onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />

                        {/* ColorWheelPicker + WeedPreview uniquement pour Couleur */}
                        {field.key === 'couleur' && (
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-gray-900/20 rounded-xl border border-gray-700">
                                <div>
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
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                                        <span className="text-lg">✨</span>
                                        Aperçu dynamique
                                    </h4>
                                    <WeedPreview
                                        selectedColors={formData.selectedColors || []}
                                        densite={formData.densite || 5}
                                        trichomes={formData.trichomes || 5}
                                        manucure={formData.manucure || 5}
                                        moisissure={formData.moisissure || 10}
                                        graines={formData.graines || 10}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </LiquidCard>
    )
}
