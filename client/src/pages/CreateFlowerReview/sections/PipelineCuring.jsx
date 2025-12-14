import React from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function PipelineCuring({ formData, handleChange }) {
    return (
        <LiquidCard title="🔥 Pipeline Curing & Maturation" bordered>
            <div className="space-y-4">
                {/* Type de maturation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de maturation
                    </label>
                    <select
                        value={formData.typeMaturation || ''}
                        onChange={(e) => handleChange('typeMaturation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="froid">Froid (&lt;5°C)</option>
                        <option value="chaud">Chaud (&gt;5°C)</option>
                    </select>
                </div>

                {/* Température */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Température de curing (°C)
                    </label>
                    <input
                        type="number"
                        value={formData.temperatureCuring || ''}
                        onChange={(e) => handleChange('temperatureCuring', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 18"
                    />
                </div>

                {/* Humidité */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Humidité relative (%)
                    </label>
                    <input
                        type="number"
                        value={formData.humidite || ''}
                        onChange={(e) => handleChange('humidite', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 62"
                    />
                </div>

                {/* Type de récipient */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de récipient
                    </label>
                    <select
                        value={formData.typeRecipient || ''}
                        onChange={(e) => handleChange('typeRecipient', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="verre">Verre</option>
                        <option value="plastique">Plastique</option>
                        <option value="aire-libre">Aire libre</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                {/* Emballage primaire */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emballage/Ballotage primaire
                    </label>
                    <select
                        value={formData.emballage || ''}
                        onChange={(e) => handleChange('emballage', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="cellophane">Cellophane</option>
                        <option value="papier-cuisson">Papier cuisson</option>
                        <option value="aluminium">Aluminium</option>
                        <option value="paper-hash">Paper hash</option>
                        <option value="sous-vide">Sous vide</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                {/* Opacité */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opacité du récipient
                    </label>
                    <select
                        value={formData.opacite || ''}
                        onChange={(e) => handleChange('opacite', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="opaque">Opaque</option>
                        <option value="semi-opaque">Semi-opaque</option>
                        <option value="transparent">Transparent</option>
                        <option value="ambre">Ambré</option>
                    </select>
                </div>

                {/* Durée */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Durée de curing (jours)
                    </label>
                    <input
                        type="number"
                        value={formData.dureeCuring || ''}
                        onChange={(e) => handleChange('dureeCuring', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 30"
                    />
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 Le pipeline complet de curing permettra de suivre l'évolution des paramètres
                        et des tests organoleptiques au fil du temps.
                    </p>
                </div>
            </div>
        </LiquidCard>
    )
}
