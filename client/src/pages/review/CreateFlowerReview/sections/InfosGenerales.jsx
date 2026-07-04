import React from 'react'
import { Camera, X, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import FillMyselfButton from '@/components/forms/helpers/FillMyselfButton'
import FillCompanyButton from '@/components/forms/helpers/FillCompanyButton'
import UnknownValueButton from '@/components/ui/UnknownValueButton'

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
        <div className="space-y-3">
            <LiquidCard glow="purple" padding="sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">📋 Informations générales</h3>
                        <p className="text-xs text-white/50">Identité et photos du produit</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-3 mt-3">
                    {/* Nom commercial + Cultivar(s) côte à côte sur desktop pour réduire le scroll */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <LiquidInput
                                label="Nom commercial *"
                                value={formData.nomCommercial || ''}
                                onChange={(e) => handleChange('nomCommercial', e.target.value)}
                                placeholder="Ex: Marque – Cultivar – Batch #"
                                maxLength={100}
                            />
                            <p className="text-xs text-white/40 mt-1">(Seul champ texte libre obligatoire)</p>
                        </div>

                        <div>
                            <LiquidInput
                                label={
                                    <span className="flex items-center justify-between">
                                        Cultivar(s)
                                        <UnknownValueButton onClick={() => handleChange('cultivars', '')} />
                                    </span>
                                }
                                value={formData.cultivars || ''}
                                onChange={(e) => handleChange('cultivars', e.target.value)}
                                placeholder="Ex: OG Kush, Purple Haze, Wedding Cake..."
                            />
                            <p className="text-xs text-white/40 mt-1">(Séparés par des virgules si plusieurs)</p>
                        </div>
                    </div>

                    {/* Farm / Producteur — "Moi-même" pré-remplit avec votre nom si c'est votre
                        propre production (remplace l'ancien toggle "C'est notre production",
                        redondant avec ce bouton et source de confusion) */}
                    <div>
                        <LiquidInput
                            label={
                                <span className="flex items-center justify-between gap-2">
                                    Farm / Producteur
                                    <span className="flex items-center gap-1.5">
                                        <FillCompanyButton onFill={(name) => handleChange('farm', name)} />
                                        <FillMyselfButton onFill={(name) => handleChange('farm', name)} />
                                        <UnknownValueButton onClick={() => handleChange('farm', '')} />
                                    </span>
                                </span>
                            }
                            value={formData.farm || ''}
                            onChange={(e) => handleChange('farm', e.target.value)}
                            placeholder="Nom du producteur"
                        />
                        <p className="text-xs text-white/40 mt-1">(Auto-complete depuis base de données)</p>
                    </div>

                    {/* Photos avec système de tags CDC conforme */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            📷 Photos du produit (1-4) *
                        </label>
                        <p className="text-xs text-white/40 mb-3">(Taguez chaque photo pour mieux organiser votre galerie)</p>
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

                                    {/* Tags rapides CDC */}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {PHOTO_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => togglePhotoTag(index, tag)}
                                                className={`px-2 py-0.5 text-xs rounded-full transition-all font-medium border ${(photo.tags || []).includes(tag) ? 'bg-violet-500/30 border-violet-500/50 text-violet-300 shadow-md' : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:border-white/30'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {photos.length < 4 && (
                            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-500/50 bg-white/5 hover:bg-violet-500/10 transition-all backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white/40" />
                                <span className="text-sm font-medium text-white/60">
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
