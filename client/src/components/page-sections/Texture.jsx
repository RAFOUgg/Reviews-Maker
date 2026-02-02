import React from 'react'
import { useTranslation } from 'react-i18next'
import { Hand } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidRating } from '@/components/ui/LiquidUI'

/**
 * Section 7: Texture
 * - 4 sliders (0-10): dureté, densité tactile, friabilité, collant
 */
export default function Texture({ data, onChange, errors = {} }) {
    const { t } = useTranslation()

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const textureScores = [
        {
            key: 'textureHardness',
            label: t('flower.texture.hardness'),
            description: t('flower.texture.hardnessDesc'),
            icon: '💪'
        },
        {
            key: 'textureDensity',
            label: t('flower.texture.density'),
            description: t('flower.texture.densityDesc'),
            icon: '🔬'
        },
        {
            key: 'textureFriability',
            label: t('flower.texture.friability'),
            description: t('flower.texture.friabilityDesc'),
            icon: '🌾'
        },
        {
            key: 'textureStickiness',
            label: t('flower.texture.stickiness'),
            description: t('flower.texture.stickinessDesc'),
            icon: '🍯'
        }
    ]

    return (
        <div className="space-y-6">
            <LiquidCard glow="pink" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                        <Hand className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">🤚 Texture</h3>
                        <p className="text-sm text-white/50">Propriétés tactiles</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">
                    {textureScores.map(({ key, label, description, icon }) => (
                        <div key={key} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{icon}</span>
                                    <div>
                                        <label className="block text-sm font-medium text-white">
                                            {label}
                                        </label>
                                        <p className="text-xs text-white/50">{description}</p>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-pink-400">
                                    {data[key] || 0}/10
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-white/50 w-6">0</span>
                                <div className="flex-1 relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value={data[key] || 0}
                                        onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #ec4899 100%)`
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-white/50 w-6">10</span>
                            </div>

                            <div className="mt-2">
                                <LiquidRating value={data[key] || 0} max={10} color="pink" />
                            </div>
                        </div>
                    ))}
                </div>
            </LiquidCard>
        </div>
    )
}


