import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Dna, Loader2 } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidInput, LiquidTextarea } from '@/components/ui/LiquidUI'

/**
 * Section 2: Génétiques
 * - breeder (optional)
 * - variety (autocomplete depuis cultivars)
 * - type (indica/sativa/hybride)
 * - indicaRatio (slider 0-100%)
 * - parentage (optional)
 * - phenotype (optional)
 * 
 * Liquid Glass Design - glow="cyan"
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
        <LiquidCard glow="cyan" padding="lg">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                    <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {t('flower.genetics.title', 'Génétiques')}
                    </h3>
                    <p className="text-sm text-white/50">
                        {t('flower.genetics.subtitle', 'Informations sur la variété et lignée')}
                    </p>
                </div>
            </div>

            <LiquidDivider className="mb-6" />

            <div className="space-y-6">
                {/* Breeder */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label htmlFor="breeder" className="block text-sm font-medium text-white/80 mb-2">
                        {t('flower.breeder')}
                    </label>
                    <input
                        type="text"
                        id="breeder"
                        value={data.breeder || ''}
                        onChange={(e) => handleInputChange('breeder', e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        placeholder={t('flower.breederPlaceholder')}
                    />
                </div>

                {/* Variety (autocomplete) */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="relative" ref={suggestionsRef}>
                        <label htmlFor="variety" className="block text-sm font-medium text-white/80 mb-2">
                            {t('flower.variety')}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="variety"
                                value={data.variety || ''}
                                onChange={(e) => handleVarietyChange(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full px-4 py-3 pr-12 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                placeholder={t('flower.varietyPlaceholder')}
                                autoComplete="off"
                            />
                            {loadingSuggestions ? (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
                            ) : (
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            )}
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && (varietySuggestions.length > 0 || loadingSuggestions) && (
                            <div className="absolute z-20 w-full mt-2 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-xl shadow-black/30 max-h-60 overflow-y-auto">
                                {loadingSuggestions ? (
                                    <div className="px-4 py-3 text-sm text-white/50 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('common.loading')}...
                                    </div>
                                ) : (
                                    varietySuggestions.map((cultivar) => (
                                        <button
                                            key={cultivar.id}
                                            type="button"
                                            onClick={() => selectVariety(cultivar)}
                                            className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors"
                                        >
                                            <div className="font-medium text-white">
                                                {cultivar.name}
                                            </div>
                                            {cultivar.breeder && (
                                                <div className="text-sm text-white/50">
                                                    {t('flower.by')} {cultivar.breeder}
                                                </div>
                                            )}
                                            {cultivar.type && (
                                                <div className="text-xs text-cyan-400/70 mt-1">
                                                    {cultivar.type} {cultivar.indicaRatio !== null && `(${cultivar.indicaRatio}% Indica)`}
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Type */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        {t('flower.type')}
                    </label>
                    <select
                        value={data.type || ''}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundSize: '1.5em',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <option value="" className="bg-[#1a1a2e]">{t('flower.selectType')}</option>
                        <option value="indica" className="bg-[#1a1a2e]">{t('flower.type.indica')}</option>
                        <option value="sativa" className="bg-[#1a1a2e]">{t('flower.type.sativa')}</option>
                        <option value="hybride" className="bg-[#1a1a2e]">{t('flower.type.hybride')}</option>
                    </select>
                </div>

                {/* Indica/Sativa Ratio Slider */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label htmlFor="indicaRatio" className="block text-sm font-medium text-white/80 mb-3">
                        {t('flower.indicaRatio')}:
                        <span className="ml-2 text-purple-400">{data.indicaRatio || 50}% Indica</span>
                        <span className="text-white/40"> / </span>
                        <span className="text-green-400">{100 - (data.indicaRatio || 50)}% Sativa</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-green-400 font-medium">Sativa</span>
                        <div className="flex-1 relative">
                            <input
                                type="range"
                                id="indicaRatio"
                                min="0"
                                max="100"
                                step="5"
                                value={data.indicaRatio || 50}
                                onChange={(e) => handleInputChange('indicaRatio', parseInt(e.target.value))}
                                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${100 - (data.indicaRatio || 50)}%, #a855f7 ${100 - (data.indicaRatio || 50)}%, #a855f7 100%)`
                                }}
                            />
                        </div>
                        <span className="text-xs text-purple-400 font-medium">Indica</span>
                    </div>
                    {/* Visual indicator */}
                    <div className="mt-3 flex gap-2">
                        <div
                            className="h-2 rounded-l-full bg-green-500 transition-all"
                            style={{ width: `${100 - (data.indicaRatio || 50)}%` }}
                        />
                        <div
                            className="h-2 rounded-r-full bg-purple-500 transition-all"
                            style={{ width: `${data.indicaRatio || 50}%` }}
                        />
                    </div>
                </div>

                {/* Parentage */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label htmlFor="parentage" className="block text-sm font-medium text-white/80 mb-2">
                        {t('flower.parentage')}
                    </label>
                    <textarea
                        id="parentage"
                        value={data.genetics || ''}
                        onChange={(e) => handleInputChange('genetics', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                        placeholder={t('flower.parentagePlaceholder')}
                    />
                    <p className="mt-2 text-xs text-white/40">
                        {t('flower.parentageHelper')}
                    </p>
                </div>

                {/* Phenotype */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label htmlFor="phenotype" className="block text-sm font-medium text-white/80 mb-2">
                        {t('flower.phenotype')}
                    </label>
                    <input
                        type="text"
                        id="phenotype"
                        value={data.phenotype || ''}
                        onChange={(e) => handleInputChange('phenotype', e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        placeholder={t('flower.phenotypePlaceholder')}
                    />
                    <p className="mt-2 text-xs text-white/40">
                        {t('flower.phenotypeHelper')}
                    </p>
                </div>
            </div>
        </LiquidCard>
    )
}


