import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n/i18n'
import { Award, FileText, Heart, MessageCircle, Download, TrendingUp, Calendar, Star, CreditCard, Check, Shield, Settings } from 'lucide-react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'

export default function AccountPage() {
    const navigate = useNavigate()
    const { user } = useStore()
    const { i18n } = useTranslation()

    const [stats, setStats] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [activeTab, setActiveTab] = useState('preferences')

    // Language setting
    const [language, setLanguage] = useState(() => {
        return i18n.language || 'fr'
    })

    // Default preferences
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('userPreferences')
        return saved ? JSON.parse(saved) : {
            defaultVisibility: 'public',
            showNotifications: true,
            autoSaveDrafts: true,
            shareOnSocial: false,
            showDetailedStats: true,
            privateProfile: false
        }
    })

    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
        fetchStats()
        fetchRecentReviews()
    }, [user, navigate])

    useEffect(() => {
        try {
            const root = window.document.documentElement
            root.setAttribute('data-theme', 'dark')
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } catch (e) { /* ignore */ }
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/user/stats', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Erreur chargement stats:', err)
        }
    }

    const fetchRecentReviews = async () => {
        try {
            const response = await fetch('/api/reviews?limit=5', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setRecentReviews(data.reviews || [])
            }
        } catch (err) {
            console.error('Erreur chargement reviews:', err)
        }
    }

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => {
            const updated = { ...prev, [key]: value }
            localStorage.setItem('userPreferences', JSON.stringify(updated))
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
            return updated
        })
    }

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang)
        await changeLanguage(newLang)

        try {
            await fetch('/api/account/language', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ locale: newLang }),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) {
            console.error('Error saving language:', error)
        }
    }

    const getBadges = () => {
        if (!user) return []
        const badges = []

        if (user.accountType === 'producer') {
            badges.push({ icon: '🌱', label: 'Producteur Certifié' })
        } else if (user.accountType === 'influencer') {
            badges.push({ icon: '⭐', label: 'Influenceur' })
        }

        if (user.legalAge) {
            badges.push({ icon: '✓', label: 'Vérifié' })
        }

        if (stats) {
            if (stats.totalReviews >= 100) {
                badges.push({ icon: '🏆', label: 'Expert' })
            } else if (stats.totalReviews >= 50) {
                badges.push({ icon: '🥇', label: 'Contributeur' })
            } else if (stats.totalReviews >= 10) {
                badges.push({ icon: '🥈', label: 'Actif' })
            }
        }

        return badges
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Mon Compte</h1>
                    <p className="text-gray-400">Gérez votre profil, vos préférences et votre abonnement</p>
                </div>

                {/* Save confirmation */}
                {saved && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-800 dark:text-green-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Préférences enregistrées avec succès!</span>
                    </div>
                )}

                {/* Profile Card */}
                <LiquidCard className="mb-8">
                    <div className="p-8">
                        <div className="flex items-start gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff&bold=true&size=150`}
                                    alt={user.username}
                                    className="w-32 h-32 rounded-2xl border-4 border-indigo-500 shadow-lg"
                                />
                                <button className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
                                <p className="text-gray-400 mb-4">{user.email}</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 uppercase">Type de Compte</p>
                                        <p className="text-lg font-bold text-indigo-400 capitalize">{user.accountType || 'amateur'}</p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 uppercase">Membre depuis</p>
                                        <p className="text-sm font-bold text-white">{new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 uppercase">Abonnement</p>
                                        <p className="text-sm font-bold text-green-400">{user.subscriptionStatus || 'Gratuit'}</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {getBadges().map((badge, idx) => (
                                        <span key={idx} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            {badge.icon} {badge.label}
                                        </span>
                                    ))}
                                </div>

                                {/* Manage Subscription Button */}
                                <div className="mt-6">
                                    <LiquidButton onClick={() => navigate('/manage-subscription')}>
                                        💳 Gérer l'abonnement
                                    </LiquidButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Stats Quick View */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <LiquidCard>
                            <div className="p-6 text-center">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                <div className="text-3xl font-bold text-white">{stats.totalReviews || 0}</div>
                                <div className="text-sm text-gray-400">Reviews</div>
                            </div>
                        </LiquidCard>
                        <LiquidCard>
                            <div className="p-6 text-center">
                                <Download className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                <div className="text-3xl font-bold text-white">{stats.totalExports || 0}</div>
                                <div className="text-sm text-gray-400">Exports</div>
                            </div>
                        </LiquidCard>
                        <LiquidCard>
                            <div className="p-6 text-center">
                                <Heart className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                <div className="text-3xl font-bold text-white">{stats.totalLikes || 0}</div>
                                <div className="text-sm text-gray-400">Likes</div>
                            </div>
                        </LiquidCard>
                        <LiquidCard>
                            <div className="p-6 text-center">
                                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                <div className="text-3xl font-bold text-white">{stats.totalComments || 0}</div>
                                <div className="text-sm text-gray-400">Commentaires</div>
                            </div>
                        </LiquidCard>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-700">
                    {[
                        { id: 'preferences', label: 'Préférences', icon: Settings },
                        { id: 'language', label: 'Langue', icon: FileText },
                        { id: 'stats', label: 'Statistiques', icon: TrendingUp },
                        { id: 'legal', label: 'Légal', icon: Award }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'text-white border-indigo-500' : 'text-gray-400 hover:text-white border-transparent'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <LiquidCard>
                    <div className="p-8">
                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white">Préférences personnelles</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Notifications */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-900/30 rounded-lg">
                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">Notifications</div>
                                                    <div className="text-xs text-gray-400">Toast notifications</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('showNotifications', !preferences.showNotifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showNotifications ? 'bg-blue-500' : 'bg-gray-600'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visibility */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-green-900/30 rounded-lg">
                                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-white">Visibilité par défaut</div>
                                                <select
                                                    value={preferences.defaultVisibility}
                                                    onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
                                                    className="mt-2 w-full px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                >
                                                    <option value="public">🌍 Publique</option>
                                                    <option value="private">🔒 Privée</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto-save */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-900/30 rounded-lg">
                                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">Auto-sauvegarde</div>
                                                    <div className="text-xs text-gray-400">Sauvegarder les brouillons</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('autoSaveDrafts', !preferences.autoSaveDrafts)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.autoSaveDrafts ? 'bg-purple-500' : 'bg-gray-600'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.autoSaveDrafts ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Share on Social */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-900/30 rounded-lg">
                                                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.949 15.566 11.672 17.19 13.824 18.062c.44.148.676-.663.353-.899-2.335-1.579-4.03-3.455-5.195-5.578" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">Partage réseaux</div>
                                                    <div className="text-xs text-gray-400">Partager automatiquement</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('shareOnSocial', !preferences.shareOnSocial)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.shareOnSocial ? 'bg-pink-500' : 'bg-gray-600'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.shareOnSocial ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-900/30 rounded-lg">
                                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">Stats détaillées</div>
                                                    <div className="text-xs text-gray-400">Afficher les analyses</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('showDetailedStats', !preferences.showDetailedStats)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showDetailedStats ? 'bg-orange-500' : 'bg-gray-600'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showDetailedStats ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Private Profile */}
                                    <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-900/30 rounded-lg">
                                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">Profil privé</div>
                                                    <div className="text-xs text-gray-400">Masquer votre profil</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('privateProfile', !preferences.privateProfile)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.privateProfile ? 'bg-red-500' : 'bg-gray-600'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.privateProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Language Tab */}
                        {activeTab === 'language' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-6">Langue de l'application</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.i18nCode)}
                                            className={`flex flex-col items-center justify-center p-6 rounded-xl font-semibold transition-all border-2 ${
                                                language === lang.i18nCode
                                                    ? 'bg-indigo-500/20 border-indigo-500 shadow-lg scale-105'
                                                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                            }`}
                                            title={lang.label}
                                        >
                                            <span className="text-4xl mb-2">{lang.flag}</span>
                                            <span className="text-lg text-white">{lang.label}</span>
                                            <span className="text-xs text-gray-400 mt-1">{lang.code.split('-')[0].toUpperCase()}</span>
                                            {language === lang.i18nCode && (
                                                <Check className="w-5 h-5 text-green-400 mt-2" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats Tab */}
                        {activeTab === 'stats' && stats && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-6">Statistiques détaillées</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-700/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-white">Production</h4>
                                            <Star className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Reviews créées</span>
                                                <span className="font-bold text-white">{stats.totalReviews || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Exports générés</span>
                                                <span className="font-bold text-white">{stats.totalExports || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-rose-900/30 to-pink-900/30 rounded-xl border border-rose-700/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-white">Engagement</h4>
                                            <Heart className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Likes reçus</span>
                                                <span className="font-bold text-white">{stats.totalLikes || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Commentaires</span>
                                                <span className="font-bold text-white">{stats.totalComments || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Legal Tab */}
                        {activeTab === 'legal' && (
                            <div className="space-y-6">
                                <div className="rounded-xl p-6 border border-indigo-700 bg-indigo-900/20">
                                    <h3 className="font-bold text-white mb-3">Conditions Générales d'Utilisation</h3>
                                    <div className="text-sm text-gray-300 space-y-3">
                                        <p>Les présentes conditions régissent l'accès et l'utilisation de la plateforme Reviews Maker.</p>
                                        <p>En accédant à notre plateforme, vous reconnaissez avoir l'âge légal requis dans votre juridiction.</p>
                                        <p>Vous acceptez de respecter toutes les lois et réglementations applicables.</p>
                                    </div>
                                </div>

                                <div className="rounded-xl p-6 border border-rose-700 bg-rose-900/20">
                                    <h3 className="font-bold text-white mb-3">Mentions Légales</h3>
                                    <div className="text-sm text-gray-300 space-y-3">
                                        <p><strong>Responsable:</strong> Reviews Maker SARL</p>
                                        <p><strong>Conformité:</strong> Respect des réglementations cannabis applicables.</p>
                                        <p><strong>Propriété:</strong> Les contenus générés par les utilisateurs leur appartiennent.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </LiquidCard>
            </div>
        </div>
    )
}
