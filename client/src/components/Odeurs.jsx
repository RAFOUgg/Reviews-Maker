import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ODEURS_NOTES } from '../../data/flowerData'
import { Search, X } from 'lucide-react'

/**
 * Section 6: Odeurs
 * - odeursDominantes (multi-select max 7)
 * - odeursSecondaires (multi-select max 7)
 * - odeursIntensiteScore (0-10)
 */
export default function Odeurs({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [searchDominant, setSearchDominant] = useState('')
    const [searchSecondary, setSearchSecondary] = useState('')

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const toggleAroma = (field, aromaId) => {
        const current = data[field] || []
        const maxItems = 7

        if (current.includes(aromaId)) {
            handleInputChange(field, current.filter(id => id !== aromaId))
        } else {
            if (current.length >= maxItems) return
            handleInputChange(field, [...current, aromaId])
        }
    }

    const filterAromas = (searchTerm) => {
        if (!searchTerm) return ODEURS_NOTES
        return ODEURS_NOTES.filter(aroma =>
            aroma.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aroma.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const getAromaById = (id) => ODEURS_NOTES.find(a => a.id === id)

    const groupedAromas = ODEURS_NOTES.reduce((acc, aroma) => {
        if (!acc[aroma.category]) acc[aroma.category] = []
        acc[aroma.category].push(aroma)
        return acc
    }, {})

    const AromaSection = ({ field, label, searchTerm, setSearchTerm, max = 7 }) => {
        const selected = data[field] || []
        const filteredAromas = filterAromas(searchTerm)

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label} ({selected.length}/{max})
                    </label>
                </div>

                {/* Selected aromas */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selected.map(aromaId => {
                            const aroma = getAromaById(aromaId)
                            return (
                                <button
                                    key={aromaId}
                                    type="button"
                                    onClick={() => toggleAroma(field, aromaId)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                                >
                                    {aroma?.label}
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
                        placeholder={t('flower.searchAromas')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {/* Aromas grid */}
                <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    {Object.entries(groupedAromas).map(([category, aromas]) => {
                        const visibleAromas = aromas.filter(a => filteredAromas.includes(a))
                        if (visibleAromas.length === 0) return null

                        return (
                            <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {visibleAromas.map(aroma => {
                                        const isSelected = selected.includes(aroma.id)
                                        return (
                                            <button
                                                key={aroma.id}
                                                type="button"
                                                onClick={() => toggleAroma(field, aroma.id)}
                                                disabled={!isSelected && selected.length >= max}
                                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${isSelected
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {aroma.label}
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
            {/* Dominant aromas */}
            <AromaSection
                field="odeursDominantes"
                label={t('flower.odeurs.dominantes')}
                searchTerm={searchDominant}
                setSearchTerm={setSearchDominant}
            />

            {/* Secondary aromas */}
            <AromaSection
                field="odeursSecondaires"
                label={t('flower.odeurs.secondaires')}
                searchTerm={searchSecondary}
                setSearchTerm={setSearchSecondary}
            />

            {/* Intensity slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('flower.odeurs.intensite')}
                    </label>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {data.odeursIntensiteScore || 0}/10
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">0</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={data.odeursIntensiteScore || 0}
                        onChange={(e) => handleInputChange('odeursIntensiteScore', parseFloat(e.target.value))}
                        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #a855f7 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6">10</span>
                </div>
            </div>
        </div>
    )
}


