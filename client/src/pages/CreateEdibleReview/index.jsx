import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import { edibleReviewsService } from '../../services/apiService'
import CreateReviewFormWrapper from '../../components/CreateReviewFormWrapper'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import RecipePipelineSection from './sections/RecipePipelineSection'
import TasteSection from '../../components/reviews/sections/TasteSection'
import EffectsSection from '../../components/reviews/sections/EffectsSection'

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
            const reviewFormData = new FormData()

            Object.keys(formData).forEach(key => {
                if (key !== 'photos' && formData[key] !== undefined && formData[key] !== null) {
                    reviewFormData.append(key, typeof formData[key] === 'object'
                        ? JSON.stringify(formData[key])
                        : formData[key]
                    )
                }
            })

            if (photos && photos.length > 0) {
                photos.forEach((photo) => {
                    if (photo.file) {
                        reviewFormData.append('photos', photo.file)
                    }
                })
            }

            reviewFormData.append('status', 'draft')

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
            toast.error('Erreur lors de la sauvegarde')
}
