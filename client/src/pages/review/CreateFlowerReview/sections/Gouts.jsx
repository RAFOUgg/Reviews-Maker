import React, { useState, useEffect } from 'react'
import { LiquidCard, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI'
import LiquidSlider from '@/components/ui/LiquidSlider'
import { Utensils } from 'lucide-react'

export default function Gouts({ formData, handleChange }) {
    const [tastes, setTastes] = useState([])
    const [selectedDryPuff, setSelectedDryPuff] = useState(formData.dryPuff || [])
    const [selectedInhalation, setSelectedInhalation] = useState(formData.inhalation || [])
    const [selectedExpiration, setSelectedExpiration] = useState(formData.expiration || [])

    useEffect(() => {
        // Load tastes from data/tastes.json
        fetch('/data/tastes.json')
            .then(res => res.json())
            .then(data => setTastes(data))
            .catch(err => console.error('Failed to load tastes:', err))
    }, [])

    const toggleTaste = (taste, type) => {
        const lists = {
            'dryPuff': [selectedDryPuff, setSelectedDryPuff, 'dryPuff'],
            'inhalation': [selectedInhalation, setSelectedInhalation, 'inhalation'],
            'expiration': [selectedExpiration, setSelectedExpiration, 'expiration']
        }
        const [list, setList, field] = lists[type]

        if (list.includes(taste)) {
            const updated = list.filter(t => t !== taste)
            setList(updated)
            handleChange(field, updated)
        } else if (list.length < 7) {
            const updated = [...list, taste]
            setList(updated)
            handleChange(field, updated)
        }
    }

    return (
        <LiquidCard glow="amber" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">😋 Goûts</h3>
                    <p className="text-sm text-white/50">Profil gustatif et saveurs</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="space-y-6 mt-6">
                {/* Intensité */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Intensité"
                        value={formData.intensiteGout || 5}
                        min={1}
                        max={10}
                        step={1}
                        color="amber"
                        onChange={(val) => handleChange('intensiteGout', val)}
                    />
                </div>

                {/* Agressivité/piquant */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Agressivité/piquant"
                        value={formData.agressivite || 5}
                        min={1}
                        max={10}
                        step={1}
                        color="amber"
                        onChange={(val) => handleChange('agressivite', val)}
                    />
                </div>

                {/* Dry puff */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        💨 Dry puff / tirage à sec ({selectedDryPuff.length}/7)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <LiquidChip
                                key={taste}
                                active={selectedDryPuff.includes(taste)}
                                onClick={() => toggleTaste(taste, 'dryPuff')}
                                color="amber"
                                disabled={!selectedDryPuff.includes(taste) && selectedDryPuff.length >= 7}
                            >
                                {taste}
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* Inhalation */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        🌬️ Inhalation ({selectedInhalation.length}/7)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <LiquidChip
                                key={taste}
                                active={selectedInhalation.includes(taste)}
                                onClick={() => toggleTaste(taste, 'inhalation')}
                                color="amber"
                                disabled={!selectedInhalation.includes(taste) && selectedInhalation.length >= 7}
                            >
                                {taste}
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* Expiration/arrière-goût */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        💨 Expiration / arrière-goût ({selectedExpiration.length}/7)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tastes.map(taste => (
                            <LiquidChip
                                key={taste}
                                active={selectedExpiration.includes(taste)}
                                onClick={() => toggleTaste(taste, 'expiration')}
                                color="amber"
                                disabled={!selectedExpiration.includes(taste) && selectedExpiration.length >= 7}
                            >
                                {taste}
                            </LiquidChip>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
