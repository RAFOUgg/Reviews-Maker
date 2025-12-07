import React, { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'

export default function LoginPage() {
    const navigate = useNavigate()
    const preferred = useMemo(() => localStorage.getItem('preferredAccountType'), [])

    useEffect(() => {
        if (!preferred) {
            navigate('/choose-account')
        }
    }, [preferred, navigate])

    const handleProviderClick = (provider) => {
        const type = preferred || 'consumer'
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

    const label = preferred === 'influencer_basic'
        ? 'Influenceur Basic'
        : preferred === 'influencer_pro'
            ? 'Influenceur Pro'
            : preferred === 'producer'
                ? 'Producteur (désactivé)'
                : 'Consommateur'

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-3xl glass border border-dark-border/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <h1 className="text-2xl font-bold">Connexion</h1>
                    <p className="text-dark-muted text-sm">
                        Type de compte sélectionné : <span className="font-semibold text-dark-text">{label}</span>. Vous pouvez revenir en arrière pour changer.
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Choisissez un mode de connexion</h2>
                        <OAuthButtons
                            className="space-y-3"
                            onLoginStart={(provider) => handleProviderClick(provider)}
                        />
                    </div>

                    <div className="text-sm text-dark-muted border-t border-dark-border/40 pt-4">
                        <p>En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.</p>
                        <p className="mt-2 text-xs">Changer de type de compte ? <button className="text-violet-600 hover:underline" onClick={() => navigate('/choose-account')}>Retourner au choix</button></p>
                        <p className="mt-1 text-xs">Besoin d'aide ? <button className="text-violet-600 hover:underline" onClick={() => navigate('/')}>Retour accueil</button></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
