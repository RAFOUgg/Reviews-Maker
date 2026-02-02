import React from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidRating } from '@/components/ui/LiquidUI'
import ColorWheelPicker from '../shared/charts/ColorWheelPicker'
import WeedPreview from '../shared/preview/WeedPreview'

/**
 * Section 5: Visuel Technique
 * - 7 sliders (0-10): couleur, densité, trichomes, pistils, manucure, moisissure, graines
 * - ColorWheelPicker avec aperçu dynamique WeedPreview
 * 
 * Liquid Glass Design - glow="purple"
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
            if (value >= 8) return 'text-green-400'
            if (value >= 5) return 'text-yellow-400'
            return 'text-red-400'
        } else {
            if (value >= 7) return 'text-green-400'
            if (value >= 4) return 'text-yellow-400'
            return 'text-red-400'
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

    const getRatingColor = (score, inverted = false) => {
        const value = parseFloat(score) || 0
        if (inverted) {
            if (value >= 8) return 'green'
            if (value >= 5) return 'amber'
            return 'red'
        } else {
            if (value >= 7) return 'green'
            if (value >= 4) return 'amber'
            return 'red'
        }
    }

    return (
        <LiquidCard glow="purple" padding="lg">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30">
                    <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {t('flower.visual.title', 'Visuel & Technique')}
                    </h3>
                    <p className="text-sm text-white/50">
                        {t('flower.visual.subtitle', 'Évaluez l\'apparence et la qualité visuelle')}
                    </p>
                </div>
            </div>

            <LiquidDivider className="mb-6" />

            {/* Visual Scores */}
            <div className="space-y-6">
                {visualScores.map(({ key, label, description, icon, showNuancier, inverted }) => (
                    <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{icon}</span>
                                <div>
                                    <label className="block text-sm font-medium text-white">
                                        {label}
                                    </label>
                                    <p className="text-xs text-white/50">{description}</p>
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(data[key], inverted)}`}>
                                {data[key] || 0}/10
                            </div>
                        </div>

                        {/* Slider */}
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-xs text-white/40 w-6">0</span>
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
                                        background: `linear-gradient(to right, 
                                            rgba(239, 68, 68, 0.3) 0%, 
                                            rgba(245, 158, 11, 0.3) 50%, 
                                            rgba(16, 185, 129, 0.3) 100%
                                        )`
                                    }}
                                />
                                {/* Slider fill */}
                                <div
                                    className={`absolute top-0 h-3 rounded-lg transition-all pointer-events-none ${getScoreBgColor(data[key], inverted)}`}
                                    style={{
                                        width: `${((data[key] || 0) / 10) * 100}%`
                                    }}
                                />
                            </div>
                            <span className="text-xs text-white/40 w-6">10</span>
                        </div>

                        {/* Rating bar */}
                        <LiquidRating
                            value={(data[key] || 0) / 10}
                            max={1}
                            color={getRatingColor(data[key], inverted)}
                        />

                        {/* ColorWheelPicker + WeedPreview (only for couleurScore) */}
                        {showNuancier && (
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sélection couleurs */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-sm font-medium text-white/80 mb-3">
                                        {t('flower.visual.colorSelection', 'Sélection des couleurs')}
                                    </h4>
                                    <ColorWheelPicker
                                        value={data.selectedColors || []}
                                        onChange={handleColorChange}
                                        maxSelections={5}
                                        className="compact-size closed"
                                    />
                                </div>

                                {/* Aperçu visuel animé */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-sm font-medium text-white/80 mb-3">
                                        {t('flower.visual.preview', 'Aperçu')}
                                    </h4>
                                    <WeedPreview selectedColors={data.selectedColors || []} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </LiquidCard>
    )
}



