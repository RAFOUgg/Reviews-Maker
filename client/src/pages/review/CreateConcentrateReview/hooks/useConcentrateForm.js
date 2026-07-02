import { useState, useEffect } from 'react'
import { concentrateReviewsService } from '../../../../services/apiService'
import { useToast } from '../../../../components/shared/ToastContainer'

export function useConcentrateForm(reviewId = null) {
    const toast = useToast()
    const [formData, setFormData] = useState({ type: 'concentrate' })
    const [loading, setLoading] = useState(!!reviewId)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (reviewId) loadReview(reviewId)
    }, [reviewId])

    const loadReview = async (id) => {
        try {
            setLoading(true)
            const response = await concentrateReviewsService.getById(id)

            const baseReview = response.review || {}
            const cd = response.concentrateReview || {}

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
                thcPercent: cd.thcPercent ?? null,
                cbdPercent: cd.cbdPercent ?? null,
                cbgPercent: cd.cbgPercent ?? null,
                cbcPercent: cd.cbcPercent ?? null,
                cbnPercent: cd.cbnPercent ?? null,
                thcvPercent: cd.thcvPercent ?? null,
                terpeneProfile: cd.terpeneProfile ? parseArr(cd.terpeneProfile, null) : null,
                labReportUrl: cd.labReportUrl ?? null,
                terpeneFileUrl: cd.terpeneFileUrl ?? null,
            }

            const odeurs = {
                dominantNotes: parseArr(cd.notesDominantes, []),
                secondaryNotes: parseArr(cd.notesSecondaires, []),
                fideliteCultivars: cd.fideliteCultivars ?? 0,
                intensiteAromatique: cd.intensiteAromatique ?? 0,
            }

            const texture = {
                hardness: cd.durete ?? 0,
                density: cd.densiteTactile ?? 0,
                friability: cd.friabiliteViscositeMelting ?? 0,
                melting: cd.meltingResidus ?? 0,
                stickiness: cd.collantScore ?? 0,
            }

            const gouts = {
                intensity: cd.intensite ?? 0,
                aggressiveness: cd.agressivitePiquant ?? 0,
                dryPuffNotes: parseArr(cd.dryPuff, []),
                inhalationNotes: parseArr(cd.inhalation, []),
                exhalationNotes: parseArr(cd.expiration, []),
            }

            const effets = {
                onset: cd.monteeRapidite ?? 0,
                intensity: cd.intensiteEffets ?? 0,
                effects: parseArr(cd.effetsChoisis, []),
                methodeConsommation: cd.methodeConsommation ?? '',
            }

            const extractionPipeline = {
                extractionTimelineConfig: parseObj(cd.extractionTimelineConfig, {}),
                extractionTimelineData: parseArr(cd.extractionTimelineData, []),
            }

            // Schema stocke des colonnes plates (curingTimelineConfig/Data, curingType, ...) — pas de
            // colonne curingPipeline. Sans ce mapping, CuringMaturationSection recevait toujours {} au
            // chargement et les données de curing sauvegardées en DB n'étaient jamais réaffichées.
            const curing = {
                curingTimelineConfig: parseObj(cd.curingTimelineConfig, {}),
                curingTimeline: parseArr(cd.curingTimelineData, []),
                curingType: cd.curingType ?? '',
                temperature: cd.curingTemperature ?? undefined,
                humidity: cd.curingHumidity ?? undefined,
                curingDuration: cd.curingDuration ?? undefined,
                curingInterval: cd.curingInterval ?? '',
            }

            const visuel = {
                couleurTransparence: cd.couleurTransparence ?? 0,
                viscosite: cd.viscosite ?? 0,
                pureteVisuelle: cd.pureteVisuelle ?? 0,
                melting: cd.melting ?? 0,
                residus: cd.residus ?? 0,
                // Manquait : VisualSection lit data.couleurNuancier directement, sinon la palette
                // sélectionnée redevient vide à chaque réouverture de la review malgré la sauvegarde DB
                couleurNuancier: parseArr(cd.couleurNuancier, []),
            }

            const photos = parseArr(cd.photos, []).map(p => ({
                url: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                preview: typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || ''),
                existing: true,
                name: typeof p === 'string' ? p : ''
            }))

            // Lifter les champs d'aperçu depuis extraData
            const extraData = parseObj(baseReview.extraData, {})

            setFormData({
                ...baseReview,
                type: 'concentrate',
                id: baseReview.id,
                nomCommercial: cd.nomCommercial || baseReview.holderName || '',
                concentrateType: cd.concentrateType || '',
                hashmaker: cd.hashmaker || '',
                laboratoire: cd.laboratoire || '',
                cultivarsUtilises: cd.cultivarsUtilises || '',
                parentFlowerReviewId: cd.parentFlowerReviewId || null,
                sourceLineage: parseArr(cd.sourceLineage, []),
                status: baseReview.status || 'draft',
                orchardPreset: extraData.orchardPreset || null,
                orchardConfig: extraData.orchardConfig || null,
                orchardCustomLayout: extraData.orchardCustomLayout || null,
                orchardLayoutMode: extraData.orchardLayoutMode || null,
                analytics,
                odeurs,
                texture,
                gouts,
                effets,
                extractionPipeline,
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
