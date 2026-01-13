import React from 'react'
import { Camera } from 'lucide-react'
import LiquidInput from '../../components/ui/LiquidInput'

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-6">
            {/* Nom commercial */}
            <LiquidInput
                label="Nom commercial"
                type="text"
                value={formData.nomCommercial || ''}
                onChange={(e) => handleChange('nomCommercial', e.target.value)}
                placeholder="Nom du produit"
                required
            />

            {/* Hashmaker */}
            <LiquidInput
                label="Hashmaker"
                type="text"
                value={formData.hashmaker || ''}
                onChange={(e) => handleChange('hashmaker', e.target.value)}
                placeholder="Nom du hashmaker"
            />

            {/* Laboratoire */}
            <LiquidInput
                label="Laboratoire de production"
                type="text"
                value={formData.laboratoire || ''}
                onChange={(e) => handleChange('laboratoire', e.target.value)}
                placeholder="Nom du laboratoire"
            />

            {/* Cultivars utilisés */}
            <LiquidInput
                label="Cultivar(s) utilisés"
                type="text"
                value={formData.cultivars || ''}
                onChange={(e) => handleChange('cultivars', e.target.value)}
                placeholder="Cultivars utilisés"
                hint="Séparez plusieurs cultivars par des virgules"
            />

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
