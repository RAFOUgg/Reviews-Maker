import React from 'react'
import { Camera } from 'lucide-react'
import LiquidCard from '../../../components/LiquidCard'
import LiquidButton from '../../../components/LiquidButton'
import SegmentedControl from '../../../components/ui/SegmentedControl'
import { INFOS_GENERALES_CONFIG } from '../../../config/flowerReviewConfig'

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    // Récupérer les options du type génétique depuis la config
    const typeGenetiqueField = INFOS_GENERALES_CONFIG.fields.find(f => f.id === 'typeGenetique')
    const typeOptions = typeGenetiqueField?.options || []

    return (
        <div className="space-y-6">
            <LiquidCard title="📋 Informations générales" bordered>
                <div className="space-y-4">
                    {/* Nom commercial */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom commercial *
                            <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                                (Seul champ texte libre obligatoire)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Marque – Cultivar – Batch #"
                            maxLength={100}
                        />
                    </div>

                    {/* Cultivar(s) - Multi-select pills (à implémenter avec bibliothèque) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cultivar(s)
                            <span className="ml-2 text-xs text-gray-500">
                                (Multi-sélection depuis bibliothèque)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivars', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                            placeholder="Nom des cultivars"
                        />
                    </div>

                    {/* Farm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Farm / Producteur
                            <span className="ml-2 text-xs text-gray-500">
                                (Auto-complete depuis base de données)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.farm || ''}
                            onChange={(e) => handleChange('farm', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                            placeholder="Nom du producteur"
                        />
                    </div>

                    {/* Type génétique - NOUVEAU: SegmentedControl */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Type de génétique *
                        </label>
                        <SegmentedControl
                            options={typeOptions}
                            value={formData.type || ''}
                            onChange={(value) => handleChange('type', value)}
                            fullWidth
                            size="md"
                        />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Photos du produit (1-4) *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={photo.preview || photo.url}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        {photos.length < 4 && (
                            <label className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                                    <Camera className="mx-auto mb-2 text-gray-400" size={32} />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Ajouter des photos ({photos.length}/4)
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
