import React from 'react'
import { useTranslation } from 'react-i18next'
import ColorWheelPicker from '../../ui/ColorWheelPicker'
import WeedPreview from '../../ui/WeedPreview'

/**
 * Section 5: Visuel Technique
 * - 7 sliders (0-10): couleur, densité, trichomes, pistils, manucure, moisissure, graines
 * - ColorWheelPicker avec aperçu dynamique WeedPreview
 */
export default function VisuelTechnique({ data, onChange, errors = {} }) {
    const { t } = useTranslation()

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    // Format: [{ colorId: 'green', percentage: 60 }, ...]
    const handleColorChange = (colors) => {
        handleInputChange('selectedColors', colors)
    }

    const visualScores = [
        {
            key: 'couleurScore',
            label: t('flower.visual.couleur'),
            description: t('flower.visual.couleurDesc'),
            icon: '🎨',
            showNuancier: true
        },
        {
            key: 'densiteScore',
            label: t('flower.visual.densite'),
            description: t('flower.visual.densiteDesc'),
            icon: '🔬'
        },
        {
            key: 'trichomesScore',
            label: t('flower.visual.trichomes'),
            description: t('flower.visual.trichomesDesc'),
            icon: '✨'
        },
        {
            key: 'pistilsScore',
            label: t('flower.visual.pistils'),
            description: t('flower.visual.pistilsDesc'),
            icon: '🌿'
        },
        {
            key: 'manucureScore',
            label: t('flower.visual.manucure'),
            description: t('flower.visual.manucureDesc'),
            icon: '✂️'
        },
        {
            key: 'moisissureScore',
            label: t('flower.visual.moisissure'),
            description: t('flower.visual.moisissureDesc'),
            icon: '🍄',
            inverted: true // 10 = aucune moisissure (bon)
        },
        {
            key: 'grainesScore',
            label: t('flower.visual.graines'),
            description: t('flower.visual.grainesDesc'),
            icon: '🌱',
            inverted: true // 10 = aucune graine (bon)
        }
    ]

    const getScoreColor = (score, inverted = false) => {
        const value = parseFloat(score) || 0
        if (inverted) {
            // For moisissure/graines: higher is better
            if (value >= 8) return 'text-green-600 dark:text-green-400'
            if (value >= 5) return 'text-yellow-600 dark:text-yellow-400'
            return 'text-red-600 dark:text-red-400'
        } else {
            // For normal scores: higher is better
            if (value >= 7) return 'text-green-600 dark:text-green-400'
            if (value >= 4) return 'text-yellow-600 dark:text-yellow-400'
            return 'text-red-600 dark:text-red-400'
        }
    }

    const getScoreBgColor = (score, inverted = false) => {
        const value = parseFloat(score) || 0
        if (inverted) {
            if (value >= 8) return 'bg-green-500'
            if (value >= 5) return 'bg-yellow-500'
            return 'bg-red-500'
        } else {
            if (value >= 7) return 'bg-green-500'
            if (value >= 4) return 'bg-yellow-500'
            return 'bg-red-500'
        }
    }

    return (
        <div className="space-y-8">
            {visualScores.map(({ key, label, description, icon, showNuancier, inverted }) => (
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
                        <div className={`text-2xl font-bold ${getScoreColor(data[key], inverted)}`}>
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
                                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, 
                                        #ef4444 0%, 
                                        #f59e0b 50%, 
                                        #10b981 100%
                                    )`
                                }}
                            />
                            {/* Slider thumb indicator */}
                            <div
                                className={`absolute top-0 h-3 rounded-lg transition-all ${getScoreBgColor(data[key], inverted)}`}
                                style={{
                                    width: `${((data[key] || 0) / 10) * 100}%`,
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                    </div>

                    {/* ColorWheelPicker + WeedPreview (only for couleurScore) */}
                    {showNuancier && (
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sélection couleurs */}
                            <div>
                                <ColorWheelPicker
                                    value={data.selectedColors || []}
                                    onChange={handleColorChange}
                                    maxSelections={5}
                                />
                            </div>

                            {/* Aperçu visuel animé */}
                            <div>
                                <WeedPreview selectedColors={data.selectedColors || []} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
