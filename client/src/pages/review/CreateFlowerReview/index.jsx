import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye, Lock, Download } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../../hooks/useAccountFeatures'
const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))
const ExportMaker = lazy(() => import('../../../components/export/ExportMaker'))
import { AnimatePresence, motion } from 'framer-motion'
import { flowerReviewsService } from '../../../services/apiService'
import { ResponsiveCreateReviewLayout } from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { flattenFlowerFormData, createFormDataFromFlat } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import Genetiques from './sections/Genetiques'
import CulturePipelineSection from '../../../components/pipelines/sections/CulturePipelineSection'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisuelTechnique from './sections/VisuelTechnique'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSectionImpl'
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
        setPhotos,
        handlePhotoUpload,
        removePhoto
    } = usePhotoUpload()

    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const [showExportMaker, setShowExportMaker] = useState(false)
    const scrollContainerRef = useRef(null)
    // Curing section: optionnelle, activée seulement si l'utilisateur le souhaite
    // Auto-activée en édition si des données curing existent déjà
    const [curingEnabled, setCuringEnabled] = useState(false)

    // Load existing images into photos state when editing a review
    useEffect(() => {
        if (!id || !formData.images) return
        let imgs = []
        try {
            imgs = Array.isArray(formData.images)
                ? formData.images
                : JSON.parse(formData.images)
        } catch { imgs = [] }
        if (!imgs.length) return
        // Only set once when photos are still empty (don't overwrite new uploads)
        setPhotos(prev => {
            if (prev.length > 0) return prev
            return imgs.map(img => {
                const src = typeof img === 'string'
                    ? (img.startsWith('http') || img.startsWith('/') ? img : `/images/${img}`)
                    : (img.url || img.preview || '')
                return { url: src, preview: src, existing: true, name: typeof img === 'string' ? img : '' }
            })
        })
    }, [id, formData.images])

    // Auto-enable curing when editing a review that already has curing data (loaded async)
    useEffect(() => {
        const hasCuringData = !!(
            formData?.curing?.curingTimeline?.length ||
            formData?.curingTimelineData?.length ||
            formData?.curingType ||
            formData?.curingTemperature
        )
        if (hasCuringData) setCuringEnabled(true)
    }, [formData?.curing, formData?.curingTimelineData, formData?.curingType])

    // Tracker l'aperçu : depuis formData (mode édition) ou défini durant la session
    const hasPreview = !!(formData.orchardPreset)

    // Visibilité courante de la review (pour le bouton de sauvegarde intelligent)
    const currentVisibility = id
        ? (formData.status === 'published' ? 'public' : 'private')
        : null

    // Synchroniser les photos avec formData
    useEffect(() => {
        if (photos.length > 0) {
            handleChange('photos', photos)
        }
    }, [photos])

    // Définition des 10 sections avec permissions selon PERMISSIONS.md :
    // Amateur: Infos, Analytics, Visuel, Odeurs, Texture, Goûts, Effets
    // Influenceur: Amateur + Curing
    // Producteur: TOUT (+ Génétiques, Culture)
    const allSections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true, access: 'all' },
        { id: 'genetics', icon: '🧬', title: 'Génétiques & PhenoHunt', access: 'producteur' },
        { id: 'culture', icon: '🌱', title: 'Culture & Pipeline', access: 'producteur' },
        { id: 'analytics', icon: '🔬', title: 'Analytiques', access: 'all' },
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
        if (section.access === 'paid' && (isProducteur || isInfluenceur)) return true
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

    // Debug: log form state whenever the current section changes to help reproduce lost values
    useEffect(() => {
        try {
            console.debug('[CreateFlowerReview] sectionChange', { currentSection, sectionId: currentSectionData?.id, formData })
        } catch (e) { }
    }, [currentSection, formData])

    const handleSave = async () => {
        let savedReview
        try {
            setSaving(true)

            // Aplatir les données du formulaire avec l'utilitaire
            const flatData = flattenFlowerFormData(formData)

            // Dériver existingImages depuis l'état photos courant (pas depuis formData.images)
            // → si l'utilisateur a supprimé une photo existante, elle ne sera plus dans photos
            const existingImages = photos
                .filter(p => p.existing)
                .map(p => p.name || p.url || p.preview)
                .filter(Boolean)

            // Créer le FormData avec les données aplaties et les images existantes
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'draft', existingImages)

            console.log('📤 Sending flattened data:', flatData)

            if (id) {
                savedReview = await flowerReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await flowerReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé ✅')

            if (!id && savedReview?.id) {
                navigate(`/edit/flower/${savedReview.id}`)
            }
        } catch (error) {
            const msg = error?.message || 'Erreur inconnue'
            toast.error('Erreur lors de la sauvegarde : ' + msg)
            console.error('Save error:', error)
            throw error   // re-throw pour que SaveReviewModal puisse afficher l'erreur inline
        } finally {
            setSaving(false)
        }
        return savedReview
    }

    // Publier avec les données orchardData passées directement (évite la race-condition setState)
    const handleSubmitWithOrchardData = async (orchardData = {}) => {
        const orchardPreset = orchardData.orchardPreset || formData.orchardPreset
        if (!orchardPreset) {
            toast.error('Un aperçu est requis pour publier publiquement.')
            return
        }
        try {
            setSaving(true)

            const existingImages = photos
                .filter(p => p.existing)
                .map(p => p.name || p.url || p.preview)
                .filter(Boolean)

            const mergedData = {
                ...formData,
                orchardPreset,
                orchardConfig: orchardData.orchardConfig ? JSON.stringify(orchardData.orchardConfig) : formData.orchardConfig,
            }
            const flatData = flattenFlowerFormData(mergedData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published', existingImages)

            if (id) {
                await flowerReviewsService.update(id, reviewFormData)
            } else {
                await flowerReviewsService.create(reviewFormData)
            }
            toast.success('Review publiée ✅')
            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de la publication : ' + (error?.message || 'Erreur inconnue'))
            console.error(error)
            throw error
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        // Validation des champs requis
        // En mode édition, les images existantes comptent aussi (pas besoin de nouvelles photos)
        const existingImagesForValidation = photos
            .filter(p => p.existing)
            .map(p => p.name || p.url || p.preview)
            .filter(Boolean)
        const hasImages = photos.length > 0

        if (!formData.nomCommercial || !hasImages) {
            toast.error('Veuillez remplir les champs obligatoires : Nom commercial et au moins 1 photo')
            setCurrentSection(0)
            return
        }

        // Un aperçu est requis pour publier dans la galerie publique
        if (!formData.orchardPreset) {
            toast.error('Un aperçu est requis pour publier publiquement. Cliquez sur "Aperçu" pour en définir un.')
            return
        }

        try {
            setSaving(true)
            const flatData = flattenFlowerFormData(formData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published', existingImagesForValidation)

            if (id) {
                await flowerReviewsService.update(id, reviewFormData)
                toast.success('Review publiée ✅')
            } else {
                await flowerReviewsService.create(reviewFormData)
                toast.success('Review publiée ✅')
            }

            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de la publication : ' + (error?.message || 'Erreur inconnue'))
            console.error(error)
            throw error
        } finally {
            setSaving(false)
        }
    }

    const handlePrevious = () => {
        if (currentSection > 0) {
            try { console.debug('[CreateFlowerReview] handlePrevious - before', { currentSection, formData }) } catch (e) { }
            setCurrentSection(currentSection - 1)
        }
    }

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            try { console.debug('[CreateFlowerReview] handleNext - before', { currentSection, formData }) } catch (e) { }
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
        <>
            <ResponsiveCreateReviewLayout
                currentSection={currentSection}
                totalSections={sections.length}
                onSectionChange={setCurrentSection}
                title="Créer une review Fleur"
                subtitle="Documentez votre variété en détail"
                sectionEmojis={sectionEmojis}
                showProgress={true}
                onOpenPreview={() => setShowOrchard(true)}
                onSave={handleSave}
                onSubmit={handleSubmit}
                reviewVisibility={currentVisibility}
                isSaving={saving}
                reviewId={id || null}
                reviewHasPreview={hasPreview}
            >
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
                            <div className="space-y-4">
                                {/* Section optionnelle — peut être ignorée */}
                                {!curingEnabled ? (
                                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/3 p-6 text-center space-y-3">
                                        <div className="text-4xl">🔥</div>
                                        <div>
                                            <p className="text-white font-medium text-sm">Section optionnelle</p>
                                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                                Le curing & maturation est facultatif. Activez-le uniquement si vous
                                                souhaitez documenter votre processus de conservation.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setCuringEnabled(true)}
                                            className="px-5 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 rounded-xl text-sm font-medium transition-all"
                                        >
                                            + Activer le curing
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-orange-400 text-xs font-medium">
                                                <span>🔥</span>
                                                <span>Section optionnelle</span>
                                            </div>
                                            <button
                                                onClick={() => setCuringEnabled(false)}
                                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                            >
                                                Passer cette section
                                            </button>
                                        </div>
                                        <CuringMaturationSection
                                            data={formData.curing || {}}
                                            onChange={(curingData) => handleChange('curing', curingData)}
                                            productType="flower"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </ResponsiveCreateReviewLayout>

            {/* Orchard Preview Panel – OUTSIDE layout to avoid z-index stacking context issues */}
            {showOrchard && (
                <Suspense fallback={<div className="p-4"><div className="animate-spin w-6 h-6 border-b-2 rounded-full border-purple-400"></div></div>}>
                    <OrchardPanel
                        reviewData={formData}
                        productType="flower"
                        reviewId={id || null}
                        onClose={() => setShowOrchard(false)}
                        onPresetApplied={(orchardData) => {
                            handleChange('orchardPreset', orchardData.orchardPreset || 'custom')
                            handleChange('orchardConfig', JSON.stringify(orchardData.orchardConfig || {}))
                            if (orchardData.customLayout) handleChange('orchardCustomLayout', orchardData.customLayout)
                            if (orchardData.layoutMode) handleChange('orchardLayoutMode', orchardData.layoutMode)
                            setShowOrchard(false)
                        }}
                        onPublish={handleSubmitWithOrchardData}
                    />
                </Suspense>
            )}

            {/* Export Maker – OUTSIDE layout to avoid z-index stacking context issues */}
            {showExportMaker && (
                <Suspense fallback={null}>
                    <ExportMaker
                        reviewData={formData}
                        productType="flower"
                        onClose={() => setShowExportMaker(false)}
                    />
                </Suspense>
            )}
        </>
    )
}
