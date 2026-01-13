/**
 * Page Profil & Paramètres Unifiée - Reviews Maker
 * Fusion complète avec sections : Informations, Légal, Sécurité, Préférences
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n'
import KYCUploader from '../../components/legal/KYCUploader'
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

    // Enforce dark theme globally (no user-selectable themes)
    useEffect(() => {
        try {
            const root = document.documentElement
            root.setAttribute('data-theme', 'dark')
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } catch (e) {
            // ignore in non-browser env
        }
    }, [])

    // themeOptions removed — app is dark-only

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
            influencer: { label: 'Influenceur', color: '', icon: '⭐' },
            producer: { label: 'Producteur', color: '', icon: '🏢' }
        }
        return badges[type] || badges.consumer
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 container-glass">
                    <div className="text-white text-xl">Chargement...</div>
                </div>
            </div>
        )
    }

    const badge = getAccountTypeBadge()

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto container-glass">
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
                                    <div className="text-2xl font-bold">{profile?.reviewCount || 0}</div>
                                    <div className="text-sm text-gray-600">Reviews</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{profile?.exportCount || 0}</div>
                                    <div className="text-sm text-gray-600">Exports</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{profile?.likes || 0}</div>
                                    <div className="text-sm text-gray-600">J'aime</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 liquid-btn liquid-btn--accent"
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
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${isActive ? 'liquid-btn liquid-btn--accent' : 'text-gray-700 hover:bg-white/5'}`}>
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
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus: focus:ring-2 focus: transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
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
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus: focus:ring-2 focus: transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
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
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus: focus:ring-2 focus: transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900 resize-none"
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
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus: focus:ring-2 focus: transition-all disabled:bg-gray-100 disabled:text-gray-600 text-gray-900"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Social Links (Influencer/Producer) */}
                            {(profile?.accountType === 'influencer' || profile?.accountType === 'producer') && (
                                <div className="rounded-2xl p-6 border-2">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
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
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
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
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
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
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Producer Info */}
                            {profile?.accountType === 'producer' && (
                                <div className="rounded-2xl p-6 border-2">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Informations Entreprise
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Nom de l'entreprise"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="SIRET"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Numéro de TVA"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Forme juridique"
                                            disabled={!editing}
                                            className="px-4 py-2 rounded-lg border-2 focus: disabled: text-gray-900"
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

                            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="w-6 h-6 text-green-700" />
                                    <h3 className="text-lg font-bold text-gray-900">Vérification d'âge</h3>
                                </div>
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
                                        <input type="checkbox" checked={profile?.consentRDR} disabled className="w-5 h-5" />
                                        <span className="text-gray-900">Disclaimer RDR accepté</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked disabled className="w-5 h-5" />
                                        <span className="text-gray-900">CGU acceptées</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked disabled className="w-5 h-5" />
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

                            <div className="rounded-2xl p-6 border-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Smartphone className="w-5 h-5" />
                                    Authentification à deux facteurs (2FA)
                                </h3>
                                <p className="text-gray-700 mb-4">Statut : {profile?.totpEnabled ? '✅ Activée' : '❌ Désactivée'}</p>
                                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold">
                                    {profile?.totpEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
                                </button>
                            </div>

                            <div className="rounded-2xl p-6 border-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Sessions Actives</h3>
                                <p className="text-gray-700 mb-4">Gérez les appareils connectés à votre compte</p>
                                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold">
                                    Voir les sessions
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Préférences & Apparence</h2>

                            {/* Theme removed — application enforced to dark-only */}
                            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-white/80" />
                                    Thème de l'application
                                </h3>
                                <p className="text-sm text-gray-300">L'application utilise maintenant exclusivement le mode sombre (dark). Les options de thème ont été supprimées pour garantir une UI cohérente.</p>
                            </div>

                            {/* Language */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Langue
                                </h3>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value)
                                        changeLanguage(e.target.value)
                                    }}
                                    className="w-full md:w-1/2 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-medium"
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
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                        <span className="text-gray-900 font-medium">Notifications par email</span>
                                        <input type="checkbox" className="w-6 h-6" defaultChecked />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                        <span className="text-gray-900 font-medium">Nouveaux likes sur mes reviews</span>
                                        <input type="checkbox" className="w-6 h-6" defaultChecked />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                        <span className="text-gray-900 font-medium">Nouveaux commentaires</span>
                                        <input type="checkbox" className="w-6 h-6" />
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
