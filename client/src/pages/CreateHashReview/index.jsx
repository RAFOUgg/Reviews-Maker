import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import OrchardPanel from '../../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { hashReviewsService } from '../../services/apiService'
import { LiquidCard, LiquidButton, LiquidAlert } from '../../components/liquid'

// Import sections réutilisables
import InfosGenerales from './sections/InfosGenerales'
import SeparationPipelineSection from './sections/SeparationPipelineSection'
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
import { useAccountPermissions } from '../../hooks/useAccountPermissions'

/**
 * CreateHashReview - Formulaire création review Hash (version modulaire)
 * Types: Hash, Kief, Ice-O-Lator, Dry-Sift
 */
export default function CreateHashReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const { user, isAuthenticated } = useStore()
    const { canAccessSection, filterSections, getPipelinePermissions, accountType } = useAccountPermissions()

    const {
        formData,
        handleChange,
        loading,
        saving,
        setSaving
    } = useHashForm(id)

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

    // Définition des 10 sections spécifiques au Hash
    const allSections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'separation', icon: '🔬', title: 'Pipeline Séparation', premium: true },
        { id: 'analytics', icon: '⚗️', title: 'Données Analytiques' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' },
        { id: 'experience', icon: '🧪', title: 'Expérience d\'utilisation' }
    ]

    // Filtrer sections selon permissions
    const sections = filterSections(allSections)

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 relative pb-20">
            {/* Background gradient overlay */}
            <div className="fixed inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" style={{ top: '40%' }} />

            {/* Header Navigation */}
            <div className="sticky top-0 z-50 liquid-glass border-b border-white/10 shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <LiquidButton
                        variant="ghost"
                        leftIcon={<ChevronLeft className="w-5 h-5" />}
                        onClick={() => navigate('/library')}
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
                            variant="secondary"
                            leftIcon={<Save className="w-5 h-5" />}
                            onClick={handleSave}
                            disabled={saving}
                            loading={saving}
                        >
                            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </LiquidButton>
                        <LiquidButton
                            variant="primary"
                            leftIcon={<Eye className="w-5 h-5" />}
                            onClick={() => setShowOrchard(!showOrchard)}
                        >
                            Aperçu
                        </LiquidButton>
                    </div>
                </div>
            </div>

            {/* Section Content */}
            <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <LiquidCard padding="lg" className="shadow-2xl">
                            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="text-4xl">{currentSectionData.icon}</span>
                                {currentSectionData.title}
                                {currentSectionData.required && <span className="text-red-400">*</span>}
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
                                <SeparationPipelineSection
                                    data={formData.separation || {}}
                                    onChange={(separationData) => handleChange('separation', separationData)}
                                />
                            )}
                            {currentSection === 2 && (
                                <AnalyticsSection
                                    productType="Hash"
                                    data={formData.analytics || {}}
                                    onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                                />
                            )}
                            {currentSection === 3 && (
                                <VisualSection
                                    data={formData.visual || {}}
                                    onChange={(visualData) => handleChange('visual', visualData)}
                                />
                            )}
                            {currentSection === 4 && (
                                <OdorSection
                                    data={formData.odeurs || {}}
                                    onChange={(odeursData) => handleChange('odeurs', odeursData)}
                                />
                            )}
                            {currentSection === 5 && (
                                <TextureSection
                                    data={formData.texture || {}}
                                    onChange={(textureData) => handleChange('texture', textureData)}
                                />
                            )}
                            {currentSection === 6 && (
                                <TasteSection
                                    data={formData.gouts || {}}
                                    onChange={(goutsData) => handleChange('gouts', goutsData)}
                                />
                            )}
                            {currentSection === 7 && (
                                <EffectsSection
                                    data={formData.effets || {}}
                                    onChange={(effetsData) => handleChange('effets', effetsData)}
                                />
                            )}
                            {currentSection === 8 && (
                                <CuringMaturationSection
                                    data={formData.curing || {}}
                                    onChange={(curingData) => handleChange('curing', curingData)}
                                    productType="hash"
                                />
                            )}
                            {currentSection === 9 && (
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
                        variant="ghost"
                        leftIcon={<ChevronLeft className="w-5 h-5" />}
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                    >
                        Précédent
                    </LiquidButton>
                    {currentSection === sections.length - 1 ? (
                        <LiquidButton
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={saving}
                            loading={saving}
                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                            {saving ? 'Publication...' : 'Publier la review'}
                        </LiquidButton>
                    ) : (
                        <LiquidButton
                            variant="primary"
                            rightIcon={<ChevronRight className="w-5 h-5" />}
                            onClick={handleNext}
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
