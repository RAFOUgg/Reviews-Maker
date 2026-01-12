import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { authService } from '../services/apiService'

export function useAuth() {
    const { user, isAuthenticated, checkAuth, logout: storeLogout } = useStore()
    const [legalStatus, setLegalStatus] = useState(null)
    const [accountInfo, setAccountInfo] = useState(null)
    const [needsAgeVerification, setNeedsAgeVerification] = useState(false)
    const [needsConsent, setNeedsConsent] = useState(false)
    const [needsAccountTypeSelection, setNeedsAccountTypeSelection] = useState(false)
    const [loading, setLoading] = useState(true)

    // Charger le statut légal
    const loadLegalStatus = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/legal/status', {
                credentials: 'include',
            })

            if (response.ok) {
                const data = await response.json()
                setLegalStatus(data)

                // Vérifier les étapes à compléter
                // Note: traiter null comme false pour forcer le workflow légal
                if (!data.legalAge || data.legalAge === null) {
                    setNeedsAgeVerification(true)
                    setNeedsConsent(false)
                    setNeedsAccountTypeSelection(false)
                } else if (!data.consentRDR || data.consentRDR === null) {
                    setNeedsAgeVerification(false)
                    setNeedsConsent(true)
                    setNeedsAccountTypeSelection(false)
                } else {
                    setNeedsAgeVerification(false)
                    setNeedsConsent(false)

                    // Vérifier le type de compte
                    const accountResponse = await fetch('/api/account/info', {
                        credentials: 'include',
                    })

                    if (accountResponse.ok) {
                        const accountData = await accountResponse.json()
                        setAccountInfo(accountData)

                        // Si nouveau utilisateur consumer, proposer sélection
                        const isNewUser = accountData.accountType === 'consumer'
                            && !localStorage.getItem('accountTypeSelected')
                        setNeedsAccountTypeSelection(isNewUser)
                    }
                }
            }
        } catch (error) {
    return {
        user,
        isAuthenticated,
        loading,
        legalStatus,
        accountInfo,
        needsAgeVerification,
        needsConsent,
        needsAccountTypeSelection,
        handleAgeVerified,
        handleConsentAccepted,
        handleAccountTypeSelected,
        handleConsentDeclined,
        handleAgeRejected,
        loginWithDiscord,
        loginWithGoogle,
        logout,
        checkAuth,
        refreshLegalStatus: loadLegalStatus,
        refreshAccountInfo: loadAccountInfo,
    }
}
