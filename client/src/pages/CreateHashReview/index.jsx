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

    // Définition des sections pour Hash
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'separation', icon: '⚗️', title: 'Pipeline Séparation', premium: false },
        { id: 'analytics', icon: '🔬', title: 'Données Analytiques' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' }
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
        curing: CuringMaturationSection
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
}
