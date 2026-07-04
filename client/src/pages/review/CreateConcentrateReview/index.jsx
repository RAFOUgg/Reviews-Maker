import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { concentrateReviewsService } from '../../../services/apiService'
import ResponsiveCreateReviewLayout from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'
import WizardFlow from '../../../components/wizard/WizardFlow'
import { getConcentrateWizardQuestions } from '../../../components/wizard/schemas/concentrateWizardQuestions'

const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))
import { flattenConcentrateFormData, createFormDataFromFlat, diffFlatData } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import { ExtractionPipelineAdapter, CuringMaturationAdapter } from '../../../components/pipelines/adapters'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisualSection from '../../../components/sections/VisualSection'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useConcentrateForm } from './hooks/useConcentrateForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateConcentrateReview - Review complète pour Concentré
 * Types: Rosin, BHO, PHO, CO2, Live Resin, etc.
 */
export default function CreateConcentrateReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { isAuthenticated, authChecked } = useStore()
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const { formData, handleChange, loading, saving, setSaving } = useConcentrateForm(id)
    const { photos, setPhotos, handlePhotoUpload, removePhoto } = usePhotoUpload()

    // Ouvre automatiquement Export Maker si on arrive depuis la bibliothèque via le badge "Aperçu requis"
    useEffect(() => {
        if (!loading && searchParams.get('openExport') === '1') {
            setShowOrchard(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    // Charger les photos existantes quand on édite une review
    useEffect(() => {
        if (!id || !formData._photos?.length) return
        setPhotos(prev => {
            if (prev.length > 0) return prev
            return formData._photos
        })
    }, [id, formData._photos])

    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'extraction', icon: '⚗️', title: 'Pipeline Extraction' },
        { id: 'analytics', icon: '🔬', title: 'Données Analytiques' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' }
    ]

    // Mode automatique (wizard) — cf. CreateFlowerReview/index.jsx pour le détail du mécanisme.
    const { isMobile } = useResponsiveLayout()
    const forceWizard = searchParams.get('mode') === 'auto'
    // wizardOverride = choix explicite (bouton "Mode auto"/"Voir toutes les questions"), prime
    // sur le déclenchement auto (mobile/query param) — cf. CreateFlowerReview/index.jsx.
    const [wizardOverride, setWizardOverride] = useState(null)
    // Survit au démontage/remontage de WizardFlow — cf. CreateFlowerReview/index.jsx.
    const [wizardIndex, setWizardIndex] = useState(0)
    const useWizardMode = wizardOverride !== null ? wizardOverride : (isMobile || forceWizard)
    const wizardQuestions = getConcentrateWizardQuestions()

    // Repasse automatiquement en mode auto dès qu'on quitte la section handoff — cf.
    // CreateFlowerReview/index.jsx pour le détail.
    const [handoffSectionIndex, setHandoffSectionIndex] = useState(null)
    useEffect(() => {
        if (handoffSectionIndex !== null && currentSection !== handoffSectionIndex) {
            setWizardOverride(null)
            setHandoffSectionIndex(null)
        }
    }, [currentSection, handoffSectionIndex])

    const handleOpenHandoff = (target) => {
        const index = sections.findIndex(s => s.id === target)
        setWizardOverride(false)
        setHandoffSectionIndex(index)
        setWizardIndex(i => Math.min(i + 1, wizardQuestions.length - 1))
        if (index >= 0) setCurrentSection(index)
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

    // Snapshot des données aplaties de la dernière sauvegarde réussie — sert de base
    // pour ne renvoyer au backend que les champs qui ont réellement changé (autosave rapide).
    const lastSavedFlatRef = useRef(null)

    const handleSave = async ({ silent = false, skipNavigate = false } = {}) => {
        let savedReview
        try {
            setSaving(true)
            const flatData = flattenConcentrateFormData(formData)

            // Cf. CreateFlowerReview/index.jsx : ne jamais auto-créer silencieusement une toute
            // nouvelle review sans nom (sinon un "Brouillon" fantôme apparaît en bibliothèque dès
            // qu'une autre section est touchée avant le nom) — un save explicite ou l'update d'une
            // review déjà créée passent toujours.
            if (!id && silent && !flatData.nomCommercial?.trim()) {
                setSaving(false)
                return undefined
            }

            const dataToSend = id ? diffFlatData(flatData, lastSavedFlatRef.current) : flatData
            const existingImages = photos
                .filter(p => p.existing)
                .map(p => p.name || p.url || p.preview)
                .filter(Boolean)
            const reviewFormData = createFormDataFromFlat(dataToSend, photos, 'draft', existingImages)

            if (id) {
                savedReview = await concentrateReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await concentrateReviewsService.create(reviewFormData)
            }

            lastSavedFlatRef.current = Object.fromEntries(
                Object.entries(flatData).filter(([, v]) => !(v instanceof File))
            )

            // Resynchroniser les photos avec la réponse serveur : les nouveaux fichiers
            // uploadés deviennent "existing" et ne sont plus jamais ré-uploadés aux
            // autosaves suivants (sinon chaque autosave dupliquait les photos en DB).
            const rawPhotos = savedReview?.concentrateReview?.photos
            if (rawPhotos) {
                let parsedPhotos = []
                try { parsedPhotos = typeof rawPhotos === 'string' ? JSON.parse(rawPhotos) : rawPhotos } catch { parsedPhotos = [] }
                setPhotos(prev => {
                    prev.forEach(p => { if (!p.existing && p.preview) URL.revokeObjectURL(p.preview) })
                    return parsedPhotos.map(p => {
                        const url = typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || '')
                        return { url, preview: url, existing: true, name: typeof p === 'string' ? p : (p.name || '') }
                    })
                })
            }

            setIsDirty(false)
            if (!silent) toast.success('Brouillon sauvegardé')

            const newId = savedReview?.review?.id || savedReview?.id
            if (!id && newId && !skipNavigate) {
                navigate(`/edit/concentrate/${newId}`)
            }
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde')
            console.error(error)
        } finally {
            setSaving(false)
        }
        return savedReview
    }

    const handleSubmitWithOrchardData = async (orchardData = {}) => {
        if (!formData.nomCommercial || !photos || photos.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires : Nom commercial et au moins 1 photo')
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
                ...(orchardData.orchardPreset && { orchardPreset: orchardData.orchardPreset }),
                ...(orchardData.orchardConfig && { orchardConfig: JSON.stringify(orchardData.orchardConfig) }),
            }
            const flatData = flattenConcentrateFormData(mergedData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published', existingImages)

            if (id) {
                await concentrateReviewsService.update(id, reviewFormData)
            } else {
                await concentrateReviewsService.create(reviewFormData)
            }
            toast.success('Review publiée ✅')
            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de la publication : ' + (error?.message || 'Erreur inconnue'))
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    // Auto-save sur chaque modification (debounced 2.5s)
    // hasLoadedRef évite de déclencher un save juste après le peuplement initial de formData ;
    // au-delà, plus besoin de gate sur nomCommercial (qui bloquait silencieusement l'autosave
    // si on éditait le pipeline avant d'avoir rempli le nom).
    const autoSaveTimerRef = useRef(null)
    const hasLoadedRef = useRef(false)
    useEffect(() => {
        if (!loading) {
            const t = setTimeout(() => { hasLoadedRef.current = true }, 500)
            return () => clearTimeout(t)
        }
    }, [loading])
    useEffect(() => {
        if (!hasLoadedRef.current) return
        setIsDirty(true)
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = setTimeout(() => { handleSave({ silent: true }) }, 2500)
        return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
    }, [formData])

    // Filet de sécurité : si l'utilisateur quitte la page moins de 2.5s après sa dernière
    // modification, on force un save immédiat au démontage plutôt que de la perdre.
    const handleSaveRef = useRef(handleSave)
    useEffect(() => { handleSaveRef.current = handleSave })
    useEffect(() => () => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
            handleSaveRef.current({ silent: true, skipNavigate: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // authChecked garde : cf. CreateFlowerReview/index.jsx
    if (authChecked && !isAuthenticated && !loading) {
        toast.error('Vous devez être connecté')
        navigate('/login')
        return null
    }

    return (
        <>
            {useWizardMode ? (
                <WizardFlow
                    questions={wizardQuestions}
                    formData={formData}
                    handleChange={handleChange}
                    photos={photos}
                    handlePhotoUpload={handlePhotoUpload}
                    removePhoto={removePhoto}
                    title="Créer une review Concentré"
                    onExitToClassic={() => setWizardOverride(false)}
                    onOpenHandoff={handleOpenHandoff}
                    onComplete={() => setShowOrchard(true)}
                    initialIndex={wizardIndex}
                    onIndexChange={setWizardIndex}
                    saving={saving}
                    isDirty={isDirty}
                    onSave={() => handleSave({ silent: false })}
                />
            ) : (
            <ResponsiveCreateReviewLayout
                sections={sections}
                sectionEmojis={sections.map(s => s.icon)}
                currentSection={currentSection}
                totalSections={sections.length}
                onSectionChange={setCurrentSection}
                onPrevious={handlePrevious}
                onNext={handleNext}
                formData={formData}
                photos={photos}
                handlePhotoUpload={handlePhotoUpload}
                removePhoto={removePhoto}
                onOpenPreview={() => setShowOrchard(true)}
                onSave={() => handleSave({ silent: false })}
                onEnableWizard={() => setWizardOverride(true)}
                isDirty={isDirty}
                title="Créer une review Concentré"
                subtitle="Documentez votre rosin, BHO ou autre concentré"
                loading={loading}
                saving={saving}
                wide={false}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{sections[currentSection].icon}</span>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {sections[currentSection].title}
                                    {sections[currentSection].required && <span className="text-red-500 ml-2">*</span>}
                                </h2>
                            </div>
                        </div>

                        {currentSection === 0 && (
                            <InfosGenerales
                                formData={formData}
                                handleChange={handleChange}
                                photos={photos}
                                handlePhotoUpload={handlePhotoUpload}
                                removePhoto={removePhoto}
                            />
                        )}
                        {currentSection === 1 && (
                            <ExtractionPipelineAdapter
                                productType="concentrate"
                                data={formData.extractionPipeline || {}}
                                onChange={(data) => handleChange('extractionPipeline', data)}
                            />
                        )}
                        {currentSection === 2 && (
                            <AnalyticsSection
                                data={formData.analytics || {}}
                                onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                            />
                        )}
                        {currentSection === 3 && (
                            <VisualSection
                                productType="Concentrate"
                                data={formData.visuel || {}}
                                onChange={(visuelData) => handleChange('visuel', visuelData)}
                            />
                        )}
                        {currentSection === 4 && (
                            <OdorSection
                                productType="Concentré"
                                data={formData.odeurs || {}}
                                onChange={(odeursData) => handleChange('odeurs', odeursData)}
                            />
                        )}
                        {currentSection === 5 && (
                            <TextureSection
                                productType="Concentré"
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
                                onChange={(data) => handleChange('effets', data)}
                            />
                        )}
                        {currentSection === 8 && (
                            <CuringMaturationAdapter
                                productType="concentrate"
                                data={formData.curing || {}}
                                onChange={(data) => handleChange('curing', data)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </ResponsiveCreateReviewLayout>
            )}

            <AnimatePresence>
                {showOrchard && (
                    <Suspense fallback={<div className="p-4"><div className="animate-spin w-6 h-6 border-b-2 rounded-full border-purple-400"></div></div>}>
                        <OrchardPanel
                            productType="Concentrate"
                            reviewData={{
                                title: formData.nomCommercial || 'Aperçu concentré',
                                holderName: formData.nomCommercial || '',
                                description: formData.description || '',
                                lab: formData.laboratoire || '',
                                cultivars: formData.cultivarsList || [],
                                isPublic: false,
                                // ...formData AVANT les clés ci-dessous : formData.images hérite de
                                // Review.images (toujours null pour Concentrate, stocké sur sa propre
                                // sous-table) et écrasait sinon le tableau de photos correctement calculé
                                ...formData,
                                images: photos.map(p => (p?.url || p?.preview || p?.name)).filter(Boolean),
                            }}
                            onClose={() => setShowOrchard(false)}
                            onPresetApplied={(orchardData) => {
                                if (orchardData?.orchardPreset) {
                                    handleChange('orchardPreset', orchardData.orchardPreset)
                                }
                                if (orchardData?.orchardConfig) {
                                    handleChange('orchardConfig', orchardData.orchardConfig)
                                }
                            }}
                            onPublish={handleSubmitWithOrchardData}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </>
    )
}
