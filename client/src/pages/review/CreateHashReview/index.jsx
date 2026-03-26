import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { hashReviewsService } from '../../../services/apiService'
import ResponsiveCreateReviewLayout from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy } from 'react'

const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))

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
    const { isAuthenticated } = useStore()
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)

    const { formData, handleChange, loading, saving, setSaving } = useHashForm(id)
    const { photos, handlePhotoUpload, removePhoto } = usePhotoUpload()

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

    // Vérifier auth
    if (!isAuthenticated && !loading) {
        toast.error('Vous devez être connecté')
        navigate('/login')
        return null
    }

    return (
        <ResponsiveCreateReviewLayout
            sections={sections}
            sectionEmojis={sections.map(s => s.icon)}
            currentSection={currentSection}
            onPrevious={handlePrevious}
            onNext={handleNext}
            formData={formData}
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            onOpenPreview={() => setShowOrchard(true)}
            onSave={handleSave}
            onSubmit={handleSubmit}
            title="Créer une review Hash"
            subtitle="Documentez votre hash, kief ou ice-o-lator"
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
                <OrchardPanel
                    productType="Hash"
                    reviewData={{
                        title: formData.nomCommercial || 'Aperçu de la review Hash',
                        holderName: formData.nomCommercial || '',
                        description: formData.description || '',
                        hashmaker: formData.hashmaker || '',
                        lab: formData.laboratoire || '',
                        cultivars: formData.cultivarsUtilises || [],
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
            )}
        </AnimatePresence>
    )
}
