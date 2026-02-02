import React from 'react'
import { Camera, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-6">
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">📋 Informations générales</h3>
                        <p className="text-sm text-white/50">Identité et origine du hash</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-4 mt-6">
                    {/* Nom commercial */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Nom commercial *"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            placeholder="Nom du produit"
                        />
                    </div>

                    {/* Hashmaker */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Hashmaker"
                            value={formData.hashmaker || ''}
                            onChange={(e) => handleChange('hashmaker', e.target.value)}
                            placeholder="Nom du hashmaker"
                        />
                    </div>

                    {/* Laboratoire */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Laboratoire de production"
                            value={formData.laboratoire || ''}
                            onChange={(e) => handleChange('laboratoire', e.target.value)}
                            placeholder="Nom du laboratoire"
                        />
                    </div>

                    {/* Cultivars utilisés */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Cultivar(s) utilisés"
                            value={formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivars', e.target.value)}
                            placeholder="Cultivars utilisés"
                        />
                    </div>
                </div>
            </LiquidCard>

            {/* Photos */}
            <LiquidCard glow="amber" padding="lg">
                <label className="block text-sm font-medium text-white/80 mb-3">
                    📷 Photos du produit (1-4) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={photo.preview || photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-white/10"
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
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-amber-500/50 bg-white/5 transition-colors">
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
