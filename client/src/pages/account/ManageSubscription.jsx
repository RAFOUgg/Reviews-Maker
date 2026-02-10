import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ManageSubscription() {
    const navigate = useNavigate()

    // Redirige vers l'onglet abonnement de la page compte
    useEffect(() => {
        navigate('/account?tab=subscription', { replace: true })
    }, [navigate])

    return null
}
