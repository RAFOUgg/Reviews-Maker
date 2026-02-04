import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../../hooks/useAccountFeatures'
import { hashReviewsService } from '../../../services/apiService'
import CreateReviewFormWrapper from '../../../components/account/CreateReviewFormWrapper'
import { flattenHashFormData, createFormDataFromFlat } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import { SeparationPipelineAdapter, CuringMaturationAdapter } from '../../../components/pipelines/adapters'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisualSection from '../../../components/sections/VisualSection'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useHashForm } from './hooks/useHashForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateHashReview - Utilise le wrapper unifié
 * Types: Hash, Kief, Ice-O-Lator, Dry-Sift
 */
export default function CreateHashReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const { isAuthenticated } = useStore()

    const { formData, handleChange, loading, saving, setSaving } = useHashForm(id)
    const { photos, handlePhotoUpload, removePhoto } = usePhotoUpload()
    const { isProducteur } = useAccountFeatures()

    // Définition des sections pour Hash avec restrictions selon CDC:
    // Amateur/Influenceur: Info, Visuel, Odeurs, Texture, Goûts, Effets, Curing
    // Producteur: + Pipeline Séparation, Analytiques
    const allSections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true, access: 'all' },
        { id: 'separation', icon: '⚗️', title: 'Pipeline Séparation', access: 'producteur' },
        { id: 'analytics', icon: '🔬', title: 'Données Analytiques', access: 'producteur' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique', access: 'all' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs', access: 'all' },
        { id: 'texture', icon: '🤚', title: 'Texture', access: 'all' },
        { id: 'gouts', icon: '😋', title: 'Goûts', access: 'all' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience', access: 'all' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation', access: 'all' }
    ]
    
    // Filtrer les sections selon le type de compte
    const sections = allSections.filter(section => {
        if (section.access === 'all') return true
        if (section.access === 'producteur' && isProducteur) return true
        return false
    })

    // Map des sections aux composants
    const sectionComponents = {
        infos: InfosGenerales,
        separation: SeparationPipelineAdapter,
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
            const flatData = flattenHashFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'draft')

            console.log('📤 Sending flattened Hash data:', flatData)

            let savedReview
            if (id) {
                savedReview = await hashReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await hashReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/hash/${savedReview.id}`)
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
            const flatData = flattenHashFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published')

            if (id) {
                await hashReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await hashReviewsService.create(reviewFormData)
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

    // Vérifier auth
    if (!isAuthenticated && !loading) {
        toast.error('Vous devez être connecté')
        navigate('/login')
        return null
    }

    return (
        <CreateReviewFormWrapper
            productType="hash"
            sections={sections}
            sectionComponents={sectionComponents}
            formData={formData}
            handleChange={handleChange}
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            onSave={handleSave}
            onSubmit={handleSubmit}
            title="Créer une review Hash"
            subtitle="Documentez votre hash, kief ou ice-o-lator"
            loading={loading}
            saving={saving}
        />
    )
}
