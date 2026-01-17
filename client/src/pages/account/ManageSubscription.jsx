import React from 'react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Shield, Settings, AlertCircle, Check } from 'lucide-react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'

/**
 * ManageSubscription Page - Account Management
 * Gestion de l'abonnement, KYC, subscription status
 */
export default function ManageSubscription() {
    const { user, isAuthenticated } = useStore()
    const navigate = useNavigate()

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <LiquidCard className="max-w-md w-full">
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Authentification requise</h2>
                        <p className="text-gray-300 text-sm">Veuillez vous connecter pour accéder à cette page.</p>
                        <LiquidButton variant="primary" onClick={() => navigate('/login')} fullWidth>
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Gestion du Compte</h1>
                        <p className="text-gray-400">Gérez votre abonnement et vos préférences</p>
                    </div>

                    {/* Current Account Info */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-6 h-6 text-purple-400" />
                                Informations du Compte
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nom d'utilisateur</p>
                                    <p className="text-lg font-semibold text-white">{user.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-lg font-semibold text-white">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Type de Compte</p>
                                    <p className="text-lg font-semibold text-green-400">Amateur (Gratuit)</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Membre depuis</p>
                                    <p className="text-lg font-semibold text-white">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Upgrade Options */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-purple-400" />
                                Passer à un Compte Payant
                            </h2>
                            <p className="text-gray-400">Débloquez les fonctionnalités premium et les options d'export avancées</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/choose-account')}
                                    className="p-4 rounded-lg border-2 border-indigo-500/50 hover:border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all text-left"
                                >
                                    <h3 className="font-bold text-white mb-1">⭐ Influenceur (15,99€/mois)</h3>
                                    <p className="text-sm text-gray-400">Exports avancés et personnalisation</p>
                                </button>
                                <button
                                    onClick={() => navigate('/choose-account')}
                                    className="p-4 rounded-lg border-2 border-purple-500/50 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left"
                                >
                                    <h3 className="font-bold text-white mb-1">🌱 Producteur (29,99€/mois)</h3>
                                    <p className="text-sm text-gray-400">Toutes les fonctionnalités professionnelles</p>
                                </button>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Features Comparison */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-6 h-6 text-purple-400" />
                                Comparaison des Fonctionnalités
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-gray-300">Reviews créées</span>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Amateur</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Payant</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-gray-300">Exports PNG/JPEG/PDF</span>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Amateur</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Payant</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-gray-300">Exports SVG/CSV/JSON/HTML</span>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">✗ Amateur</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Payant</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-gray-300">Personnalisation avancée</span>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">✗ Amateur</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Payant</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-gray-300">PhenoHunt & Génétiques</span>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">✗ Amateur</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Producteurs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Settings Link */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-6 h-6 text-purple-400" />
                                Préférences
                            </h2>
                            <p className="text-gray-400">Gérez vos paramètres personnels, la langue et les notifications</p>
                            <LiquidButton
                                variant="primary"
                                onClick={() => navigate('/account')}
                                fullWidth
                            >
                                Aller aux Paramètres
                            </LiquidButton>
                        </div>
                    </LiquidCard>
                </div>
            </div>
        )
    }

    // Paid Account (Influencer/Producer): Show Account Management
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Gestion de l'Abonnement</h1>
                    <p className="text-gray-400">Gérez votre souscription et vos paramètres de compte</p>
                </div>

                {/* Account Status */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-purple-400" />
                            État du Compte
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Type de Compte</p>
                                <p className="text-xl font-bold text-indigo-400">
                                    {user.accountType === 'producer' ? '🌱 Producteur' : '⭐ Influenceur'}
                                </p>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Abonnement</p>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-400" />
                                    <p className="text-xl font-bold text-green-400">Actif</p>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vérification KYC</p>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-blue-400" />
                                    <p className="text-xl font-bold text-blue-400">Vérifiée</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Subscription Management */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            Gestion de l'Abonnement
                        </h2>
                        <div className="space-y-2 text-gray-400">
                            <p>Votre abonnement est actuellement <strong className="text-green-400">actif</strong></p>
                            <p>Cycle de facturation: Mensuel</p>
                        </div>
                        <div className="flex gap-3">
                            <LiquidButton variant="secondary" fullWidth>
                                Changer de Plan
                            </LiquidButton>
                            <LiquidButton variant="secondary" fullWidth>
                                Annuler l'Abonnement
                            </LiquidButton>
                        </div>
                    </div>
                </LiquidCard>

                {/* KYC Verification */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-green-400" />
                            Vérification KYC
                        </h2>
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 flex items-center gap-3">
                            <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-white">Vérifié</p>
                                <p className="text-sm text-gray-400">Votre identité a été confirmée avec succès</p>
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Settings */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Settings className="w-6 h-6 text-purple-400" />
                            Paramètres Personnels
                        </h2>
                        <p className="text-gray-400">Gérez vos préférences, la langue et les notifications</p>
                        <LiquidButton
                            variant="primary"
                            onClick={() => navigate('/account')}
                            fullWidth
                        >
                            Aller aux Paramètres
                        </LiquidButton>
                    </div>
                </LiquidCard>
            </div>
        </div>
    )
}
