import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { concentrateReviewsService } from '../../../services/apiService'
import ResponsiveCreateReviewLayout from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, lazy, Suspense } from 'react'

const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))

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
    const { isAuthenticated } = useStore()
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)

    const { formData, handleChange, loading, saving, setSaving } = useConcentrateForm(id)
    const { photos, setPhotos, handlePhotoUpload, removePhoto } = usePhotoUpload()

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

    const buildFormData = (status) => {
        const reviewFormData = new FormData()

        // Extract File objects from analytics before stringify
        const analyticsRaw = formData.analytics ? { ...formData.analytics } : null
        let certificateFile = null
        let terpeneFile = null
        if (analyticsRaw) {
            if (analyticsRaw.certificateFile instanceof File) {
                certificateFile = analyticsRaw.certificateFile
                delete analyticsRaw.certificateFile
            }
            if (analyticsRaw.terpeneFile instanceof File) {
                terpeneFile = analyticsRaw.terpeneFile
                delete analyticsRaw.terpeneFile
            }
        }

        Object.keys(formData).forEach(key => {
            if (key === 'photos' || key === '_photos') return
            const val = formData[key]
            if (val === undefined || val === null) return
            if (key === 'analytics') {
                if (analyticsRaw) reviewFormData.append(key, JSON.stringify(analyticsRaw))
            } else {
                reviewFormData.append(key, typeof val === 'object' ? JSON.stringify(val) : val)
            }
        })

        if (photos?.length > 0) {
            photos.forEach(photo => { if (photo.file) reviewFormData.append('photos', photo.file) })
        }
        if (certificateFile) reviewFormData.append('certificateFile', certificateFile)
        if (terpeneFile) reviewFormData.append('terpeneFile', terpeneFile)

        reviewFormData.append('status', status)
        return reviewFormData
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const reviewFormData = buildFormData('draft')

            let savedReview
            if (id) {
                savedReview = await concentrateReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await concentrateReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            if (!id && savedReview?.id) {
                navigate(`/edit/concentrate/${savedReview.id}`)
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
            return
        }

        try {
            setSaving(true)
            const reviewFormData = buildFormData('published')

            if (id) {
                await concentrateReviewsService.update(id, reviewFormData)
                toast.success('Review mise à jour et publiée')
            } else {
                await concentrateReviewsService.create(reviewFormData)
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
                onSave={handleSave}
                onSubmit={handleSubmit}
                title="Créer une review Concentré"
                subtitle="Documentez votre rosin, BHO ou autre concentré"
                loading={loading}
                saving={saving}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
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
                                data={formData.odeurs || {}}
                                onChange={(odeursData) => handleChange('odeurs', odeursData)}
                            />
                        )}
                        {currentSection === 5 && (
                            <TextureSection
                                productType="Concentrate"
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
                                images: photos.map(p => (p?.url || p?.preview || p?.name)).filter(Boolean),
                                isPublic: false,
                                ...formData
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
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </>
    )
}
