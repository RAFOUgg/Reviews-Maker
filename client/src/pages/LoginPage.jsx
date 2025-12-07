import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'

const ACCOUNT_CHOICES = [
    { id: 'consumer', label: 'Consommateur', desc: 'Accès complet, création et export', disabled: false },
    { id: 'influencer_basic', label: 'Influenceur Basic', desc: 'Branding personnel Orchard (bientôt)', disabled: false },
    { id: 'influencer_pro', label: 'Influenceur Pro', desc: 'Fonctions pro avancées (bientôt)', disabled: false },
    { id: 'producer', label: 'Producteur', desc: 'Compte pro bientôt disponible', disabled: true },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const preferred = useMemo(() => localStorage.getItem('preferredAccountType') || 'consumer', [])
    const [selectedType, setSelectedType] = useState(preferred)

    const handleProviderClick = (provider) => {
        localStorage.setItem('preferredAccountType', selectedType)
        if (selectedType === 'consumer') {
            // Le plan consommateur donne accès complet, on peut sauter la modale de choix
            localStorage.setItem('accountTypeSelected', 'true')
        } else {
            localStorage.removeItem('accountTypeSelected')
        }
        // Laisser la sélection de type se finaliser après onboarding; on redirige juste
        if (provider === 'discord') {
            window.location.href = '/api/auth/discord'
        } else if (provider === 'google') {
            window.location.href = '/api/auth/google'
        }
    }

    const handleTypeCardClick = (id, disabled) => {
        if (disabled) return
        setSelectedType(id)
    }

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-5xl glass border border-dark-border/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: account types */}
                    <div className="p-8 bg-gradient-to-br from-violet-600/10 to-emerald-500/10 border-r border-dark-border/40">
                        <h1 className="text-2xl font-bold mb-2">Choisissez votre type de compte</h1>
                        <p className="text-dark-muted mb-6 text-sm">Le type "Consommateur" donne accès à tout le site. Les autres plans seront activés plus tard.</p>

                        <div className="space-y-3">
                            {ACCOUNT_CHOICES.map((choice) => {
                                const isSelected = selectedType === choice.id
                                return (
                                    <button
                                        key={choice.id}
                                        type="button"
                                        onClick={() => handleTypeCardClick(choice.id, choice.disabled)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${choice.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-violet-500'} ${isSelected ? 'border-violet-600 bg-violet-600/10' : 'border-dark-border/60'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">{choice.label}</div>
                                                <div className="text-sm text-dark-muted">{choice.desc}</div>
                                            </div>
                                            {isSelected && (
                                                <span className="text-sm text-violet-600 font-semibold">Sélectionné</span>
                                            )}
                                        </div>
                                        {choice.disabled && (
                                            <div className="mt-2 text-xs text-dark-muted">Arrive bientôt. Achat désactivé pour le MVP.</div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: login methods */}
                    <div className="p-8 space-y-6">
                        <h2 className="text-xl font-semibold">Mode de connexion</h2>
                        <p className="text-dark-muted text-sm">Connectez-vous avec Discord ou Google. Nous appliquerons votre type de compte juste après l'onboarding.</p>

                        <OAuthButtons
                            className="space-y-3"
                            onLoginStart={(provider) => handleProviderClick(provider)}
                        />

                        <div className="text-sm text-dark-muted border-t border-dark-border/40 pt-4">
                            <p>En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.</p>
                            <p className="mt-2 text-xs">Besoin d'aide ? <button className="text-violet-600 hover:underline" onClick={() => navigate('/')}>Retour accueil</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
