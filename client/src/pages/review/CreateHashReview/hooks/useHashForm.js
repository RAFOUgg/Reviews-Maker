import { useState, useEffect } from 'react'
import { hashReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

export function useHashForm(reviewId = null) {
    const toast = useToast()
    const [formData, setFormData] = useState({ type: 'hash' })
    const [loading, setLoading] = useState(!!reviewId)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (reviewId) loadReview(reviewId)
    }, [reviewId])

    const loadReview = async (id) => {
        try {
            setLoading(true)
            const response = await hashReviewsService.getById(id)

            const baseReview = response.review || {}
            const hd = response.hashReview || {}

            const parseArr = (v, def = []) => {
                if (!v) return def
                if (Array.isArray(v)) return v
                try { return JSON.parse(v) } catch { return def }
            }
            const parseObj = (v, def = {}) => {
                if (!v) return def
                if (typeof v === 'object' && !Array.isArray(v)) return v
                try { return JSON.parse(v) } catch { return def }
            }

            const analytics = {
                thcPercent: hd.thcPercent ?? null,
                cbdPercent: hd.cbdPercent ?? null,
                cbgPercent: hd.cbgPercent ?? null,
                cbcPercent: hd.cbcPercent ?? null,
                cbnPercent: hd.cbnPercent ?? null,
                thcvPercent: hd.thcvPercent ?? null,
                terpeneProfile: hd.terpeneProfile ? parseArr(hd.terpeneProfile, null) : null,
                labReportUrl: hd.labReportUrl ?? null,
                terpeneFileUrl: hd.terpeneFileUrl ?? null,
            }

            const odeurs = {
                dominantNotes: parseArr(hd.notesDominantes, []),
                secondaryNotes: parseArr(hd.notesSecondaires, []),
                fideliteCultivars: hd.fideliteCultivars ?? 0,
                intensiteAromatique: hd.intensiteAromatique ?? 0,
            }

            const texture = {
                hardness: hd.durete ?? 0,
                density: hd.densiteTactile ?? 0,
                friability: hd.friabiliteViscositeMelting ?? 0,
                melting: hd.meltingResidus ?? 0,
            }

            const gouts = {
                intensity: hd.intensite ?? 0,
                aggressiveness: hd.agressivitePiquant ?? 0,
                dryPuffNotes: parseArr(hd.dryPuff, []),
                inhalationNotes: parseArr(hd.inhalation, []),
                exhalationNotes: parseArr(hd.expiration, []),
            }

            const effets = {
                onset: hd.monteeRapidite ?? 0,
                intensity: hd.intensiteEffets ?? 0,
                effects: parseArr(hd.effetsChoisis, []),
                methodeConsommation: hd.methodeConsommation ?? '',
            }

            const separationPipeline = {
                separationTimelineConfig: parseObj(hd.separationTimelineConfig, {}),
                separationTimelineData: parseArr(hd.separationTimelineData, []),
            }

            const curing = parseObj(hd.curingPipeline, {})

            const visuel = {
                couleurTransparence: hd.couleurTransparence ?? 0,
                pureteVisuelle: hd.pureteVisuelle ?? 0,
                densiteVisuelle: hd.densiteVisuelle ?? 0,
            }

            const photos = parseArr(hd.photos, []).map(p => ({
                url: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                preview: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                existing: true,
                name: typeof p === 'string' ? p : ''
            }))

            setFormData({
                ...baseReview,
                type: 'hash',
                id: baseReview.id,
                nomCommercial: hd.nomCommercial || baseReview.holderName || '',
                hashmaker: hd.hashmaker || '',
                laboratoire: hd.laboratoire || '',
                cultivarsUtilises: hd.cultivarsUtilises || '',
                parentFlowerReviewId: hd.parentFlowerReviewId || null,
                status: baseReview.status || 'draft',
                analytics,
                odeurs,
                texture,
                gouts,
                effets,
                separationPipeline,
                curing,
                visuel,
                _photos: photos,
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
