import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GOUTS_NOTES } from '../../data/flowerData'
import { Search, X } from 'lucide-react'

/**
 * Section 8: Goûts
 * - goutsIntensiteScore, goutsAgressiviteScore (0-10)
 * - goutsDryPuff, goutsInhalation, goutsExpiration (multi-select max 7)
 */
export default function Gouts({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [searchDryPuff, setSearchDryPuff] = useState('')
    const [searchInhalation, setSearchInhalation] = useState('')
    const [searchExpiration, setSearchExpiration] = useState('')

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const toggleTaste = (field, tasteId) => {
        const current = data[field] || []
        const maxItems = 7

        if (current.includes(tasteId)) {
            handleInputChange(field, current.filter(id => id !== tasteId))
        } else {
            if (current.length >= maxItems) return
            handleInputChange(field, [...current, tasteId])
        }
    }

    const filterTastes = (searchTerm) => {
        if (!searchTerm) return GOUTS_NOTES
        return GOUTS_NOTES.filter(taste =>
            taste.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            taste.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const getTasteById = (id) => GOUTS_NOTES.find(t => t.id === id)

    const groupedTastes = GOUTS_NOTES.reduce((acc, taste) => {
        if (!acc[taste.category]) acc[taste.category] = []
        acc[taste.category].push(taste)
        return acc
    }, {})

    const TasteSection = ({ field, label, searchTerm, setSearchTerm, max = 7 }) => {
        const selected = data[field] || []
        const filteredTastes = filterTastes(searchTerm)

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label} ({selected.length}/{max})
                    </label>
                </div>

                {/* Selected tastes */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selected.map(tasteId => {
                            const taste = getTasteById(tasteId)
                            return (
                                <button
                                    key={tasteId}
                                    type="button"
                                    onClick={() => toggleTaste(field, tasteId)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                >
                                    {taste?.label}
                                    <X className="w-3 h-3" />
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('flower.searchTastes')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {/* Tastes grid */}
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    {Object.entries(groupedTastes).map(([category, tastes]) => {
                        const visibleTastes = tastes.filter(t => filteredTastes.includes(t))
                        if (visibleTastes.length === 0) return null

                        return (
                            <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {visibleTastes.map(taste => {
                                        const isSelected = selected.includes(taste.id)
                                        return (
                                            <button
                                                key={taste.id}
                                                type="button"
                                                onClick={() => toggleTaste(field, taste.id)}
                                                disabled={!isSelected && selected.length >= max}
                                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${isSelected
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {taste.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Intensity slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.gouts.intensite')}
                    </label>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {data.goutsIntensiteScore || 0}/10
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">0</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={data.goutsIntensiteScore || 0}
                        onChange={(e) => handleInputChange('goutsIntensiteScore', parseFloat(e.target.value))}
                        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #f59e0b 0%, #ef4444 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                </div>
            </div>

            {/* Aggressivity slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.gouts.agressivite')}
                    </label>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {data.goutsAgressiviteScore || 0}/10
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">0</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={data.goutsAgressiviteScore || 0}
                        onChange={(e) => handleInputChange('goutsAgressiviteScore', parseFloat(e.target.value))}
                        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #10b981 0%, #ef4444 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                </div>
            </div>

            {/* Dry Puff */}
            <TasteSection
                field="goutsDryPuff"
                label={t('flower.gouts.dryPuff')}
                searchTerm={searchDryPuff}
                setSearchTerm={setSearchDryPuff}
            />

            {/* Inhalation */}
            <TasteSection
                field="goutsInhalation"
                label={t('flower.gouts.inhalation')}
                searchTerm={searchInhalation}
                setSearchTerm={setSearchInhalation}
            />

            {/* Expiration */}
            <TasteSection
                field="goutsExpiration"
                label={t('flower.gouts.expiration')}
                searchTerm={searchExpiration}
                setSearchTerm={setSearchExpiration}
            />
        </div>
    )
}




