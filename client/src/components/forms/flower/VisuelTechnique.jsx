import React from 'react'
import { useTranslation } from 'react-i18next'
import { COULEURS_CANNABIS } from '../../../data/flowerData'

/**
 * Section 5: Visuel Technique
 * - 7 sliders (0-10): couleur, densité, trichomes, pistils, manucure, moisissure, graines
 * - Nuancier couleurs (picker multi-select)
 */
export default function VisuelTechnique({ data, onChange, errors = {} }) {
    const { t } = useTranslation()

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const toggleColor = (colorHex) => {
        const currentColors = data.nuancierColors || []
        const index = currentColors.indexOf(colorHex)

        let newColors
        if (index > -1) {
            // Remove color
            newColors = currentColors.filter(c => c !== colorHex)
        } else {
            // Add color (max 5)
            if (currentColors.length >= 5) {
                return // Max 5 colors
            }
            newColors = [...currentColors, colorHex]
        }

        handleInputChange('nuancierColors', newColors)
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

                    {/* Nuancier colors (only for couleurScore) */}
                    {showNuancier && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                {t('flower.visual.selectColors')} ({(data.nuancierColors || []).length}/5)
                            </p>
                            <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
                                {COULEURS_CANNABIS.map(({ id, label, hex }) => {
                                    const isSelected = (data.nuancierColors || []).includes(hex)
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => toggleColor(hex)}
                                            className={`relative w-10 h-10 rounded-lg border-2 transition-all ${isSelected
                                                    ? 'border-primary-500 ring-2 ring-primary-300 scale-110'
                                                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: hex }}
                                            title={label}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            {(data.nuancierColors || []).length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(data.nuancierColors || []).map((hex) => {
                                        const color = COULEURS_CANNABIS.find(c => c.hex === hex)
                                        return (
                                            <span
                                                key={hex}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-md text-xs border border-gray-300 dark:border-gray-600"
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full border border-gray-400"
                                                    style={{ backgroundColor: hex }}
                                                />
                                                {color?.label || hex}
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
