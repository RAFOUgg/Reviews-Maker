import React, { useState, useEffect } from 'react'
import { LiquidCard, LiquidChip, LiquidRating, LiquidDivider } from '@/components/ui/LiquidUI'
import { Zap } from 'lucide-react'

export default function Effets({ formData, handleChange }) {
    const [effects, setEffects] = useState([])
    const [filter, setFilter] = useState('tous')
    const [selectedEffects, setSelectedEffects] = useState(formData.effets || [])

    useEffect(() => {
        // Load effects from data/effects.json
        fetch('/data/effects.json')
            .then(res => res.json())
            .then(data => setEffects(data))
            .catch(err => console.error('Failed to load effects:', err))
    }, [])

    const toggleEffect = (effect) => {
        if (selectedEffects.includes(effect)) {
            const updated = selectedEffects.filter(e => e !== effect)
            setSelectedEffects(updated)
            handleChange('effets', updated)
        } else if (selectedEffects.length < 8) {
            const updated = [...selectedEffects, effect]
            setSelectedEffects(updated)
            handleChange('effets', updated)
        }
    }

    const filteredEffects = effects.filter(effect => {
        if (filter === 'tous') return true
        return effect.type === filter
    })

    return (
        <LiquidCard glow="cyan" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">💥 Effets ressentis</h3>
                    <p className="text-sm text-white/50">Effets et expérience</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="space-y-6 mt-6">
                {/* Montée rapidité */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidRating
                        label="Montée (rapidité)"
                        value={formData.montee || 0}
                        max={10}
                        color="cyan"
                    />
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.montee || 0}
                        onChange={(e) => handleChange('montee', parseInt(e.target.value))}
                        className="w-full mt-2 accent-cyan-500"
                    />
                </div>

                {/* Intensité */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidRating
                        label="Intensité"
                        value={formData.intensiteEffet || 0}
                        max={10}
                        color="cyan"
                    />
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.intensiteEffet || 0}
                        onChange={(e) => handleChange('intensiteEffet', parseInt(e.target.value))}
                        className="w-full mt-2 accent-cyan-500"
                    />
                </div>

                {/* Filtres par type */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        🎯 Filtrer par type
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['tous', 'mental', 'physique', 'therapeutique', 'positif', 'negatif'].map(type => (
                            <LiquidChip
                                key={type}
                                active={filter === type}
                                onClick={() => setFilter(type)}
                                color="cyan"
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* Sélection des effets */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        ⚡ Sélection des effets ({selectedEffects.length}/8)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                        {filteredEffects.map(effect => (
                            <LiquidChip
                                key={effect.name}
                                active={selectedEffects.includes(effect.name)}
                                onClick={() => toggleEffect(effect.name)}
                                color="cyan"
                                disabled={!selectedEffects.includes(effect.name) && selectedEffects.length >= 8}
                            >
                                {effect.name}
                            </LiquidChip>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
