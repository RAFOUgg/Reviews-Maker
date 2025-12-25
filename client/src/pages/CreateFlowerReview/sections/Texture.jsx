import React from 'react'
import LiquidCard from '../../../components/LiquidCard'

const TEXTURE_FIELDS = [
    { key: 'durete', label: 'Dureté', max: 10 },
    { key: 'densiteTactile', label: 'Densité tactile', max: 10 },
    { key: 'elasticite', label: 'Élasticité', max: 10 },
    { key: 'collant', label: 'Collant', max: 10 }
]

export default function Texture({ formData, handleChange }) {
    return (
        <LiquidCard title="🤚 Texture" bordered>
            <div className="space-y-6">
                {TEXTURE_FIELDS.map(field => (
                    <div key={field.key}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                {formData[field.key] || 0}/{field.max}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={field.max}
                            value={formData[field.key] || 0}
                            onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                    </div>
                ))}
            </div>
        </LiquidCard>
    )
}
