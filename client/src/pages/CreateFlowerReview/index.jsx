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
            console.error(error)
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
                    <p className="text-gray-400">Chargement...</p>
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
                            <h2 className="text-xl font-semibold text-gray-100">
                                {currentSectionData.title}
                                {currentSectionData.required && <span className="text-red-500 ml-2">*</span>}
                            </h2>
                        </div>
                    </div>

                    {/* Render current section */}
                    {currentSection === 0 && (
                        <InfosGenerales
                            formData={formData}
                            photos={photos}
                            handleChange={handleChange}
                            handlePhotoUpload={handlePhotoUpload}
                            removePhoto={removePhoto}
                        />
                    )}
                    {currentSection === 1 && (
                        <Genetiques formData={formData} handleChange={handleChange} />
                    )}
                    {currentSection === 2 && (
                        <CulturePipelineSection
                            data={formData.culture || {}}
                            onChange={(cultureData) => handleChange('culture', cultureData)}
                        />
                    )}
                    {currentSection === 3 && (
                        <AnalyticsSection
                            productType="Fleur"
                            data={formData.analytics || {}}
                            onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                        />
                    )}
                    {currentSection === 4 && (
                        <VisuelTechnique
                            formData={formData}
                            handleChange={handleChange}
                        />
                    )}
                    {currentSection === 5 && (
                        <OdorSection
                            data={formData.odeurs || {}}
                            onChange={(odeursData) => handleChange('odeurs', odeursData)}
                        />
                    )}
                    {currentSection === 6 && (
                        <TextureSection
                            productType="Fleur"
                            data={formData.texture || {}}
                            onChange={(textureData) => handleChange('texture', textureData)}
                        />
                    )}
                    {currentSection === 7 && (
                        <TasteSection
                            data={formData.gouts || {}}
                            onChange={(goutsData) => handleChange('gouts', goutsData)}
                        />
                    )}
                    {currentSection === 8 && (
                        <div className="space-y-6">
                            <EffectsSection
                                data={formData.effets || {}}
                                onChange={(data) => handleChange('effets', data)}
                            />
                            <ExperienceUtilisation
                                data={formData.experience || {}}
                                onChange={(data) => handleChange('experience', data)}
                            />
                        </div>
                    )}
                    {currentSection === 9 && (
                        <CuringMaturationTimeline
                            data={formData.curing || {}}
                            onChange={(curingData) => handleChange('curing', curingData)}
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
