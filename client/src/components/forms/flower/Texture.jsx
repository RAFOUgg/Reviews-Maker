import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Section 7: Texture
 * - 4 sliders (0-10): dureté, densité tactile, élasticité, collant
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
            key: 'textureElasticity',
            label: t('flower.texture.elasticity'),
            description: t('flower.texture.elasticityDesc'),
            icon: '🎯'
        },
        {
            key: 'textureStickiness',
            label: t('flower.texture.stickiness'),
            description: t('flower.texture.stickinessDesc'),
            icon: '🍯'
        }
    ]

    const getScoreColor = (score) => {
        const value = parseFloat(score) || 0
        if (value >= 7) return 'text-green-600 dark:text-green-400'
        if (value >= 4) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    return (
        <div className="space-y-8">
            {textureScores.map(({ key, label, description, icon }) => (
                <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{icon}</span>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {label}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(data[key])}`}>
                            {data[key] || 0}/10
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-6">0</span>
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
                                    background: `linear-gradient(to right, #9ca3af 0%, #10b981 100%)`
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
