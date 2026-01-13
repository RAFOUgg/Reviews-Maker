import React from 'react'
import { Camera, X } from 'lucide-react'
import LiquidCard from '../../../components/LiquidCard'
import LiquidButton from '../../../components/LiquidButton'
import MultiSelectPills from '../../../components/MultiSelectPills'

const PHOTO_TAGS = ['Macro', 'Full plant', 'Bud sec', 'Trichomes', 'Drying', 'Curing']

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {

    // Toggle tag sur une photo
    const togglePhotoTag = (photoIndex, tag) => {
        const updatedPhotos = photos.map((photo, idx) => {
            if (idx === photoIndex) {
                const currentTags = photo.tags || []
                const newTags = currentTags.includes(tag)
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag]
                return { ...photo, tags: newTags }
            }
            return photo
        })
        handleChange('photos', updatedPhotos)
    }

    return (
        <div className="space-y-6">
            <LiquidCard title="📋 Informations générales" bordered>
                <div className="space-y-4">
                    {/* Nom commercial */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom commercial *
                            <span className="ml-2 text-xs dark:">
                                (Seul champ texte libre obligatoire)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
                            placeholder="Ex: Marque – Cultivar – Batch #"
                            maxLength={100}
                        />
                    </div>

                    {/* Cultivar(s) - Multi-select pills CDC conforme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cultivar(s)
                            <span className="ml-2 text-xs dark:">
                                (Multi-sélection depuis bibliothèque, drag & drop pour réorganiser)
                            </span>
                        </label>
                        <MultiSelectPills
                            value={formData.cultivars || []}
                            onChange={(cultivars) => handleChange('cultivars', cultivars)}
                            source="user-library"
                            placeholder="Sélectionner ou créer des cultivars"
                            addNewButton
                            addNewLabel="+ Nouveau cultivar"
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
                            placeholder="Nom du producteur"
                        />
                    </div>

                    {/* Photos avec système de tags CDC conforme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Photos du produit (1-4) *
                            <span className="ml-2 text-xs dark:">
                                (Taguez chaque photo pour mieux organiser votre galerie)
                            </span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={photo.preview || photo.url}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {/* Tags rapides CDC */}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {PHOTO_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => togglePhotoTag(index, tag)}
                                                className={`px-2 py-0.5 text-xs rounded-full transition-all font-medium ${(photo.tags || []).includes(tag) ? 'bg-gradient-to-r text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {photos.length < 4 && (
                            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-400 bg-white/50 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                                <Camera className="w-6 h-6 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Ajouter une photo ({photos.length}/4)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    multiple={photos.length < 3}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
