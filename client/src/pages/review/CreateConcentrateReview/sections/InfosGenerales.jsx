import React from 'react'
import { Camera, X, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import SourceLineageSelector from '@/components/forms/helpers/SourceLineageSelector'
import FillMyselfButton from '@/components/forms/helpers/FillMyselfButton'

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
        <div className="space-y-3">
            <LiquidCard glow="cyan" padding="sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">📋 Informations générales</h3>
                        <p className="text-xs text-white/50">Identité et photos du concentré</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-3 mt-3">
                    {/* Nom commercial + Type de concentré côte à côte sur desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LiquidInput
                            label="Nom commercial *"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            placeholder="Nom du produit"
                            maxLength={100}
                        />

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Type de concentré</label>
                            <select
                                value={formData.type || ''}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-colors appearance-none"
                            >
                                <option value="" className="bg-[#0f0f1a]">Sélectionnez un type</option>
                                {CONCENTRATE_TYPES.map(type => (
                                    <option key={type} value={type} className="bg-[#0f0f1a]">{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Hashmaker/Extracteur + Laboratoire côte à côte sur desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LiquidInput
                            label={
                                <span className="flex items-center justify-between">
                                    Hashmaker / Extracteur
                                    <FillMyselfButton onFill={(name) => handleChange('hashmaker', name)} />
                                </span>
                            }
                            value={formData.hashmaker || ''}
                            onChange={(e) => handleChange('hashmaker', e.target.value)}
                            placeholder="Nom de l'extracteur"
                        />

                        <LiquidInput
                            label="Laboratoire de production"
                            value={formData.laboratoire || ''}
                            onChange={(e) => handleChange('laboratoire', e.target.value)}
                            placeholder="Nom du laboratoire"
                        />
                    </div>

                    {/* Cultivars utilisés */}
                    <div>
                        <LiquidInput
                            label="Matière première(s) utilisée(s)"
                            value={formData.cultivarsUtilises || formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivarsUtilises', e.target.value)}
                            placeholder="Cultivars utilisés (séparés par des virgules)"
                        />
                        <p className="text-xs text-white/40 mt-1">(Auto-rempli depuis les matières premières liées, ou modifiable manuellement)</p>
                    </div>

                    {/* Lien matière première (fleur et/ou hash) */}
                    <div>
                        <SourceLineageSelector
                            value={formData.sourceLineage || []}
                            allowedTypes={['flower', 'hash']}
                            onChange={(sources, aggregatedCultivars) => {
                                handleChange('sourceLineage', sources)
                                if (aggregatedCultivars.length > 0) {
                                    handleChange('cultivarsUtilises', aggregatedCultivars.join(', '))
                                }
                            }}
                        />
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
                            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500/50 bg-white/5 hover:bg-cyan-500/10 transition-all backdrop-blur-sm">
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
