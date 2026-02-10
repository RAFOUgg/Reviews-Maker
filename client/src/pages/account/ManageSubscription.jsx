import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ManageSubscription() {
  const navigate = useNavigate()

  // Redirige vers l'onglet abonnement de la page compte
  useEffect(() => {
    navigate('/account?tab=subscription', { replace: true })
  }, [navigate])

  return null
}

/**
 * ManageSubscription Page - Account Management
 * Gestion de l'abonnement, KYC, subscription status
 */
export default function ManageSubscription() {
    const { user, isAuthenticated } = useStore()
    const navigate = useNavigate()

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center p-4">
                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>
                <LiquidCard glow="blue" padding="lg" className="max-w-md w-full relative z-10">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Authentification requise</h2>
                        <p className="text-white/50 text-sm">Veuillez vous connecter pour accéder à cette page.</p>
                        <LiquidButton variant="primary" glow="purple" onClick={() => navigate('/login')} fullWidth>
                            Aller à la connexion
                        </LiquidButton>
                    </div>
                </LiquidCard>
            </div>
        )
    }

    // Consumer: Show Basic Setup
    if (user.accountType === 'consumer' || user.accountType === 'amateur') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] py-12 px-4">
                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-2">Gestion du Compte</h1>
                        <p className="text-white/50">Gérez votre abonnement et vos préférences</p>
                    </div>

                    {/* Current Account Info */}
                    <LiquidCard glow="purple" padding="lg">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                            <Shield className="w-6 h-6 text-purple-400" />
                            Informations du Compte
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Nom d'utilisateur</p>
                                <p className="text-lg font-semibold text-white">{user.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
                                <p className="text-lg font-semibold text-white">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Type de Compte</p>
                                <LiquidBadge variant="success" size="lg">Amateur (Gratuit)</LiquidBadge>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Membre depuis</p>
                                <p className="text-lg font-semibold text-white">
                                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Upgrade Options */}
                    <LiquidCard glow="default" padding="lg">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            Passer à un Compte Payant
                        </h2>
                        <p className="text-white/50 mb-4">Débloquez les fonctionnalités premium et les options d'export avancées</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LiquidCard
                                glow="blue"
                                padding="md"
                                className="cursor-pointer hover:scale-[1.02] transition-transform"
                                onClick={() => navigate('/choose-account')}
                            >
                                <h3 className="font-bold text-white mb-1">⭐ Influenceur (15,99€/mois)</h3>
                                <p className="text-sm text-white/50">Exports avancés et personnalisation</p>
                            </LiquidCard>
                            <LiquidCard
                                glow="purple"
                                padding="md"
                                className="cursor-pointer hover:scale-[1.02] transition-transform"
                                onClick={() => navigate('/choose-account')}
                            >
                                <h3 className="font-bold text-white mb-1">🌱 Producteur (29,99€/mois)</h3>
                                <p className="text-sm text-white/50">Toutes les fonctionnalités professionnelles</p>
                            </LiquidCard>
                        </div>
                    </LiquidCard>

                    {/* Features Comparison */}
                    <LiquidCard glow="default" padding="lg">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                            <Settings className="w-6 h-6 text-purple-400" />
                            Comparaison des Fonctionnalités
                        </h2>
                        <div className="space-y-3">
                            {[
                                { name: 'Reviews créées', amateur: true, paid: true },
                                { name: 'Exports PNG/JPEG/PDF', amateur: true, paid: true },
                                { name: 'Exports SVG/CSV/JSON/HTML', amateur: false, paid: true },
                                { name: 'Personnalisation avancée', amateur: false, paid: true },
                                { name: 'PhenoHunt & Génétiques', amateur: false, paid: 'Producteurs' }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                    <span className="text-white/70">{feature.name}</span>
                                    <div className="flex gap-2">
                                        <LiquidBadge variant={feature.amateur ? 'success' : 'error'} size="sm">
                                            {feature.amateur ? '✓' : '✗'} Amateur
                                        </LiquidBadge>
                                        <LiquidBadge variant="success" size="sm">
                                            ✓ {typeof feature.paid === 'string' ? feature.paid : 'Payant'}
                                        </LiquidBadge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidCard>

                    {/* Settings Link */}
                    <LiquidCard glow="default" padding="lg">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                            <Settings className="w-6 h-6 text-purple-400" />
                            Préférences
                        </h2>
                        <p className="text-white/50 mb-4">Gérez vos paramètres personnels, la langue et les notifications</p>
                        <LiquidButton
                            variant="primary"
                            glow="purple"
                            onClick={() => navigate('/account')}
                            fullWidth
                        >
                            Aller aux Paramètres
                        </LiquidButton>
                    </LiquidCard>
                </div>
            </div>
        )
    }

    // Paid Account (Influencer/Producer): Show Account Management
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] py-12 px-4">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-2">Gestion de l'Abonnement</h1>
                    <p className="text-white/50">Gérez votre souscription et vos paramètres de compte</p>
                </div>

                {/* Account Status */}
                <LiquidCard glow="purple" padding="lg">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                        <Shield className="w-6 h-6 text-purple-400" />
                        État du Compte
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Type de Compte</p>
                            <p className="text-xl font-bold text-indigo-400">
                                {user.accountType === 'producer' ? '🌱 Producteur' : '⭐ Influenceur'}
                            </p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Abonnement</p>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-400" />
                                <p className="text-xl font-bold text-green-400">Actif</p>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Vérification KYC</p>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-blue-400" />
                                <p className="text-xl font-bold text-blue-400">Vérifiée</p>
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Subscription Management */}
                <LiquidCard glow="default" padding="lg">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                        Gestion de l'Abonnement
                    </h2>
                    <div className="space-y-2 text-white/50 mb-4">
                        <p>Votre abonnement est actuellement <strong className="text-green-400">actif</strong></p>
                        <p>Cycle de facturation: Mensuel</p>
                    </div>
                    <div className="flex gap-3">
                        <LiquidButton variant="secondary" fullWidth>
                            Changer de Plan
                        </LiquidButton>
                        <LiquidButton variant="outline" glow="red" fullWidth>
                            Annuler l'Abonnement
                        </LiquidButton>
                    </div>
                </LiquidCard>

                {/* KYC Verification */}
                <LiquidCard glow="green" padding="lg">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                        <Shield className="w-6 h-6 text-green-400" />
                        Vérification KYC
                    </h2>
                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center gap-3">
                        <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white">Vérifié</p>
                            <p className="text-sm text-white/50">Votre identité a été confirmée avec succès</p>
                        </div>
                    </div>
                </LiquidCard>

                {/* Settings */}
                <LiquidCard glow="default" padding="lg">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                        <Settings className="w-6 h-6 text-purple-400" />
                        Paramètres Personnels
                    </h2>
                    <p className="text-white/50 mb-4">Gérez vos préférences, la langue et les notifications</p>
                    <LiquidButton
                        variant="primary"
                        glow="purple"
                        onClick={() => navigate('/account')}
                        fullWidth
                    >
                        Aller aux Paramètres
                    </LiquidButton>
                </LiquidCard>
            </div>
        </div>
    )
}
