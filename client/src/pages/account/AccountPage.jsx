import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n/i18n'
import { Calendar, Check, CreditCard, Shield, Settings } from 'lucide-react'

export default function AccountPage() {
    const navigate = useNavigate()
    const { user } = useStore()
    const { i18n } = useTranslation()

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
    }, [user, navigate])

    // Enforce dark theme globally
    useEffect(() => {
        try {
            const root = window.document.documentElement
            root.setAttribute('data-theme', 'dark')
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } catch (e) { /* ignore */ }
    }, [])

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

        // Save to backend
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

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        ⚙️ Mon Compte
                    </h1>
                    <p className="text-gray-400">
                        Gérez vos infos personnelles, préférences et abonnement
                    </p>
                </div>

                {/* Save confirmation */}
                {saved && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-800 dark:text-green-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Enregistré avec succès !</span>
                    </div>
                )}

                {/* SECTION 1: PROFIL */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-8 shadow-lg border border-indigo-200 dark:border-indigo-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Mon Profil
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Avatar & Identity */}
                        <div className="md:col-span-1 flex flex-col items-center text-center">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`}
                                alt={user.username}
                                className="w-20 h-20 rounded-full border-4 border-indigo-500 shadow-lg mb-4"
                            />
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">{user.username}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm break-all">{user.email}</p>
                        </div>

                        {/* Account Stats */}
                        <div className="md:col-span-1 flex flex-col justify-center">
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type de compte</p>
                                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 capitalize">{user.accountType || 'amateur'}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Membre depuis</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Language Selection (Compact 3-column grid with larger flags) */}
                        <div className="md:col-span-1 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Langue</p>
                            <div className="grid grid-cols-3 gap-2">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.i18nCode)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg font-semibold transition-all ${
                                            language === lang.i18nCode
                                                ? 'bg-white dark:bg-gray-700 shadow-md scale-110'
                                                : 'bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700'
                                        }`}
                                        title={lang.label}
                                    >
                                        <span className="text-2xl mb-1">{lang.flag}</span>
                                        <span className="text-xs font-bold">{lang.code.split('-')[0].toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-1 flex flex-col justify-center gap-3">
                            {['admin', 'producteur', 'influenceur'].includes(user.accountType?.toLowerCase()) && (
                                <button
                                    onClick={() => navigate('/manage-subscription')}
                                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors text-sm"
                                >
                                    💳 Abonnement
                                </button>
                            )}
                            {user.accountType?.toLowerCase() === 'amateur' && (
                                <button
                                    onClick={() => navigate('/manage-subscription')}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                                >
                                    ⭐ Upgrade
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    try {
                                        fetch('/api/auth/logout', {
                                            method: 'POST',
                                            credentials: 'include'
                                        }).then(() => navigate('/'))
                                    } catch (e) {
                                        console.error('Logout error:', e)
                                    }
                                }}
                                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                                🚪 Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PREFERENCES MOSAIC */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Préférences
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Personnalisez vos paramètres par défaut</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Notifications Toggle */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Notifications</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Toast notifications</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('showNotifications', !preferences.showNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Default Visibility */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white">Visibilité par défaut</div>
                                    <select
                                        value={preferences.defaultVisibility}
                                        onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
                                        className="mt-2 w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                    >
                                        <option value="public">🌍 Publique</option>
                                        <option value="private">🔒 Privée</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Auto-save Drafts */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Auto-sauvegarde</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Sauvegarder les brouillons</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('autoSaveDrafts', !preferences.autoSaveDrafts)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.autoSaveDrafts ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.autoSaveDrafts ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Share on Social */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                        <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.949 15.566 11.672 17.19 13.824 18.062c.44.148.676-.663.353-.899-2.335-1.579-4.03-3.455-5.195-5.578" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Partage réseaux</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Partager automatiquement</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('shareOnSocial', !preferences.shareOnSocial)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.shareOnSocial ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.shareOnSocial ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Show Detailed Stats */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Stats détaillées</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Afficher les analyses</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('showDetailedStats', !preferences.showDetailedStats)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showDetailedStats ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showDetailedStats ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Private Profile */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Profil privé</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Masquer votre profil</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('privateProfile', !preferences.privateProfile)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.privateProfile ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.privateProfile ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
