import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OAuthButtons from '../../components/account/OAuthButtons'
import AgeVerification from '../../components/legal/AgeVerification'
import { LiquidCard, LiquidButton, LiquidInput } from '@/components/ui/LiquidUI'
import { authService } from '../../services/apiService'
import { useStore } from '../../store/useStore'
import { Mail, Lock, ArrowRight, LogIn, UserPlus, Home, AlertTriangle } from 'lucide-react'

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
                if (user.accountType === 'influenceur' || user.accountType === 'producteur') {
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
            // Gérer les différents types d'erreurs avec des messages adaptés
            if (err.code === 'user_not_found') {
                setError('Aucun compte trouvé avec cet email. Créez un compte pour commencer.')
            } else if (err.code === 'oauth_account') {
                setError(err.message || 'Ce compte utilise une connexion OAuth. Utilisez le bouton correspondant.')
            } else if (err.code === 'invalid_credentials') {
                setError('Mot de passe incorrect')
            } else {
                setError(err.message || 'Connexion impossible')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAgeVerified = () => {
        navigate('/')
    }

    return (
        <>
            <AgeVerification
                isOpen={showAgeVerification}
                onVerified={handleAgeVerified}
                onReject={() => setShowAgeVerification(false)}
            />

            <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8 space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl mb-4">
                            <LogIn className="w-10 h-10 text-purple-400" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                            Connexion
                        </h1>
                        <p className="text-white/60 text-lg">
                            Accédez à votre espace personnel
                        </p>
                    </div>

                    {/* Carte principale */}
                    <LiquidCard glow="purple" padding="lg" className="mb-6">
                        {/* OAuth Buttons - Redirect to account choice first */}
                        <div className="space-y-3 mb-6">
                            <div className="text-center">
                                <LiquidButton
                                    onClick={() => navigate('/choose-account')}
                                    variant="secondary"
                                    size="lg"
                                    className="w-full"
                                    glow="purple"
                                >
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Créer un compte
                                </LiquidButton>
                                <p className="text-white/50 text-sm mt-2">
                                    Choisissez votre type de compte avant de vous connecter
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 text-sm font-medium text-white/40 bg-[#0d0d1a]">
                                    Ou par email
                                </span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form className="space-y-5" onSubmit={handleSubmitEmail}>
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
                            />

                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <span className="text-red-400 text-sm">{error}</span>
                                </div>
                            )}

                            <LiquidButton
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={loading}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="w-full"
                            >
                                Se connecter
                            </LiquidButton>
                        </form>

                        {/* 🔧 DEV Quick Login Button */}
                        {import.meta.env.DEV && (
                            <div className="pt-4 mt-4 border-t border-white/10">
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
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white rounded-xl font-semibold text-sm hover:from-purple-500 hover:to-pink-500 transition-all border border-purple-500/30"
                                >
                                    🚀 Dev Quick Login (test@example.com)
                                </button>
                            </div>
                        )}

                        {/* Mot de passe oublié */}
                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    </LiquidCard>

                    {/* Bouton créer un compte */}
                    <LiquidCard
                        glow="cyan"
                        padding="none"
                        onClick={() => navigate('/choose-account')}
                        className="cursor-pointer group"
                    >
                        <div className="p-5 flex items-center justify-center gap-3">
                            <UserPlus className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                            <span className="text-lg font-semibold text-white group-hover:text-cyan-100 transition-colors">
                                Créer un compte
                            </span>
                        </div>
                    </LiquidCard>

                    {/* Footer */}
                    <div className="text-center mt-8 space-y-3">
                        <p className="text-sm text-white/50">
                            En continuant, vous acceptez nos{' '}
                            <button
                                onClick={() => navigate('/cgu')}
                                className="text-purple-400 hover:text-purple-300 underline transition-colors"
                            >
                                CGU
                            </button>
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                            <Home size={16} />
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
