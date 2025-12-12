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

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'violet-lean')
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
            console.error('Erreur:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/account/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })
            if (!response.ok) throw new Error('Update failed')
            const updated = await response.json()
            setProfile(updated)
            setUser(updated)
            setEditing(false)
        } catch (err) {
            console.error('Erreur:', err)
        } finally {
            setSaving(false)
        }
    }

    // Apply theme
    useEffect(() => {
        const root = document.documentElement
        const applyTheme = (t) => {
            root.removeAttribute('data-theme')
            root.classList.remove('dark')

            switch (t) {
                case 'dark':
                    root.setAttribute('data-theme', 'dark')
                    root.classList.add('dark')
                    break
                case 'auto':
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                    if (isDark) {
                        root.setAttribute('data-theme', 'dark')
                        root.classList.add('dark')
                    } else {
                        root.setAttribute('data-theme', 'violet-lean')
                    }
                    break
                default:
                    root.setAttribute('data-theme', t)
            }
        }

        applyTheme(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const themeOptions = [
        { value: 'violet-lean', label: 'Violet Lean', gradient: 'from-purple-500 to-violet-600' },
        { value: 'emerald', label: 'Vert Émeraude', gradient: 'from-emerald-500 to-green-600' },
        { value: 'tahiti', label: 'Bleu Tahiti', gradient: 'from-cyan-500 to-blue-600' },
        { value: 'sakura', label: 'Sakura', gradient: 'from-pink-500 to-rose-600' },
        { value: 'dark', label: 'Mode Sombre', gradient: 'from-gray-800 to-gray-900' },
        { value: 'auto', label: 'Automatique', gradient: 'from-slate-500 to-gray-600' }
    ]

    const tabs = [
        { id: 'profile', label: 'Mon Profil', icon: User },
        { id: 'legal', label: 'Informations Légales', icon: FileText },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'preferences', label: 'Préférences', icon: Settings }
    ]

    const getAccountTypeBadge = () => {
        const type = profile?.accountType || 'consumer'
        const badges = {
            consumer: { label: 'Amateur', color: 'bg-green-500', icon: '🌱' },
            influencer: { label: 'Influenceur', color: 'bg-purple-500', icon: '⭐' },
            producer: { label: 'Producteur', color: 'bg-blue-500', icon: '🏢' }
        }
        return badges[type] || badges.consumer
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 flex items-center justify-center">
                <div className="glass rounded-2xl p-8">
                    <div className="text-white text-xl">Chargement...</div>
                </div>
            </div>
        )
    }

    const badge = getAccountTypeBadge()

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white hover:text-white/80 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Retour</span>
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="glass rounded-3xl p-8 mb-6 animate-fade-in">
                    <div className="flex items-start gap-6 flex-wrap">
                        {/* Avatar */}
                        <div className="relative group">
                            <img
                                src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=9333EA&color=fff&bold=true&size=150`}
                                alt={profile?.username}
                                className="w-32 h-32 rounded-2xl shadow-xl border-4 border-white/30"
                            />
                            <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-[300px]">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-gray-900">{profile?.username}</h1>
                                <span className={`${badge.color} text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                                    <span>{badge.icon}</span>
                                    {badge.label}
                                </span>
                            </div>
                            <p className="text-gray-700 text-lg mb-4">{profile?.email}</p>

                            {/* Stats Row */}
                            <div className="flex gap-6 flex-wrap">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-700">{profile?.reviewCount || 0}</div>
                                    <div className="text-sm text-gray-600">Reviews</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-700">{profile?.exportCount || 0}</div>
                                    <div className="text-sm text-gray-600">Exports</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-700">{profile?.likes || 0}</div>
                                    <div className="text-sm text-gray-600">J'aime</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-xl hover:shadow-lg transition-all font-bold"
                                >
                                    <Edit2 className="w-5 h-5" />
                                    Modifier
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        {saving ? 'Enregistrement...' : 'Sauvegarder'}
                                    </button>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                        Annuler
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="glass rounded-2xl p-2 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="glass rounded-3xl p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Informations Personnelles</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Pseudo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Biographie
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    disabled={!editing}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900 resize-none"
                                    placeholder="Parlez-nous de vous..."
                                />
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Site Web
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    disabled={!editing}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Social Links (Influencer/Producer) */}
                            {(profile?.accountType === 'influencer' || profile?.accountType === 'producer') && (
                                <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-700" />
                                        Réseaux Sociaux
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={formData.socialLinks?.instagram || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                            })}
                                            disabled={!editing}
                                            placeholder="Instagram"
                                            className="px-4 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-600 disabled:bg-purple-100 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            value={formData.socialLinks?.tiktok || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                                            })}
                                            disabled={!editing}
                                            placeholder="TikTok"
                                            className="px-4 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-600 disabled:bg-purple-100 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            value={formData.socialLinks?.youtube || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                                            })}
                                            disabled={!editing}
                                            placeholder="YouTube"
                                            className="px-4 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-600 disabled:bg-purple-100 text-gray-900"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Producer Info */}
                            {profile?.accountType === 'producer' && (
                                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-700" />
                                        Informations Entreprise
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Nom de l'entreprise"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-600 disabled:bg-blue-100 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="SIRET"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-600 disabled:bg-blue-100 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Numéro de TVA"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-600 disabled:bg-blue-100 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Forme juridique"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-600 disabled:bg-blue-100 text-gray-900"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LEGAL TAB */}
                    {activeTab === 'legal' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Informations Légales</h2>

                            {/* eKYC Component */}
                            {(profile?.accountType === 'producer' || profile?.accountType === 'influencer') && (
                                <KYCUploader userId={profile?.id} accountType={profile?.accountType} />
                            )}

                                <div className="space-y-2 text-gray-900">
                                    <p><strong>Statut :</strong> {profile?.legalAge ? '✅ Vérifié' : '❌ Non vérifié'}</p>
                                    <p><strong>Pays :</strong> {profile?.country || 'Non renseigné'}</p>
                                    <p><strong>Date de consentement RDR :</strong> {profile?.consentDate ? new Date(profile.consentDate).toLocaleDateString() : 'Non renseigné'}</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Documents et Consentements</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={profile?.consentRDR} disabled className="w-5 h-5 text-purple-600" />
                                        <span className="text-gray-900">Disclaimer RDR accepté</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked disabled className="w-5 h-5 text-purple-600" />
                                        <span className="text-gray-900">CGU acceptées</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked disabled className="w-5 h-5 text-purple-600" />
                                        <span className="text-gray-900">Politique de confidentialité acceptée</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Sécurité & Authentification</h2>

                        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-red-700" />
                                Mot de passe
                            </h3>
                            <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold">
                                Changer le mot de passe
                            </button>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-blue-700" />
                                Authentification à deux facteurs (2FA)
                            </h3>
                            <p className="text-gray-700 mb-4">Statut : {profile?.totpEnabled ? '✅ Activée' : '❌ Désactivée'}</p>
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold">
                                {profile?.totpEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
                            </button>
                        </div>

                        <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Sessions Actives</h3>
                            <p className="text-gray-700 mb-4">Gérez les appareils connectés à votre compte</p>
                            <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold">
                                Voir les sessions
                            </button>
                        </div>
                    </div>
                )}

                {/* PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Préférences & Apparence</h2>

                        {/* Theme Selection */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-purple-700" />
                                Thème de l'application
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {themeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`relative p-4 rounded-xl border-3 transition-all ${theme === option.value
                                            ? 'border-purple-600 shadow-lg scale-105'
                                            : 'border-gray-300 hover:border-purple-400'
                                            }`}
                                    >
                                        <div className={`h-16 rounded-lg bg-gradient-to-br ${option.gradient} mb-3`}></div>
                                        <div className="text-sm font-bold text-gray-900">{option.label}</div>
                                        {theme === option.value && (
                                            <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-purple-700" />
                                Langue
                            </h3>
                            <select
                                value={language}
                                onChange={(e) => {
                                    setLanguage(e.target.value)
                                    changeLanguage(e.target.value)
                                }}
                                className="w-full md:w-1/2 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900 font-medium"
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notifications */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-700" />
                                Notifications
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer">
                                    <span className="text-gray-900 font-medium">Notifications par email</span>
                                    <input type="checkbox" className="w-6 h-6 text-purple-600" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer">
                                    <span className="text-gray-900 font-medium">Nouveaux likes sur mes reviews</span>
                                    <input type="checkbox" className="w-6 h-6 text-purple-600" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer">
                                    <span className="text-gray-900 font-medium">Nouveaux commentaires</span>
                                    <input type="checkbox" className="w-6 h-6 text-purple-600" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div >
    )
}
