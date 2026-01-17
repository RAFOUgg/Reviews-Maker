import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../../components/account/OAuthButtons'
import AgeVerificationModal from '../../components/legal/AgeVerificationModal'
import LiquidButton from '../../components/ui/LiquidButton'
import LiquidInput from '../../components/ui/LiquidInput'
import { authService } from '../../services/apiService'
import { useStore } from '../../store/useStore'
import { Mail, Lock, ArrowRight, LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const setUser = useStore((state) => state.setUser)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showAgeVerification, setShowAgeVerification] = useState(false)

    const handleSubmitEmail = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const user = await authService.loginWithEmail({ email, password })
            setUser(user)

            // Vérifier si l'utilisateur a déjà validé son âge ET accepté le disclaimer
            if (!user.legalAge || !user.consentRDR) {
                setShowAgeVerification(true)
            } else {
                // Redirection selon type de compte
                if (user.accountType === 'influencer' || user.accountType === 'producer') {
                    if (user.subscriptionStatus !== 'active' || user.kycStatus !== 'verified') {
                        navigate('/account')
                    } else {
                        navigate('/')
                    }
                } else {
                    navigate('/')
                }
            }
        } catch (err) {
            setError(err.message || 'Connexion impossible')
        } finally {
            setLoading(false)
        }
    }

    const handleAgeVerified = () => {
        navigate('/')
    }

    return (
        <>
            <AgeVerificationModal
                isOpen={showAgeVerification}
                onClose={() => setShowAgeVerification(false)}
                onVerified={handleAgeVerified}
            />

            <div className="min-h-screen bg-gradient-to-br text-white flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8 space-y-4 animate-fade-in">
                        <div className="inline-block p-4 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl mb-4">
                            <LogIn className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl">
                            Connexion
                        </h1>
                        <p className="text-xl text-white font-light drop-shadow-lg">
                            Accédez à votre espace personnel
                        </p>
                    </div>

                    {/* Carte principale */}
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-6">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/90"></div>

                        {/* Liquid glass effect */}
                        <div className="absolute inset-0 backdrop-blur-xl"></div>

                        {/* Contenu */}
                        <div className="relative p-8 space-y-6">
                            {/* OAuth Buttons */}
                            <div className="space-y-3">
                                <OAuthButtons />
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 text-sm font-semibold text-gray-600 bg-white">
                                        Ou par email
                                    </span>
                                </div>
                            </div>

                            {/* Email/Password Form */}
                            <form className="space-y-4" onSubmit={handleSubmitEmail}>
                                <LiquidInput
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@example.com"
                                    icon={Mail}
                                    required
                                    className="text-black"
                                />

                                <LiquidInput
                                    label="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={Lock}
                                    required
                                    className="text-black"
                                />

                                {error && (
                                    <div className="border-2 border-red-500 bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <span className="text-red-600 text-sm font-medium">{error}</span>
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
                                    Se connecter
                                </LiquidButton>
                            </form>

                            {/* 🔧 DEV Quick Login Button */}
                            {import.meta.env.DEV && (
                                <div className="pt-2 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/auth/dev/quick-login', {
                                                    method: 'POST',
                                                    credentials: 'include'
                                                })
                                                if (res.ok) {
                                                    const data = await res.json()
                                                    setUser(data.user)
                                                    navigate('/')
                                                } else {
                                                    setError('Quick login failed')
                                                }
                                            } catch (e) {
                                                setError(e.message)
                                            }
                                        }}
                                        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition"
                                    >
                                        🚀 Dev Quick Login (test@example.com)
                                    </button>
                                </div>
                            )}

                            {/* Mot de passe oublié */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bouton créer un compte */}
                    <button
                        type="button"
                        onClick={() => navigate('/choose-account')}
                        className="w-full relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 group"
                    >
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>

                        {/* Liquid glass effect */}
                        <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>

                        {/* Contenu */}
                        <div className="relative p-6 flex items-center justify-center gap-3">
                            <UserPlus className="w-6 h-6 text-white" strokeWidth={2.5} />
                            <span className="text-xl font-black text-white drop-shadow-lg">
                                Créer un compte
                            </span>
                        </div>
                    </button>

                    {/* Footer */}
                    <div className="text-center mt-6 space-y-2">
                        <p className="text-sm text-white/90 font-light">
                            En continuant, vous acceptez nos{' '}
                            <button
                                onClick={() => navigate('/cgu')}
                                className="underline hover:text-white font-medium transition-colors"
                            >
                                CGU
                            </button>
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-white/80 hover:text-white font-medium transition-colors"
                        >
                            ← Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
