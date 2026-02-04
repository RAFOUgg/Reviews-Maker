import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../../hooks/useAccountFeatures'
import { concentrateReviewsService } from '../../../services/apiService'
import CreateReviewFormWrapper from '../../../components/account/CreateReviewFormWrapper'
import { flattenConcentrateFormData, createFormDataFromFlat } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import { ExtractionPipelineAdapter, CuringMaturationAdapter } from '../../../components/pipelines/adapters'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisualSection from '../../../components/sections/VisualSection'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useConcentrateForm } from './hooks/useConcentrateForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateConcentrateReview - Utilise le wrapper unifié
 * Types: Rosin, BHO, PHO, CO2, Live Resin, etc.
 */
export default function CreateConcentrateReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const { isAuthenticated } = useStore()

    const { formData, handleChange, loading, saving, setSaving } = useConcentrateForm(id)
    const { photos, handlePhotoUpload, removePhoto } = usePhotoUpload()
    const { isProducteur, isInfluenceur } = useAccountFeatures()

    // Définition des sections pour Concentré selon PERMISSIONS.md:
    // Amateur: Infos, Analytics, Visuel, Odeurs, Texture, Goûts, Effets
    // Influenceur: Amateur + Curing
    // Producteur: TOUT (+ Pipeline Extraction)
    const allSections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true, access: 'all' },
        { id: 'extraction', icon: '⚗️', title: 'Pipeline Extraction', access: 'producteur' },
        { id: 'analytics', icon: '🔬', title: 'Données Analytiques', access: 'all' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique', access: 'all' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs', access: 'all' },
        { id: 'texture', icon: '🤚', title: 'Texture', access: 'all' },
        { id: 'gouts', icon: '😋', title: 'Goûts', access: 'all' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience', access: 'all' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation', access: 'paid' }
    ]
    
    // Filtrer les sections selon le type de compte
    const sections = allSections.filter(section => {
        if (section.access === 'all') return true
        if (section.access === 'paid' && (isProducteur || isInfluenceur)) return true
        if (section.access === 'producteur' && isProducteur) return true
        return false
    })

    const sectionComponents = {
        infos: InfosGenerales,
        extraction: ExtractionPipelineAdapter,
        analytics: AnalyticsSection,
        visual: VisualSection,
        odeurs: OdorSection,
        texture: TextureSection,
        gouts: TasteSection,
        effets: EffectsSection,
        curing: CuringMaturationAdapter
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Aplatir les données avec l'utilitaire
            const flatData = flattenConcentrateFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'draft')

            console.log('📤 Sending flattened Concentrate data:', flatData)

            let savedReview
            if (id) {
                savedReview = await concentrateReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await concentrateReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/concentrate/${savedReview.id}`)
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'))
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.nomCommercial || !photos || photos.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires : Nom commercial et au moins 1 photo')
            return
        }

        try {
            setSaving(true)

            // Aplatir les données avec l'utilitaire
            const flatData = flattenConcentrateFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published')

            if (id) {
                await concentrateReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await concentrateReviewsService.create(reviewFormData)
                toast.success('Review publiée avec succès')
            }

            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de la publication: ' + (error.message || 'Erreur inconnue'))
            console.error('Publish error:', error)
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated && !loading) {
        toast.error('Vous devez être connecté')
        navigate('/login')
        return null
    }

    return (
        <CreateReviewFormWrapper
            productType="concentrate"
            sections={sections}
            sectionComponents={sectionComponents}
            formData={formData}
            handleChange={handleChange}
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            onSave={handleSave}
            onSubmit={handleSubmit}
            title="Créer une review Concentré"
            subtitle="Documentez votre rosin, BHO ou autre concentré"
            loading={loading}
            saving={saving}
        />
    )
}
