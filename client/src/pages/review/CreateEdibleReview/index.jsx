import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../components/shared/ToastContainer'
import { edibleReviewsService } from '../../../services/apiService'
import ResponsiveCreateReviewLayout from '../../../components/forms/helpers/ResponsiveCreateReviewLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, lazy, Suspense } from 'react'

const OrchardPanel = lazy(() => import('../../../components/shared/orchard/OrchardPanel'))

// Import sections
import InfosGenerales from './sections/InfosGenerales'
import RecipePipelineSection from './sections/RecipePipelineSection'
import TasteSection from '../../../components/sections/TasteSection'
import EffectsSection from '../../../components/sections/EffectsSection'

// Import hooks
import { useEdibleForm } from './hooks/useEdibleForm'
import { usePhotoUpload } from './hooks/usePhotoUpload'

/**
 * CreateEdibleReview - Review complète pour Comestibles
 * Types: Brownie, Cookie, Gummies, Boissons, etc.
 */
export default function CreateEdibleReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { isAuthenticated } = useStore()
    const [currentSection, setCurrentSection] = useState(0)

    const { formData, handleChange, loading, saving, setSaving } = useEdibleForm(id)
    const { photos, setPhotos, handlePhotoUpload, removePhoto } = usePhotoUpload()
    const [showOrchard, setShowOrchard] = useState(false)

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
        { id: 'recipe', icon: '🥘', title: 'Recette & Préparation' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets + Expérience' }
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

    // RecipePipelineSection garde ingredients/steps imbriqués sous formData.recipe, mais le
    // backend (edible-reviews.js) lit des champs à plat: `ingredients` et `etapesPreparation`
    // (pas `recipe.steps`) — sans ce dépaquetage, la recette est silencieusement perdue.
    const buildReviewFormData = () => {
        const reviewFormData = new FormData()

        Object.keys(formData).forEach(key => {
            if (key === 'photos' || key === '_photos' || formData[key] === undefined || formData[key] === null) return
            if (key === 'recipe') {
                const recipe = formData.recipe || {}
                if (recipe.ingredients) reviewFormData.append('ingredients', JSON.stringify(recipe.ingredients))
                if (recipe.steps) reviewFormData.append('etapesPreparation', JSON.stringify(recipe.steps))
                return
            }
            reviewFormData.append(key, typeof formData[key] === 'object'
                ? JSON.stringify(formData[key])
                : formData[key]
            )
        })

        if (photos && photos.length > 0) {
            photos.forEach((photo) => {
                if (photo.file) {
                    reviewFormData.append('photos', photo.file)
                }
            })
        }

        return reviewFormData
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const reviewFormData = buildReviewFormData()

            reviewFormData.append('status', 'draft')

            let savedReview
            if (id) {
                savedReview = await edibleReviewsService.update(id, reviewFormData)
            } else {
                savedReview = await edibleReviewsService.create(reviewFormData)
            }

            toast.success('Brouillon sauvegardé')

            const newId = savedReview?.review?.id || savedReview?.id
            if (!id && newId) {
                navigate(`/edit/edible/${newId}`)
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
            return
        }

        try {
            setSaving(true)
            const reviewFormData = buildReviewFormData()

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
                title="Créer une review Comestible"
                subtitle="Documentez votre brownie, cookie, gummies ou autre comestible"
                loading={loading}
                saving={saving}
                wide={sections[currentSection]?.id === 'recipe'}
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
                            <RecipePipelineSection
                                data={formData.recipe || {}}
                                onChange={(data) => handleChange('recipe', data)}
                            />
                        )}
                        {currentSection === 2 && (
                            <TasteSection
                                data={formData.gouts || {}}
                                onChange={(goutsData) => handleChange('gouts', goutsData)}
                            />
                        )}
                        {currentSection === 3 && (
                            <EffectsSection
                                data={formData.effets || {}}
                                onChange={(data) => handleChange('effets', data)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </ResponsiveCreateReviewLayout>

            <AnimatePresence>
                {showOrchard && (
                    <Suspense fallback={<div className="p-4"><div className="animate-spin w-6 h-6 border-b-2 rounded-full border-purple-400"></div></div>}>
                        <OrchardPanel
                            productType="Edible"
                            reviewData={{
                                title: formData.nomProduit || 'Aperçu comestible',
                                holderName: formData.nomProduit || '',
                                description: formData.description || '',
                                productType: formData.typeComestible || '',
                                isPublic: false,
                                // ...formData AVANT images : formData.images hérite de Review.images
                                // (toujours null pour Edible, stocké sur sa propre sous-table) et écrasait
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
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </>
    )
}
