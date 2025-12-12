import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'
import AgeVerificationModal from '../components/auth/AgeVerificationModal'
import { authService } from '../services/apiService'
import { useStore } from '../store/useStore'

export default function LoginPage() {
    const navigate = useNavigate()
    const setUser = useStore((state) => state.setUser)
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'consumer', [])
    const [selectedType, setSelectedType] = useState(initial)
    const [mode, setMode] = useState('login') // login | signup
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showAgeVerification, setShowAgeVerification] = useState(false)
    const [tempUser, setTempUser] = useState(null)

    useEffect(() => {
        const preferred = localStorage.getItem('preferredAccountType')
        if (!preferred) {
            navigate('/choose-account', { replace: true })
        }
    }, [navigate])

    const accountTypeLabels = {
        consumer: 'Amateur',
        influencer: 'Influenceur',
        producer: 'Producteur',
    }

    const handleProviderClick = (provider) => {
        const type = selectedType || 'consumer'
        localStorage.setItem('preferredAccountType', type)
        localStorage.setItem('accountTypeSelected', 'true')

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
                payload.accountType = selectedType || 'consumer'
                localStorage.setItem('preferredAccountType', selectedType || 'consumer')
                localStorage.setItem('accountTypeSelected', 'true')

                const user = await authService.signupWithEmail(payload)

                // Après inscription, afficher le modal de vérification d'âge
                setTempUser(user)
                setUser(user)
                setShowAgeVerification(true)
                return
            }

            const user = await authService.loginWithEmail(payload)
            setUser(user)

            // Vérifier si l'utilisateur a déjà validé son âge
            if (!user.legalAge) {
                setTempUser(user)
                setShowAgeVerification(true)
            } else {
                navigate('/')
            }
        } catch (err) {
            setError(err.message || 'Connexion impossible')
        } finally {
            setLoading(false)
        }
    }

    const handleAgeVerified = (data) => {
        // Rediriger vers l'accueil après vérification
        navigate('/')
    }

    return (
        <>
            <AgeVerificationModal
                isOpen={showAgeVerification}
                onClose={() => setShowAgeVerification(false)}
                onVerified={handleAgeVerified}
            />

            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 text-gray-900 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-4xl glass rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-8 md:p-10 space-y-7">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                                Connexion {accountTypeLabels[selectedType] || 'Amateur'}
                            </h1>
                            <p className="text-white/90 text-sm md:text-base drop-shadow">
                                {selectedType === 'consumer' && 'Créez et gérez vos reviews personnelles'}
                                {selectedType === 'influencer' && 'Exports avancés et partage optimisé'}
                                {selectedType === 'producer' && 'Traçabilité complète et exports professionnels'}
                            </p>
                            <button
                                onClick={() => navigate('/choose-account')}
                                className="text-sm text-white/80 hover:text-white underline"
                            >
                                Changer de plan →
                            </button>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg border-2 border-white/50 rounded-2xl p-5 space-y-4 shadow-xl">
                            <div className="flex gap-2 text-sm font-semibold bg-gray-100 rounded-xl p-1.5 shadow-inner">
                                <button
                                    type="button"
                                    className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 ${mode === 'login' ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-900 hover:bg-white hover:shadow-md'}`}
                                    onClick={() => setMode('login')}
                                >
                                    Connexion
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 ${mode === 'signup' ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-900 hover:bg-white hover:shadow-md'}`}
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
                                <div className="w-full border-t-2 border-white/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 text-white font-semibold">Ou continuez avec</span>
                            </div>
                        </div>

                        <OAuthButtons
                            onLoginStart={(provider) => handleProviderClick(provider)}
                        />

                        <div className="text-sm text-white/90 border-t-2 border-white/30 pt-5 space-y-2">
                            <p className="text-center text-xs">En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.</p>
                            <p className="text-center text-xs">Besoin d'aide ? <button className="text-emerald-300 hover:text-emerald-200 hover:underline font-bold transition-colors" onClick={() => navigate('/')}>Retour accueil</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
