import React from 'react'
import LiquidCard from '../../../../components/ui/LiquidCard'

export default function Experience({ formData, handleChange }) {
    return (
        <LiquidCard title="🧪 Expérience d'utilisation" bordered>
            <div className="space-y-4">
                {/* Méthode de consommation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Méthode de consommation
                    </label>
                    <select
                        value={formData.methodeConsommation || ''}
                        onChange={(e) => handleChange('methodeConsommation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="combustion">Combustion</option>
                        <option value="vapeur">Vapeur</option>
                        <option value="infusion">Infusion</option>
                    </select>
                </div>

                {/* Dosage utilisé */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dosage utilisé (g/mg)
                    </label>
                    <input
                        type="text"
                        value={formData.dosage || ''}
                        onChange={(e) => handleChange('dosage', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 0.5g"
                    />
                </div>

                {/* Durée des effets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Durée des effets (HH:MM)
                    </label>
                    <input
                        type="text"
                        value={formData.dureeEffets || ''}
                        onChange={(e) => handleChange('dureeEffets', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 02:30"
                    />
                </div>

                {/* Début des effets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Début des effets
                    </label>
                    <select
                        value={formData.debutEffets || ''}
                        onChange={(e) => handleChange('debutEffets', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="immediat">Immédiat (0-5 min)</option>
                        <option value="rapide">Rapide (5-15 min)</option>
                        <option value="moyen">Moyen (15-30 min)</option>
                        <option value="differe">Différé (30+ min)</option>
                    </select>
                </div>

                {/* Usage préféré */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Usage préféré
                    </label>
                    <select
                        value={formData.usagePreface || ''}
                        onChange={(e) => handleChange('usagePreface', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="soir">Soir</option>
                        <option value="journee">Journée</option>
                        <option value="seul">Seul</option>
                        <option value="social">Social</option>
                        <option value="medical">Médical</option>
                    </select>
                </div>

                {/* Effets secondaires */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Effets secondaires
                    </label>
                    <textarea
                        value={formData.effetsSecondaires || ''}
                        onChange={(e) => handleChange('effetsSecondaires', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Yeux secs, faim, etc."
                        rows={3}
                    />
                </div>
            </div>
        </LiquidCard>
    )
}
