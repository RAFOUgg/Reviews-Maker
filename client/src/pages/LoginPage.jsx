import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../components/auth/OAuthButtons'
import AgeVerificationModal from '../components/auth/AgeVerificationModal'
import LiquidButton from '../components/LiquidButton'
import LiquidInput from '../components/LiquidInput'
import LiquidCard from '../components/LiquidCard'
import { authService } from '../services/apiService'
import { useStore } from '../store/useStore'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

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
        influencer_basic: 'Influenceur Basic',
        influencer_pro: 'Influenceur',
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

            <div className="min-h-screen flex items-center justify-center px-4 py-10">
                <LiquidCard className="w-full max-w-4xl" padding="lg" hover={false}>
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                                Connexion {accountTypeLabels[selectedType] || 'Amateur'}
                            </h1>
                            <p className="text-[var(--text-secondary)] text-lg">
                                {selectedType === 'consumer' && 'Créez et gérez vos reviews personnelles'}
                                {(selectedType === 'influencer_basic' || selectedType === 'influencer_pro') && 'Exports avancés et partage optimisé'}
                                {selectedType === 'producer' && 'Traçabilité complète et exports professionnels'}
                            </p>
                            <button
                                onClick={() => navigate('/choose-account')}
                                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-smooth inline-flex items-center gap-1"
                            >
                                Changer de plan <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex gap-2 liquid-glass rounded-xl p-1.5">
                            <button
                                type="button"
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-smooth ${mode === 'login'
                                        ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg'
                                        : 'text-[var(--text-secondary)] hover:bg-white/10'
                                    }`}
                                onClick={() => setMode('login')}
                            >
                                Connexion
                            </button>
                            <button
                                type="button"
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-smooth ${mode === 'signup'
                                        ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg'
                                        : 'text-[var(--text-secondary)] hover:bg-white/10'
                                    }`}
                                onClick={() => setMode('signup')}
                            >
                                Créer un compte
                            </button>
                        </div>

                        {/* Email/Password Form */}
                        <form className="space-y-4" onSubmit={handleSubmitEmail}>
                            {mode === 'signup' && (
                                <LiquidInput
                                    label="Pseudo"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Votre pseudo"
                                    icon={User}
                                />
                            )}

                            <LiquidInput
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vous@example.com"
                                icon={Mail}
                                required
                            />

                            <LiquidInput
                                label="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                                hint={mode === 'signup' ? 'Minimum 8 caractères' : undefined}
                            />

                            {error && (
                                <div className="liquid-glass border-2 border-red-500/50 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span>
                                    <span className="text-red-500">{error}</span>
                                </div>
                            )}

                            <LiquidButton
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={loading}
                                icon={ArrowRight}
                                iconPosition="right"
                            >
                                {mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
                            </LiquidButton>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-primary)]"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 liquid-glass text-sm font-medium">
                                    Ou continuez avec
                                </span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <OAuthButtons
                            onLoginStart={(provider) => handleProviderClick(provider)}
                        />

                        {/* Footer */}
                        <div className="text-sm text-[var(--text-tertiary)] text-center space-y-2 pt-4 border-t border-[var(--border-primary)]">
                            <p className="text-xs">
                                En continuant, vous confirmez avoir l'âge légal et accepter la vérification RDR après connexion.
                            </p>
                            <p className="text-xs">
                                Besoin d'aide ?
                                <button
                                    className="text-[var(--accent-primary)] hover:underline font-medium ml-1 transition-smooth"
                                    onClick={() => navigate('/')}
                                >
                                    Retour accueil
                                </button>
                            </p>
                        </div>
                    </div>
                </LiquidCard>
            </div>
        </>
    )
}
