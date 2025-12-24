import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import OrchardPanel from '../../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { edibleReviewsService } from '../../services/apiService'
import { LiquidCard, LiquidButton } from '../../components/liquid'

// Import sections réutilisables
import InfosGenerales from './sections/InfosGenerales'
import RecipePipelineSection from './sections/RecipePipelineSection'
import AnalyticsSection from '../../components/reviews/sections/AnalyticsSection'
import TasteSection from '../../components/reviews/sections/TasteSection'
import EffectsSection from '../../components/reviews/sections/EffectsSection'
import ExperienceUtilisation from '../../components/forms/flower/ExperienceUtilisation'

// Import hooks
import { useEdibleForm } from './hooks/useEdibleForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateEdibleReview - Formulaire création review Comestibles (version modulaire)
 * Types: Brownie, Cookie, Gummies, Boissons, etc.
 */
export default function CreateEdibleReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const { user, isAuthenticated } = useStore()

    const {
        formData,
        handleChange,
        loading,
        saving,
        setSaving
    } = useEdibleForm(id)

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

    // Définition des 6 sections spécifiques aux Comestibles
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'recipe', icon: '🥘', title: 'Recette & Préparation' },
        { id: 'analytics', icon: '⚗️', title: 'Données Analytiques' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets' },
        { id: 'experience', icon: '🍽️', title: 'Expérience d\'utilisation' }
    ]

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
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.nomProduit || !photos || photos.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires : Nom du produit et au moins 1 photo')
            setCurrentSection(0)
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
                await edibleReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await edibleReviewsService.create(reviewFormData)
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
        <div className="min-h-screen bg-slate-900 relative pb-20">
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

            {/* Header Navigation */}
            <div className="sticky top-0 z-50 liquid-glass border-b border-white/10 shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <LiquidButton
                        onClick={() => navigate('/library')}
                        variant="ghost"
                        leftIcon={<ChevronLeft className="w-5 h-5" />}
                    >
                        Retour
                    </LiquidButton>

                    {/* Section Navigation */}
                    <div className="flex items-center gap-3">
                        {sections.map((section, idx) => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === currentSection
                                    ? 'bg-white w-8'
                                    : idx < currentSection
                                        ? 'bg-green-400'
                                        : 'bg-white/30'
                                    }`}
                                title={section.title}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <LiquidButton
                            onClick={handleSave}
                            variant="secondary"
                            loading={saving}
                            leftIcon={<Save className="w-5 h-5" />}
                        >
                            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </LiquidButton>
                        <LiquidButton
                            onClick={() => setShowOrchard(!showOrchard)}
                            variant="primary"
                            leftIcon={<Eye className="w-5 h-5" />}
                        >
                            Aperçu
                        </LiquidButton>
                    </div>
                </div>
            </div>

            {/* Section Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className=""
                    >
                        <LiquidCard padding="lg" className="shadow-2xl">
                            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="text-4xl">{currentSectionData.icon}</span>
                                {currentSectionData.title}
                                {currentSectionData.required && <span className="text-red-500">*</span>}
                            </h2>

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
                                <RecipePipelineSection
                                    data={formData.recipe || {}}
                                    onChange={(recipeData) => handleChange('recipe', recipeData)}
                                />
                            )}
                            {currentSection === 2 && (
                                <AnalyticsSection
                                    productType="Comestible"
                                    data={formData.analytics || {}}
                                    onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                                />
                            )}
                            {currentSection === 3 && (
                                <TasteSection
                                    data={formData.gouts || {}}
                                    onChange={(goutsData) => handleChange('gouts', goutsData)}
                                />
                            )}
                            {currentSection === 4 && (
                                <EffectsSection
                                    data={formData.effets || {}}
                                    onChange={(effetsData) => handleChange('effets', effetsData)}
                                />
                            )}
                            {currentSection === 5 && (
                                <ExperienceUtilisation
                                    data={formData.experience || {}}
                                    onChange={(expData) => handleChange('experience', expData)}
                                />
                            )}
                        </LiquidCard>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <LiquidButton
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        variant="ghost"
                        leftIcon={<ChevronLeft className="w-5 h-5" />}
                    >
                        Précédent
                    </LiquidButton>
                    {currentSection === sections.length - 1 ? (
                        <LiquidButton
                            onClick={handleSubmit}
                            loading={saving}
                            variant="primary"
                            size="lg"
                        >
                            {saving ? 'Publication...' : 'Publier la review'}
                        </LiquidButton>
                    ) : (
                        <LiquidButton
                            onClick={handleNext}
                            variant="primary"
                            rightIcon={<ChevronRight className="w-5 h-5" />}
                        >
                            Suivant
                        </LiquidButton>
                    )}
                </div>
            </div>

            {/* Orchard Preview Panel */}
            {showOrchard && (
                <OrchardPanel
                    reviewData={formData}
                    onClose={() => setShowOrchard(false)}
                />
            )}
        </div>
    )
}
