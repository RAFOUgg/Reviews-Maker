import React from 'react'
import { LiquidCard, LiquidButton, LiquidDivider } from '@/components/ui/LiquidUI'
import { Save, Send, CheckCircle } from 'lucide-react'

export default function Validation({ formData, saving, onSave, onSubmit }) {
    const requiredFields = ['nomCommercial', 'photos']
    const isValid = requiredFields.every(field => {
        if (field === 'photos') return formData.photos?.length > 0
        return formData[field]
    })

    return (
        <div className="space-y-6">
            <LiquidCard glow="green" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">✅ Validation & Sauvegarde</h3>
                        <p className="text-sm text-white/50">Récapitulatif et publication</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-6 mt-6">
                    {/* Récapitulatif */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Récapitulatif
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                <span className="text-white/60">Nom commercial:</span>
                                <span className="font-medium text-white">
                                    {formData.nomCommercial || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                <span className="text-white/60">Cultivar(s):</span>
                                <span className="font-medium text-white">
                                    {formData.cultivars || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                <span className="text-white/60">Photos:</span>
                                <span className="font-medium text-white">
                                    {formData.photos?.length || 0} / 4
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                <span className="text-white/60">Type:</span>
                                <span className="font-medium text-white">
                                    {formData.type || '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Messages de validation */}
                    {!isValid && (
                        <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                            <p className="text-sm text-amber-300">
                                ⚠️ Veuillez remplir les champs obligatoires : Nom commercial et au moins 1 photo.
                            </p>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex gap-4">
                        <LiquidButton
                            onClick={onSave}
                            disabled={saving || !isValid}
                            variant="secondary"
                            className="flex-1"
                        >
                            <Save size={20} className="mr-2" />
                            {saving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
                        </LiquidButton>
                        <LiquidButton
                            onClick={onSubmit}
                            disabled={saving || !isValid}
                            variant="primary"
                            className="flex-1"
                        >
                            <Send size={20} className="mr-2" />
                            {saving ? 'Publication...' : 'Publier la review'}
                        </LiquidButton>
                    </div>

                    {/* Note */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-sm text-white/60">
                            💡 Vous pourrez modifier votre review à tout moment depuis votre bibliothèque.
                        </p>
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
