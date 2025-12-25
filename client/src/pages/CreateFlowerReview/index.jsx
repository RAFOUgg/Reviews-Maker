import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/ToastContainer'
import OrchardPanel from '../../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { flowerReviewsService } from '../../services/apiService'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import Genetiques from './sections/Genetiques'
import CulturePipelineSection from './sections/CulturePipelineSection'
import Recolte from './sections/Recolte'
import AnalyticsSection from '../../components/reviews/sections/AnalyticsSection'
import VisualSection from '../../components/reviews/sections/VisualSection'
import OdorSection from '../../components/reviews/sections/OdorSection'
import TextureSection from '../../components/reviews/sections/TextureSection'
import TasteSection from '../../components/reviews/sections/TasteSection'
import EffectsSection from '../../components/reviews/sections/EffectsSection'
import ExperienceUtilisation from '../../components/forms/flower/ExperienceUtilisation'
import CuringMaturationTimeline from '../../components/forms/flower/CuringMaturationTimeline'
import TerpeneManualInput from '../../components/analytics/TerpeneManualInput'

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

    // Définition des 13 sections (+ Récolte + Terpènes manuels)
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'genetics', icon: '🧬', title: 'Génétiques & PhenoHunt' },
        { id: 'culture', icon: '🌱', title: 'Culture & Pipeline' },
        { id: 'recolte', icon: '🌾', title: 'Récolte & Post-Récolte' },
        { id: 'analytics', icon: '🔬', title: 'Analytiques PDF' },
        { id: 'terpenes', icon: '🧪', title: 'Terpènes (Manuel)' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets ressentis' },
        { id: 'experience', icon: '🔥', title: 'Expérience d\'utilisation' },
        { id: 'curing', icon: '🌡️', title: 'Curing & Maturation' },
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
        <div className="min-h-screen bg-slate-900 relative pb-20">
            {/* Header Navigation */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/library')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Retour</span>
                    </button>

                    {/* Section Navigation */}
                    <div className="flex items-center gap-3">
                        {sections.map((section, idx) => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === currentSection ? 'bg-white w-8' : idx < currentSection ? 'bg-green-400' : 'bg-white/30'}`}
                                title={section.title}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                        >
                            <Save className="w-5 h-5" />
                            <span>Sauvegarder</span>
                        </button>
                        <button
                            onClick={() => setShowOrchard(!showOrchard)}
                            className="flex items-center gap-2 px-4 py-2 liquid-btn liquid-btn--accent"
                        >
                            <Eye className="w-5 h-5" />
                            <span>Aperçu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[min(1100px,100%)] mx-auto p-6 sm:p-6 lg:p-10 overflow-hidden"
                    >
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
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
                            <Genetiques formData={formData} handleChange={handleChange} />
                        )}
                        {currentSection === 2 && (
                            <CulturePipelineSection
                                data={formData.culture || {}}
                                onChange={(cultureData) => handleChange('culture', cultureData)}
                            />
                        )}
                        {currentSection === 3 && (
                            <Recolte formData={formData} handleChange={handleChange} />
                        )}
                        {currentSection === 4 && (
                            <AnalyticsSection
                                productType="Fleurs"
                                data={formData.analytics || {}}
                                onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                            />
                        )}
                        {currentSection === 5 && (
                            <div className="space-y-6">
                                <TerpeneManualInput
                                    data={formData.terpenes || {}}
                                    onChange={(terpenesData) => handleChange('terpenes', terpenesData)}
                                />
                            </div>
                        )}
                        {currentSection === 6 && (
                            <VisualSection
                                data={formData.visual || {}}
                                onChange={(visualData) => handleChange('visual', visualData)}
                            />
                        )}
                        {currentSection === 7 && (
                            <OdorSection
                                data={formData.odeurs || {}}
                                onChange={(odeursData) => handleChange('odeurs', odeursData)}
                            />
                        )}
                        {currentSection === 8 && (
                            <TextureSection
                                productType="Fleurs"
                                data={formData.texture || {}}
                                onChange={(textureData) => handleChange('texture', textureData)}
                            />
                        )}
                        {currentSection === 9 && (
                            <TasteSection
                                data={formData.gouts || {}}
                                onChange={(goutsData) => handleChange('gouts', goutsData)}
                            />
                        )}
                        {currentSection === 10 && (
                            <EffectsSection
                                data={formData.effets || {}}
                                onChange={(effetsData) => handleChange('effets', effetsData)}
                            />
                        )}
                        {currentSection === 11 && (
                            <ExperienceUtilisation
                                data={formData.experience || {}}
                                onChange={(expData) => handleChange('experience', expData)}
                            />
                        )}
                        {currentSection === 12 && (
                            <CuringMaturationTimeline
                                data={formData.curing || {}}
                                onChange={(curingData) => handleChange('curing', curingData)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Précédent
                    </button>
                    {currentSection === sections.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all font-semibold"
                        >
                            Publier la review
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 liquid-btn liquid-btn--primary rounded-xl transition-all flex items-center gap-2"
                        >
                            Suivant
                            <ChevronRight className="w-5 h-5" />
                        </button>
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
