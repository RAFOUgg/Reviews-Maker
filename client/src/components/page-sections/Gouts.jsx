import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GOUTS_NOTES } from '../../data/flowerData'
import { Search, X, Utensils } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidChip, LiquidRating } from '@/components/ui/LiquidUI'

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
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">
                        {label} ({selected.length}/{max})
                    </label>
                </div>

                {/* Selected tastes */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selected.map(tasteId => {
                            const taste = getTasteById(tasteId)
                            return (
                                <LiquidChip
                                    key={tasteId}
                                    active
                                    color="amber"
                                    onRemove={() => toggleTaste(field, tasteId)}
                                >
                                    {taste?.label}
                                </LiquidChip>
                            )
                        })}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('flower.searchTastes')}
                        className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                </div>

                {/* Tastes grid */}
                <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl p-3 bg-white/5">
                    {Object.entries(groupedTastes).map(([category, tastes]) => {
                        const visibleTastes = tastes.filter(t => filteredTastes.includes(t))
                        if (visibleTastes.length === 0) return null

                        return (
                            <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-xs font-semibold text-white/50 uppercase mb-2">
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {visibleTastes.map(taste => {
                                        const isSelected = selected.includes(taste.id)
                                        return (
                                            <LiquidChip
                                                key={taste.id}
                                                active={isSelected}
                                                color="amber"
                                                onClick={() => toggleTaste(field, taste.id)}
                                                disabled={!isSelected && selected.length >= max}
                                            >
                                                {taste.label}
                                            </LiquidChip>
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
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">😋 Goûts</h3>
                        <p className="text-sm text-white/50">Profil gustatif</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">
                    {/* Intensity slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.gouts.intensite')}
                            </label>
                            <span className="text-2xl font-bold text-amber-400">
                                {data.goutsIntensiteScore || 0}/10
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50 w-6">0</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.goutsIntensiteScore || 0}
                                onChange={(e) => handleInputChange('goutsIntensiteScore', parseFloat(e.target.value))}
                                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #f59e0b 100%)`
                                }}
                            />
                            <span className="text-xs text-white/50 w-6">10</span>
                        </div>
                        <LiquidRating value={data.goutsIntensiteScore || 0} max={10} color="amber" />
                    </div>

                    {/* Aggressivity slider */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.gouts.agressivite')}
                            </label>
                            <span className="text-2xl font-bold text-red-400">
                                {data.goutsAgressiviteScore || 0}/10
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50 w-6">0</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.goutsAgressiviteScore || 0}
                                onChange={(e) => handleInputChange('goutsAgressiviteScore', parseFloat(e.target.value))}
                                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #ef4444 100%)`
                                }}
                            />
                            <span className="text-xs text-white/50 w-6">10</span>
                        </div>
                        <LiquidRating value={data.goutsAgressiviteScore || 0} max={10} color="red" />
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
            </LiquidCard>
        </div>
    )
}




