import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { hashReviewsService } from '../../../services/apiService'
import ResponsiveCreateReviewLayout from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'

const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))
import { flattenHashFormData, createFormDataFromFlat, diffFlatData } from '../../../utils/formDataFlattener'

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import { SeparationPipelineAdapter, CuringMaturationAdapter } from '../../../components/pipelines/adapters'
import AnalyticsSection from '../../../components/sections/AnalyticsSection'
import VisualSection from '../../../components/sections/VisualSection'
import OdorSection from '../../../components/sections/OdorSection'
import TextureSection from '../../../components/sections/TextureSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useHashForm } from './hooks/useHashForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateHashReview - Review complète pour Hash
 * Types: Hash, Kief, Ice-O-Lator, Dry-Sift
 */
export default function CreateHashReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { isAuthenticated } = useStore()
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const { formData, handleChange, loading, saving, setSaving } = useHashForm(id)
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

    const handleSave = async ({ silent = false } = {}) => {
        let savedReview
        try {
            setSaving(true)
            const flatData = flattenHashFormData(formData)
            const dataToSend = id ? diffFlatData(flatData, lastSavedFlatRef.current) : flatData
            const existingImages = photos
                .filter(p => p.existing)
                .map(p => p.name || p.url || p.preview)
                .filter(Boolean)
            const reviewFormData = createFormDataFromFlat(dataToSend, photos, 'draft', existingImages)

            if (id) {
                savedReview = await hashReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await hashReviewsService.create(reviewFormData)
            }

            // Snapshot complet (pas le diff) pour comparer au prochain autosave
            lastSavedFlatRef.current = Object.fromEntries(
                Object.entries(flatData).filter(([, v]) => !(v instanceof File))
            )

            // Resynchroniser les photos avec la réponse serveur : les nouveaux fichiers
            // uploadés deviennent "existing" (URL serveur) et ne sont plus jamais ré-uploadés
            // aux autosaves suivants (sinon chaque autosave dupliquait les photos en DB).
            const rawPhotos = savedReview?.hashReview?.photos
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
            if (!id && newId) {
                navigate(`/edit/hash/${newId}`)
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
            const flatData = flattenHashFormData(mergedData)
            const reviewFormData = createFormDataFromFlat(flatData, photos, 'published', existingImages)

            if (id) {
                await hashReviewsService.update(id, reviewFormData)
            } else {
                await hashReviewsService.create(reviewFormData)
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
    // hasLoadedRef évite de déclencher un save juste après le peuplement initial de formData
    // (au montage ou juste après le chargement d'une review existante) — au-delà, tout
    // changement de formData vient forcément d'une vraie édition utilisateur, donc plus besoin
    // de gate sur nomCommercial (qui bloquait silencieusement l'autosave si on éditait le
    // pipeline avant d'avoir rempli le nom).
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
    // modification, le debounce ci-dessus n'a pas encore eu le temps de sauvegarder — on
    // force un save immédiat au démontage plutôt que de perdre silencieusement la modification.
    const handleSaveRef = useRef(handleSave)
    useEffect(() => { handleSaveRef.current = handleSave })
    useEffect(() => () => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
            handleSaveRef.current({ silent: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Vérifier auth
    if (!isAuthenticated && !loading) {
        toast.error('Vous devez être connecté')
        navigate('/login')
        return null
    }

    return (
        <>
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
                isDirty={isDirty}
                title="Créer une review Hash"
                subtitle="Documentez votre hash, kief ou ice-o-lator"
                loading={loading}
                saving={saving}
                wide={['separation', 'curing'].includes(sections[currentSection]?.id)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className={['separation', 'curing'].includes(sections[currentSection]?.id) ? 'h-full' : 'space-y-6'}
                    >
                        {!['separation', 'curing'].includes(sections[currentSection]?.id) && (
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">{sections[currentSection].icon}</span>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        {sections[currentSection].title}
                                        {sections[currentSection].required && <span className="text-red-500 ml-2">*</span>}
                                    </h2>
                                </div>
                            </div>
                        )}

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
                            <SeparationPipelineAdapter
                                productType="hash"
                                data={formData.separationPipeline || {}}
                                onChange={(data) => handleChange('separationPipeline', data)}
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
                                productType="Hash"
                                data={formData.visuel || {}}
                                onChange={(visuelData) => handleChange('visuel', visuelData)}
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
                                productType="Hash"
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
                                productType="hash"
                                data={formData.curing || {}}
                                onChange={(data) => handleChange('curing', data)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </ResponsiveCreateReviewLayout>

            <AnimatePresence>
                {showOrchard && (
                    <Suspense fallback={<div className="p-4"><div className="animate-spin w-6 h-6 border-b-2 rounded-full border-purple-400"></div></div>}>
                        <OrchardPanel
                            productType="Hash"
                            reviewData={{
                                title: formData.nomCommercial || 'Aperçu de la review Hash',
                                holderName: formData.nomCommercial || '',
                                description: formData.description || '',
                                hashmaker: formData.hashmaker || '',
                                lab: formData.laboratoire || '',
                                cultivars: formData.cultivarsUtilises || [],
                                isPublic: false,
                                // ...formData AVANT images : formData.images hérite de Review.images
                                // (toujours null pour Hash, stocké sur sa propre sous-table) et écrasait
                                // sinon le tableau de photos correctement calculé
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
