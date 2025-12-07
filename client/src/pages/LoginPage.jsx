import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'

const ACCOUNT_CHOICES = [
    { id: 'consumer', label: 'Consommateur', desc: 'Accès complet, création et export', disabled: false },
    { id: 'influencer_basic', label: 'Influenceur Basic', desc: 'Branding personnel Orchard (bientôt)', disabled: false },
    { id: 'influencer_pro', label: 'Influenceur Pro', desc: 'Fonctions pro avancées (bientôt)', disabled: false },
    { id: 'producer', label: 'Producteur', desc: 'Compte pro bientôt disponible (achat désactivé)', disabled: true },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'consumer', [])
    const [selectedType, setSelectedType] = useState(initial)

    const handleProviderClick = (provider) => {
        const type = selectedType || 'consumer'
        localStorage.setItem('preferredAccountType', type)
        if (type === 'consumer') {
            localStorage.setItem('accountTypeSelected', 'true')
        } else {
            localStorage.removeItem('accountTypeSelected')
        }

        if (provider === 'discord') {
            window.location.href = '/api/auth/discord'
        } else if (provider === 'google') {
            window.location.href = '/api/auth/google'
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl glass border border-dark-border/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <h1 className="text-2xl font-bold">Connexion</h1>
                    <p className="text-dark-muted text-sm">
                        Choisissez votre type de compte puis le fournisseur de connexion.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ACCOUNT_CHOICES.map((choice) => {
                            const isSelected = selectedType === choice.id
                            return (
                                <button
                                    key={choice.id}
                                    type="button"
                                    onClick={() => {
                                        if (!choice.disabled) {
                                            setSelectedType(choice.id)
                                        }
                                    }}
                                    className={`text-left p-4 rounded-xl border transition-all ${choice.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-violet-500'} ${isSelected ? 'border-violet-600 bg-violet-600/10' : 'border-dark-border/60'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">{choice.label}</div>
                                            <div className="text-sm text-dark-muted">{choice.desc}</div>
                                        </div>
                                        {isSelected ? <span className="text-sm text-violet-600 font-semibold">Sélectionné</span> : null}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Choisissez un mode de connexion</h2>
                        <OAuthButtons
                            className="space-y-3"
                            onLoginStart={(provider) => handleProviderClick(provider)}
                        />
                    </div>

                    <div className="text-sm text-dark-muted border-t border-dark-border/40 pt-4">
                        <p>En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.</p>
                        <p className="mt-2 text-xs">Besoin d'aide ? <button className="text-violet-600 hover:underline" onClick={() => navigate('/')}>Retour accueil</button></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
