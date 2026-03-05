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

            const { flowerData, ...baseReview } = review
            const fd = flowerData || {}

            // Helper: parse a JSON string or return array/value as-is
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

            // ── Section 5: Visuel ──────────────────────────────────────────────
            const visual = {
                colors: parseArr(fd.couleurNuancier, []),
                colorRating: fd.couleurRating ?? 5,
                density: fd.densiteVisuelle ?? 5,
                trichomes: fd.trichomesScore ?? 5,
                pistils: fd.pistilsScore ?? 5,
                manucure: fd.manucureScore ?? 5,
                mold: fd.moisissureScore ?? 10,
                seeds: fd.grainesScore ?? 10,
            }

            // ── Section 4: Analytics ──────────────────────────────────────────
            const analytics = {
                thcPercent: fd.thcPercent ?? null,
                cbdPercent: fd.cbdPercent ?? null,
                cbgPercent: fd.cbgPercent ?? null,
                cbcPercent: fd.cbcPercent ?? null,
                terpeneProfile: fd.terpeneProfile ? parseArr(fd.terpeneProfile, null) : null,
            }

            // ── Section 6: Odeurs ─────────────────────────────────────────────
            const odeurs = {
                dominantNotes: parseArr(fd.notesOdeursDominantes, []),
                secondaryNotes: parseArr(fd.notesOdeursSecondaires, []),
                intensity: fd.intensiteAromeScore ?? 0,
                complexity: fd.complexiteAromeScore ?? 0,
                fidelity: fd.fideliteAromeScore ?? 0,
            }

            // ── Section 7: Texture ────────────────────────────────────────────
            const texture = {
                hardness: fd.dureteScore ?? 0,
                density: fd.densiteTactileScore ?? 0,
                elasticity: fd.elasticiteScore ?? 0,
                stickiness: fd.collantScore ?? 0,
                malleability: fd.malleabiliteScore ?? 0,
                friability: fd.friabiliteScore ?? 0,
                viscosity: fd.viscositeScore ?? 0,
                melting: fd.meltingScore ?? 0,
                residue: fd.residuScore ?? 10,
            }

            // ── Section 8: Goûts ──────────────────────────────────────────────
            const gouts = {
                intensity: fd.intensiteGoutScore ?? 0,
                aggressiveness: fd.agressiviteScore ?? 0,
                dryPuffNotes: parseArr(fd.dryPuffNotes, []),
                inhalationNotes: parseArr(fd.inhalationNotes, []),
                exhalationNotes: parseArr(fd.expirationNotes, []),
            }

            // ── Section 9: Effets & Expérience ────────────────────────────────
            // Reconstruct HH/MM from stored effectDurationMinutes
            const durationMins = fd.effectDurationMinutes != null ? parseInt(fd.effectDurationMinutes) : null
            const effets = {
                onset: fd.monteeScore ?? 5,
                intensity: fd.intensiteEffetScore ?? 5,
                duration: fd.effectDuration ?? '1-2h',
                effects: parseArr(fd.effetsChoisis, []),
                methodeConsommation: fd.consumptionMethod ?? '',
                dosageUtilise: fd.dosage ?? '',
                dosageUnite: fd.dosageUnit ?? 'g',
                dureeEffetsHeures: durationMins != null ? String(Math.floor(durationMins / 60)) : '',
                dureeEffetsMinutes: durationMins != null ? String(durationMins % 60) : '',
                debutEffets: fd.effectOnset ?? '',
                dureeEffetsCategorie: fd.effectLength ?? 'moyenne',
                profilsEffets: parseArr(fd.effectProfiles, []),
                effetsSecondaires: parseArr(fd.sideEffects, []),
                usagesPreferes: parseArr(fd.preferredUse, []),
            }

            // ── Section 2: Génétiques ─────────────────────────────────────────
            const genetics = {
                breeder: fd.breeder ?? '',
                variety: fd.variety ?? '',
                geneticType: fd.geneticType ?? '',
                indicaPercent: fd.indicaPercent ?? null,
                sativaPercent: fd.sativaPercent ?? null,
                parentage: parseArr(fd.parentage, []),
                phenotypeCode: fd.phenotypeCode ?? '',
                treeId: fd.geneticTreeId ?? null,
            }

            // ── Section 3: Culture Pipeline ───────────────────────────────────
            const culture = {
                cultureTimeline: parseArr(fd.cultureTimelineData, []),
                cultureTimelineConfig: parseObj(fd.cultureTimelineConfig, {}),
                mode: fd.cultureMode ?? null,
                spaceType: fd.cultureSpaceType ?? null,
                substrat: fd.cultureSubstrat ?? null,
            }

            // ── Section 10: Curing ────────────────────────────────────────────
            const curing = {
                curingTimeline: parseArr(fd.curingTimelineData, []),
                curingTimelineConfig: parseObj(fd.curingTimelineConfig, {}),
                curingType: fd.curingType ?? null,
                temperature: fd.curingTemperature ?? null,
                humidity: fd.curingHumidity ?? null,
            }

            const mappedFormData = {
                ...baseReview,
                nomCommercial: baseReview.holderName || '',
                // Flat FlowerReview fields at top-level (for compatibility with
                // legacy code that still reads fd.xxx directly)
                ...fd,
                // Nested sub-objects — override any flat value from ...fd above
                visual,
                analytics,
                odeurs,
                texture,
                gouts,
                effets,
                genetics,
                culture,
                curing,
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
