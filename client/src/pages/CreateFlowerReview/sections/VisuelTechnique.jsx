import React from 'react'
import LiquidCard from '../../../components/LiquidCard'

const VISUAL_FIELDS = [
    { key: 'couleur', label: 'Couleur', max: 10 },
    { key: 'densite', label: 'Densité visuelle', max: 10 },
    { key: 'trichomes', label: 'Trichomes', max: 10 },
    { key: 'pistils', label: 'Pistils', max: 10 },
    { key: 'manucure', label: 'Manucure', max: 10 },
    { key: 'moisissure', label: 'Moisissure (10=aucune)', max: 10 },
    { key: 'graines', label: 'Graines (10=aucune)', max: 10 }
]

export default function VisuelTechnique({ formData, handleChange }) {
    return (
        <LiquidCard title="👁️ Visuel & Technique" bordered>
            <div className="space-y-6">
                {VISUAL_FIELDS.map(field => (
                    <div key={field.key}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            <span className="text-sm font-bold dark:">
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

                {/* Données analytiques */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Données analytiques
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                THC (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.thc || ''}
                                onChange={(e) => handleChange('thc', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                CBD (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cbd || ''}
                                onChange={(e) => handleChange('cbd', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                CBG (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cbg || ''}
                                onChange={(e) => handleChange('cbg', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
