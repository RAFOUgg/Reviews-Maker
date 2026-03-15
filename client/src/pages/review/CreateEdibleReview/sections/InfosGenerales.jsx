import React from 'react'
import { Camera, X, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'

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
                        <p className="text-sm text-white/50">Identité et photos du comestible</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-4 mt-6">
                    {/* Nom du produit */}
                    <div>
                        <LiquidInput
                            label="Nom du produit *"
                            value={formData.nomProduit || ''}
                            onChange={(e) => handleChange('nomProduit', e.target.value)}
                            placeholder="Nom du comestible"
                            maxLength={100}
                        />
                    </div>

                    {/* Type de comestible */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">Type de comestible</label>
                        <select
                            value={formData.type || ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 outline-none transition-colors appearance-none"
                        >
                            <option value="" className="bg-[#0f0f1a]">Sélectionnez un type</option>
                            {EDIBLE_TYPES.map(type => (
                                <option key={type} value={type} className="bg-[#0f0f1a]">{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fabricant */}
                    <div>
                        <LiquidInput
                            label="Fabricant"
                            value={formData.fabricant || ''}
                            onChange={(e) => handleChange('fabricant', e.target.value)}
                            placeholder="Nom du fabricant"
                        />
                    </div>

                    {/* Cultivars utilisés */}
                    <div>
                        <LiquidInput
                            label="Type de génétiques utilisées"
                            value={formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivars', e.target.value)}
                            placeholder="Génétiques ou cultivars utilisés"
                        />
                        <p className="text-xs text-white/40 mt-1">(Optionnel)</p>
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            📷 Photos du produit (1-4) *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={photo.preview || photo.url}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-white/10 shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {photos.length < 4 && (
                            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-green-500/50 bg-white/5 hover:bg-green-500/10 transition-all backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white/40" />
                                <span className="text-sm font-medium text-white/60">
                                    Ajouter une photo ({photos.length}/4)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    multiple
                                />
                            </label>
                        )}
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
