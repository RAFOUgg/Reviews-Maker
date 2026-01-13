import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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
        <div className="space-y-6">
            {/* Nom commercial* */}
            <div>
                <label htmlFor="nomCommercial" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.nomCommercial')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nomCommercial"
                    value={data.nomCommercial || ''}
                    onChange={(e) => handleInputChange('nomCommercial', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.nomCommercial ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder={t('flower.nomCommercialPlaceholder')}
                    required
                />
                {errors.nomCommercial && (
                    <p className="mt-1 text-sm text-red-500">{errors.nomCommercial}</p>
                )}
            </div>

            {/* Farm */}
            <div>
                <label htmlFor="farm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.farm')}
                </label>
                <input
                    type="text"
                    id="farm"
                    value={data.farm || ''}
                    onChange={(e) => handleInputChange('farm', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder={t('flower.farmPlaceholder')}
                />
            </div>

            {/* Variety Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.varietyType')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="varietyType"
                            value="souche"
                            checked={data.varietyType === 'souche'}
                            onChange={(e) => handleInputChange('varietyType', e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{t('flower.varietyType.souche')}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="varietyType"
                            value="hybride"
                            checked={data.varietyType === 'hybride'}
                            onChange={(e) => handleInputChange('varietyType', e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{t('flower.varietyType.hybride')}</span>
                    </label>
                </div>
                {errors.varietyType && (
                    <p className="mt-1 text-sm text-red-500">{errors.varietyType}</p>
                )}
            </div>

            {/* Photos Upload (max 4) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.photos')} ({photos.length}/4) <span className="text-red-500">*</span>
                </label>

                {/* Preview Grid */}
                {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {photos.map((photo, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700"
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
                                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                </div>
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {/* Drag indicator */}
                                <div className="absolute bottom-2 left-2 right-2 text-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-60 rounded py-1">
                                    {t('flower.dragToReorder')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Zone */}
                {photos.length < 4 && (
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-300 dark:border-gray-700'
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
                                    <Upload className="w-12 h-12 text-primary-500" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p className="font-medium">
                                    {dragActive
                                        ? t('flower.dropPhotosHere')
                                        : t('flower.clickOrDragPhotos')}
                                </p>
                                <p className="text-xs mt-1">
                                    {t('flower.maxPhotos', { max: 4, remaining: 4 - photos.length })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.photos && (
                    <p className="mt-2 text-sm text-red-500">{errors.photos}</p>
                )}

                {/* Helper text */}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('flower.photosHelper')}
                </p>
            </div>
        </div>
    )
}
