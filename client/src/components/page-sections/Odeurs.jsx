import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ODEURS_NOTES } from '../../data/flowerData'
import { Search, X, Wind } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidChip, LiquidRating } from '@/components/ui/LiquidUI'

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
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">
                        {label} ({selected.length}/{max})
                    </label>
                </div>

                {/* Selected aromas */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selected.map(aromaId => {
                            const aroma = getAromaById(aromaId)
                            return (
                                <LiquidChip
                                    key={aromaId}
                                    active
                                    color="green"
                                    onRemove={() => toggleAroma(field, aromaId)}
                                >
                                    {aroma?.label}
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
                        placeholder={t('flower.searchAromas')}
                        className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    />
                </div>

                {/* Aromas grid */}
                <div className="max-h-64 overflow-y-auto border border-white/10 rounded-xl p-3 bg-white/5">
                    {Object.entries(groupedAromas).map(([category, aromas]) => {
                        const visibleAromas = aromas.filter(a => filteredAromas.includes(a))
                        if (visibleAromas.length === 0) return null

                        return (
                            <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-xs font-semibold text-white/50 uppercase mb-2">
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {visibleAromas.map(aroma => {
                                        const isSelected = selected.includes(aroma.id)
                                        return (
                                            <LiquidChip
                                                key={aroma.id}
                                                active={isSelected}
                                                color="green"
                                                onClick={() => toggleAroma(field, aroma.id)}
                                                disabled={!isSelected && selected.length >= max}
                                            >
                                                {aroma.label}
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
            <LiquidCard glow="green" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Wind className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">👃 Odeurs</h3>
                        <p className="text-sm text-white/50">Profil aromatique</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">
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
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                                {t('flower.odeurs.intensite')}
                            </label>
                            <span className="text-2xl font-bold text-green-400">
                                {data.odeursIntensiteScore || 0}/10
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50 w-6">0</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.odeursIntensiteScore || 0}
                                onChange={(e) => handleInputChange('odeursIntensiteScore', parseFloat(e.target.value))}
                                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, #22c55e 100%)`
                                }}
                            />
                            <span className="text-xs text-white/50 w-6">10</span>
                        </div>
                        <LiquidRating value={data.odeursIntensiteScore || 0} max={10} color="green" />
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}




