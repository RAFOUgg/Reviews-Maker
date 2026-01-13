import React, { useState, useEffect } from 'react'
import { Scale, Droplet, Scissors, TrendingUp, Award } from 'lucide-react'
import LiquidCard from '../../../../components/ui/LiquidCard'
import SegmentedControl from '../../../../components/shared/ui-helpers/SegmentedControl'

/**
 * Recolte - Section Récolte & Post-Récolte CDC conforme
 * Fenêtre de récolte, couleur trichomes, poids, rendements
 */
export default function Recolte({ formData, handleChange }) {
    const recolteData = formData.recolte || {}

    const handleRecolteChange = (field, value) => {
        handleChange('recolte', {
            ...recolteData,
            [field]: value
        })
    }

    // Calculer rendement par plante
    const calculerRendementPlante = () => {
        const poidsNet = recolteData.poidsNet || 0
        const nombrePlantes = formData.culture?.nombrePlantes || 1
        return (poidsNet / nombrePlantes).toFixed(1)
    }

    // Calculer rendement au m²
    const calculerRendementM2 = () => {
        const poidsNet = recolteData.poidsNet || 0
        const surfaceSol = formData.culture?.surfaceSol || 1
        return (poidsNet / surfaceSol).toFixed(1)
    }

    // Badge qualité rendement
    const getBadgeRendement = (rendementM2) => {
        if (rendementM2 < 200) return { label: 'Faible', color: 'bg-red-500' }
        if (rendementM2 < 400) return { label: 'Moyen', color: 'bg-yellow-500' }
        if (rendementM2 < 600) return { label: 'Élevé', color: 'bg-green-500' }
        return { label: 'Exceptionnel', color: '' }
    }

    const rendementM2 = parseFloat(calculerRendementM2())
    const badge = getBadgeRendement(rendementM2)

    // Vérifier somme trichomes = 100%
    const sommeTrichomes = (recolteData.trichomesTranslucides || 0) +
        (recolteData.trichomesLaiteux || 0) +
        (recolteData.trichomesAmbres || 0)

    const trichomesValid = Math.abs(sommeTrichomes - 100) < 0.1

    return (
        <div className="space-y-6">
            <LiquidCard title="🌾 Récolte & Post-Récolte" bordered>
                <div className="space-y-6">

                    {/* 1. Fenêtre de récolte */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Award className="w-4 h-4 inline mr-2" />
                            Fenêtre de récolte
                        </label>
                        <SegmentedControl
                            options={[
                                { value: 'precoce', label: 'Précoce', emoji: '🌱' },
                                { value: 'optimal', label: 'Optimal', emoji: '✨' },
                                { value: 'tardif', label: 'Tardif', emoji: '🍂' }
                            ]}
                            value={recolteData.fenetreRecolte || 'optimal'}
                            onChange={(value) => handleRecolteChange('fenetreRecolte', value)}
                            fullWidth
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Optimal = ratio THC/effets max selon votre préférence
                        </p>
                    </div>

                    {/* 2. Couleur des trichomes (sliders verrouillés 100%) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Droplet className="w-4 h-4 inline mr-2" />
                            Couleur des trichomes au moment de la récolte
                        </label>

                        <div className="space-y-4">
                            {/* Translucides */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">⚪ Translucides</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {recolteData.trichomesTranslucides || 0}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={recolteData.trichomesTranslucides || 0}
                                    onChange={(e) => handleRecolteChange('trichomesTranslucides', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Laiteux */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">🥛 Laiteux</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {recolteData.trichomesLaiteux || 0}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={recolteData.trichomesLaiteux || 0}
                                    onChange={(e) => handleRecolteChange('trichomesLaiteux', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            {/* Ambrés */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">🟠 Ambrés</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {recolteData.trichomesAmbres || 0}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={recolteData.trichomesAmbres || 0}
                                    onChange={(e) => handleRecolteChange('trichomesAmbres', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                            </div>

                            {/* Validation somme = 100% */}
                            <div className={`px-4 py-3 rounded-lg flex items-center justify-between ${trichomesValid ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'}`}>
                                <span className="text-sm font-medium">
                                    {trichomesValid ? '✅ Total' : '⚠️ Total'}
                                </span>
                                <span className={`text-lg font-bold ${trichomesValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {sommeTrichomes.toFixed(0)}%
                                </span>
                            </div>
                            {!trichomesValid && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    ⚠️ La somme doit être égale à 100%
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Mode de récolte */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Scissors className="w-4 h-4 inline mr-2" />
                            Mode de récolte
                        </label>
                        <select
                            value={recolteData.modeRecolte || 'branches'}
                            onChange={(e) => handleRecolteChange('modeRecolte', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
                        >
                            <option value="plante-entiere">Plante entière</option>
                            <option value="branches">Branches</option>
                            <option value="buds">Buds unitaires</option>
                            <option value="machine-trim">Machine trim</option>
                            <option value="hand-trim">Hand trim</option>
                            <option value="mixte">Mixte</option>
                        </select>
                    </div>

                    {/* 4. Poids & Rendements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Poids brut humide */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Scale className="w-4 h-4 inline mr-2" />
                                Poids brut humide (g)
                            </label>
                            <input
                                type="number"
                                min="50"
                                max="5000"
                                step="10"
                                value={recolteData.poidsBrut || ''}
                                onChange={(e) => handleRecolteChange('poidsBrut', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
                                placeholder="Ex: 800"
                            />
                            <p className="text-xs text-gray-500 mt-1">Poids juste après coupe</p>
                        </div>

                        {/* Poids net après manucure */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Scale className="w-4 h-4 inline mr-2" />
                                Poids net après 1ère manucure (g)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="3000"
                                step="10"
                                value={recolteData.poidsNet || ''}
                                onChange={(e) => handleRecolteChange('poidsNet', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
                                placeholder="Ex: 150"
                            />
                            <p className="text-xs text-gray-500 mt-1">Poids après trim + séchage initial</p>
                        </div>
                    </div>

                    {/* 5. Rendements calculés */}
                    <LiquidCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    Rendements calculés
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badge.color}`}>
                                    {badge.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Rendement par plante */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <p className="text-xs text-gray-500 mb-1">Rendement / plante</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {calculerRendementPlante()}
                                        <span className="text-lg ml-1">g</span>
                                    </p>
                                </div>

                                {/* Rendement au m² */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <p className="text-xs text-gray-500 mb-1">Rendement / m²</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {rendementM2}
                                        <span className="text-lg ml-1">g/m²</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                💡 Calculs basés sur : {formData.culture?.nombrePlantes || 0} plante(s) • {formData.culture?.surfaceSol || 0} m²
                            </p>
                        </div>
                    </LiquidCard>

                </div>
            </LiquidCard>
        </div>
    )
}
