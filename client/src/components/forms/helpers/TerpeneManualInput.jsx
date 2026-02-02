import React from 'react'
import { FlaskConical } from 'lucide-react'
import LiquidCard from '../../ui/LiquidCard'

/**
 * TerpeneManualInput - Saisie manuelle des terpènes principaux CDC conforme
 * Liste des terpènes standards avec sliders % ou mg/g
 */
export default function TerpeneManualInput({ data = {}, onChange }) {
    const terpenes = [
        { key: 'myrcene', label: 'Myrcène', icon: '🌲', color: 'bg-green-500' },
        { key: 'limonene', label: 'Limonène', icon: '🍋', color: 'bg-yellow-500' },
        { key: 'caryophyllene', label: 'Caryophyllène', icon: '🌶️', color: 'bg-red-500' },
        { key: 'linalool', label: 'Linalol', icon: '🌸', color: '' },
        { key: 'pinene', label: 'Pinène (α+β)', icon: '🌲', color: '' },
        { key: 'terpinolene', label: 'Terpinolène', icon: '🌿', color: 'bg-lime-500' },
        { key: 'humulene', label: 'Humulène', icon: '🍺', color: 'bg-amber-500' },
        { key: 'ocimene', label: 'Ocimène', icon: '🌺', color: '' },
        { key: 'bisabolol', label: 'Bisabolol', icon: '🌼', color: 'bg-orange-500' },
        { key: 'valencene', label: 'Valencène', icon: '🍊', color: 'bg-orange-600' }
    ]

    const handleTerpeneChange = (key, value) => {
        onChange({
            ...data,
            [key]: parseFloat(value) || 0
        })
    }

    // Calculer total terpènes
    const totalTerpenes = terpenes.reduce((sum, terp) => {
        return sum + (parseFloat(data[terp.key]) || 0)
    }, 0)

    return (
        <LiquidCard className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-2 border-green-700">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-green-600" />
                            Profil Terpénique (saisie manuelle)
                        </h4>
                        <p className="text-xs text-white/60 mt-1">
                            Saisissez les valeurs en % (pourcentage du poids sec)
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/50">Total</p>
                        <p className="text-2xl font-bold text-green-400">
                            {totalTerpenes.toFixed(2)}%
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terpenes.map(terp => {
                        const value = parseFloat(data[terp.key]) || 0
                        return (
                            <div key={terp.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        <span className="text-lg">{terp.icon}</span>
                                        {terp.label}
                                    </label>
                                    <span className="text-sm font-semibold text-white">
                                        {value.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => handleTerpeneChange(terp.key, e.target.value)}
                                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                        style={{ accentColor: terp.color.replace('bg-', '#') }}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => handleTerpeneChange(terp.key, e.target.value)}
                                        className="w-20 px-2 py-1 text-sm border border-white/10 rounded bg-white/5 text-white focus:ring-violet-500/20 focus:border-violet-500/50"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Validation / Avertissement */}
                {totalTerpenes > 10 && (
                    <div className="bg-orange-900/20 border-2 border-orange-500 rounded-lg p-3">
                        <p className="text-sm text-orange-300 flex items-center gap-2">
                            ⚠️ <strong>Attention:</strong> Le total de {totalTerpenes.toFixed(2)}% semble élevé. Vérifiez vos valeurs.
                        </p>
                    </div>
                )}

                {/* Info */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/60">
                        💡 <strong>Note:</strong> Les terpènes représentent généralement 1-5% du poids sec total. Les valeurs exceptionnelles peuvent atteindre 8-10%.
                    </p>
                </div>
            </div>
        </LiquidCard>
    )
}



