import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye, Lock } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../../hooks/useAccountFeatures'
import OrchardPanel from '../../../components/shared/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { flowerReviewsService } from '../../../services/apiService'
import { ResponsiveCreateReviewLayout } from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { flattenFlowerFormData, createFormDataFromFlat } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import Genetiques from './sections/Genetiques'
import CulturePipelineSection from './sections/CulturePipelineSection'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisuelTechnique from './sections/VisuelTechnique'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'
import CuringMaturationSection from '../../../components/sections/CuringMaturationSection'

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

    // Récupérer les permissions selon le type de compte
    const {
        isProducteur,
        isInfluenceur,
        isAmateur,
        canConfigurePipeline,
        canAccessGeneticsCanvas
    } = useAccountFeatures()

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

    // Définition des 10 sections avec permissions selon CDC :
    // Amateur : Info général, Visuel & Technique, Curing, Odeurs, Goûts, Effets
    // Influenceur : Comme Amateur (même accès aux sections)
    // Producteur : TOUT (Culture & Pipeline, Génétiques, Analytiques complets)
    const allSections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true, access: 'all' },
        { id: 'genetics', icon: '🧬', title: 'Génétiques & PhenoHunt', access: 'producteur' },
        { id: 'culture', icon: '🌱', title: 'Culture & Pipeline', access: 'producteur' },
        { id: 'analytics', icon: '🔬', title: 'Analytiques', access: 'producteur' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique', access: 'all' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs', access: 'all' },
        { id: 'texture', icon: '🤚', title: 'Texture', access: 'all' },
        { id: 'gouts', icon: '😋', title: 'Goûts', access: 'all' },
        { id: 'effects-experience', icon: '💥', title: 'Effets & Expérience', access: 'all' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation', access: 'all' },
    ]

    // Filtrer les sections selon le type de compte
    const sections = allSections.filter(section => {
        if (section.access === 'all') return true
        if (section.access === 'producteur' && isProducteur) return true
        return false
    })

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

            // Aplatir les données du formulaire avec l'utilitaire
            const flatData = flattenFlowerFormData(formData)

            // Créer le FormData avec les données aplaties
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'draft')

            // Debug: log les données envoyées
            console.log('📤 Sending flattened data:', flatData)

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
            toast.error('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'))
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        // Validation des champs requis
        if (!formData.nomCommercial || !photos || photos.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires : Nom commercial et au moins 1 photo')
            setCurrentSection(0) // Retour à la première section
            return
        }

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

            reviewFormData.append('status', 'published')

            if (id) {
                await flowerReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await flowerReviewsService.create(reviewFormData)
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

    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1)
        }
    }

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                    <p className="text-white/60">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <ResponsiveCreateReviewLayout
            currentSection={currentSection}
            totalSections={sections.length}
            onSectionChange={setCurrentSection}
            title="Créer une review Fleur"
            subtitle="Documentez votre variété en détail"
            sectionEmojis={sectionEmojis}
            showProgress={true}
        >
            {/* Orchard Preview Button - Mobile optimized */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowOrchard(!showOrchard)}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-medium transition-all"
                >
                    <Eye className="w-4 h-4 inline mr-2" />
                    Aperçu
                </button>
            </div>

            {/* Section Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{currentSectionData.icon}</span>
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {currentSectionData.title}
                                {currentSectionData.required && <span className="text-red-500 ml-2">*</span>}
                            </h2>
                        </div>
                    </div>

                    {/* Render current section by ID */}
                    {currentSectionData.id === 'infos' && (
                        <InfosGenerales
                            formData={formData}
                            photos={photos}
                            handleChange={handleChange}
                            handlePhotoUpload={handlePhotoUpload}
                            removePhoto={removePhoto}
                        />
                    )}
                    {currentSectionData.id === 'genetics' && (
                        <Genetiques formData={formData} handleChange={handleChange} />
                    )}
                    {currentSectionData.id === 'culture' && (
                        <CulturePipelineSection
                            data={formData.culture || {}}
                            onChange={(cultureData) => handleChange('culture', cultureData)}
                        />
                    )}
                    {currentSectionData.id === 'analytics' && (
                        <AnalyticsSection
                            productType="Fleur"
                            data={formData.analytics || {}}
                            onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                        />
                    )}
                    {currentSectionData.id === 'visual' && (
                        <VisuelTechnique
                            formData={formData}
                            handleChange={handleChange}
                        />
                    )}
                    {currentSectionData.id === 'odeurs' && (
                        <OdorSection
                            data={formData.odeurs || {}}
                            onChange={(odeursData) => handleChange('odeurs', odeursData)}
                        />
                    )}
                    {currentSectionData.id === 'texture' && (
                        <TextureSection
                            productType="Fleur"
                            data={formData.texture || {}}
                            onChange={(textureData) => handleChange('texture', textureData)}
                        />
                    )}
                    {currentSectionData.id === 'gouts' && (
                        <TasteSection
                            data={formData.gouts || {}}
                            onChange={(goutsData) => handleChange('gouts', goutsData)}
                        />
                    )}
                    {currentSectionData.id === 'effects-experience' && (
                        <EffectsSection
                            data={formData.effets || {}}
                            onChange={(data) => handleChange('effets', data)}
                        />
                    )}
                    {currentSectionData.id === 'curing' && (
                        <CuringMaturationSection
                            data={formData.curing || {}}
                            onChange={(curingData) => handleChange('curing', curingData)}
                            productType="flower"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Orchard Preview Panel */}
            {showOrchard && (
                <OrchardPanel
                    reviewData={formData}
                    onClose={() => setShowOrchard(false)}
                />
            )}
        </ResponsiveCreateReviewLayout>
    )
}
