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
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 text-gray-900 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl glass rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-8 md:p-10 space-y-7">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Connexion</h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Choisissez votre type de compte puis connectez-vous
                        </p>
                    </div>

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
                                    className={`text-left p-4 rounded-xl border-2 transition-all duration-300 ${choice.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-violet-500 hover:shadow-lg hover:scale-[1.02]'} ${isSelected ? 'border-violet-600 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md' : 'border-gray-300 bg-white'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                {choice.label}
                                                {isSelected && <span className="text-violet-600">✓</span>}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{choice.desc}</div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex gap-2 text-sm font-semibold bg-white rounded-xl p-1.5 shadow-inner">
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 ${mode === 'login' ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setMode('login')}
                            >
                                Connexion
                            </button>
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 ${mode === 'signup' ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setMode('signup')}
                            >
                                Créer un compte
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={handleSubmitEmail}>
                            {mode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-900">Pseudo</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Votre pseudo"
                                        className="input-light w-full rounded-lg px-3 py-2.5 text-gray-900"
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-900">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="vous@example.com"
                                    className="input-light w-full rounded-lg px-3 py-2.5 text-gray-900"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-900">Mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="input-light w-full rounded-lg px-3 py-2.5 text-gray-900"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-800 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 flex items-center gap-2 animate-slide-down">
                                    <span className="text-lg">⚠️</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-4 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? '⏳ Patientez...' : mode === 'signup' ? '🚀 Créer mon compte' : '🔐 Se connecter'}
                            </button>
                        </form>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-600 font-semibold">Ou continuez avec</span>
                        </div>
                    </div>

                    <OAuthButtons
                        onLoginStart={(provider) => handleProviderClick(provider)}
                    />

                    <div className="text-sm text-gray-600 border-t-2 border-gray-200 pt-5 space-y-2">
                        <p className="text-center text-xs">En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.</p>
                        <p className="text-center text-xs">Besoin d'aide ? <button className="text-violet-600 hover:text-purple-700 hover:underline font-bold transition-colors" onClick={() => navigate('/')}>Retour accueil</button></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
