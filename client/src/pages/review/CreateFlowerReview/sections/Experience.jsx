import React from 'react'
import { LiquidCard, LiquidSelect, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import { FlaskConical } from 'lucide-react'

export default function Experience({ formData, handleChange }) {
    return (
        <LiquidCard glow="cyan" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🧪 Expérience d'utilisation</h3>
                    <p className="text-sm text-white/50">Méthode et conditions de test</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="space-y-4 mt-6">
                {/* Méthode de consommation */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSelect
                        label="Méthode de consommation"
                        value={formData.methodeConsommation || ''}
                        onChange={(e) => handleChange('methodeConsommation', e.target.value)}
                        options={[
                            { value: '', label: 'Sélectionner...' },
                            { value: 'combustion', label: 'Combustion' },
                            { value: 'vapeur', label: 'Vapeur' },
                            { value: 'infusion', label: 'Infusion' }
                        ]}
                    />
                </div>

                {/* Dosage utilisé */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidInput
                        label="Dosage utilisé (g/mg)"
                        value={formData.dosage || ''}
                        onChange={(e) => handleChange('dosage', e.target.value)}
                        placeholder="Ex: 0.5g"
                    />
                </div>

                {/* Durée des effets */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidInput
                        label="Durée des effets (HH:MM)"
                        value={formData.dureeEffets || ''}
                        onChange={(e) => handleChange('dureeEffets', e.target.value)}
                        placeholder="Ex: 02:30"
                    />
                </div>

                {/* Début des effets */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSelect
                        label="Début des effets"
                        value={formData.debutEffets || ''}
                        onChange={(e) => handleChange('debutEffets', e.target.value)}
                        options={[
                            { value: '', label: 'Sélectionner...' },
                            { value: 'immediat', label: 'Immédiat (0-5 min)' },
                            { value: 'rapide', label: 'Rapide (5-15 min)' },
                            { value: 'moyen', label: 'Moyen (15-30 min)' },
                            { value: 'differe', label: 'Différé (30+ min)' }
                        ]}
                    />
                </div>

                {/* Usage préféré */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <LiquidSelect
                        label="Usage préféré"
                        value={formData.usagePreface || ''}
                        onChange={(e) => handleChange('usagePreface', e.target.value)}
                        options={[
                            { value: '', label: 'Sélectionner...' },
                            { value: 'soir', label: 'Soir' },
                            { value: 'journee', label: 'Journée' },
                            { value: 'seul', label: 'Seul' },
                            { value: 'social', label: 'Social' },
                            { value: 'medical', label: 'Médical' }
                        ]}
                    />
                </div>

                {/* Effets secondaires */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-white mb-2">
                        Effets secondaires
                    </label>
                    <textarea
                        value={formData.effetsSecondaires || ''}
                        onChange={(e) => handleChange('effetsSecondaires', e.target.value)}
                        className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        placeholder="Ex: Yeux secs, faim, etc."
                        rows={3}
                    />
                </div>
            </div>
        </LiquidCard>
    )
}
