import { useState } from 'react'
import { useToast } from '../../../../components/shared/ToastContainer'

const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 Mo par fichier (photo ou vidéo)

function formatSize(bytes) {
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`
}

/**
 * Custom hook pour gérer l'upload de photos et vidéos
 */
export function usePhotoUpload(maxPhotos = 4) {
    const toast = useToast()
    const [photos, setPhotos] = useState([])

    const handlePhotoUpload = (e) => {
        const allFiles = Array.from(e.target.files)
        e.target.value = '' // permet de re-sélectionner le même fichier ensuite

        const files = allFiles.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.warning(`"${file.name}" trop volumineux (${formatSize(file.size)}) — 200 Mo maximum`)
                return false
            }
            return true
        })

        const remaining = maxPhotos - photos.length
        if (files.length > remaining) {
            toast.warning(`Maximum ${maxPhotos} fichiers. ${remaining} emplacement(s) restant(s).`)
            return
        }

        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'photo',
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
