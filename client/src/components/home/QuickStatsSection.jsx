import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Star, Heart } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

/**
 * Section "Statistiques Rapides" - Affiche 4 stats principales
 * Conforme CDC : "Statistiques Rapides (4 cards : total reviews, total exports, type favori, total likes)"
 */
export default function QuickStatsSection({ userId }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchQuickStats = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/quick/${userId}`, {
                    credentials: 'include'
                })
                const data = await response.json()

                if (response.ok) {
                    setStats(data.stats)
                } else {
}
