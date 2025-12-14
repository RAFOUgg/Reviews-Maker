import React from 'react'
import { Camera } from 'lucide-react'

const EDIBLE_TYPES = [
    'Brownie',
    'Cookie',
    'Gâteau',
    'Bonbon/Candy',
    'Chocolat',
    'Gummies',
    'Boisson',
    'Thé/Infusion',
    'Huile culinaire',
    'Beurre cannabique',
    'Sauce',
    'Pâte à tartiner',
    'Sirop',
    'Capsule',
    'Autre'
]

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-6">
            {/* Nom du produit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du produit *
                </label>
                <input
                    type="text"
                    value={formData.nomProduit || ''}
                    onChange={(e) => handleChange('nomProduit', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Nom du comestible"
                />
            </div>

            {/* Type de comestible */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de comestible
                </label>
                <select
                    value={formData.type || ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Sélectionnez un type</option>
                    {EDIBLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Fabricant */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fabricant
                </label>
                <input
                    type="text"
                    value={formData.fabricant || ''}
                    onChange={(e) => handleChange('fabricant', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Nom du fabricant"
                />
            </div>

            {/* Cultivars/Génétiques utilisés */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de génétiques utilisées
                </label>
                <input
                    type="text"
                    value={formData.cultivars || ''}
                    onChange={(e) => handleChange('cultivars', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Génétiques ou cultivars utilisés"
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
    )
}
