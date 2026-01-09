import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import { hashReviewsService } from '../../services/apiService'
import CreateReviewFormWrapper from '../../components/CreateReviewFormWrapper'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import SeparationPipelineSection from '../../components/reviews/sections/SeparationPipelineSection'
import AnalyticsSection from '../../components/reviews/sections/AnalyticsSection'
import VisualSection from '../../components/reviews/sections/VisualSection'
import OdorSection from '../../components/reviews/sections/OdorSection'
import TextureSection from '../../components/reviews/sections/TextureSection'
import TasteSection from '../../components/reviews/sections/TasteSection'
import EffectsSection from '../../components/reviews/sections/EffectsSection'
import ExperienceUtilisation from '../../components/forms/flower/ExperienceUtilisation'
import CuringMaturationSection from '../../components/reviews/sections/CuringMaturationSection'

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

    // Définition des sections pour Hash (comme Culture mais adapté)
    const sections = [
        { id: 'infos', icon: '\ud83d\udccb', title: 'Informations générales', required: true },
        { id: 'separation', icon: '\u2697\ufe0f', title: 'Pipeline Séparation', premium: false },
        { id: 'analytics', icon: '\ud83d\udd2c', title: 'Données Analytiques' },
        { id: 'visual', icon: '\ud83d\udc41\ufe0f', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '\ud83d\udc43', title: 'Odeurs' },
        { id: 'texture', icon: '\ud83e\udd1a', title: 'Texture' },
        { id: 'gouts', icon: '\ud83d\ude0b', title: 'Goûts' },
        { id: 'effets', icon: '\ud83d\udca5', title: 'Effets' },
        { id: 'curing', icon: '\ud83d\udd25', title: 'Curing & Maturation' },
        { id: 'experience', icon: '\ud83e\uddea', title: 'Expérience d\'utilisation' }
    ]

    // Map des sections aux composants
    const sectionComponents = {
        infos: InfosGenerales,
        separation: SeparationPipelineSection,
        analytics: AnalyticsSection,
        visual: VisualSection,
        odeurs: OdorSection,
        texture: TextureSection,
        gouts: TasteSection,
        effets: EffectsSection,
        curing: CuringMaturationSection,
        experience: ExperienceUtilisation
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
                savedReview = await hashReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await hashReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/hash/${savedReview.id}`)
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde')
            console.error(error)
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

            reviewFormData.append('status', 'published')

            if (id) {
                await hashReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await hashReviewsService.create(reviewFormData)
                toast.success('Review publiée avec succès')
            }

            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de la publication')
            console.error(error)
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
