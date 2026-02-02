import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { LiquidCard, LiquidInput, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI'

/**
 * Section 1: Informations Générales Fleur
 * - nomCommercial* (required)
 * - farm (optional)
 * - varietyType (souche/hybride)
 * - photos 1-4 (upload + preview + drag-drop)
 */
export default function InfosGeneralesFleur({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [dragActive, setDragActive] = useState(false)

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        handleFiles(files)
    }

    const handleFiles = (files) => {
        const currentPhotos = data.photos || []
        const remainingSlots = 4 - currentPhotos.length

        if (remainingSlots === 0) {
            return // Already have 4 photos
        }

        const newPhotos = files.slice(0, remainingSlots).map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))

        onChange({
            ...data,
            photos: [...currentPhotos, ...newPhotos]
        })
    }

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files))
        }
    }, [data, onChange])

    const removePhoto = (index) => {
        const newPhotos = [...(data.photos || [])]
        // Revoke object URL to prevent memory leaks
        if (newPhotos[index]?.preview) {
            URL.revokeObjectURL(newPhotos[index].preview)
        }
        newPhotos.splice(index, 1)
        onChange({ ...data, photos: newPhotos })
    }

    const movePhoto = (fromIndex, toIndex) => {
        const newPhotos = [...(data.photos || [])]
        const [moved] = newPhotos.splice(fromIndex, 1)
        newPhotos.splice(toIndex, 0, moved)
        onChange({ ...data, photos: newPhotos })
    }

    const photos = data.photos || []

    return (
        <LiquidCard glow="purple" padding="lg" className="space-y-6">
            {/* Nom commercial* */}
            <div>
                <LiquidInput
                    label={`${t('flower.nomCommercial')} *`}
                    value={data.nomCommercial || ''}
                    onChange={(e) => handleInputChange('nomCommercial', e.target.value)}
                    placeholder={t('flower.nomCommercialPlaceholder')}
                    error={errors.nomCommercial}
                />
            </div>

            {/* Farm */}
            <div>
                <LiquidInput
                    label={t('flower.farm')}
                    value={data.farm || ''}
                    onChange={(e) => handleInputChange('farm', e.target.value)}
                    placeholder={t('flower.farmPlaceholder')}
                />
            </div>

            {/* Variety Type */}
            <div>
                <label className="block text-[13px] font-medium text-white/60 ml-1 mb-2">
                    {t('flower.varietyType')} <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                    <LiquidChip
                        active={data.varietyType === 'souche'}
                        color="purple"
                        onClick={() => handleInputChange('varietyType', 'souche')}
                    >
                        {t('flower.varietyType.souche')}
                    </LiquidChip>
                    <LiquidChip
                        active={data.varietyType === 'hybride'}
                        color="purple"
                        onClick={() => handleInputChange('varietyType', 'hybride')}
                    >
                        {t('flower.varietyType.hybride')}
                    </LiquidChip>
                </div>
                {errors.varietyType && (
                    <p className="mt-1 text-sm text-red-400">{errors.varietyType}</p>
                )}
            </div>

            <LiquidDivider />

            {/* Photos Upload (max 4) */}
            <div>
                <label className="block text-[13px] font-medium text-white/60 ml-1 mb-2">
                    {t('flower.photos')} ({photos.length}/4) <span className="text-red-400">*</span>
                </label>

                {/* Preview Grid */}
                {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {photos.map((photo, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10"
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('photoIndex', index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    const fromIndex = parseInt(e.dataTransfer.getData('photoIndex'))
                                    if (fromIndex !== index) {
                                        movePhoto(fromIndex, index)
                                    }
                                }}
                            >
                                <img
                                    src={photo.preview}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {/* Photo number badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                                    #{index + 1}
                                </div>
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {/* Drag indicator */}
                                <div className="absolute bottom-2 left-2 right-2 text-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded-lg py-1">
                                    {t('flower.dragToReorder')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Zone */}
                {photos.length < 4 && (
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/20 hover:border-white/40'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="photoUpload"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                {dragActive ? (
                                    <Upload className="w-12 h-12 text-violet-400" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-white/30" />
                                )}
                            </div>
                            <div className="text-sm text-white/60">
                                <p className="font-medium text-white/80">
                                    {dragActive
                                        ? t('flower.dropPhotosHere')
                                        : t('flower.clickOrDragPhotos')}
                                </p>
                                <p className="text-xs mt-1 text-white/40">
                                    {t('flower.maxPhotos', { max: 4, remaining: 4 - photos.length })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.photos && (
                    <p className="mt-2 text-sm text-red-400">{errors.photos}</p>
                )}

                {/* Helper text */}
                <p className="mt-2 text-xs text-white/40">
                    {t('flower.photosHelper')}
                </p>
            </div>
        </LiquidCard>
    )
}


