import { useState, useEffect } from 'react'
import { flowerReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

/**
 * Custom hook pour gérer le formulaire CreateFlowerReview
 */
export function useFlowerForm(reviewId = null) {
    const toast = useToast()
    const [formData, setFormData] = useState({
        type: 'flower',
        // Pre-initialize visual defaults so extractExtraData finds scores even if
        // the user opens OrchardPanel before navigating to the Visual section
        visual: { colors: [], colorRating: 5, density: 5, trichomes: 5, mold: 10, seeds: 10 }
    })
    const [loading, setLoading] = useState(!!reviewId)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (reviewId) {
            loadReview(reviewId)
        }
    }, [reviewId])

    const loadReview = async (id) => {
        try {
            setLoading(true)
            const review = await flowerReviewsService.getById(id)

            // Map the API response structure to form expected structure:
            // - Review model fields: holderName, images, mainImage, type, etc.
            // - FlowerReview model fields are nested under review.flowerData
            const { flowerData, ...baseReview } = review

            const fd = flowerData || {}

            // Reconstruct visual sub-object from flat API fields so VisualSection
            // and normalizeReviewDataByType receive proper nested state on edit
            const visual = {
                colors:      fd.couleurNuancier   ?? [],
                colorRating: fd.couleurRating      ?? 5,
                density:     fd.densiteVisuelle    ?? 5,
                trichomes:   fd.trichomesScore     ?? 5,
                pistils:     fd.pistilsScore       ?? 5,
                manucure:    fd.manucureScore      ?? 5,
                mold:        fd.moisissureScore    ?? 10,
                seeds:       fd.grainesScore       ?? 10,
            }

            const mappedFormData = {
                ...baseReview,
                // Map holderName (Review model) → nomCommercial (form field)
                nomCommercial: baseReview.holderName || '',
                // Merge flowerData fields into top-level form state
                // so fields like cultivars, farm, thcPercent etc. are accessible directly
                ...fd,
                // Nested visual object required by VisualSection + normalizeReviewDataByType
                visual,
            }

            setFormData(mappedFormData)
        } catch (error) {
            toast.error('Impossible de charger la review')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field, value) => {
        // Debug: trace every change routed to the centralized form state
        try { console.debug('[useFlowerForm] handleChange', { field, value }) } catch (e) { }
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const saveReview = async () => {
        try {
            setSaving(true)
            if (reviewId) {
                await flowerReviewsService.update(reviewId, formData)
                toast.success('Review mise à jour')
            } else {
                const created = await flowerReviewsService.create(formData)
                toast.success('Review créée')
                return created
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde')
            throw error
        } finally {
            setSaving(false)
        }
    }

    return {
        formData,
        setFormData,
        handleChange,
        loading,
        setLoading,
        saving,
        setSaving,
        saveReview
    }
}
