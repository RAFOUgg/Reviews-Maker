import { useState, useEffect } from 'react'
import { flowerReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

/**
 * Custom hook pour gérer le formulaire CreateFlowerReview
 */
export function useFlowerForm(reviewId = null) {
    const toast = useToast()
    const [formData, setFormData] = useState({})
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
            setFormData(review)
        } catch (error) {
            toast.error('Impossible de charger la review')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field, value) => {
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
