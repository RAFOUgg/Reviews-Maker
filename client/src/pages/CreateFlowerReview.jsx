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

/**
 * Page principale: CreateFlowerReview
 * Orchestre les 10 sections avec navigation, validation et soumission
 */
export default function CreateFlowerReview() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams() // Pour mode édition
    const [currentSection, setCurrentSection] = useState(0)
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {id ? t('flower.editReview') : t('flower.createReview')}
                        </h1>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {currentSection + 1} / {sections.length}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
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
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${index === currentSection
                                    ? 'bg-primary-500 text-white'
                                    : index < currentSection
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <span className="mr-1">{section.icon}</span>
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* Current Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
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
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {t('common.previous')}
                    </button>

                    <div className="flex gap-3">
                        {currentSection === sections.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                {t('common.next')}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
