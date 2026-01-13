/**
 * Page Profil Utilisateur - Infos personnelles, avatar, paramètres, statistiques
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { LiquidButton, LiquidCard, LiquidInput } from '../components/liquid'
import { Award, FileText, Heart, MessageCircle, Download, TrendingUp, Calendar, Star } from 'lucide-react'

/**
 * Page Profil Utilisateur - Review Maker by Terpologie
 * Gestion des infos personnelles, avatar, paramètres et documents légaux
 */
export default function ProfilePage() {
    const navigate = useNavigate()
    const user = useStore((state) => state.user)
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        theme: 'violet-lean'
    })
    const [activeTab, setActiveTab] = useState('stats') // stats | info | legal | security

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
        fetchStats()
        fetchRecentReviews()
    }, [user, navigate])

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/account/info', {
                credentials: 'include'
            })
            if (!response.ok) throw new Error('Failed to fetch profile')
            const data = await response.json()
            setProfile(data)
            setFormData({
                username: data.username || '',
                email: data.email || '',
                theme: data.theme || 'violet-lean'
            })
        } catch (err) {
}
