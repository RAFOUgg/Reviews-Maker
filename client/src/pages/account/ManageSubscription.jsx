import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function ManageSubscription() {
    const navigate = useNavigate()
    const { user } = useStore()
    const [loading, setLoading] = useState(false)
    const [subscriptionData, setSubscriptionData] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
        // Fetch subscription data
        fetchSubscriptionData()
    }, [user, navigate])

    const fetchSubscriptionData = async () => {
        try {
            const res = await fetch('/api/account/subscription', {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setSubscriptionData(data)
            }
        } catch (error) {
            console.error('Error fetching subscription:', error)
        }
    }

    const handleUpgrade = async (planType) => {
        setLoading(true)
        try {
            const res = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType })
            })
            const { sessionId } = await res.json()
            // Redirect to Stripe checkout (simplified)
            window.location.href = `/checkout?session=${sessionId}`
        } catch (error) {
            console.error('Error creating checkout:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAccountTypeBadge = (type) => {
        const typeMap = {
            'amateur': { emoji: '👤', label: 'Amateur', color: 'gray' },
            'producteur': { emoji: '🌱', label: 'Producteur', color: 'green' },
            'influenceur': { emoji: '⭐', label: 'Influenceur', color: 'yellow' },
            'admin': { emoji: '👑', label: 'Admin', color: 'purple' }
        }
        return typeMap[type?.toLowerCase()] || typeMap['amateur']
    }

    const currentType = getAccountTypeBadge(user?.accountType)

    const plans = [
        {
            type: 'amateur',
            title: 'Amateur',
            emoji: '👤',
            price: 'Gratuit',
            pricePeriod: 'toujours',
            features: [
                '✅ Création de reviews',
                '✅ Templates standards (3)',
                '✅ Export PNG/JPEG/PDF',
                '✅ Export qualité standard',
                '❌ Export haute qualité',
                '❌ Traçabilité complète (PipeLine)',
                '❌ Système de génétique',
                '❌ Templates personnalisés'
            ],
            disabled: user?.accountType?.toLowerCase() === 'amateur'
        },
        {
            type: 'producteur',
            title: 'Producteur',
            emoji: '🌱',
            price: '29.99',
            pricePeriod: 'mois',
            features: [
                '✅ Tout d\'Amateur +',
                '✅ Traçabilité PipeLine complète',
                '✅ Système généalogique (génétiques)',
                '✅ Templates personnalisés (drag & drop)',
                '✅ Export haute qualité (300 DPI)',
                '✅ Export SVG/CSV/JSON/HTML',
                '✅ Limite exports: Illimitée',
                '✅ Support prioritaire'
            ],
            popular: true
        },
        {
            type: 'influenceur',
            title: 'Influenceur',
            emoji: '⭐',
            price: '15.99',
            pricePeriod: 'mois',
            features: [
                '✅ Aperçu détaillé avec rendu',
                '✅ Système drag & drop',
                '✅ Export haute qualité',
                '✅ Export PNG/JPEG/SVG/PDF',
                '✅ Limite exports: 50/mois',
                '✅ Filigrane personnalisé',
                '❌ PipeLine complète',
                '❌ Système généalogique'
            ],
            disabled: user?.accountType?.toLowerCase() === 'influenceur'
        }
    ]

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <button
                        onClick={() => navigate('/account')}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        ← Retour aux paramètres
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        💳 Gestion d'abonnement
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Votre compte actuel: <span className="font-bold text-indigo-400">{currentType.emoji} {currentType.label}</span>
                    </p>
                </div>

                {/* Current Subscription Info */}
                {user?.accountType?.toLowerCase() !== 'amateur' && (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-12 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">✅ Abonnement actif</h2>
                                <p className="text-green-100 mb-4">
                                    Vous avez accès à toutes les fonctionnalités du plan {currentType.label}.
                                </p>
                                <button
                                    onClick={() => {
                                        // TODO: Implement cancel subscription
                                        alert('Fonctionnalité en développement')
                                    }}
                                    className="px-4 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Gérer mon abonnement
                                </button>
                            </div>
                            <div className="text-6xl">{currentType.emoji}</div>
                        </div>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.type}
                            className={`rounded-xl overflow-hidden shadow-lg transition-all ${
                                plan.disabled
                                    ? 'bg-gray-700 border-2 border-indigo-500'
                                    : plan.popular
                                    ? 'bg-white dark:bg-gray-800 border-2 border-indigo-500 transform md:scale-105'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500'
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && !plan.disabled && (
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center py-2 text-sm font-bold">
                                    ⭐ PLAN RECOMMANDÉ
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {plan.disabled && (
                                <div className="bg-indigo-600 text-white text-center py-2 text-sm font-bold">
                                    ✅ VOTRE PLAN ACTUEL
                                </div>
                            )}

                            {/* Plan Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">{plan.emoji}</span>
                                    <h3 className={`text-2xl font-bold ${plan.disabled ? 'text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                        {plan.title}
                                    </h3>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-bold ${plan.disabled ? 'text-gray-400' : 'text-indigo-600'}`}>
                                            {plan.price}
                                        </span>
                                        {plan.price !== 'Gratuit' && (
                                            <span className={plan.disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}>
                                                €/{plan.pricePeriod}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-6 space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <p
                                            key={idx}
                                            className={`text-sm ${
                                                plan.disabled
                                                    ? 'text-gray-500'
                                                    : feature.startsWith('✅')
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                        >
                                            {feature}
                                        </p>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                {!plan.disabled && (
                                    <button
                                        onClick={() => handleUpgrade(plan.type)}
                                        disabled={loading}
                                        className={`w-full py-3 px-4 font-semibold rounded-lg transition-all ${
                                            plan.popular
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? '⏳ Chargement...' : 'Sélectionner'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">❓ Questions fréquentes</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                Puis-je changer de plan ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Oui ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prendront effet immédiatement.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                Comment fonctionnent les remboursements ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Les remboursements sont disponibles dans les 30 jours suivant votre achat. Contactez notre support pour plus de détails.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                Qu'est-ce qui est inclus dans chaque plan ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Consultez la comparaison détaillée ci-dessus. Chaque plan offre des fonctionnalités adaptées à votre type d'utilisation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
