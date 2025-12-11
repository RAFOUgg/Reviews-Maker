import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import InfosGeneralesFleur from '../components/forms/flower/InfosGeneralesFleur'
import Genetiques from '../components/forms/flower/Genetiques'
import PipelineCulture from '../components/forms/flower/PipelineCulture'
import AnalyticsPDF from '../components/forms/flower/AnalyticsPDF'
import VisuelTechnique from '../components/forms/flower/VisuelTechnique'
import Odeurs from '../components/forms/flower/Odeurs'
import Texture from '../components/forms/flower/Texture'
import Gouts from '../components/forms/flower/Gouts'
import Effets from '../components/forms/flower/Effets'
import PipelineCuring from '../components/forms/flower/PipelineCuring'
import LoadingSpinner from '../components/LoadingSpinner'
import OrchardPanel from '../components/orchard/OrchardPanel'
import { AnimatePresence } from 'framer-motion'
import { useToast } from '../components/ToastContainer'

/**
 * Page principale: CreateFlowerReview
 * Orchestre les 10 sections avec navigation, validation et soumission
 */
export default function CreateFlowerReview() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams() // Pour mode édition
    const [currentSection, setCurrentSection] = useState(0)
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showOrchard, setShowOrchard] = useState(false)

    const sections = [
        {
            id: 'infos',
            title: t('flower.sections.infos'),
            icon: '📋',
            component: InfosGeneralesFleur,
            required: true
        },
        {
            id: 'genetics',
            title: t('flower.sections.genetics'),
            icon: '🧬',
            component: Genetiques
        },
        {
            id: 'culture',
            title: t('flower.sections.culture'),
            icon: '🌱',
            component: PipelineCulture
        },
        {
            id: 'analytics',
            title: t('flower.sections.analytics'),
            icon: '🔬',
            component: AnalyticsPDF
        },
        {
            id: 'visual',
            title: t('flower.sections.visual'),
            icon: '👁️',
            component: VisuelTechnique
        },
        {
            id: 'odeurs',
            title: t('flower.sections.odeurs'),
            icon: '👃',
            component: Odeurs
        },
        {
            id: 'texture',
            title: t('flower.sections.texture'),
            icon: '🤚',
            component: Texture
        },
        {
            id: 'gouts',
            title: t('flower.sections.gouts'),
            icon: '😋',
            component: Gouts
        },
        {
            id: 'effets',
            title: t('flower.sections.effets'),
            icon: '💥',
            component: Effets
        },
        {
            id: 'curing',
            title: t('flower.sections.curing'),
            icon: '🔥',
            component: PipelineCuring
        }
    ]

    // Load existing review in edit mode
    useEffect(() => {
        if (id) {
            loadReview(id)
        }
    }, [id])

    const loadReview = async (reviewId) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/reviews/flower/${reviewId}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const review = await response.json()
                // Populate form data from review.flowerData
                setFormData({
                    ...review.flowerData,
                    description: review.description,
                    isPublic: review.isPublic
                })
            } else {
                console.error('Failed to load review')
                navigate('/reviews')
            }
        } catch (error) {
            console.error('Error loading review:', error)
        } finally {
            setLoading(false)
        }
    }

    const validateSection = (sectionId) => {
        const newErrors = {}

        if (sectionId === 'infos') {
            if (!formData.nomCommercial || formData.nomCommercial.trim() === '') {
                newErrors.nomCommercial = t('flower.errors.nomCommercialRequired')
            }
            if (!formData.varietyType) {
                newErrors.varietyType = t('flower.errors.varietyTypeRequired')
            }
            if (!formData.photos || formData.photos.length === 0) {
                newErrors.photos = t('flower.errors.photosRequired')
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateSection(sections[currentSection].id)) {
            setCurrentSection(Math.min(currentSection + 1, sections.length - 1))
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handlePrevious = () => {
        setCurrentSection(Math.max(currentSection - 1, 0))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSectionChange = (data) => {
        setFormData({ ...formData, ...data })
    }

    const handleSubmit = async () => {
        // Validate all required sections
        if (!validateSection('infos')) {
            setCurrentSection(0)
            return
        }

        setSaving(true)
        try {
            const formDataToSend = new FormData()

            // Add text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '' && !key.includes('Steps') && key !== 'photos' && key !== 'analyticsPdfFile') {
                    if (typeof value === 'object') {
                        formDataToSend.append(key, JSON.stringify(value))
                    } else {
                        formDataToSend.append(key, value)
                    }
                }
            })

            // Add photos
            if (formData.photos) {
                formData.photos.forEach((photo, index) => {
                    if (photo.file) {
                        formDataToSend.append('images', photo.file)
                    }
                })
            }

            // Add PDF analytics
            if (formData.analyticsPdfFile) {
                formDataToSend.append('analyticsPdf', formData.analyticsPdfFile)
            }

            // Create/update pipelines first
            let culturePipelineId = formData.culturePipelineId
            let curingPipelineId = formData.curingPipelineId

            if (formData.cultureSteps && formData.cultureSteps.length > 0) {
                if (!culturePipelineId) {
                    const pipelineRes = await fetch('/api/pipelines', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    if (pipelineRes.ok) {
                        const { pipelineId } = await pipelineRes.json()
                        culturePipelineId = pipelineId
                    }
                }

                // Add steps
                for (const step of formData.cultureSteps) {
                    await fetch(`/api/pipelines/${culturePipelineId}/steps`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pipelineType: 'culture',
                            stepName: step.stepName,
                            intervalType: step.intervalType,
                            intervalValue: step.intervalValue,
                            data: step.data,
                            notes: step.notes
                        })
                    })
                }
            }

            if (formData.curingSteps && formData.curingSteps.length > 0) {
                if (!curingPipelineId) {
                    const pipelineRes = await fetch('/api/pipelines', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    if (pipelineRes.ok) {
                        const { pipelineId } = await pipelineRes.json()
                        curingPipelineId = pipelineId
                    }
                }

                // Add steps
                for (const step of formData.curingSteps) {
                    await fetch(`/api/pipelines/${curingPipelineId}/steps`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pipelineType: 'curing',
                            stepName: step.stepName,
                            intervalType: step.intervalType,
                            intervalValue: step.intervalValue,
                            data: step.data,
                            notes: step.notes
                        })
                    })
                }
            }

            // Add pipeline IDs
            if (culturePipelineId) formDataToSend.append('culturePipelineId', culturePipelineId)
            if (curingPipelineId) formDataToSend.append('curingPipelineId', curingPipelineId)

            // Submit review
            const url = id ? `/api/reviews/flower/${id}` : '/api/reviews/flower'
            const method = id ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                credentials: 'include',
                body: formDataToSend
            })

            if (response.ok) {
                const review = await response.json()
                navigate(`/review/${review.id}`)
            } else {
                const error = await response.json()
                console.error('Submission error:', error)
                alert(t('flower.errors.submitFailed'))
            }
        } catch (error) {
            console.error('Error submitting review:', error)
            alert(t('flower.errors.submitFailed'))
        } finally {
            setSaving(false)
        }
    }

    const CurrentSectionComponent = sections[currentSection].component
    const progress = ((currentSection + 1) / sections.length) * 100

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(99, 102, 241) 100%)' }}>
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                            {id ? t('flower.editReview') : t('flower.createReview')}
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowOrchard(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/30"
                            >
                                <Eye className="w-4 h-4" />
                                {t('common.preview', 'Aperçu')}
                            </button>
                            <div className="text-sm text-white/90 font-medium">
                                {currentSection + 1} / {sections.length}
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300 shadow-lg"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {sections.map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => setCurrentSection(index)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${index === currentSection
                                ? 'bg-white text-purple-600 shadow-lg scale-105'
                                : index < currentSection
                                    ? 'bg-white/80 text-purple-800 border border-white/30'
                                    : 'bg-white/40 text-white border border-white/20 hover:bg-white/50'
                                }`}
                        >
                            <span className="mr-1">{section.icon}</span>
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* Current Section */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <h2 className="text-xl font-semibold text-purple-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">{sections[currentSection].icon}</span>
                        {sections[currentSection].title}
                    </h2>

                    <CurrentSectionComponent
                        data={formData}
                        onChange={handleSectionChange}
                        errors={errors}
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white/80 text-purple-700 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {t('common.previous')}
                    </button>

                    <div className="flex gap-3">
                        {currentSection === sections.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold"
                            >
                                {saving ? (
                                    <>
                                        <LoadingSpinner />
                                        {t('common.saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {id ? t('common.update') : t('common.publish')}
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-purple-700 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold"
                            >
                                {t('common.next')}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orchard Studio Modal */}
            <AnimatePresence>
                {showOrchard && (() => {
                    const normalizeArray = (val) => {
                        if (Array.isArray(val)) return val;
                        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
                        return [];
                    };

                    const getImageUrl = (img) => {
                        if (!img) return undefined;
                        if (typeof img === 'string') return img;
                        if (img.url) return img.url;
                        if (img.preview) return img.preview;
                        if (img.file && img.file instanceof Blob) {
                            return URL.createObjectURL(img.file);
                        }
                        return undefined;
                    };

                    const images = formData.photos || [];
                    const imageUrls = images.map(img => getImageUrl(img)).filter(Boolean);

                    return (
                        <OrchardPanel
                            reviewData={{
                                type: 'Fleur',
                                holderName: formData.nomCommercial || '',
                                rating: formData.globalRating || 0,
                                imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined,
                                images: imageUrls,
                                effects: normalizeArray(formData.effetsChoisis),
                                aromas: normalizeArray(formData.notesDominantesOdeur),
                                tastes: normalizeArray(formData.inhalation),
                                cultivar: formData.variety || '',
                                breeder: formData.breeder || '',
                                farm: formData.farm || '',
                                // Sections visuelles
                                couleurScore: formData.couleurScore,
                                densiteVisuScore: formData.densiteVisuScore,
                                trichomesScore: formData.trichomesScore,
                                // Odeurs
                                intensiteOdeur: formData.intensiteOdeur,
                                // Texture
                                dureteScore: formData.dureteScore,
                                densiteTactileScore: formData.densiteTactileScore,
                                // Goûts
                                intensiteGout: formData.intensiteGout,
                                // Effets
                                monteeScore: formData.monteeScore,
                                intensiteEffet: formData.intensiteEffet
                            }}
                            onClose={() => setShowOrchard(false)}
                            onPresetApplied={(orchardData) => {
                                setFormData(prev => ({
                                    ...prev,
                                    orchardConfig: JSON.stringify(orchardData.orchardConfig),
                                    orchardPreset: orchardData.orchardPreset || 'custom',
                                    orchardCustomLayout: orchardData.customLayout || null,
                                    orchardLayoutMode: orchardData.layoutMode || (orchardData.customLayout ? 'custom' : 'template')
                                }));
                                toast.success('✅ Aperçu défini avec succès !');
                            }}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    )
}
