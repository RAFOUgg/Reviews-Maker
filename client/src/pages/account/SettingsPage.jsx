import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n'

export default function SettingsPage() {
    const navigate = useNavigate()
    const { user } = useStore()
    const { i18n } = useTranslation()

    // Theme is enforced to dark-only; disable local theme switching
    const [theme, setTheme] = useState('dark')

    // Language setting
    const [language, setLanguage] = useState(() => {
        return i18n.language || 'fr'
    })

    // Default preferences
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('userPreferences')
        return saved ? JSON.parse(saved) : {
            defaultVisibility: 'public',
            exportFormat: 'png',
            showNotifications: true,
            compactView: false
        }
    })

    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
    }, [user, navigate])

    // Enforce dark theme globally (no user-selectable themes)
    useEffect(() => {
        try {
            const root = window.document.documentElement
            root.setAttribute('data-theme', 'dark')
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } catch (e) { /* ignore */ }
    }, [])

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ⚙️ Paramètres
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Personnalisez votre expérience Reviews Maker
                    </p>
                </div>

                {/* Save confirmation */}
                {saved && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-800 dark:text-green-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Préférences enregistrées avec succès !</span>
                    </div>
                )}

                {/* Account Info (moved to top) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`}
                                alt={user.username}
                                className="w-16 h-16 rounded-full border-2 border-indigo-500"
                            />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{user.username}</p>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                                <p className="text-gray-500 dark:text-gray-400">Type d'abonnement : {user.subscriptionType || 'Standard'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connecté via Discord</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                            {user.subscriptionType !== 'Standard' && (
                                <button
                                    onClick={() => navigate('/manage-subscription')}
                                    className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600"
                                >
                                    Gérer l'abonnement
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Language Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Langue de l'application
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                        Choisissez votre langue préférée
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.i18nCode)}
                                className={`relative p-4 rounded-lg border-2 transition-all text-left ${language === lang.i18nCode ? 'border-indigo-500 dark:' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                            >
                                {language === lang.i18nCode && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{lang.flag}</span>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{lang.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {lang.code === 'en-US' && 'United States'}
                                            {lang.code === 'en-GB' && 'United Kingdom'}
                                            {lang.code === 'fr' && 'France'}
                                            {lang.code === 'de' && 'Deutschland'}
                                            {lang.code === 'es' && 'España'}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferences Gallery (compact) */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Préférences par défaut
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Visibility Card */}
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">Visibilité par défaut</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Définir la visibilité par défaut des reviews</div>
                                </div>
                                <div className="w-36">
                                    <select
                                        value={preferences.defaultVisibility}
                                        onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                    >
                                        <option value="public">Publique</option>
                                        <option value="private">Privée</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Export Format Card */}
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">Format d'export</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Format par défaut pour l'export</div>
                                </div>
                                <div className="w-36">
                                    <select
                                        value={preferences.exportFormat}
                                        onChange={(e) => handlePreferenceChange('exportFormat', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                    >
                                        <option value="png">PNG</option>
                                        <option value="pdf">PDF</option>
                                        <option value="json">JSON</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Compact View Card */}
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Vue compacte</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Afficher plus de reviews par page</div>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('compactView', !preferences.compactView)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.compactView ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.compactView ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {/* Notifications Card */}
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Notifications</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Recevoir des notifications toast</div>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('showNotifications', !preferences.showNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showNotifications ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
