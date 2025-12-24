import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown } from 'lucide-react'

/**
 * Section 2: Génétiques
 * - breeder (optional)
 * - variety (autocomplete depuis cultivars)
 * - type (indica/sativa/hybride)
 * - indicaRatio (slider 0-100%)
 * - parentage (optional)
 * - phenotype (optional)
 */
export default function Genetiques({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [varietySuggestions, setVarietySuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const debounceTimer = useRef(null)
    const suggestionsRef = useRef(null)

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    // Autocomplete variety depuis API cultivars
    const searchCultivars = async (query) => {
        if (!query || query.length < 2) {
            setVarietySuggestions([])
            return
        }

        setLoadingSuggestions(true)
        try {
            const response = await fetch(`/api/cultivars/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const cultivars = await response.json()
                setVarietySuggestions(cultivars)
            }
        } catch (error) {
            console.error('Error searching cultivars:', error)
        } finally {
            setLoadingSuggestions(false)
        }
    }

    const handleVarietyChange = (value) => {
        handleInputChange('variety', value)

        // Debounce search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }
        debounceTimer.current = setTimeout(() => {
            searchCultivars(value)
        }, 300)

        setShowSuggestions(true)
    }

    const selectVariety = (cultivar) => {
        handleInputChange('variety', cultivar.name)
        if (cultivar.breeder) {
            handleInputChange('breeder', cultivar.breeder)
        }
        if (cultivar.indicaRatio !== null && cultivar.indicaRatio !== undefined) {
            handleInputChange('indicaRatio', cultivar.indicaRatio)
        }
        if (cultivar.phenotype) {
            handleInputChange('phenotype', cultivar.phenotype)
        }
        setShowSuggestions(false)
        setVarietySuggestions([])
    }

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="space-y-6">
            {/* Breeder */}
            <div>
                <label htmlFor="breeder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.breeder')}
                </label>
                <input
                    type="text"
                    id="breeder"
                    value={data.breeder || ''}
                    onChange={(e) => handleInputChange('breeder', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder={t('flower.breederPlaceholder')}
                />
            </div>

            {/* Variety (autocomplete) */}
            <div className="relative" ref={suggestionsRef}>
                <label htmlFor="variety" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.variety')}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="variety"
                        value={data.variety || ''}
                        onChange={(e) => handleVarietyChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder={t('flower.varietyPlaceholder')}
                        autoComplete="off"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (varietySuggestions.length > 0 || loadingSuggestions) && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loadingSuggestions ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {t('common.loading')}...
                            </div>
                        ) : (
                            varietySuggestions.map((cultivar) => (
                                <button
                                    key={cultivar.id}
                                    type="button"
                                    onClick={() => selectVariety(cultivar)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {cultivar.name}
                                    </div>
                                    {cultivar.breeder && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('flower.by')} {cultivar.breeder}
                                        </div>
                                    )}
                                    {cultivar.type && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {cultivar.type} {cultivar.indicaRatio !== null && `(${cultivar.indicaRatio}% Indica)`}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.type')}
                </label>
                <select
                    value={data.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none bg-no-repeat bg-right pr-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundSize: '1.5em',
                        backgroundPosition: 'right 0.5rem center'
                    }}
                >
                    <option value="">{t('flower.selectType')}</option>
                    <option value="indica">{t('flower.type.indica')}</option>
                    <option value="sativa">{t('flower.type.sativa')}</option>
                    <option value="hybride">{t('flower.type.hybride')}</option>
                </select>
            </div>

            {/* Indica/Sativa Ratio Slider */}
            <div>
                <label htmlFor="indicaRatio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.indicaRatio')}: {data.indicaRatio || 50}% Indica / {100 - (data.indicaRatio || 50)}% Sativa
                </label>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Sativa</span>
                    <input
                        type="range"
                        id="indicaRatio"
                        min="0"
                        max="100"
                        step="5"
                        value={data.indicaRatio || 50}
                        onChange={(e) => handleInputChange('indicaRatio', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gradient-to-r from-green-400 via-yellow-400 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${100 - (data.indicaRatio || 50)}%, #a855f7 ${100 - (data.indicaRatio || 50)}%, #a855f7 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Indica</span>
                </div>
            </div>

            {/* Parentage */}
            <div>
                <label htmlFor="parentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.parentage')}
                </label>
                <textarea
                    id="parentage"
                    value={data.genetics || ''}
                    onChange={(e) => handleInputChange('genetics', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder={t('flower.parentagePlaceholder')}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('flower.parentageHelper')}
                </p>
            </div>

            {/* Phenotype */}
            <div>
                <label htmlFor="phenotype" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.phenotype')}
                </label>
                <input
                    type="text"
                    id="phenotype"
                    value={data.phenotype || ''}
                    onChange={(e) => handleInputChange('phenotype', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder={t('flower.phenotypePlaceholder')}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('flower.phenotypeHelper')}
                </p>
            </div>
        </div>
    )
}
