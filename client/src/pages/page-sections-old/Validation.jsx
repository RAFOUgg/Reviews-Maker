import React from 'react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'
import { Save, Send } from 'lucide-react'

export default function Validation({ formData, saving, onSave, onSubmit }) {
    const requiredFields = ['nomCommercial', 'photos']
    const isValid = requiredFields.every(field => {
        if (field === 'photos') return formData.photos?.length > 0
        return formData[field]
    })

    return (
        <LiquidCard title="✅ Validation & Sauvegarde" bordered>
            <div className="space-y-6">
                {/* Récapitulatif */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Récapitulatif
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Nom commercial:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formData.nomCommercial || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cultivar(s):</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formData.cultivars || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Photos:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formData.photos?.length || 0} / 4
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formData.type || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages de validation */}
                {!isValid && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
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
                <div className="p-4 dark: rounded-lg">
                    <p className="text-sm dark:">
                        💡 Vous pourrez modifier votre review à tout moment depuis votre bibliothèque.
                    </p>
                </div>
            </div>
        </LiquidCard>
    )
}
