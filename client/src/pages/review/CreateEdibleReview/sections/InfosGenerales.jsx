import React from 'react'
import { Camera, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidSelect, LiquidDivider } from '@/components/ui/LiquidUI'

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
            <LiquidCard glow="green" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">📋 Informations générales</h3>
                        <p className="text-sm text-white/50">Identité et recette du comestible</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-4 mt-6">
                    {/* Nom du produit */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Nom du produit *"
                            value={formData.nomProduit || ''}
                            onChange={(e) => handleChange('nomProduit', e.target.value)}
                            placeholder="Nom du comestible"
                        />
                    </div>

                    {/* Type de comestible */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidSelect
                            label="Type de comestible"
                            value={formData.type || ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                            options={[
                                { value: '', label: 'Sélectionnez un type' },
                                ...EDIBLE_TYPES.map(type => ({ value: type, label: type }))
                            ]}
                        />
                    </div>

                    {/* Fabricant */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Fabricant"
                            value={formData.fabricant || ''}
                            onChange={(e) => handleChange('fabricant', e.target.value)}
                            placeholder="Nom du fabricant"
                        />
                    </div>

                    {/* Cultivars/Génétiques utilisés */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Type de génétiques utilisées"
                            value={formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivars', e.target.value)}
                            placeholder="Génétiques ou cultivars utilisés"
                        />
                    </div>
                </div>
            </LiquidCard>

            {/* Photos */}
            <LiquidCard glow="green" padding="lg">
                <label className="block text-sm font-medium text-white/80 mb-3">
                    📷 Photos du produit (1-4) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={photo.preview || photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-xl border border-white/10"
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
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-green-500/50 bg-white/5 transition-colors">
                            <Camera className="mx-auto mb-2 text-white/40" size={32} />
                            <span className="text-sm text-white/50">
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
            </LiquidCard>
        </div>
    )
}
