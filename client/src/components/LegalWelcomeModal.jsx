import React, { useState, useEffect } from 'react'
import legalTranslations from '../i18n/legalWelcome.json'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n'

const LegalWelcomeModal = ({ onAccept, onDeny }) => {
    const { user, isAuthenticated } = useAuth()
    const { i18n } = useTranslation()
    const [language, setLanguage] = useState(i18n.language || 'fr')
    const [ageConfirmed, setAgeConfirmed] = useState(false)
    const [consentGiven, setConsentGiven] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [userIsLegal, setUserIsLegal] = useState(false)
    const [isFirstVisit, setIsFirstVisit] = useState(false)

    // Check user age from profile
    useEffect(() => {
        const checkUserAge = async () => {
            setLoading(true)

            // Check if this is user's first visit
            const hasVisited = localStorage.getItem('hasVisitedBefore')
            setIsFirstVisit(!hasVisited)

            if (isAuthenticated && user) {
                try {
                    const response = await fetch('/api/account/info', {
                        credentials: 'include'
                    })
                    if (response.ok) {
                        const data = await response.json()

                        // Calculate age from birthdate if available
                        if (data.birthdate) {
                            const birthDate = new Date(data.birthdate)
                            const today = new Date()
                            let age = today.getFullYear() - birthDate.getFullYear()
                            const monthDiff = today.getMonth() - birthDate.getMonth()
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--
                            }

                            // Auto-confirm age if user is 18+
                            if (age >= 18) {
                                setUserIsLegal(true)
                                setAgeConfirmed(true)
                            }
                        }

                        // Get language from profile (locale field)
                        if (data.locale) {
                            const userLang = data.locale
                            setLanguage(userLang)
                            await changeLanguage(userLang) // Update i18n
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error)
                }
            }

            setLoading(false)
        }

        checkUserAge()
    }, [isAuthenticated, user])

    const t = legalTranslations[language] || legalTranslations.fr

    const handleAccept = async () => {
        if (!ageConfirmed) {
            setError(t.errors?.mustConfirmAge || 'Vous devez confirmer votre âge')
            return
        }

        if (!consentGiven) {
            setError(t.errors?.mustAcceptConsent || 'Vous devez accepter les conditions')
            return
        }

        // Save language preference to backend if authenticated
        if (isAuthenticated && user) {
            try {
                await fetch('/api/account/language', {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ locale: language }),
                })
            } catch (error) {
                console.error('Error saving language preference:', error)
            }
        }

        // Mark that user has visited
        localStorage.setItem('hasVisitedBefore', 'true')

        onAccept({
            language,
            timestamp: Date.now()
        })
    }

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang)
        await changeLanguage(newLang)
    }

    const handleDeny = () => {
        onDeny()
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-700/50">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <img
                            src="/branding_logo.png"
                            alt="Terpologie"
                            className="h-16 w-16 object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t.welcome?.title || 'Bienvenue sur Terpologie'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t.welcome?.subtitle || 'Plateforme de reviews cannabis'}
                    </p>
                </div>

                {/* Language selector - prominent on first visit */}
                <div className={`mb-6 ${isFirstVisit ? ' border-2 /50 rounded-lg p-4' : ''}`}>
                    {isFirstVisit && (
                        <p className="text-sm mb-3 font-medium">
                            🌍 {t.welcome?.selectLanguage || 'Choisissez votre langue / Choose your language'}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.i18nCode)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${language === lang.i18nCode ? ' text-white border-2 ' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600' }`}
                            >
                                <span className="mr-2">{lang.flag}</span>
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RDR Warning */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p className="text-red-200 text-sm leading-relaxed">
                        <strong>⚠️ {t.rdr?.title || 'Avertissement RDR'}</strong><br />
                        {t.rdr?.warning || 'Ne consommez pas si vous êtes mineur, enceinte, ou si la loi locale l\'interdit. Ne conduisez pas après consommation. En cas de doute médical, consultez un professionnel.'}
                    </p>
                </div>

                {/* Age confirmation - only if not auto-confirmed */}
                {!userIsLegal && (
                    <div className="mb-6">
                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={ageConfirmed}
                                onChange={(e) => setAgeConfirmed(e.target.checked)}
                                className="mt-1 h-5 w-5 rounded border-gray-600 focus: focus:ring-offset-gray-900"
                            />
                            <span className="text-gray-300 text-sm group-hover:text-white transition">
                                {t.consent?.ageConfirm || 'Je confirme avoir 18 ans ou plus et être majeur dans mon pays de résidence.'}
                            </span>
                        </label>
                    </div>
                )}

                {/* User is legal (from profile) */}
                {userIsLegal && (
                    <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-3">
                        <p className="text-green-200 text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t.consent?.ageVerified || 'Âge vérifié via votre profil'}
                        </p>
                    </div>
                )}

                {/* Consent checkbox */}
                <div className="mb-6">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={consentGiven}
                            onChange={(e) => setConsentGiven(e.target.checked)}
                            className="mt-1 h-5 w-5 rounded border-gray-600 focus: focus:ring-offset-gray-900"
                        />
                        <span className="text-gray-300 text-sm group-hover:text-white transition">
                            {t.consent?.legalConsent || 'J\'ai lu et j\'accepte la charte légale et les règles de ce site.'}
                        </span>
                    </label>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDeny}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                        {t.actions?.deny || 'Refuser'}
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={!ageConfirmed || !consentGiven}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                        {t.actions?.continue || 'Continuer'}
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    {t.footer?.note || 'Cette confirmation est requise à chaque visite pour des raisons légales.'}
                </p>
            </div>
        </div>
    )
}

export default LegalWelcomeModal
