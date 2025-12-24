import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

                {/* Theme removed — application enforced to dark-only */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Thème de l'application
                    </h2>
                    <p className="text-sm text-gray-300">L'application utilise maintenant exclusivement le mode sombre (dark). Les options de thème ont été supprimées pour garantir une UI cohérente.</p>
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
                                className={`relative p-4 rounded-lg border-2 transition-all text-left ${language === lang.i18nCode ? 'border-indigo-500 dark:' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' }`}
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

                {/* Preferences Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Préférences par défaut
                    </h2>

                    <div className="space-y-6">
                        {/* Default Visibility */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Visibilité par défaut
                            </label>
                            <select
                                value={preferences.defaultVisibility}
                                onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="public">👁️ Publique</option>
                                <option value="private">🔒 Privée</option>
                            </select>
                        </div>

                        {/* Export Format */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Format d'export par défaut
                            </label>
                            <select
                                value={preferences.exportFormat}
                                onChange={(e) => handlePreferenceChange('exportFormat', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="png">🖼️ PNG (Image)</option>
                                <option value="pdf">📄 PDF (Document)</option>
                                <option value="json">📊 JSON (Données)</option>
                            </select>
                        </div>

                        {/* Compact View Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Vue compacte</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Afficher plus de reviews par page</div>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('compactView', !preferences.compactView)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.compactView ? '' : 'bg-gray-300 dark:bg-gray-600' }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.compactView ? 'translate-x-6' : 'translate-x-1' }`}
                                />
                            </button>
                        </div>

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Notifications</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Recevoir des notifications toast</div>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('showNotifications', !preferences.showNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showNotifications ? '' : 'bg-gray-300 dark:bg-gray-600' }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-1' }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Informations du compte
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`}
                                alt={user.username}
                                className="w-16 h-16 rounded-full border-2 border-indigo-500"
                            />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{user.username}</p>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Connecté via Discord • Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
