import React from 'react'
import { LiquidCard, LiquidRating, LiquidDivider } from '@/components/ui/LiquidUI'
import ColorWheelPicker from '../../../../components/shared/charts/ColorWheelPicker'
import { Eye } from 'lucide-react'

const VISUAL_FIELDS = [
    { key: 'densite', label: 'Densité visuelle', max: 10 },
    { key: 'trichomes', label: 'Trichomes', max: 10 },
    { key: 'pistils', label: 'Pistils', max: 10 },
    { key: 'manucure', label: 'Manucure', max: 10 },
    { key: 'moisissure', label: 'Moisissure (10=aucune)', max: 10 },
    { key: 'graines', label: 'Graines (10=aucune)', max: 10 }
]

export default function VisuelTechnique({ formData = {}, handleChange = () => { } }) {
    const handleColorChange = (colors) => {
        if (handleChange && typeof handleChange === 'function') {
            handleChange('selectedColors', colors)
        }
    }

    return (
        <LiquidCard glow="purple" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">👁️ Visuel & Technique</h3>
                    <p className="text-sm text-white/50">Caractéristiques visuelles et qualité</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Left: Color selection */}
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 w-full">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
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
                    {VISUAL_FIELDS.map(field => (
                        <div key={field.key} className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidRating
                                label={field.label}
                                value={formData[field.key] || 0}
                                max={field.max}
                                color="purple"
                            />
                            <input
                                type="range"
                                min="0"
                                max={field.max}
                                value={formData[field.key] || 0}
                                onChange={(e) => {
                                    if (handleChange && typeof handleChange === 'function') {
                                        handleChange(field.key, parseInt(e.target.value))
                                    }
                                }}
                                className="w-full mt-2 accent-violet-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </LiquidCard>
    )
}
