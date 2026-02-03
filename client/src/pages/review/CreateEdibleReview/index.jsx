import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { edibleReviewsService } from '../../../services/apiService'
import CreateReviewFormWrapper from '../../../components/account/CreateReviewFormWrapper'
import { flattenEdibleFormData, createFormDataFromFlat } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import RecipePipelineSection from './sections/RecipePipelineSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useEdibleForm } from './hooks/useEdibleForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateEdibleReview - Utilise le wrapper unifié
 * Types: Brownie, Cookie, Gummies, Boissons, etc.
 */
export default function CreateEdibleReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const { isAuthenticated } = useStore()

    const { formData, handleChange, loading, saving, setSaving } = useEdibleForm(id)
    const { photos, handlePhotoUpload, removePhoto } = usePhotoUpload()

    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'recipe', icon: '🥘', title: 'Recette & Préparation' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience' }
    ]

    const sectionComponents = {
        infos: InfosGenerales,
        recipe: RecipePipelineSection,
        gouts: TasteSection,
        effets: EffectsSection
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Aplatir les données avec l'utilitaire
            const flatData = flattenEdibleFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'draft')

            console.log('📤 Sending flattened Edible data:', flatData)

            let savedReview
            if (id) {
                savedReview = await edibleReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await edibleReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/edible/${savedReview.id}`)
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'))
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.nomProduit || !photos || photos.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires : Nom du produit et au moins 1 photo')
            return
        }

        try {
            setSaving(true)

            // Aplatir les données avec l'utilitaire
            const flatData = flattenEdibleFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published')

            if (id) {
                await edibleReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await edibleReviewsService.create(reviewFormData)
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
            productType="edible"
            sections={sections}
            sectionComponents={sectionComponents}
            formData={formData}
            handleChange={handleChange}
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            onSave={handleSave}
            onSubmit={handleSubmit}
            title="Créer une review Comestible"
            subtitle="Documentez votre produit comestible"
            loading={loading}
            saving={saving}
        />
    )
}
