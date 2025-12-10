import React, { useState, useEffect } from 'react'
import LegalWelcomeModal from './LegalWelcomeModal'
import { useLegalConsent } from '../hooks/useLegalConsent'

/**
 * Wrapper qui affiche la modal de consentement légal si nécessaire
 * Bloque l'accès à l'application jusqu'à acceptation
 */
const LegalConsentGate = ({ children }) => {
    const { hasConsent, isLoading, giveConsent } = useLegalConsent()
    const [showModal, setShowModal] = useState(false)
    const [accessGranted, setAccessGranted] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            if (hasConsent) {
                setAccessGranted(true)
                setShowModal(false)
            } else {
                setShowModal(true)
                setAccessGranted(false)
            }
        }
    }, [hasConsent, isLoading])

    const handleAccept = (consentInfo) => {
        const success = giveConsent(consentInfo)
        if (success) {
            setShowModal(false)
            setAccessGranted(true)
        }
    }

    const handleDeny = () => {
        // Rediriger vers une page de refus ou afficher un message
        window.location.href = 'about:blank'
    }

    // Afficher un loader pendant la vérification initiale
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement...</p>
                </div>
            </div>
        )
    }

    // Afficher la modal si pas de consentement
    if (showModal && !accessGranted) {
        return <LegalWelcomeModal onAccept={handleAccept} onDeny={handleDeny} />
    }

    // Afficher l'application si consentement validé
    return accessGranted ? children : null
}

export default LegalConsentGate
