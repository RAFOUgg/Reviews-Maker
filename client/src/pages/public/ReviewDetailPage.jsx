import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseImages } from '../../utils/imageUtils'
import TemplateRenderer from '../../components/export/TemplateRenderer'
import { getModulesByProductType } from '../../utils/orchard/moduleMappings'
import ReviewFullDisplay from '../../components/gallery/ReviewFullDisplay'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/shared/ToastContainer'
import ExportMaker from '../../components/export/ExportMaker'
import { templatesService } from '../../services/apiService'
import { Download, ArrowLeft, Edit3, Layout, FileText, Loader2 } from 'lucide-react'
import { LiquidCard, LiquidButton, LiquidDivider, LiquidChip } from '../../components/ui/LiquidUI'
import LiquidModal from '../../components/ui/LiquidModal'

export default function ReviewDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated } = useStore()
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(null)
    const [viewMode, setViewMode] = useState('full') // 'full' or 'orchard'
    const [showExportModal, setShowExportModal] = useState(false)

    useEffect(() => {
        fetchReview()
    }, [id])

    const fetchReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${id}`)
            if (response.ok) {
                const data = await response.json()
                // Parse images to full URLs
                data.images = parseImages(data.images)

                // Parse JSON fields safely
                try {
                    if (typeof data.categoryRatings === 'string') data.categoryRatings = JSON.parse(data.categoryRatings)
                    if (typeof data.aromas === 'string') data.aromas = JSON.parse(data.aromas)
                    if (typeof data.tastes === 'string') data.tastes = JSON.parse(data.tastes)
                    if (typeof data.effects === 'string') data.effects = JSON.parse(data.effects)
                    if (typeof data.cultivarsList === 'string') data.cultivarsList = JSON.parse(data.cultivarsList)
                    if (typeof data.pipelineExtraction === 'string') data.pipelineExtraction = JSON.parse(data.pipelineExtraction)
                    if (typeof data.pipelineSeparation === 'string') data.pipelineSeparation = JSON.parse(data.pipelineSeparation)
                } catch (e) {
                    // silent
                }

                setReview(data)
            } else {
                const error = await response.json().catch(() => ({ message: 'Review non trouvée' }))
                toast.error(error.message || 'Review non trouvée')
                navigate('/')
            }
        } catch (error) {
            toast.error('Erreur lors du chargement de la review')
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveTemplate = async (templateConfig) => {
        const templateName = prompt('Entrez un nom pour votre template :', 'Mon Template Personnalisé');
        if (!templateName) return;

        try {
            const dataToSave = {
                name: templateName,
                description: `Template personnalisé basé sur la review ${review?.holderName}`,
                isPublic: false,
                config: templateConfig,
            }
            await templatesService.create(dataToSave)
            toast.success('Template sauvegardé avec succès !')
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du template:', error)
            toast.error(error.message || 'Erreur lors de la sauvegarde du template.')
        }
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating / 2)
        const hasHalfStar = (rating % 2) >= 0.5
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-xl">⭐</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400 text-xl">✨</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-600 text-xl">⭐</span>
                ))}
                <span className="ml-2 text-gray-400 text-sm font-medium">{rating}/10</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
                <div className="flex items-center gap-3 text-white/60">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    <span className="text-lg">Chargement...</span>
                </div>
            </div>
        )
    }

    if (!review) return null

    return (
        <div className="min-h-screen bg-[#07070f] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back & Edit Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Retour à la galerie</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <LiquidButton
                            onClick={() => setShowExportModal(true)}
                            variant="primary"
                            size="sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Exporter</span>
                        </LiquidButton>

                        {isAuthenticated && user?.id === review?.authorId && (
                            <LiquidButton
                                onClick={() => navigate(`/edit/${id}`)}
                                variant="secondary"
                                size="sm"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Éditer</span>
                            </LiquidButton>
                        )}
                    </div>
                </div>

                {/* View Mode Switcher - Only show if Orchard config exists */}
                {review.orchardConfig && (
                    <div className="mb-6 flex gap-2">
                        <LiquidChip
                            active={viewMode === 'full'}
                            onClick={() => setViewMode('full')}
                            color="purple"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Vue Détaillée</span>
                        </LiquidChip>
                        <LiquidChip
                            active={viewMode === 'orchard'}
                            onClick={() => setViewMode('orchard')}
                            color="cyan"
                        >
                            <Layout className="w-4 h-4" />
                            <span>Aperçu Orchard</span>
                        </LiquidChip>
                    </div>
                )}

                {/* Orchard Template Preview */}
                {viewMode === 'orchard' && review.orchardConfig ? (
                    <LiquidCard glow="cyan" padding="lg">
                        <TemplateRenderer
                            config={typeof review.orchardConfig === 'string' ? (() => {
                                try { return JSON.parse(review.orchardConfig) } catch { return review.orchardConfig }
                            })() : review.orchardConfig}
                            reviewData={{
                                // Start from raw review so fields like mainImageUrl are present
                                ...review,

                                // Mapping des données de review aux propriétés attendues par les templates (override)
                                title: review.holderName,
                                rating: review.overallRating || review.note || 0,
                                imageUrl: review.mainImageUrl || (review.images && review.images.length > 0 ? review.images[0] : null),
                                images: review.images || [],
                                tags: [
                                    ...(review.terpenes || []),
                                    ...(review.aromas || []),
                                    ...(review.tastes || []),
                                    ...(review.effects || [])
                                ].slice(0, 10), // Limiter à 10 tags
                                category: review.type,
                                description: review.description,
                                ownerName: review.ownerName || review.author?.username || 'Anonyme',
                                date: review.createdAt,
                                cultivar: review.cultivars,
                                breeder: review.breeder || review.hashmaker,
                                farm: review.farm
                            }}
                            activeModules={getModulesByProductType(review.type)}
                        />
                    </LiquidCard>
                ) : (
                    /* Full Review Display - Always show by default or if no Orchard config */
                    <ReviewFullDisplay review={review} />
                )}
            </div>

            {/* Export Modal using ExportMaker */}
            <LiquidModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Exporter la review"
                size="xl"
            >
                <ExportMaker
                    reviewData={review}
                    productType={review.type}
                    accountType={user?.accountType || 'Amateur'}
                    onClose={() => setShowExportModal(false)}
                    onSave={handleSaveTemplate}
                />
            </LiquidModal>
        </div>
    )
}
