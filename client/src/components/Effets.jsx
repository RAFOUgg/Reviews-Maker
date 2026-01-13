import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EFFETS } from '../../data/flowerData'
import { Search, X, Filter } from 'lucide-react'

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
            case 'positif': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            case 'negatif': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            case 'neutre': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
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
            {/* Montée slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.effets.montee')} (rapidité)
                    </label>
                    <span className="text-2xl font-bold dark:">
                        {data.effetsMonteeScore || 0}/10
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Lent</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={data.effetsMonteeScore || 0}
                        onChange={(e) => handleInputChange('effetsMonteeScore', parseFloat(e.target.value))}
                        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Rapide</span>
                </div>
            </div>

            {/* Intensité slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.effets.intensite')}
                    </label>
                    <span className="text-2xl font-bold dark:">
                        {data.effetsIntensiteScore || 0}/10
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">0</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={data.effetsIntensiteScore || 0}
                        onChange={(e) => handleInputChange('effetsIntensiteScore', parseFloat(e.target.value))}
                        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #6366f1 0%, #ec4899 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                </div>
            </div>

            {/* Effects selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.effets.selection')} ({selected.length}/8)
                    </label>
                </div>

                {/* Selected effects */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selected.map(effectId => {
                            const effect = getEffectById(effectId)
                            return (
                                <button
                                    key={effectId}
                                    type="button"
                                    onClick={() => toggleEffect(effectId)}
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity ${getSentimentColor(effect?.sentiment)}`}
                                >
                                    <span>{getSentimentIcon(effect?.sentiment)}</span>
                                    {effect?.label}
                                    <X className="w-3 h-3" />
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('flower.searchEffects')}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* Sentiment filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white appearance-none"
                        >
                            <option value="tous">{t('flower.effets.filter.tous')}</option>
                            <option value="positif">😊 {t('flower.effets.filter.positif')}</option>
                            <option value="neutre">😐 {t('flower.effets.filter.neutre')}</option>
                            <option value="negatif">😰 {t('flower.effets.filter.negatif')}</option>
                        </select>
                    </div>
                </div>

                {/* Effects grid */}
                <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    {Object.entries(groupedEffects).map(([category, effects]) => {
                        if (effects.length === 0) return null

                        return (
                            <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {effects.map(effect => {
                                        const isSelected = selected.includes(effect.id)
                                        return (
                                            <button
                                                key={effect.id}
                                                type="button"
                                                onClick={() => toggleEffect(effect.id)}
                                                disabled={!isSelected && selected.length >= 8}
                                                className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${isSelected ? getSentimentColor(effect.sentiment) : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600' } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <span>{getSentimentIcon(effect.sentiment)}</span>
                                                {effect.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    {Object.keys(groupedEffects).length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t('flower.noEffectsFound')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


