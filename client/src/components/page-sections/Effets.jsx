import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EFFETS } from '../../data/flowerData'
import { Search, X, Filter, Zap } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidChip, LiquidRating } from '@/components/ui/LiquidUI'

/**
 * Section 9: Effets
 * - effetsMonteeScore, effetsIntensiteScore (0-10)
 * - effetsSelectionnes (multi-select max 8 avec filter sentiment)
 */
export default function Effets({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState('')
    const [sentimentFilter, setSentimentFilter] = useState('tous')

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const toggleEffect = (effectId) => {
        const current = data.effetsSelectionnes || []
        const maxItems = 8

        if (current.includes(effectId)) {
            handleInputChange('effetsSelectionnes', current.filter(id => id !== effectId))
        } else {
            if (current.length >= maxItems) return
            handleInputChange('effetsSelectionnes', [...current, effectId])
        }
    }

    const filterEffects = () => {
        let filtered = EFFETS

        // Filter by sentiment
        if (sentimentFilter !== 'tous') {
            filtered = filtered.filter(e => e.sentiment === sentimentFilter)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return filtered
    }

    const getEffectById = (id) => EFFETS.find(e => e.id === id)

    const groupedEffects = filterEffects().reduce((acc, effect) => {
        if (!acc[effect.category]) acc[effect.category] = []
        acc[effect.category].push(effect)
        return acc
    }, {})

    const selected = data.effetsSelectionnes || []

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positif': return 'green'
            case 'negatif': return 'red'
            case 'neutre': return 'gray'
            default: return 'gray'
        }
    }

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positif': return '😊'
            case 'negatif': return '😰'
            case 'neutre': return '😐'
            default: return '🟡'
        }
    }

    return (
        <div className="space-y-6">
            <LiquidCard glow="cyan" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">💥 Effets ressentis</h3>
                        <p className="text-sm text-white/50">Montée, intensité et sélection</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">
                    {/* Montée slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.effets.montee')} (rapidité)
                            </label>
                            <span className="text-2xl font-bold text-cyan-400">
                                {data.effetsMonteeScore || 0}/10
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50">Lent</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.effetsMonteeScore || 0}
                                onChange={(e) => handleInputChange('effetsMonteeScore', parseFloat(e.target.value))}
                                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #06b6d4 100%)`
                                }}
                            />
                            <span className="text-xs text-white/50">Rapide</span>
                        </div>
                        <LiquidRating value={data.effetsMonteeScore || 0} max={10} color="cyan" />
                    </div>

                    {/* Intensité slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.effets.intensite')}
                            </label>
                            <span className="text-2xl font-bold text-cyan-400">
                                {data.effetsIntensiteScore || 0}/10
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50 w-6">0</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.effetsIntensiteScore || 0}
                                onChange={(e) => handleInputChange('effetsIntensiteScore', parseFloat(e.target.value))}
                                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #ec4899 100%)`
                                }}
                            />
                            <span className="text-xs text-white/50 w-6">10</span>
                        </div>
                        <LiquidRating value={data.effetsIntensiteScore || 0} max={10} color="purple" />
                    </div>

                    {/* Effects selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.effets.selection')} ({selected.length}/8)
                            </label>
                        </div>

                        {/* Selected effects */}
                        {selected.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selected.map(effectId => {
                                    const effect = getEffectById(effectId)
                                    return (
                                        <LiquidChip
                                            key={effectId}
                                            active
                                            color={getSentimentColor(effect?.sentiment)}
                                            onRemove={() => toggleEffect(effectId)}
                                        >
                                            {getSentimentIcon(effect?.sentiment)} {effect?.label}
                                        </LiquidChip>
                                    )
                                })}
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('flower.searchEffects')}
                                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            {/* Sentiment filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <select
                                    value={sentimentFilter}
                                    onChange={(e) => setSentimentFilter(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
                                >
                                    <option value="tous">{t('flower.effets.filter.tous')}</option>
                                    <option value="positif">😊 {t('flower.effets.filter.positif')}</option>
                                    <option value="neutre">😐 {t('flower.effets.filter.neutre')}</option>
                                    <option value="negatif">😰 {t('flower.effets.filter.negatif')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Effects grid */}
                        <div className="max-h-96 overflow-y-auto border border-white/10 rounded-xl p-4 bg-white/5">
                            {Object.entries(groupedEffects).map(([category, effects]) => {
                                if (effects.length === 0) return null

                                return (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <h4 className="text-xs font-semibold text-white/50 uppercase mb-2">
                                            {category}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {effects.map(effect => {
                                                const isSelected = selected.includes(effect.id)
                                                return (
                                                    <LiquidChip
                                                        key={effect.id}
                                                        active={isSelected}
                                                        color={getSentimentColor(effect.sentiment)}
                                                        onClick={() => toggleEffect(effect.id)}
                                                        disabled={!isSelected && selected.length >= 8}
                                                    >
                                                        {getSentimentIcon(effect.sentiment)} {effect.label}
                                                    </LiquidChip>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}

                            {Object.keys(groupedEffects).length === 0 && (
                                <div className="text-center py-8 text-white/40">
                                    {t('flower.noEffectsFound')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}




