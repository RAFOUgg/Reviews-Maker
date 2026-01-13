import { useState, useEffect } from 'react'
import { hashReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

/**
 * Custom hook pour gérer le formulaire CreateHashReview
 */
export function useHashForm(reviewId = null) {
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
            const review = await hashReviewsService.getById(id)
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

    return {
        formData,
        setFormData,
        handleChange,
        loading,
        setLoading,
        saving,
        setSaving
    }
}
