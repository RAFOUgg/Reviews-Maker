import React from 'react'
import { LiquidCard, LiquidRating, LiquidDivider } from '@/components/ui/LiquidUI'
import { Hand } from 'lucide-react'

const TEXTURE_FIELDS = [
    { key: 'durete', label: 'Dureté', max: 10 },
    { key: 'densiteTactile', label: 'Densité tactile', max: 10 },
    { key: 'elasticite', label: 'Élasticité', max: 10 },
    { key: 'collant', label: 'Collant', max: 10 }
]

export default function Texture({ formData, handleChange }) {
    return (
        <LiquidCard glow="pink" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <Hand className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🤚 Texture</h3>
                    <p className="text-sm text-white/50">Propriétés tactiles</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="space-y-4 mt-6">
                {TEXTURE_FIELDS.map(field => (
                    <div key={field.key} className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <LiquidRating
                            label={field.label}
                            value={formData[field.key] || 0}
                            max={field.max}
                            color="pink"
                        />
                        <input
                            type="range"
                            min="0"
                            max={field.max}
                            value={formData[field.key] || 0}
                            onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                            className="liquid-range w-full mt-2"
                        />
                    </div>
                ))}
            </div>
        </LiquidCard>
    )
}
