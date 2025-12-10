import { useState, useEffect, useCallback } from 'react'

const CONSENT_KEY = 'terpologie_legal_consent'
const CONSENT_VALIDITY_DAYS = 30 // Revalider tous les 30 jours

/**
 * Hook pour gérer le consentement légal
 * @returns {Object} État du consentement et fonctions de gestion
 */
export const useLegalConsent = () => {
    const [hasConsent, setHasConsent] = useState(false)
    const [consentData, setConsentData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkConsent = useCallback(() => {
        setIsLoading(true)
        try {
            const stored = localStorage.getItem(CONSENT_KEY)
            if (!stored) {
                setHasConsent(false)
                setConsentData(null)
                setIsLoading(false)
                return
            }

            const consent = JSON.parse(stored)

            // Vérifier la validité temporelle
            const consentDate = new Date(consent.timestamp)
            const now = new Date()
            const daysSinceConsent = Math.floor((now - consentDate) / (1000 * 60 * 60 * 24))

            if (daysSinceConsent > CONSENT_VALIDITY_DAYS) {
                // Consentement expiré
                localStorage.removeItem(CONSENT_KEY)
                setHasConsent(false)
                setConsentData(null)
                setIsLoading(false)
                return
            }

            // Vérifier que tous les champs requis sont présents
            if (
                consent.ageConfirmed &&
                consent.rulesAccepted &&
                consent.privacyAccepted &&
                consent.country &&
                consent.language
            ) {
                setHasConsent(true)
                setConsentData(consent)
            } else {
                // Consentement incomplet
                localStorage.removeItem(CONSENT_KEY)
                setHasConsent(false)
                setConsentData(null)
            }
        } catch (error) {
            console.error('Error checking legal consent:', error)
            localStorage.removeItem(CONSENT_KEY)
            setHasConsent(false)
            setConsentData(null)
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        checkConsent()
    }, [checkConsent])

    const giveConsent = (consentInfo) => {
        try {
            const consent = {
                ...consentInfo,
                timestamp: new Date().toISOString()
            }
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
            setHasConsent(true)
            setConsentData(consent)
            return true
        } catch (error) {
            console.error('Error saving legal consent:', error)
            return false
        }
    }

    const revokeConsent = () => {
        try {
            localStorage.removeItem(CONSENT_KEY)
            setHasConsent(false)
            setConsentData(null)
            return true
        } catch (error) {
            console.error('Error revoking legal consent:', error)
            return false
        }
    }

    const updateConsentCountry = (country, language) => {
        if (!consentData) return false

        try {
            const updatedConsent = {
                ...consentData,
                country,
                language,
                timestamp: new Date().toISOString()
            }
            localStorage.setItem(CONSENT_KEY, JSON.stringify(updatedConsent))
            setConsentData(updatedConsent)
            return true
        } catch (error) {
            console.error('Error updating consent country:', error)
            return false
        }
    }

    return {
        hasConsent,
        consentData,
        isLoading,
        checkConsent,
        giveConsent,
        revokeConsent,
        updateConsentCountry
    }
}
