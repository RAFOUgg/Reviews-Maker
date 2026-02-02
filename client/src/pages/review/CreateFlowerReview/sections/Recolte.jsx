import React, { useState, useEffect } from 'react'
import { Scale, Droplet, Scissors, TrendingUp, Award, Wheat } from 'lucide-react'
import { LiquidCard, LiquidDivider, LiquidChip, LiquidRating } from '@/components/ui/LiquidUI'
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
        return { label: 'Exceptionnel', color: 'bg-purple-500' }
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
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Wheat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">🌾 Récolte & Post-Récolte</h3>
                        <p className="text-sm text-white/50">Données de récolte et rendements</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">

                    {/* 1. Fenêtre de récolte */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <label className="block text-sm font-medium text-white mb-3">
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
                        <p className="text-xs text-white/40 mt-2">
                            💡 Optimal = ratio THC/effets max selon votre préférence
                        </p>
                    </div>

                    {/* 2. Couleur des trichomes (sliders verrouillés 100%) */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <label className="block text-sm font-medium text-white mb-3">
                            <Droplet className="w-4 h-4 inline mr-2" />
                            Couleur des trichomes au moment de la récolte
                        </label>

                        <div className="space-y-4">
                            {/* Translucides */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/60">⚪ Translucides</span>
                                    <span className="font-semibold text-white">
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
                                    className="liquid-range cyan w-full"
                                />
                            </div>

                            {/* Laiteux */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/60">🥛 Laiteux</span>
                                    <span className="font-semibold text-white">
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
                                    className="liquid-range w-full"
                                />
                            </div>

                            {/* Ambrés */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/60">🟠 Ambrés</span>
                                    <span className="font-semibold text-white">
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
                                    className="liquid-range amber w-full"
                                />
                            </div>

                            {/* Validation somme = 100% */}
                            <div className={`px-4 py-3 rounded-lg flex items-center justify-between ${trichomesValid ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-red-500/20 border-2 border-red-500/50'}`}>
                                <span className="text-sm font-medium text-white">
                                    {trichomesValid ? '✅ Total' : '⚠️ Total'}
                                </span>
                                <span className={`text-lg font-bold ${trichomesValid ? 'text-green-400' : 'text-red-400'}`}>
                                    {sommeTrichomes.toFixed(0)}%
                                </span>
                            </div>
                            {!trichomesValid && (
                                <p className="text-xs text-red-400">
                                    ⚠️ La somme doit être égale à 100%
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Mode de récolte */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <label className="block text-sm font-medium text-white mb-3">
                            <Scissors className="w-4 h-4 inline mr-2" />
                            Mode de récolte
                        </label>
                        <select
                            value={recolteData.modeRecolte || 'branches'}
                            onChange={(e) => handleRecolteChange('modeRecolte', e.target.value)}
                            className="liquid-input liquid-select w-full"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Poids brut humide */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="block text-sm font-medium text-white mb-2">
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
                                className="liquid-input w-full"
                                placeholder="Ex: 800"
                            />
                            <p className="text-xs text-white/40 mt-1">Poids juste après coupe</p>
                        </div>

                        {/* Poids net après manucure */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="block text-sm font-medium text-white mb-2">
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
                                className="liquid-input w-full"
                                placeholder="Ex: 150"
                            />
                            <p className="text-xs text-white/40 mt-1">Poids après trim + séchage initial</p>
                        </div>
                    </div>

                    {/* 5. Rendements calculés */}
                    <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border-2 border-green-500/30">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    Rendements calculés
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badge.color}`}>
                                    {badge.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Rendement par plante */}
                                <div className="bg-white/5 rounded-xl p-4 border border-green-500/20">
                                    <p className="text-xs text-white/50 mb-1">Rendement / plante</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        {calculerRendementPlante()}
                                        <span className="text-lg ml-1">g</span>
                                    </p>
                                </div>

                                {/* Rendement au m² */}
                                <div className="bg-white/5 rounded-xl p-4 border border-green-500/20">
                                    <p className="text-xs text-white/50 mb-1">Rendement / m²</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        {rendementM2}
                                        <span className="text-lg ml-1">g/m²</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-white/50">
                                💡 Calculs basés sur : {formData.culture?.nombrePlantes || 0} plante(s) • {formData.culture?.surfaceSol || 0} m²
                            </p>
                        </div>
                    </div>

                </div>
            </LiquidCard>
        </div>
    )
}
