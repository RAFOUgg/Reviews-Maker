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
                thcaPercent: cd.thcaPercent ?? null,
                cbdPercent: cd.cbdPercent ?? null,
                cbdaPercent: cd.cbdaPercent ?? null,
                cbgPercent: cd.cbgPercent ?? null,
                cbcPercent: cd.cbcPercent ?? null,
                cbnPercent: cd.cbnPercent ?? null,
                thcvPercent: cd.thcvPercent ?? null,
                terpeneProfile: cd.terpeneProfile ? parseArr(cd.terpeneProfile, null) : null,
                labReportUrl: cd.labReportUrl ?? null,
                terpeneFileUrl: cd.terpeneFileUrl ?? null,
                labName: cd.labName ?? null,
                labMethod: cd.labMethod ?? null,
                labAccredited: cd.labAccredited ?? false,
                labAccreditationStandard: cd.labAccreditationStandard ?? null,
                labAnalysisDate: cd.labAnalysisDate ?? null,
            }

            const odeurs = {
                dominantNotes: parseArr(cd.notesDominantes, []),
                secondaryNotes: parseArr(cd.notesSecondaires, []),
                fideliteCultivars: cd.fideliteCultivars ?? 0,
                intensiteAromatique: cd.intensiteAromatique ?? 0,
                // OdorSection lit exclusivement data.intensity/data.fidelity (clés génériques, pas
                // les alias Hash/Concentré ci-dessus) — sans ce mirroring, les sliders "Intensité
                // globale" et "Fidélité aux cultivars" retombaient à 0 à chaque réouverture malgré
                // des valeurs bien présentes en DB (fideliteCultivars/intensiteAromatique).
                intensity: cd.intensiteAromatique ?? 0,
                fidelity: cd.fideliteCultivars ?? 0,
                complexity: cd.complexiteAromeScore ?? 0,
            }

            const texture = {
                hardness: cd.durete ?? 0,
                density: cd.densiteTactile ?? 0,
                // TextureSection ne rend un slider "Friabilité" QUE pour productType === 'Hash' et un
                // slider "Viscosité" QUE pour productType === 'Concentré' — pour Concentré la colonne
                // combinée friabiliteViscositeMelting doit donc recharger dans `viscosity`, pas
                // `friability` (clé jamais lue par le composant dans cette branche : le slider
                // Viscosité retombait toujours à 0 après un reload malgré la valeur bien sauvegardée).
                viscosity: cd.friabiliteViscositeMelting ?? 0,
                // textureMeltingScore/textureResiduScore : colonnes dédiées (post-migration).
                // meltingResidus (legacy) reste en fallback pour les reviews sauvées avant ce fix.
                melting: cd.textureMeltingScore ?? cd.meltingResidus ?? 0,
                residue: cd.textureResiduScore ?? 10,
                stickiness: cd.collantScore ?? 0,
            }

            const gouts = {
                intensity: cd.intensite ?? 0,
                aggressiveness: cd.agressivitePiquant ?? 0,
                dryPuffNotes: parseArr(cd.dryPuff, []),
                inhalationNotes: parseArr(cd.inhalation, []),
                exhalationNotes: parseArr(cd.expiration, []),
            }

            const [effectHeures, effectMinutes] = (cd.effectDuration || '').split(':')
            const effets = {
                onset: cd.monteeRapidite ?? 0,
                intensity: cd.intensiteEffets ?? 0,
                effects: parseArr(cd.effetsChoisis, []),
                methodeConsommation: cd.methodeConsommation ?? '',
                // dosageUtilise/dureeEffets existent en DB (colonnes String simples, même schéma
                // que HashReview) mais manquaient ici : EffectsSection retombait à '' / 'moyenne'
                // par défaut à chaque réouverture malgré une valeur bien sauvegardée.
                dosageUtilise: cd.dosageUtilise ?? '',
                dosageUnite: cd.dosageUnit ?? 'g',
                dureeEffetsCategorie: cd.dureeEffets ?? 'moyenne',
                dureeEffetsHeures: effectHeures ? String(parseInt(effectHeures, 10)) : '',
                dureeEffetsMinutes: effectMinutes ? String(parseInt(effectMinutes, 10)) : '',
                debutEffets: cd.effectOnset ?? '',
                usagesPreferes: parseArr(cd.preferredUse, []),
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
                // Méthode d'extraction (rendue dans l'aperçu/export — cf. registre groupe 'extraction')
                methodeExtraction: cd.methodeExtraction ?? null,
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
