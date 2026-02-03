import React, { useState, useEffect } from 'react'
import { LiquidCard, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI'
import LiquidSlider from '@/components/ui/LiquidSlider'
import { Wind } from 'lucide-react'

export default function Odeurs({ formData, handleChange }) {
    const [aromas, setAromas] = useState([])
    const [selectedDominant, setSelectedDominant] = useState(formData.odeursDominantes || [])
    const [selectedSecondary, setSelectedSecondary] = useState(formData.odeursSecondaires || [])

    useEffect(() => {
        // Load aromas from data/aromas.json
        fetch('/data/aromas.json')
            .then(res => res.json())
            .then(data => setAromas(data))
            .catch(err => console.error('Failed to load aromas:', err))
    }, [])

    const toggleAroma = (aroma, type) => {
        const list = type === 'dominant' ? selectedDominant : selectedSecondary
        const setList = type === 'dominant' ? setSelectedDominant : setSelectedSecondary
        const field = type === 'dominant' ? 'odeursDominantes' : 'odeursSecondaires'

        if (list.includes(aroma)) {
            const updated = list.filter(a => a !== aroma)
            setList(updated)
            handleChange(field, updated)
        } else if (list.length < 7) {
            const updated = [...list, aroma]
            setList(updated)
            handleChange(field, updated)
        }
    }

    return (
        <LiquidCard glow="green" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Wind className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">👃 Odeurs</h3>
                    <p className="text-sm text-white/50">Profil aromatique et intensité</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="space-y-6 mt-6">
                {/* Intensité aromatique */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Intensité aromatique"
                        value={formData.intensiteOdeur || 5}
                        min={1}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => handleChange('intensiteOdeur', val)}
                    />
                </div>

                {/* Notes dominantes */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        🌸 Notes dominantes ({selectedDominant.length}/7)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {aromas.map(aroma => (
                            <LiquidChip
                                key={aroma}
                                active={selectedDominant.includes(aroma)}
                                onClick={() => toggleAroma(aroma, 'dominant')}
                                color="green"
                                disabled={!selectedDominant.includes(aroma) && selectedDominant.length >= 7}
                            >
                                {aroma}
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* Notes secondaires */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                        🌿 Notes secondaires ({selectedSecondary.length}/7)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {aromas.map(aroma => (
                            <LiquidChip
                                key={aroma}
                                active={selectedSecondary.includes(aroma)}
                                onClick={() => toggleAroma(aroma, 'secondary')}
                                color="green"
                                disabled={!selectedSecondary.includes(aroma) && selectedSecondary.length >= 7}
                            >
                                {aroma}
                            </LiquidChip>
                        ))}
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
