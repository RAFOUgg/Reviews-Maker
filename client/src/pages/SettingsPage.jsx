import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function SettingsPage() {
    const navigate = useNavigate()
    const { user } = useStore()

    // Theme settings
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'violet-lean'
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

    // Apply theme
    useEffect(() => {
        const root = window.document.documentElement

        const applyTheme = (themeValue) => {
            // Remove all theme data attributes
            root.removeAttribute('data-theme')

            switch (themeValue) {
                case 'violet-lean':
                    root.setAttribute('data-theme', 'violet-lean')
                    root.classList.remove('dark')
                    break
                case 'emerald':
                    root.setAttribute('data-theme', 'emerald')
                    root.classList.remove('dark')
                    break
                case 'tahiti':
                    root.setAttribute('data-theme', 'tahiti')
                    root.classList.remove('dark')
                    break
                case 'sakura':
                    root.setAttribute('data-theme', 'sakura')
                    root.classList.remove('dark')
                    break
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
                        root.classList.remove('dark')
                    }
                    break
                default:
                    root.setAttribute('data-theme', 'violet-lean')
            }
        }

        applyTheme(theme)
        localStorage.setItem('theme', theme)

        // Listen for system theme changes if auto
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handler = () => applyTheme('auto')
            mediaQuery.addEventListener('change', handler)
            return () => mediaQuery.removeEventListener('change', handler)
        }
    }, [theme])

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

                {/* Theme Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Thème de l'application
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                        Choisissez le thème qui vous convient le mieux
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { value: 'violet-lean', label: 'Violet Lean', icon: '🟣', desc: 'Par défaut', colors: 'from-purple-400 to-pink-400' },
                            { value: 'emerald', label: 'Vert Émeraude', icon: '💚', desc: 'Vert profond', colors: 'from-emerald-400 to-green-300' },
                            { value: 'tahiti', label: 'Bleu Tahiti', icon: '🔵', desc: 'Bleu océan', colors: 'from-cyan-400 to-blue-400' },
                            { value: 'sakura', label: 'Sakura', icon: '🌸', desc: 'Rose Sakura doux', colors: 'from-pink-400 to-pink-300' },
                            { value: 'dark', label: 'Sombre', icon: '⚫', desc: 'Indigo sombre', colors: 'from-indigo-900 to-purple-900' },
                            { value: 'auto', label: 'Selon système', icon: '🔄', desc: 'Automatique', colors: 'from-gray-600 to-gray-700' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleThemeChange(option.value)}
                                className={`relative p-5 rounded-xl border-2 transition-all ${theme === option.value ? 'theme-selected' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                            >
                                {theme === option.value && (
                                    <div className="absolute top-2 right-2 theme-dot flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="text-4xl mb-2">{option.icon}</div>
                                <div className="theme-gradient-bar mb-3" style={{ background: 'linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent)))' }}></div>
                                <div className="font-bold text-gray-900 dark:text-white mb-1">{option.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
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
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.compactView ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.compactView ? 'translate-x-6' : 'translate-x-1'
                                        }`}
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
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
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
