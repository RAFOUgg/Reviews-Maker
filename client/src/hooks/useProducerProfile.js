import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

/**
 * Récupère le profil producteur de l'utilisateur connecté (nom d'entreprise, SIRET, statut).
 * Ne fait la requête que pour les comptes producteur.
 */
export function useProducerProfile() {
    const { accountType } = useStore()
    const [producerProfile, setProducerProfile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (accountType !== 'producer' && accountType !== 'producteur') {
            setProducerProfile(null)
            return
        }

        setLoading(true)
        fetch('/api/account/producer-profile', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setProducerProfile(data))
            .catch(() => setProducerProfile(null))
            .finally(() => setLoading(false))
    }, [accountType])

    return { producerProfile, loading }
}

export default useProducerProfile
