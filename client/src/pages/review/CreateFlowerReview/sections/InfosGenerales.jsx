import React from 'react'
import { Camera, X, Info, Check, ShieldCheck, Store } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider, LiquidChip, LiquidButton } from '@/components/ui/LiquidUI'
import { useAccountFeatures } from '@/hooks/useAccountFeatures'

const PHOTO_TAGS = ['Macro', 'Full plant', 'Bud sec', 'Trichomes', 'Drying', 'Curing']

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {

    const { isProducteur } = useAccountFeatures()

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
            <LiquidCard glow="purple" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">📋 Informations générales</h3>
                        <p className="text-sm text-white/50">Identité et photos du produit</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-4 mt-6">
                    {/* Nom commercial */}
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

                    {/* Cultivar(s) - Champ texte libre */}
                    <div>
                        <LiquidInput
                            label="Cultivar(s)"
                            value={formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivars', e.target.value)}
                            placeholder="Ex: OG Kush, Purple Haze, Wedding Cake..."
                        />
                        <p className="text-xs text-white/40 mt-1">(Séparés par des virgules si plusieurs)</p>
                    </div>

                    {/* Farm */}
                    <div>
                        <LiquidInput
                            label="Farm / Producteur"
                            value={formData.isOurReview ? '' : (formData.farm || '')}
                            onChange={(e) => handleChange('farm', e.target.value)}
                            placeholder={formData.isOurReview ? 'Rempli automatiquement (c\'est votre production)' : 'Nom du producteur'}
                            disabled={!!formData.isOurReview}
                            className={formData.isOurReview ? 'opacity-40 cursor-not-allowed' : ''}
                        />
                        <p className="text-xs text-white/40 mt-1">
                            {formData.isOurReview
                                ? '🔒 Désactivé — vous avez déclaré cette review comme votre production'
                                : '(Auto-complete depuis base de données)'}
                        </p>
                    </div>

                    {/* C'est notre review — Producteur uniquement */}
                    {isProducteur && (
                        <div>
                            <button
                                type="button"
                                onClick={() => handleChange('isOurReview', !formData.isOurReview)}
                                className={`w-full relative overflow-hidden rounded-xl border transition-all duration-300 flex items-center gap-4 px-5 py-4 group ${
                                    formData.isOurReview
                                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                                        : 'bg-white/4 border-white/15 hover:border-violet-500/40 hover:bg-violet-500/8'
                                }`}
                            >
                                {/* Indicateur gauche */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    formData.isOurReview
                                        ? 'bg-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/20'
                                        : 'bg-white/8 text-white/40 group-hover:bg-violet-500/20 group-hover:text-violet-400'
                                }`}>
                                    {formData.isOurReview
                                        ? <ShieldCheck className="w-5 h-5" />
                                        : <Store className="w-5 h-5" />
                                    }
                                </div>

                                {/* Texte */}
                                <div className="flex-1 text-left">
                                    <div className={`font-semibold text-sm transition-colors ${
                                        formData.isOurReview ? 'text-emerald-300' : 'text-white/70 group-hover:text-white/90'
                                    }`}>
                                        {formData.isOurReview ? 'Notre production ✓' : 'C\'est notre production'}
                                    </div>
                                    <div className={`text-xs mt-0.5 transition-colors ${
                                        formData.isOurReview ? 'text-emerald-400/70' : 'text-white/35'
                                    }`}>
                                        {formData.isOurReview
                                            ? 'Vous êtes le producteur de ce cultivar'
                                            : 'Déclarez cette review comme votre propre production'}
                                    </div>
                                </div>

                                {/* Toggle pill */}
                                <div className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                                    formData.isOurReview ? 'bg-emerald-500' : 'bg-white/15'
                                }`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
                                        formData.isOurReview
                                            ? 'translate-x-6 bg-white'
                                            : 'translate-x-0.5 bg-white/50'
                                    }`} />
                                </div>

                                {/* Badge Producteur */}
                                <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                    PRO
                                </span>
                            </button>
                        </div>
                    )}

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
                            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-500/50 bg-white/5 hover:bg-violet-500/10 transition-all backdrop-blur-sm">
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
