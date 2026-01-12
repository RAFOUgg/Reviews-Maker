import { useState, useEffect } from 'react'
import { flowerReviewsService } from '../../../services/apiService'
import { useToast } from '../../../components/ToastContainer'

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
