import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'

/**
 * Modal de comparaison et upgrade d'abonnement
 * Affiche les 3 tiers avec features et prix
 * Ordre: Amateur | Producteur (centre, recommandé) | Influenceur
 */
export default function UpgradeModal({ isOpen, onClose }) {
    const { accountType } = useStore()
    const navigate = useNavigate()

    // Ordre: Amateur (gauche) - Producteur (centre, recommandé) - Influenceur (droite)
    const tiers = [
        {
            id: 'amateur',
            label: 'Amateur',
            emoji: '👤',
            price: '0',
            period: '/mois',
            color: 'from-slate-400 to-slate-500',
            textColor: 'text-slate-900',
            badgeColor: 'bg-slate-500',
            description: 'Gratuit - Idéal pour commencer',
            features: [
                { name: '5 exports/mois', included: true },
                { name: 'Templates prédéfinis', included: true },
                { name: 'Statistiques basiques', included: true },
                { name: 'Limite 10 reviews publiques', included: true },
                { name: 'Pas de drag-drop', included: false },
                { name: 'Export PNG/JPEG/PDF', included: true },
            ],
            cta: accountType === 'amateur' ? 'Vous êtes ici' : 'Rétrograder',
            ctaDisabled: accountType === 'amateur',
        },
        {
            id: 'producteur',
            label: 'Producteur',
            emoji: '🌾',
            price: '29,99',
            period: '/mois',
            color: 'from-blue-500 to-blue-600',
            textColor: 'text-white',
            badgeColor: 'bg-blue-600',
            description: 'Premium - Pour les producteurs',
            featured: true,
            features: [
                { name: 'Exports illimités', included: false },
                { name: 'Templates personnalisés', included: false },
                { name: 'Drag-drop editor', included: false },
                { name: 'Pipelines configurables', included: false },
                { name: 'Statistiques avancées', included: false },
                { name: 'Export CSV/JSON/SVG/HTML', included: false },
                { name: 'Filigranes personnalisés', included: false },
                { name: 'Généalogie cultivars (canvas)', included: false },
                { name: '300 dpi export', included: false },
                { name: 'Dashboard culture', included: false },
            ],
            cta: accountType === 'producteur' ? 'Vous êtes ici' : 'Upgrade vers Producteur',
            ctaDisabled: accountType === 'producteur',
        },
        {
            id: 'influenceur',
            label: 'Influenceur',
            emoji: '⭐',
            price: '15,99',
            period: '/mois',
            color: 'from-purple-500 to-purple-600',
            textColor: 'text-white',
            badgeColor: 'bg-purple-600',
            description: 'Premium - Pour les influenceurs',
            features: [
                { name: '50 exports/mois', included: false },
                { name: 'Prévisualisations détaillées', included: false },
                { name: 'Analytics d\'engagement', included: false },
                { name: 'Export haute qualité (300dpi)', included: false },
                { name: 'Export SVG/PDF', included: false },
                { name: 'Dashboard influenceur', included: false },
                { name: 'Statistiques sociales', included: false },
                { name: 'Accès prévisualisations premium', included: false },
                { name: 'Templates haute qualité', included: false },
                { name: 'Partage avancé', included: false },
            ],
            cta: accountType === 'influenceur' ? 'Vous êtes ici' : 'Upgrade vers Influenceur',
            ctaDisabled: accountType === 'influenceur',
        },
    ]

    const handleUpgrade = (tierId) => {
        if (tierId === 'amateur') return // Ne peut pas downgrader vers amateur
        // Naviguer vers la page de paiement avec le type sélectionné
        onClose()
        navigate(`/payment?type=${tierId}`)
    }

    if (!isOpen) return null

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 my-8 border border-gray-700 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 p-4 md:p-6 flex items-center justify-between z-10 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Choisir votre abonnement</h2>
                        <p className="text-gray-400 text-sm">Trouvez le plan qui vous convient</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className="p-4 md:p-8 flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {tiers.map((tier) => (
                            <div
                                key={tier.id}
                                className={`relative rounded-xl border-2 transition-all ${tier.featured
                                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20 lg:scale-105 order-first lg:order-none'
                                    : 'border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                {/* Featured badge */}
                                {tier.featured && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            ⭐ RECOMMANDÉ
                                        </span>
                                    </div>
                                )}

                                {/* Card content */}
                                <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-t-xl text-center`}>
                                    <div className="text-5xl mb-3">{tier.emoji}</div>
                                    <h3 className={`text-2xl font-bold ${tier.textColor} mb-2`}>{tier.label}</h3>
                                    <p className={`text-sm ${tier.textColor} opacity-90 mb-4`}>{tier.description}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-4xl font-bold ${tier.textColor}`}>{tier.price}€</span>
                                        <span className={`text-sm ${tier.textColor} opacity-75`}>{tier.period}</span>
                                    </div>
                                </div>

                                {/* Features list */}
                                <div className="bg-gray-800/50 p-6">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center gap-3 text-sm"
                                            >
                                                {feature.included ? (
                                                    <Check size={18} className="text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <X size={18} className="text-gray-600 flex-shrink-0" />
                                                )}
                                                <span
                                                    className={feature.included ? 'text-gray-200' : 'text-gray-500'}
                                                >
                                                    {feature.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <div className="p-4 md:p-6 border-t border-gray-700">
                                    <button
                                        onClick={() => {
                                            if (!tier.ctaDisabled) {
                                                handleUpgrade(tier.id)
                                            }
                                        }}
                                        disabled={tier.ctaDisabled}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${tier.ctaDisabled
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : `bg-gradient-to-r ${tier.color} ${tier.textColor} hover:shadow-lg transform hover:scale-105`
                                            }`}
                                    >
                                        {tier.cta}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-8 md:mt-12 bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">❓ Questions fréquentes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm md:text-base">Puis-je changer de plan ?</h4>
                                <p className="text-xs md:text-sm text-gray-400">Oui, vous pouvez changer d'abonnement n'importe quand. Les changements prennent effet immédiatement.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm md:text-base">Puis-je annuler ?</h4>
                                <p className="text-xs md:text-sm text-gray-400">Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre compte.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm md:text-base">Quel paiement acceptez-vous ?</h4>
                                <p className="text-xs md:text-sm text-gray-400">Nous acceptons les cartes de crédit via Stripe. Les paiements sont sécurisés et vérifiés.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm md:text-base">Besoin d'aide ?</h4>
                                <p className="text-xs md:text-sm text-gray-400">Contactez notre support : support@terpologie.eu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
