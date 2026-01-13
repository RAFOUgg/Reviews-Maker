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
}

export default LegalWelcomeModal
