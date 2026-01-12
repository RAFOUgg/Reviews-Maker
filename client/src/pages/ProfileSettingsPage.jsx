/**
 * Page Profil & Paramètres Unifiée - Reviews Maker
 * Fusion complète avec sections : Informations, Légal, Sécurité, Préférences
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n'
import KYCUploader from '../components/kyc/KYCUploader'
import {
    User, Shield, Settings, FileText, Bell, Palette, Globe,
    Camera, Mail, Lock, Smartphone, ArrowLeft, Save, X, Edit2,
    Building2, CreditCard, Award, TrendingUp
} from 'lucide-react'

export default function ProfileSettingsPage() {
    const navigate = useNavigate()
    const { user, setUser } = useStore()
    const { i18n } = useTranslation()

    const [activeTab, setActiveTab] = useState('profile') // profile | legal | security | preferences
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState(null)
    const [editing, setEditing] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        theme: 'violet-lean',
        language: 'fr',
        bio: '',
        website: '',
        socialLinks: {
            instagram: '',
            tiktok: '',
            youtube: ''
        }
    })

    // Theme is forced to dark only; remove runtime theme switching
    const [theme, setTheme] = useState('dark')
    const [language, setLanguage] = useState(i18n.language || 'fr')

    // Producteur-specific data
    const [producerData, setProducerData] = useState({
        companyName: '',
        siret: '',
        vatNumber: '',
        logo: null
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
    }, [user, navigate])

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/account/info', {
                credentials: 'include'
            })
            if (!response.ok) throw new Error('Failed')
            const data = await response.json()
            setProfile(data)
            setFormData({
                username: data.username || '',
                email: data.email || '',
                theme: data.theme || 'violet-lean',
                language: data.locale || 'fr',
                bio: data.bio || '',
                website: data.website || '',
                socialLinks: data.socialLinks || {}
            })
        } catch (err) {
}
