import { useState, useEffect } from 'react'
import { edibleReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

export function useEdibleForm(reviewId = null) {
    const toast = useToast()
    const [formData, setFormData] = useState({ type: 'edible' })
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
            const response = await edibleReviewsService.getById(id)
            const baseReview = response.review || {}
            const ed = response.edibleReview || {}

            const parseArr = (v, def = []) => {
                if (!v) return def
                if (Array.isArray(v)) return v
                try { return JSON.parse(v) } catch { return def }
            }

            setFormData({
                ...baseReview,
                type: 'edible',
                id: baseReview.id,
                nomProduit: ed.nomProduit || baseReview.holderName || '',
                typeComestible: ed.typeComestible || '',
                fabricant: ed.fabricant || '',
                typeGenetiques: ed.typeGenetiques || '',
                sourceLineage: parseArr(ed.sourceLineage, []),
                status: baseReview.status || 'draft',
                _photos: parseArr(ed.photos, []).map(p => ({
                    url: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                    preview: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                    existing: true,
                    name: typeof p === 'string' ? p : ''
                })),
            })
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
