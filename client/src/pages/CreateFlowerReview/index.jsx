import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import OrchardPanel from '../../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { flowerReviewsService } from '../../services/apiService'
import { ResponsiveCreateReviewLayout } from '../../components/ResponsiveCreateReviewLayout'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import Genetiques from './sections/Genetiques'
import CulturePipelineSection from './sections/CulturePipelineSection'
import AnalyticsSection from '../../components/reviews/sections/AnalyticsSection'
import VisuelTechnique from './sections/VisuelTechnique'
import OdorSection from '../../components/reviews/sections/OdorSection'
import TextureSection from '../../components/reviews/sections/TextureSection'
import TasteSection from '../../components/reviews/sections/TasteSection'
import EffectsSection from '../../components/reviews/sections/EffectsSection'
import ExperienceUtilisation from '../../components/forms/flower/ExperienceUtilisation'
import CuringMaturationTimeline from '../../components/forms/flower/CuringMaturationTimeline'

// Import hooks
import { useFlowerForm } from './hooks/useFlowerForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateFlowerReview - Formulaire création review Fleur (version modulaire)
 * Refactorisé de 2253 lignes → ~200 lignes
 */
export default function CreateFlowerReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { user, isAuthenticated } = useStore()

    const {
        formData,
        setFormData,
        handleChange,
        loading,
        setLoading,
        saving,
        setSaving
    } = useFlowerForm(id)

    const {
        photos,
        handlePhotoUpload,
        removePhoto
    } = usePhotoUpload()

    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const scrollContainerRef = useRef(null)

    // Synchroniser les photos avec formData
    useEffect(() => {
        if (photos.length > 0) {
            handleChange('photos', photos)
        }
    }, [photos])

    // Définition des 10 sections (fusionné : Effets+Expérience, Analytiques+Terpènes)
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'genetics', icon: '🧬', title: 'Génétiques & PhenoHunt' },
        { id: 'culture', icon: '🌱', title: 'Culture & Pipeline' }, // Récolte intégrée dans sidebar RECOLTE
        { id: 'analytics', icon: '🔬', title: 'Analytiques' }, // Cannabinoïdes + Terpènes
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effects-experience', icon: '💥', title: 'Effets & Expérience' }, // Fusionné
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' },
    ]

    // Emojis pour le carousel
    const sectionEmojis = sections.map(s => s.icon)

    // Current section data
    const currentSectionData = sections[currentSection]

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vous devez être connecté')
            navigate('/login')
        }
    }, [isAuthenticated])

    const handleSave = async () => {
        try {
            setSaving(true)

            // Préparer les données pour l'upload
            const reviewFormData = new FormData()

            // Ajouter toutes les données du formulaire
            Object.keys(formData).forEach(key => {
                if (key !== 'photos' && formData[key] !== undefined && formData[key] !== null) {
                    reviewFormData.append(key, typeof formData[key] === 'object'
                        ? JSON.stringify(formData[key])
                        : formData[key]
                    )
                }
            })

            // Ajouter les photos
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
                savedReview = await flowerReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await flowerReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/flower/${savedReview.id}`)
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde')
}
