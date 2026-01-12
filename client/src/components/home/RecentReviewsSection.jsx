import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Eye, Heart, MessageSquare, ArrowRight } from 'lucide-react'
import { reviewsService } from '../../services/apiService'
import LoadingSpinner from '../LoadingSpinner'

/**
 * Section "Mes Reviews Récentes" - Affiche les 6 dernières reviews de l'utilisateur
 * Conforme CDC : "Mes Reviews Récentes (6 dernières reviews en grid)"
 */
export default function RecentReviewsSection({ userId }) {
    const navigate = useNavigate()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchRecentReviews = async () => {
            try {
                setLoading(true)
                // Fetch 6 dernières reviews de l'utilisateur
                const response = await reviewsService.getUserReviews(userId, { limit: 6, sort: 'createdAt_desc' })
                setReviews(response.reviews || [])
            } catch (error) {
}
