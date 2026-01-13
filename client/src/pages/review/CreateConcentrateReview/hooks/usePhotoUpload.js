import { useState } from 'react'
import { useToast } from '../../../../components/shared/ToastContainer'

/**
 * Custom hook pour gérer l'upload de photos
 */
export function usePhotoUpload(maxPhotos = 4) {
    const toast = useToast()
    const [photos, setPhotos] = useState([])

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files)
        const remaining = maxPhotos - photos.length

        if (files.length > remaining) {
            toast.warning(`Maximum ${maxPhotos} photos. ${remaining} emplacement(s) restant(s).`)
            return
        }

        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            existing: false
        }))

        setPhotos(prev => [...prev, ...newPhotos])
    }

    const removePhoto = (index) => {
        setPhotos(prev => {
            const photo = prev[index]
            if (!photo.existing && photo.preview) {
                URL.revokeObjectURL(photo.preview)
            }
            return prev.filter((_, i) => i !== index)
        })
    }

    const clearPhotos = () => {
        photos.forEach(photo => {
            if (!photo.existing && photo.preview) {
                URL.revokeObjectURL(photo.preview)
            }
        })
        setPhotos([])
    }

    return {
        photos,
        setPhotos,
        handlePhotoUpload,
        removePhoto,
        clearPhotos
    }
}
