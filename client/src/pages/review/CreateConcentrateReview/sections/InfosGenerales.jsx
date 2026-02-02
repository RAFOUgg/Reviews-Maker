import React from 'react'
import { Camera, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidSelect, LiquidDivider } from '@/components/ui/LiquidUI'

const CONCENTRATE_TYPES = [
    'Rosin',
    'BHO (Butane Hash Oil)',
    'PHO (Propane Hash Oil)',
    'CO2 Oil',
    'Live Resin',
    'Live Rosin',
    'Shatter',
    'Wax',
    'Budder',
    'Crumble',
    'Diamonds',
    'Sauce',
    'Distillate',
    'RSO (Rick Simpson Oil)',
    'FECO (Full Extract Cannabis Oil)',
    'Autre'
]

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-6">
            <LiquidCard glow="cyan" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">📋 Informations générales</h3>
                        <p className="text-sm text-white/50">Identité et origine du concentré</p>
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

                    {/* Type de concentré */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidSelect
                            label="Type de concentré"
                            value={formData.type || ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                            options={[
                                { value: '', label: 'Sélectionnez un type' },
                                ...CONCENTRATE_TYPES.map(type => ({ value: type, label: type }))
                            ]}
                        />
                    </div>

                    {/* Hashmaker */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            label="Hashmaker / Extracteur"
                            value={formData.hashmaker || ''}
                            onChange={(e) => handleChange('hashmaker', e.target.value)}
                            placeholder="Nom de l'extracteur"
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
                            placeholder="Cultivars utilisés (séparés par des virgules)"
                        />
                    </div>
                </div>
            </LiquidCard>

            {/* Photos */}
            <LiquidCard glow="cyan" padding="lg">
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
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-500/50 bg-white/5 transition-colors">
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
