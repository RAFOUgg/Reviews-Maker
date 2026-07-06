import React from 'react'
import { Camera, ImagePlus, Film, X, Info } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import SourceLineageSelector from '@/components/forms/helpers/SourceLineageSelector'
import FillMyselfButton from '@/components/forms/helpers/FillMyselfButton'
import FillCompanyButton from '@/components/forms/helpers/FillCompanyButton'
import UnknownValueButton from '@/components/ui/UnknownValueButton'
import { isVideoMedia } from '@/utils/mediaFileHelpers'

export default function InfosGenerales({ formData, handleChange, photos, handlePhotoUpload, removePhoto }) {
    return (
        <div className="space-y-3">
            <LiquidCard glow="purple" padding="sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">📋 Informations générales</h3>
                        <p className="text-xs text-white/50">Identité et photos du produit</p>
                    </div>
                </div>

                <LiquidDivider />

                <div className="space-y-3 mt-3">
                    {/* Nom du produit + Hashmaker côte à côte sur desktop pour réduire le scroll */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LiquidInput
                            label="Nom du produit *"
                            value={formData.nomCommercial || ''}
                            onChange={(e) => handleChange('nomCommercial', e.target.value)}
                            placeholder="Nom du hash"
                            maxLength={100}
                        />

                        <LiquidInput
                            label={
                                <span className="flex items-center justify-between gap-2">
                                    Hashmaker
                                    <span className="flex items-center gap-1.5">
                                        <FillMyselfButton onFill={(name) => handleChange('hashmaker', name)} />
                                        <UnknownValueButton onClick={() => handleChange('hashmaker', '')} />
                                    </span>
                                </span>
                            }
                            value={formData.hashmaker || ''}
                            onChange={(e) => handleChange('hashmaker', e.target.value)}
                            placeholder="Nom du hashmaker"
                        />
                    </div>

                    {/* Laboratoire + Matière première(s) côte à côte sur desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LiquidInput
                            label={
                                <span className="flex items-center justify-between gap-2">
                                    Laboratoire de production
                                    <span className="flex items-center gap-1.5">
                                        <FillCompanyButton onFill={(name) => handleChange('laboratoire', name)} />
                                        <UnknownValueButton onClick={() => handleChange('laboratoire', '')} />
                                    </span>
                                </span>
                            }
                            value={formData.laboratoire || ''}
                            onChange={(e) => handleChange('laboratoire', e.target.value)}
                            placeholder="Nom du laboratoire"
                        />

                        <div>
                            <LiquidInput
                                label="Matière première(s) utilisée(s)"
                                value={formData.cultivarsUtilises || formData.cultivars || ''}
                                onChange={(e) => handleChange('cultivarsUtilises', e.target.value)}
                                placeholder="Cultivars utilisés, ou liez une fiche ci-dessous"
                            />
                            <div className="mt-1.5">
                                <SourceLineageSelector
                                    compact
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
                        </div>
                    </div>

                    {/* Photos / Vidéos */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            📷 Photos / vidéos du produit (1-4) *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {photos.map((photo, index) => {
                                const isVideo = isVideoMedia(photo)
                                return (
                                    <div key={index} className="relative group">
                                        {isVideo ? (
                                            <video
                                                src={photo.preview || photo.url}
                                                className="w-full h-32 object-cover rounded-lg border border-white/10 shadow-md"
                                                muted
                                            />
                                        ) : (
                                            <img
                                                src={photo.preview || photo.url}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-white/10 shadow-md"
                                            />
                                        )}
                                        {isVideo && (
                                            <span className="absolute bottom-2 left-2 bg-black/60 text-white p-1 rounded-full">
                                                <Film className="w-3 h-3" />
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                        {photos.length < 4 && (
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 bg-white/5 hover:bg-amber-500/10 transition-all backdrop-blur-sm">
                                    <Camera className="w-5 h-5 text-white/40 shrink-0" />
                                    <span className="text-sm font-medium text-white/60 text-center">
                                        Prendre une photo
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </label>
                                <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 bg-white/5 hover:bg-amber-500/10 transition-all backdrop-blur-sm">
                                    <ImagePlus className="w-5 h-5 text-white/40 shrink-0" />
                                    <span className="text-sm font-medium text-white/60 text-center">
                                        Galerie ({photos.length}/4)
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        multiple
                                    />
                                </label>
                            </div>
                        )}
                        <p className="text-xs text-white/30 mt-1.5">200 Mo max par fichier</p>
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
