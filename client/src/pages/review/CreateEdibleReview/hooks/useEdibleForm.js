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
            const parseObj = (v, def = {}) => {
                if (!v) return def
                if (typeof v === 'object' && !Array.isArray(v)) return v
                try { return JSON.parse(v) } catch { return def }
            }

            const extraData = parseObj(baseReview.extraData, {})

            const gouts = {
                intensity: ed.intensite ?? 0,
                // Comestible : agressivitePiquant stocke la persistance en bouche/arrière-goût
                // (TasteSection.jsx lit aftertastePersistence pour ce type, pas aggressiveness).
                aftertastePersistence: ed.agressivitePiquant ?? 0,
                dryPuffNotes: parseArr(ed.dryPuff, []),
                inhalationNotes: parseArr(ed.inhalation, []),
                exhalationNotes: parseArr(ed.expiration, []),
                saveursDominantes: parseArr(ed.saveursDominantes, []),
            }

            // consumptionMethod/dosage/dosageUnit/effectDuration/effectOnset/preferredUse : colonnes
            // ajoutées (mêmes noms que FlowerReview) — avant ce fix, la section "Expérience
            // d'utilisation" était entièrement perdue à la sauvegarde pour Comestible (pas de colonne
            // du tout), donc jamais relue non plus.
            const [effectHeures, effectMinutes] = (ed.effectDuration || '').split(':')
            const effets = {
                onset: ed.monteeRapidite ?? 0,
                intensity: ed.intensiteEffets ?? 0,
                effects: parseArr(ed.effetsChoisis, []),
                methodeConsommation: ed.consumptionMethod ?? '',
                dosageUtilise: ed.dosage ?? '',
                dosageUnite: ed.dosageUnit ?? 'g',
                dureeEffetsCategorie: ed.dureeEffets ?? '',
                dureeEffetsHeures: effectHeures ? String(parseInt(effectHeures, 10)) : '',
                dureeEffetsMinutes: effectMinutes ? String(parseInt(effectMinutes, 10)) : '',
                debutEffets: ed.effectOnset ?? '',
                usagesPreferes: parseArr(ed.preferredUse, []),
            }

            // recipe.ingredients/steps : jamais remis dans formData avant ce fix, donc
            // RecipePipelineSection s'affichait toujours vide au rechargement d'une review existante
            const recipe = {
                ingredients: parseArr(ed.ingredients, []),
                steps: parseArr(ed.etapesPreparation, []),
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
                orchardPreset: extraData.orchardPreset || null,
                orchardConfig: extraData.orchardConfig || null,
                orchardCustomLayout: extraData.orchardCustomLayout || null,
                orchardLayoutMode: extraData.orchardLayoutMode || null,
                gouts,
                effets,
                recipe,
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
