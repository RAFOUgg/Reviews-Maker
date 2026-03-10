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
        // Flat aliases for VisuelTechnique.jsx (reads formData.densite etc.)
        // Start at 0 so empty reviews don't appear pre-filled in OrchardPanel
        densite: 0, trichomes: 0, pistils: 0, manucure: 0, moisissure: 0, graines: 0,
        selectedColors: [],
        // Visual sub-object — all scores start at 0
        visual: { colors: [], colorRating: 0, density: 0, trichomes: 0, mold: 0, seeds: 0 }
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
                colorRating: fd.couleurScore ?? 0,
                density: fd.densiteVisuelle ?? 0,
                trichomes: fd.trichomesScore ?? 0,
                pistils: fd.pistilsScore ?? 0,
                manucure: fd.manucureScore ?? 0,
                mold: fd.moisissureScore ?? 0,
                seeds: fd.grainesScore ?? 0,
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
                residue: fd.residuScore ?? 0,
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
            // Reconstruct HH/MM from stored effectDuration (HH:MM string from DB)
            const [effHH, effMM] = (fd.effectDuration ?? '').split(':')
            const effets = {
                onset: fd.monteeScore ?? 0,
                intensity: fd.intensiteEffetScore ?? 0,
                duration: fd.effectDuration ?? '',
                effects: parseArr(fd.effetsChoisis, []),
                methodeConsommation: fd.consumptionMethod ?? '',
                dosageUtilise: fd.dosage ?? '',
                dosageUnite: fd.dosageUnit ?? 'g',
                dureeEffetsHeures: effHH ? String(parseInt(effHH, 10)) : '',
                dureeEffetsMinutes: effMM ? String(parseInt(effMM, 10)) : '',
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
                isOurReview: baseReview.isOurReview ?? false,
                // Flat FlowerReview fields at top-level (for compatibility with
                // legacy code that still reads fd.xxx directly)
                ...fd,
                // Flat aliases for VisuelTechnique.jsx (reads formData.densite etc.)
                // These MUST come after ...fd to override fd.densiteVisuelle etc.
                densite: fd.densiteVisuelle ?? 0,
                trichomes: fd.trichomesScore ?? 0,
                pistils: fd.pistilsScore ?? 0,
                manucure: fd.manucureScore ?? 0,
                moisissure: fd.moisissureScore ?? 0,
                graines: fd.grainesScore ?? 0,
                selectedColors: parseArr(fd.couleurNuancier, []),
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

            // Sanitize any top-level text fields that may have been stored as the string "null"
            // (caused by FormData.append(key, null) coercing null → "null" string in old saves)
            const sanitizeNullStrings = (obj) => {
                const result = { ...obj }
                Object.keys(result).forEach(k => {
                    if (typeof result[k] === 'string' && result[k] === 'null') result[k] = ''
                })
                return result
            }

            setFormData(sanitizeNullStrings(mappedFormData))
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
        // Sanitize: FormData.append(key, null) produces the string "null" on the server-round-trip
        const sanitized = (typeof value === 'string' && value === 'null') ? '' : value
        setFormData(prev => ({ ...prev, [field]: sanitized }))
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
