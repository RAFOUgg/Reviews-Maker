import { useState, useCallback } from 'react'

/**
 * Hook pour gérer le consentement légal (popup à chaque visite)
 * Ne stocke RIEN en localStorage - popup s'affiche à chaque chargement de page
 */
export const useLegalConsent = () => {
    const [hasConsent, setHasConsent] = useState(false)
    const [consentData, setConsentData] = useState(null)

    const giveConsent = useCallback((consentInfo) => {
        try {
            const consent = {
                ...consentInfo,
                timestamp: new Date().toISOString()
            }
            setHasConsent(true)
            setConsentData(consent)
            return true
        } catch (error) {
            console.error('Error saving legal consent:', error)
            return false
        }
    }, [])

    const revokeConsent = useCallback(() => {
        setHasConsent(false)
        setConsentData(null)
        return true
    }, [])

    return {
        hasConsent,
        consentData,
        isLoading: false,
        giveConsent,
        revokeConsent
    }
}
