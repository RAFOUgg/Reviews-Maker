/**
 * Modal de sélection de compte utilisateur
 * Affichée après vérification d'âge lors de la première visite
 * Interface propre avec avatars, infos comptes et colorimétrie conforme
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const ACCOUNT_TIERS = [
    {
        id: 'beta_tester',
        label: 'Beta Testeur',
        icon: '🚀',
        description: 'Accès complet à toutes les fonctionnalités pendant la bêta',
        features: ['Créer des reviews', 'Exporter en HD/4K', 'Galerie privée', 'Analytics complets'],
        badge: 'Actif',
        badgeColor: '',
        disabled: false
    },
    {
        id: 'consumer',
        label: 'Consommateur',
        icon: '👥',
        description: 'Accès complet avec création et export de reviews',
        features: ['Créer des reviews', 'Exporter', 'Partager publiquement', 'Community'],
        badge: 'Disponible',
        badgeColor: 'bg-emerald-500',
        disabled: false
    },
    {
        id: 'influencer_pro',
        label: 'Influenceur',
        icon: '⭐',
        description: 'Branding personnel et outils pour créateurs de contenu',
        features: ['Marque personnelle', 'Analytics avancés', 'Outils pro', 'Support prioritaire'],
        badge: 'Disponible',
        badgeColor: 'bg-amber-500',
        disabled: false
    },
    {
        id: 'producer',
        label: 'Producteur',
        icon: '🏢',
        description: 'Compte professionnel pour producteurs et distributeurs',
        features: ['Gestion inventaire', 'Interactions B2B', 'Analytics avancés', 'Support dédié'],
        badge: 'Bientôt',
        badgeColor: '',
        disabled: true
    }
]

export default function AccountSelector({ onAccountSelected, isOpen = true }) {
    const navigate = useNavigate()
    const [selectedId, setSelectedId] = useState('consumer')
    const [loading, setLoading] = useState(false)
    const [avatar, setAvatar] = useState(null)

    useEffect(() => {
        // Charger l'avatar de l'utilisateur (fallback générique)
        const initials = (localStorage.getItem('userInitials') || 'US').substring(0, 2).toUpperCase()
        setAvatar(`https://ui-avatars.com/api/?name=${initials}&background=9333EA&color=fff&bold=true&size=128`)
    }, [])

    const handleSelectAccount = (accountId) => {
        if (ACCOUNT_TIERS.find(t => t.id === accountId)?.disabled) return
        setSelectedId(accountId)
    }

    const handleConfirm = async () => {
        setLoading(true)
        try {
            // Envoyer au backend pour sauvegarder le type de compte
            const response = await fetch('/api/account/change-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ newType: selectedId })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors du changement de type de compte')
            }

            const data = await response.json()
}
