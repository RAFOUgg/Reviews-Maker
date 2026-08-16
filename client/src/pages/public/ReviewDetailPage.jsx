import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import { parseImages } from '../../utils/imageUtils'
import SingleReviewCard from '../../components/export/SingleReviewCard'
import { resolveConfigForReview } from '../../store/exportMakerStore'
import ProductionChainCanvas from '../../components/production-chain/ProductionChainCanvas'
import { apiTypeToInternal } from '../../utils/reviewTypeMeta'
import { getLotCode } from '../../utils/lotCode'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/shared/ToastContainer'
const ExportModal = React.lazy(() => import('../../components/export/ExportModal'))
import { Download, ArrowLeft, Edit3, Loader2, GitBranch } from 'lucide-react'
import { LiquidCard, LiquidButton, LiquidDivider } from '../../components/ui/LiquidUI'


export default function ReviewDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()
    // `key === 'default'` = premier écran de la session de navigation (lien direct,
    // rechargement) : il n'y a rien derrière, on retombe alors sur la galerie.
    const canGoBack = location.key !== 'default'
    const { user, isAuthenticated } = useStore()
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(null)
    const [showExportModal, setShowExportModal] = useState(false)
    const [productionChains, setProductionChains] = useState([])
    const [expandedChainId, setExpandedChainId] = useState(null)

    useEffect(() => {
        fetchReview()
    }, [id])

    useEffect(() => {
        if (!review?.type) return
        const reviewType = apiTypeToInternal(review.type)
        if (!reviewType) return

        fetch(`/api/production-chains/for-review/${reviewType}/${review.id}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(chains => setProductionChains(Array.isArray(chains) ? chains : []))
            .catch(() => {})
    }, [review?.id, review?.type])

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
                    if (typeof data.terpenes === 'string') data.terpenes = JSON.parse(data.terpenes)
                    if (typeof data.secondaryAromas === 'string') data.secondaryAromas = JSON.parse(data.secondaryAromas)
                    if (typeof data.dryPuffNotes === 'string') data.dryPuffNotes = JSON.parse(data.dryPuffNotes)
                    if (typeof data.inhalationNotes === 'string') data.inhalationNotes = JSON.parse(data.inhalationNotes)
                    if (typeof data.exhalationNotes === 'string') data.exhalationNotes = JSON.parse(data.exhalationNotes)
                    if (typeof data.substratMix === 'string') data.substratMix = JSON.parse(data.substratMix)
                    if (typeof data.pipelinePurification === 'string') data.pipelinePurification = JSON.parse(data.pipelinePurification)
                    if (typeof data.fertilizationPipeline === 'string') data.fertilizationPipeline = JSON.parse(data.fertilizationPipeline)
                    if (typeof data.extraData === 'string') data.extraData = JSON.parse(data.extraData)
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
            <div className="min-h-[50vh] bg-[#07070f] flex items-center justify-center">
                <div className="flex items-center gap-3 text-white/60">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    <span className="text-lg">Chargement...</span>
                </div>
            </div>
        )
    }

    if (!review) return null

    return (
        <div className="bg-[#07070f] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back & Edit Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => canGoBack ? navigate(-1) : navigate('/gallery')}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>{canGoBack ? 'Retour' : 'Retour à la galerie'}</span>
                    </button>

                    {isAuthenticated && user?.id === review?.authorId && (
                        <div className="flex items-center gap-3">
                            <LiquidButton
                                onClick={() => { setShowExportModal(true); }}
                                variant="primary"
                                size="sm"
                            >
                                <Download className="w-4 h-4" />
                                <span>Exporter</span>
                            </LiquidButton>

                            <LiquidButton
                                onClick={() => navigate(`/edit/${apiTypeToInternal(review.type)}/${id}`)}
                                variant="secondary"
                                size="sm"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Éditer</span>
                            </LiquidButton>
                        </div>
                    )}
                </div>

                {/* Identifiant de lot — dérivé de l'id de la review (cf. utils/lotCode.js), jamais
                    stocké séparément. Simple référence de confort, pas un numéro réglementaire. */}
                <div
                    className="flex items-center gap-2 mb-6 -mt-4 text-white/40 text-xs font-mono"
                    title="Identifiant interne Reviews-Maker — pas un numéro de traçabilité officiel"
                >
                    <span>{getLotCode(review.id)}</span>
                </div>

                {/* Lien vers l'arbre généalogique lié (PhenoHunt), si présent et visible */}
                {review.flowerData?.geneticTree && (
                    <LiquidCard glow="purple" padding="md" className="mb-6">
                        <button
                            onClick={() => navigate(`/phenohunt?tree=${review.flowerData.geneticTree.id}`)}
                            className="flex items-center gap-3 w-full text-left"
                        >
                            <span className="text-2xl">🧬</span>
                            <div>
                                <div className="text-white font-medium">Arbre généalogique lié</div>
                                <div className="text-white/60 text-sm">{review.flowerData.geneticTree.name}</div>
                            </div>
                        </button>
                    </LiquidCard>
                )}

                {/* Chaîne(s) de production contenant cette fiche technique, en lecture seule */}
                {productionChains.length > 0 && (
                    <div className="mb-6 space-y-3">
                        {productionChains.map(chain => (
                            <LiquidCard key={chain.id} glow="none" padding="none" className="overflow-hidden">
                                <button
                                    onClick={() => setExpandedChainId(expandedChainId === chain.id ? null : chain.id)}
                                    className="flex items-center gap-3 w-full text-left p-4"
                                >
                                    <GitBranch className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-white font-medium">{chain.name}</div>
                                        <div className="text-white/50 text-sm">
                                            {chain._count?.nodes || 0} produits • {chain._count?.edges || 0} transformations
                                        </div>
                                    </div>
                                </button>
                                {expandedChainId === chain.id && (
                                    <div className="h-[500px] border-t border-white/10">
                                        <ReactFlowProvider>
                                            <ProductionChainCanvas chainId={chain.id} readOnly />
                                        </ReactFlowProvider>
                                    </div>
                                )}
                            </LiquidCard>
                        ))}
                    </div>
                )}

                {/* UN SEUL RENDU — celui d'Export Maker, en mode Écran.
                    « retire les vue détaillé, gardons uniquement les rendu export maker »
                    (2026-08-16). Le sélecteur Vue Détaillée / Aperçu Export Maker a disparu avec
                    elle : deux représentations concurrentes de la même review obligeaient à choisir
                    laquelle fait foi, et laissaient dériver celle qu'on regardait le moins.

                    `SingleReviewCard` en ratio d'écran plutôt que le canevas à ratio de FICHIER
                    rétréci : la mise en page se recompose sur la largeur réelle (deux colonnes sur
                    ordinateur, une sur téléphone) au lieu d'afficher une maquette 16:9 en miniature
                    entourée de vide. Même composant et même chemin que `/r/:id`. */}
                <LiquidCard glow="cyan" padding="lg">
                    <SingleReviewCard
                        reviewData={review}
                        config={{ ...resolveConfigForReview(review), ratio: 'ecran-pc' }}
                        canvasId="review-detail-canvas"
                    />
                </LiquidCard>
            </div>

            {/* Même moteur de rendu que l'aperçu Export Maker (TemplateRenderer/exportDataAdapter)
                — ce qui est configuré/prévisualisé est désormais ce qui s'exporte réellement ici. */}
            {showExportModal && (
                <Suspense fallback={<div className="p-6 text-center">Chargement de l'export…</div>}>
                    <ExportModal
                        reviewData={review}
                        config={(() => {
                            if (!review.exportMakerConfig) return undefined
                            try {
                                return typeof review.exportMakerConfig === 'string'
                                    ? JSON.parse(review.exportMakerConfig)
                                    : review.exportMakerConfig
                            } catch {
                                return undefined
                            }
                        })()}
                        onClose={() => setShowExportModal(false)}
                    />
                </Suspense>
            )}
        </div>
    )
}
