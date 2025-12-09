import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'
import { authService } from '../services/apiService'
import { useStore } from '../store/useStore'

const ACCOUNT_CHOICES = [
    { id: 'beta_tester', label: 'Beta testeur', desc: 'Accès complet pendant la bêta', disabled: false },
    { id: 'consumer', label: 'Consommateur', desc: 'Accès complet, création et export (bientôt)', disabled: true },
    { id: 'influencer_basic', label: 'Influenceur Basic', desc: 'Branding personnel Orchard (bientôt)', disabled: true },
    { id: 'influencer_pro', label: 'Influenceur Pro', desc: 'Fonctions pro avancées (bientôt)', disabled: true },
    { id: 'producer', label: 'Producteur', desc: 'Compte pro bientôt disponible (achat désactivé)', disabled: true },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const setUser = useStore((state) => state.setUser)
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'beta_tester', [])
    const [selectedType, setSelectedType] = useState(initial)
    const [mode, setMode] = useState('login') // login | signup
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const preferred = localStorage.getItem('preferredAccountType')
        if (!preferred) {
            navigate('/choose-account', { replace: true })
        }
    }, [navigate])

    const handleProviderClick = (provider) => {
        const type = selectedType || 'consumer'
        localStorage.setItem('preferredAccountType', type)
        if (type === 'consumer' || type === 'beta_tester') {
            localStorage.setItem('accountTypeSelected', 'true')
        } else {
            localStorage.removeItem('accountTypeSelected')
        }

        const targets = {
            discord: '/api/auth/discord',
            google: '/api/auth/google',
            apple: '/api/auth/apple',
            facebook: '/api/auth/facebook',
            amazon: '/api/auth/amazon',
        }

        if (targets[provider]) {
            window.location.href = targets[provider]
        }
    }

    const handleSubmitEmail = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const payload = {
                email,
                password,
            }

            if (mode === 'signup') {
                payload.username = username || email.split('@')[0]
                payload.accountType = selectedType
                localStorage.setItem('preferredAccountType', selectedType)
                if (selectedType === 'consumer' || selectedType === 'beta_tester') {
                    localStorage.setItem('accountTypeSelected', 'true')
                } else {
                    localStorage.removeItem('accountTypeSelected')
                }
                const user = await authService.signupWithEmail(payload)
                setUser(user)
                navigate('/')
                return
            }

            const user = await authService.loginWithEmail(payload)
            setUser(user)
            navigate('/')
        } catch (err) {
            setError(err.message || 'Connexion impossible')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl glass border border-dark-border/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <h1 className="text-2xl font-bold">Connexion</h1>
                    <p className="text-dark-muted text-sm">
                        Choisissez votre type de compte puis connectez-vous avec email ou via OAuth.
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

                    <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-4 space-y-4">
                        <div className="flex gap-2 text-sm font-semibold">
                            <button
                                type="button"
                                className={`px-3 py-2 rounded-lg ${mode === 'login' ? 'bg-violet-600 text-white' : 'bg-dark-bg border border-dark-border text-dark-text'}`}
                                onClick={() => setMode('login')}
                            >
                                Connexion email
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-2 rounded-lg ${mode === 'signup' ? 'bg-violet-600 text-white' : 'bg-dark-bg border border-dark-border text-dark-text'}`}
                                onClick={() => setMode('signup')}
                            >
                                Créer un compte
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={handleSubmitEmail}>
                            {mode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold">Pseudo</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Votre pseudo"
                                        className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2"
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="vous@example.com"
                                    className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary"
                            >
                                {loading ? 'Patientez...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Ou utilisez un fournisseur social</h2>
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
