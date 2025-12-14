import React from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function PipelineCulture({ formData, handleChange }) {
    return (
        <LiquidCard title="🌱 Pipeline Culture (Producteur)" bordered>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cette section est disponible uniquement pour les comptes Producteur.
                    Elle permet de documenter toutes les étapes de culture avec des données détaillées.
                </p>

                {/* Mode de culture */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mode de culture
                    </label>
                    <select
                        value={formData.modeCulture || ''}
                        onChange={(e) => handleChange('modeCulture', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                        <option value="greenhouse">Greenhouse</option>
                        <option value="no-till">No-till</option>
                    </select>
                </div>

                {/* Dates de culture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date de début
                        </label>
                        <input
                            type="date"
                            value={formData.dateDebut || ''}
                            onChange={(e) => handleChange('dateDebut', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date de fin
                        </label>
                        <input
                            type="date"
                            value={formData.dateFin || ''}
                            onChange={(e) => handleChange('dateFin', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Note */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 La configuration complète du pipeline de culture (phases, événements, données détaillées)
                        sera disponible dans une interface dédiée pour les comptes Producteur.
                    </p>
                </div>
            </div>
        </LiquidCard>
    )
}
