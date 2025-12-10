/**
 * Modal de sélection de compte utilisateur
 * Affichée après vérification d'âge lors de la première visite
 * Interface propre avec avatars, infos comptes et colorimétrie conforme
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const ACCOUNT_TIERS = [
    {
        id: 'beta_tester',
        label: 'Beta Testeur',
        icon: '🚀',
        description: 'Accès complet à toutes les fonctionnalités pendant la bêta',
        features: ['Créer des reviews', 'Exporter en HD/4K', 'Galerie privée', 'Analytics complets'],
        badge: 'Actif',
        badgeColor: 'bg-violet-500',
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
        id: 'influencer_basic',
        label: 'Influenceur',
        icon: '⭐',
        description: 'Branding personnel et outils pour créateurs de contenu',
        features: ['Marque personnelle', 'Analytics avancés', 'Outils pro', 'Support prioritaire'],
        badge: 'Bientôt',
        badgeColor: 'bg-amber-500',
        disabled: true
    },
    {
        id: 'producer',
        label: 'Producteur',
        icon: '🏢',
        description: 'Compte professionnel pour producteurs et distributeurs',
        features: ['Gestion inventaire', 'Interactions B2B', 'Analytics avancés', 'Support dédié'],
        badge: 'Premium',
        badgeColor: 'bg-rose-500',
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
            localStorage.setItem('preferredAccountType', selectedId)
            localStorage.setItem('accountTypeSelected', 'true')

            if (onAccountSelected) {
                onAccountSelected(selectedId)
            }

            // Redirection vers home ou retour au flow
            setTimeout(() => navigate('/'), 500)
        } catch (err) {
            console.error('Erreur sélection compte:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const selectedTier = ACCOUNT_TIERS.find(t => t.id === selectedId)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-10 space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Bienvenue sur Orchard Studio
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                        Choisissez votre profil pour accéder à des fonctionnalités adaptées à vos besoins
                    </p>
                </div>

                {/* Avatar + Greeting */}
                <div className="flex justify-center mb-12">
                    <div className="relative">
                        <img
                            src={avatar}
                            alt="Profil"
                            className="w-20 h-20 rounded-full border-4 border-violet-500 shadow-lg"
                        />
                        <div className="absolute bottom-0 right-0 bg-emerald-500 w-6 h-6 rounded-full border-2 border-white"></div>
                    </div>
                </div>

                {/* Grille de sélection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {ACCOUNT_TIERS.map((tier) => {
                        const isSelected = selectedId === tier.id
                        const isDisabled = tier.disabled

                        return (
                            <button
                                key={tier.id}
                                onClick={() => handleSelectAccount(tier.id)}
                                disabled={isDisabled}
                                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isDisabled
                                        ? 'opacity-50 cursor-not-allowed border-gray-600 bg-gray-900'
                                        : isSelected
                                            ? 'border-violet-500 bg-gradient-to-br from-violet-950 to-violet-900 shadow-lg shadow-violet-500/50'
                                            : 'border-gray-600 bg-gray-900/50 hover:border-violet-400'
                                    }`}
                            >
                                {/* Badge */}
                                <div className="absolute -top-3 -right-3">
                                    <span className={`${tier.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
                                        {tier.badge}
                                    </span>
                                </div>

                                {/* Checkmark */}
                                {isSelected && !isDisabled && (
                                    <div className="absolute -top-3 -left-3 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                        ✓
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="text-5xl mb-3">{tier.icon}</div>

                                {/* Label */}
                                <h3 className="text-xl font-bold text-white mb-2">{tier.label}</h3>

                                {/* Description */}
                                <p className="text-sm text-gray-300 mb-4 min-h-[2.5rem]">{tier.description}</p>

                                {/* Features */}
                                <ul className="space-y-2 text-xs text-gray-400">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-violet-400 mt-1">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        )
                    })}
                </div>

                {/* Selection Details */}
                <div className="bg-gradient-to-r from-violet-950 to-violet-900 rounded-2xl p-6 border border-violet-500/30 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl">{selectedTier?.icon}</div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">{selectedTier?.label}</h3>
                            <p className="text-gray-300 mb-4">{selectedTier?.description}</p>
                            <p className="text-sm text-gray-400">
                                Vous pouvez changer votre type de compte à tout moment dans les paramètres
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold hover:bg-gray-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold hover:from-violet-700 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        {loading ? 'Chargement...' : `Continuer en tant que ${selectedTier?.label}`}
                    </button>
                </div>

                {/* Footer Info */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    En continuant, vous acceptez nos{' '}
                    <button className="text-violet-400 hover:underline">Conditions d'utilisation</button>
                    {' '}et notre{' '}
                    <button className="text-violet-400 hover:underline">Politique de confidentialité</button>
                </p>
            </div>
        </div>
    )
}
