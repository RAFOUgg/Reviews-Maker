import React from 'react'
import { Camera, X, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import SourceLineageSelector from '@/components/forms/helpers/SourceLineageSelector'
import FillMyselfButton from '@/components/forms/helpers/FillMyselfButton'

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-6">
            <LiquidCard glow="purple" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
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
                            label="Nom du produit *"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            placeholder="Nom du hash"
                            maxLength={100}
                        />
                    </div>

                    {/* Hashmaker */}
                    <div>
                        <LiquidInput
                            label={
                                <span className="flex items-center justify-between">
                                    Hashmaker
                                    <FillMyselfButton onFill={(name) => handleChange('hashmaker', name)} />
                                </span>
                            }
                            value={formData.hashmaker || ''}
                            onChange={(e) => handleChange('hashmaker', e.target.value)}
                            placeholder="Nom du hashmaker"
                        />
                    </div>

                    {/* Laboratoire */}
                    <div>
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
                            label="Cultivar(s) utilisés"
                            value={formData.cultivarsUtilises || formData.cultivars || ''}
                            onChange={(e) => handleChange('cultivarsUtilises', e.target.value)}
                            placeholder="Cultivars utilisés"
                        />
                        <p className="text-xs text-white/40 mt-1">(Auto-rempli depuis les matières premières liées, ou modifiable manuellement)</p>
                    </div>

                    {/* Lien matière première (fleur) */}
                    <div>
                        <SourceLineageSelector
                            value={formData.sourceLineage || []}
                            allowedTypes={['flower']}
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
                            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 bg-white/5 hover:bg-amber-500/10 transition-all backdrop-blur-sm">
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
