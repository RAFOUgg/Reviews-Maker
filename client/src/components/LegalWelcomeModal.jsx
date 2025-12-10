import React, { useState, useEffect } from 'react'
import legalConfig from '../data/legalConfig.json'
import legalTranslations from '../i18n/legalWelcome.json'
import { useAuth } from '../hooks/useAuth'

const LegalWelcomeModal = ({ onAccept, onDeny }) => {
    const { user, isAuthenticated } = useAuth()
    const [selectedCountry, setSelectedCountry] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('')
    const [ageConfirmed, setAgeConfirmed] = useState(false)
    const [rulesAccepted, setRulesAccepted] = useState(false)
    const [privacyAccepted, setPrivacyAccepted] = useState(false)
    const [error, setError] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)

    // Initialize country and language
    useEffect(() => {
        const initPreferences = async () => {
            setLoading(true)

            if (isAuthenticated) {
                try {
                    const response = await fetch('/api/legal/user-preferences', {
                        credentials: 'include'
                    })
                    if (response.ok) {
                        const data = await response.json()
                        if (data.country && data.language) {
                            setSelectedCountry(data.country)
                            setSelectedLanguage(data.language)
                            setIsEditing(false)
                        } else {
                            setSelectedCountry(legalConfig.defaultCountry)
                            setSelectedLanguage(legalConfig.defaultLanguage)
                            setIsEditing(true)
                        }
                    } else {
                        setSelectedCountry(legalConfig.defaultCountry)
                        setSelectedLanguage(legalConfig.defaultLanguage)
                        setIsEditing(true)
                    }
                } catch (error) {
                    console.error('Error fetching user preferences:', error)
                    setSelectedCountry(legalConfig.defaultCountry)
                    setSelectedLanguage(legalConfig.defaultLanguage)
                    setIsEditing(true)
                }
            } else {
                setSelectedCountry(legalConfig.defaultCountry)
                setSelectedLanguage(legalConfig.defaultLanguage)
                setIsEditing(true)
            }

            setLoading(false)
        }

        initPreferences()
    }, [isAuthenticated])

    const t = legalTranslations[selectedLanguage] || legalTranslations[legalConfig.defaultLanguage]
    const countryData = legalConfig.countries[selectedCountry]
    const legalAge = countryData?.legalAge || 18
    const countryName = countryData?.name[selectedLanguage] || selectedCountry

    const handleContinue = async () => {
        setError('')

        if (!selectedCountry) {
            setError(t.errors.selectCountry)
            return
        }

        if (!selectedLanguage) {
            setError(t.errors.selectLanguage)
            return
        }

        if (!ageConfirmed || !rulesAccepted || !privacyAccepted) {
            setError(t.errors.mustAcceptAll)
            return
        }

        if (!countryData?.allowed) {
            setError(t.errors.accessDenied.replace('{country}', countryName))
            return
        }

        // Si l'utilisateur est connecté, sauvegarder les préférences sur le serveur
        if (isAuthenticated) {
            try {
                await fetch('/api/legal/update-preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        country: selectedCountry,
                        language: selectedLanguage
                    })
                })
            } catch (error) {
                console.error('Error saving preferences:', error)
                // Continue anyway, preferences will be stored locally
            }
        }

        // Store consent in localStorage
        const consent = {
            country: selectedCountry,
            language: selectedLanguage,
            ageConfirmed: true,
            rulesAccepted: true,
            privacyAccepted: true,
            timestamp: new Date().toISOString(),
            userId: user?.id || null
        }

        localStorage.setItem('terpologie_legal_consent', JSON.stringify(consent))
        onAccept(consent)
    }

    const handleQuit = () => {
        onDeny()
    }

    const handleModify = () => {
        setIsEditing(true)
    }

    const replaceVars = (text, vars) => {
        let result = text
        Object.keys(vars).forEach(key => {
            result = result.replace(`{${key}}`, vars[key])
        })
        return result
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto m-4 p-6 text-white">
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-purple-400 mb-2">
                        {t.welcome.title}
                    </h1>
                    <h2 className="text-xl text-purple-300/70">
                        {t.welcome.subtitle}
                    </h2>
                </div>

                {/* Country & Language Selection */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    {user && !isEditing ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-300/70 mb-1">
                                    {t.welcome.accountCountryLanguage}
                                </p>
                                <p className="text-lg font-semibold">
                                    {countryName} / {selectedLanguage.toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={handleModify}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors"
                            >
                                {t.welcome.modify}
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-purple-300/70 mb-3">
                                {t.welcome.selectCountryLanguage}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {t.welcome.country}
                                    </label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Object.keys(legalConfig.countries).map(code => (
                                            <option key={code} value={code}>
                                                {legalConfig.countries[code].name[selectedLanguage || 'fr']}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {t.welcome.language}
                                    </label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {legalConfig.supportedLanguages.map(lang => (
                                            <option key={lang} value={lang}>
                                                {lang.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Legal Age Confirmation */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-sm mb-3">
                        {replaceVars(t.welcome.legalAgeForCountry, { country: countryName, age: legalAge })}
                    </p>
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ageConfirmed}
                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                            className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-purple-500/30 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">
                            {replaceVars(t.welcome.confirmAge, { age: legalAge })}
                        </span>
                    </label>
                </div>

                {/* Risk Reduction */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                        {t.rdr.title}
                    </h3>
                    <p className="text-sm text-red-200/80">
                        {t.rdr.content}
                    </p>
                </div>

                {/* Analysis System */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        {t.analysis.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                        {t.analysis.content}
                    </p>
                </div>

                {/* Applicable Laws */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        {t.laws.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                        {replaceVars(t.laws.responsibility, { country: countryName })}
                    </p>
                    <p className="text-sm text-gray-300">
                        {replaceVars(t.laws.legalAge, { country: countryName, age: legalAge })}
                    </p>
                    {countryData?.regulations && (
                        <p className="text-xs text-purple-300/60 mt-2 italic">
                            {countryData.regulations[selectedLanguage]}
                        </p>
                    )}
                </div>

                {/* Essential Rules */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">
                        {t.rules.title}
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.localLaws}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.primaryUse}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.accuracy}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.minors}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.ip}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{t.rules.zeroTolerance}</span>
                        </li>
                    </ul>
                </div>

                {/* Consents */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">
                        {t.consent.title}
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={ageConfirmed}
                                onChange={(e) => setAgeConfirmed(e.target.checked)}
                                className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-purple-500/30 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm">
                                {replaceVars(t.consent.confirmLegalAge, { country: countryName })}
                            </span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rulesAccepted}
                                onChange={(e) => setRulesAccepted(e.target.checked)}
                                className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-purple-500/30 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm">
                                {t.consent.acceptRules}
                            </span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacyAccepted}
                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-purple-500/30 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm">
                                {t.consent.acceptPrivacy}{' '}
                                <a
                                    href="/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 underline"
                                >
                                    [{t.consent.viewPrivacy}]
                                </a>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {!user && (
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-md font-medium transition-colors"
                        >
                            {t.actions.login}
                        </button>
                    )}
                    <button
                        onClick={handleContinue}
                        disabled={!ageConfirmed || !rulesAccepted || !privacyAccepted}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-md font-medium transition-colors"
                    >
                        {t.actions.continue}
                    </button>
                    <button
                        onClick={handleQuit}
                        className="px-6 py-3 bg-red-900/50 hover:bg-red-900/70 rounded-md font-medium transition-colors"
                    >
                        {t.actions.quit}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LegalWelcomeModal
