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
}
