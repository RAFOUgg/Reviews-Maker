import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseImages } from '../utils/imageUtils'
import TemplateRenderer from '../components/orchard/TemplateRenderer'
import ReviewFullDisplay from '../components/ReviewFullDisplay'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import ExportMaker from '../components/export/ExportMaker'
import { templatesService } from '../services/apiService'
import { Download } from 'lucide-react'

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
}
