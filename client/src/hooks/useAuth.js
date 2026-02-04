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

                    // Charger les infos du compte (plus besoin de vérifier le type - c'est fait avant inscription)
                    const accountResponse = await fetch('/api/account/info', {
                        credentials: 'include',
                    })

                    if (accountResponse.ok) {
                        const accountData = await accountResponse.json()
                        setAccountInfo(accountData)
                    }
                    
                    // Le type de compte est maintenant choisi AVANT la création via /choose-account
                    // Plus besoin de needsAccountTypeSelection
                    setNeedsAccountTypeSelection(false)
                }
            }
        } catch (error) {
            console.error('Erreur chargement statut légal:', error)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated])

    // Charger les infos du compte
    const loadAccountInfo = useCallback(async () => {
        if (!isAuthenticated) return

        try {
            const response = await fetch('/api/account/info', {
                credentials: 'include',
            })

            if (response.ok) {
                const data = await response.json()
                setAccountInfo(data)
            }
        } catch (error) {
            console.error('Erreur chargement infos compte:', error)
        }
    }, [isAuthenticated])

    // Vérifier l'authentification et le statut légal au chargement
    useEffect(() => {
        const init = async () => {
            await checkAuth()
            await loadLegalStatus()
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Recharger le statut légal quand l'authentification change
    useEffect(() => {
        if (isAuthenticated) {
            loadLegalStatus()
        }
    }, [isAuthenticated, loadLegalStatus])

    // Callbacks pour les modales
    const handleAgeVerified = useCallback(async () => {
        setNeedsAgeVerification(false)
        setNeedsConsent(true)
        await loadLegalStatus()
    }, [loadLegalStatus])

    const handleConsentAccepted = useCallback(async () => {
        setNeedsConsent(false)
        await loadLegalStatus()
    }, [loadLegalStatus])

    const handleAccountTypeSelected = useCallback(async () => {
        setNeedsAccountTypeSelection(false)
        localStorage.setItem('accountTypeSelected', 'true')
        await loadAccountInfo()
    }, [loadAccountInfo])

    const handleConsentDeclined = useCallback(() => {
        window.location.href = '/legal-required'
    }, [])

    const handleAgeRejected = useCallback((message) => {
        window.location.href = `/underage?message=${encodeURIComponent(message)}`
    }, [])

    const loginWithDiscord = () => {
        authService.loginWithDiscord()
    }

    const loginWithGoogle = () => {
        window.location.href = '/api/auth/google'
    }

    const logout = useCallback(async () => {
        await storeLogout()
        localStorage.removeItem('accountTypeSelected')
        setLegalStatus(null)
        setAccountInfo(null)
        setNeedsAgeVerification(false)
        setNeedsConsent(false)
        setNeedsAccountTypeSelection(false)
    }, [storeLogout])

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
