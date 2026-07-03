import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../../hooks/useAccountFeatures'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'
const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))
import { AnimatePresence, motion } from 'framer-motion'
import { flowerReviewsService } from '../../../services/apiService'
import { ResponsiveCreateReviewLayout } from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { flattenFlowerFormData, createFormDataFromFlat, diffFlatData } from '../../../utils/formDataFlattener'
import WizardFlow from '../../../components/wizard/WizardFlow'
import { getFlowerWizardQuestions } from '../../../components/wizard/schemas/flowerWizardQuestions'

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
    const { user, isAuthenticated, authChecked } = useStore()

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
        handleChange,
        loading,
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
    const [isDirty, setIsDirty] = useState(false)
    const scrollContainerRef = useRef(null)

    // Ouvre automatiquement Export Maker si on arrive depuis la bibliothèque via le badge "Aperçu requis"
    useEffect(() => {
        if (!loading && searchParams.get('openExport') === '1') {
            setShowOrchard(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])
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

    // Synchroniser les photos avec formData (juste pour Validation.jsx qui lit formData.photos.length)
    // — comparer la LONGUEUR avant d'appeler handleChange, pas juste "photos.length > 0" : handleSave()
    // reconstruit `photos` avec de nouvelles références à chaque sauvegarde réussie (même contenu),
    // donc sans ce garde-fou chaque save déclenchait ce useEffect → handleChange → nouvelle formData
    // → re-déclenchait l'autosave (effect ci-dessous) → nouveau save → boucle infinie toutes les 2.5s.
    useEffect(() => {
        if (photos.length > 0 && formData.photos?.length !== photos.length) {
            handleChange('photos', photos)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Mode automatique (wizard une-question-à-la-fois) : auto sur mobile, ou forcé via
    // ?mode=auto (bouton central sur la page d'accueil, cf. ProductTypeCards.jsx).
    // wizardOverride est le choix explicite de l'utilisateur (bouton "Mode auto" en vue classique,
    // ou "Voir toutes les questions" en vue wizard) — il prime sur le déclenchement automatique
    // (mobile/query param), sinon cliquer "Mode auto" sur desktop sans ?mode=auto ne faisait rien
    // puisque (isMobile || forceWizard) restait false. null = pas de choix explicite (comportement
    // auto par défaut).
    const { isMobile } = useResponsiveLayout()
    const forceWizard = searchParams.get('mode') === 'auto'
    const [wizardOverride, setWizardOverride] = useState(null)
    // Survit au démontage/remontage de WizardFlow (une bascule wizard<->classique remonte tout le
    // composant) — sans ça, revenir en mode automatique après un handoff repartait toujours de la
    // question 1 au lieu de reprendre là où l'utilisateur s'était arrêté.
    const [wizardIndex, setWizardIndex] = useState(0)
    const useWizardMode = wizardOverride !== null ? wizardOverride : (isMobile || forceWizard)
    const wizardQuestions = getFlowerWizardQuestions({ isProducteur })

    // Étapes complexes (génétique/culture/curing) non linéarisables en questions : on quitte
    // temporairement le wizard pour la section correspondante du formulaire classique, et on
    // avance l'index à la question suivante pour que "Mode automatique" reprenne juste après
    // (au lieu de rester bloqué sur la même étape handoff).
    const handleOpenHandoff = (target) => {
        const index = sections.findIndex(s => s.id === target)
        setWizardOverride(false)
        setWizardIndex(i => Math.min(i + 1, wizardQuestions.length - 1))
        if (index >= 0) setCurrentSection(index)
    }

    // authChecked garde : ne rediriger vers /login qu'une fois checkAuth() résolu — sinon un
    // accès direct (nouvel onglet via "Éditer la review" depuis PhenoHunt, lien partagé...)
    // redirige à tort avant que le cookie de session ait eu le temps d'être confirmé.
    useEffect(() => {
        if (authChecked && !isAuthenticated) {
            toast.error('Vous devez être connecté')
            navigate('/login')
        }
    }, [isAuthenticated, authChecked])

    // Debug: log form state whenever the current section changes to help reproduce lost values
    useEffect(() => {
        try {
            console.debug('[CreateFlowerReview] sectionChange', { currentSection, sectionId: currentSectionData?.id, formData })
        } catch (e) { }
    }, [currentSection, formData])

    // Snapshot des données aplaties de la dernière sauvegarde réussie — sert de base
    // pour ne renvoyer au backend que les champs qui ont réellement changé (autosave rapide).
    const lastSavedFlatRef = useRef(null)

    const handleSave = async ({ silent = false, skipNavigate = false } = {}) => {
        let savedReview
        try {
            setSaving(true)
            const flatData = flattenFlowerFormData(formData)

            // Ne jamais auto-créer silencieusement une toute nouvelle review tant qu'aucun nom
            // n'a été saisi — sinon lier un arbre PhenoHunt, ajouter une photo ou toucher n'importe
            // quelle autre section avant de remplir le nom suffit à faire apparaître un "Brouillon"
            // fantôme en bibliothèque. Ne s'applique qu'à l'autosave silencieux d'une review encore
            // jamais sauvegardée (id absent) — un clic explicite sur "Sauvegarder" passe toujours
            // (choix assumé par l'utilisateur), et les updates d'une review déjà créée aussi
            // (retirer ce garde là a explicitement causé des pertes de données par le passé).
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
                savedReview = await flowerReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await flowerReviewsService.create(reviewFormData)
            }

            lastSavedFlatRef.current = Object.fromEntries(
                Object.entries(flatData).filter(([, v]) => !(v instanceof File))
            )

            // Resynchroniser les photos avec la réponse serveur : les nouveaux fichiers
            // uploadés deviennent "existing" et ne sont plus jamais ré-uploadés aux
            // autosaves suivants (sinon chaque autosave dupliquait les photos en DB).
            if (Array.isArray(savedReview?.images)) {
                setPhotos(prev => {
                    prev.forEach(p => { if (!p.existing && p.preview) URL.revokeObjectURL(p.preview) })
                    return savedReview.images.map(p => {
                        const url = typeof p === 'string' ? (p.startsWith('/') ? p : `/images/${p}`) : (p.url || p.preview || '')
                        return { url, preview: url, existing: true, name: typeof p === 'string' ? p : (p.name || '') }
                    })
                })
            }

            setIsDirty(false)
            if (!silent) toast.success('Brouillon sauvegardé ✅')

            // Rattache ce nœud PhenoHunt à la review qu'on vient de créer pour lui (voir
            // NodeContextMenu.jsx "Créer la review liée") — best-effort, ne bloque jamais la
            // sauvegarde de la review si ça échoue.
            if (!id && savedReview?.id) {
                const linkNodeId = searchParams.get('linkNodeId')
                if (linkNodeId) {
                    fetch(`/api/genetics/nodes/${linkNodeId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sourceReviewId: savedReview.id })
                    }).catch(() => { /* best-effort */ })
                }
            }

            // skipNavigate : le filet de sécurité au démontage (ligne ~228) appelle handleSave après
            // que le composant a déjà été retiré de l'arbre (ex: clic sur un bouton de nav globale) —
            // naviguer à ce moment-là écraserait la destination que l'utilisateur vient de choisir.
            if (!id && savedReview?.id && !skipNavigate) {
                navigate(`/edit/flower/${savedReview.id}`)
            }
        } catch (error) {
            const msg = error?.message || 'Erreur inconnue'
            toast.error('Erreur lors de la sauvegarde : ' + msg)
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
        return savedReview
    }

    // Auto-save sur chaque modification (debounced 2.5s)
    // hasLoadedRef évite de déclencher un save juste après le peuplement initial de formData ;
    // au-delà, plus besoin de gate sur nomCommercial (qui bloquait silencieusement l'autosave
    // si on éditait une autre section avant d'avoir rempli le nom).
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
            {useWizardMode ? (
                <WizardFlow
                    questions={wizardQuestions}
                    formData={formData}
                    handleChange={handleChange}
                    photos={photos}
                    handlePhotoUpload={handlePhotoUpload}
                    removePhoto={removePhoto}
                    title="Créer une review Fleur"
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
                currentSection={currentSection}
                totalSections={sections.length}
                onSectionChange={setCurrentSection}
                title="Créer une review Fleur"
                subtitle="Documentez votre variété en détail"
                sectionEmojis={sectionEmojis}
                showProgress={true}
                onOpenPreview={() => setShowOrchard(true)}
                onSave={() => handleSave({ silent: false })}
                onEnableWizard={() => setWizardOverride(true)}
                isDirty={isDirty}
                saving={saving}
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
                            <Genetiques formData={formData} handleChange={handleChange} reviewId={id} />
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
                                productType="flower"
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
            </ResponsiveCreateReviewLayout>
            )}

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
        </>
    )
}
