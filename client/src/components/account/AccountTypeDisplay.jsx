import React from 'react'
import { useStore } from '../../store/useStore'
import { getAccountTypeLabel, getAccountTypeColor, getAccountTypeEmoji } from '../../hooks/useAccountFeatures'
import { paymentService, accountService } from '../../services/apiService'

/**
 * Composant pour afficher le type de compte actuel
 * Affiche: Type, badge couleur, prix, statut
 */
export default function AccountTypeDisplay({ onUpgradeClick }) {
    const { accountType, user } = useStore()
    const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin')

    // État réel de l'abonnement, calculé côté serveur (services/access.js). Le tier gratuit n'a
    // par définition aucun abonnement : parler d'« actif » ou d'« inactif » n'y a pas de sens.
    const subscriptionActive = Boolean(user?.access?.subscriptionActive)
    const isFreePlan = !['producer', 'influencer'].includes(user?.access?.accountType || accountType)

    const getSubscriptionInfo = () => {
        // Normalize incoming accountType (backend uses English keys)
        const normalize = (t) => {
            if (!t) return 'consumer'
            const m = {
                amateur: 'consumer',
                consumer: 'consumer',
                producteur: 'producer',
                producer: 'producer',
                influenceur: 'influencer',
                influencer: 'influencer',
                admin: 'admin'
            }
            return m[String(t).toLowerCase()] || String(t).toLowerCase()
        }

        const info = {
            consumer: {
                label: 'Amateur',
                emoji: '👤',
                price: '0€',
                period: '/mois',
                color: 'from-slate-400 to-slate-500',
                textColor: 'text-slate-900',
                description: 'Compte gratuit avec fonctionnalités limitées',
                benefits: [
                    '✓ 5 exports/mois',
                    '✓ Templates prédéfinis',
                    '✓ Statistiques basiques',
                ]
            },
            producer: {
                label: 'Producteur',
                emoji: '🌾',
                price: '29,99€',
                period: '/mois',
                color: 'from-blue-500 to-blue-600',
                textColor: 'text-white',
                description: 'Pour les producteurs professionnels',
                benefits: [
                    '✓ Exports illimités',
                    '✓ Templates personnalisés',
                    '✓ Pipelines configurables',
                    '✓ Export CSV/JSON/SVG',
                    '✓ Statistiques avancées',
                    '✓ Drag-drop editor',
                ]
            },
            influencer: {
                label: 'Influenceur',
                emoji: '⭐',
                price: '15,99€',
                period: '/mois',
                color: 'from-purple-500 to-purple-600',
                textColor: 'text-white',
                description: 'Pour les influenceurs et reviewers',
                benefits: [
                    '✓ Exports haute qualité (300dpi)',
                    '✓ Prévisualisations détaillées',
                    '✓ Analytics d\'engagement',
                    '✓ Export SVG',
                ]
            },
            admin: {
                label: 'Administrateur',
                emoji: '👨‍💼',
                price: 'N/A',
                period: '',
                color: 'from-red-500 to-red-600',
                textColor: 'text-white',
                description: 'Accès administrateur complet',
                benefits: [
                    '✓ Accès panel admin',
                    '✓ Gestion utilisateurs',
                    '✓ Modération contenu',
                ]
            }
        }

        const key = normalize(accountType)
        return info[key] || info.consumer
    }

    const info = getSubscriptionInfo()

    return (
        <div className="space-y-4">
            {/* Header avec type et prix */}
            <div className={`bg-gradient-to-r ${info.color} ${info.textColor} rounded-lg p-6 shadow-lg`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{info.emoji}</span>
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                {info.label}
                                {isAdmin && (
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/30 border border-red-400/50">
                                        🛡️ Admin
                                    </span>
                                )}
                            </h3>
                            <p className="opacity-90 text-sm">{info.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{info.price}</div>
                        <div className="text-sm opacity-90">{info.period}</div>
                    </div>
                </div>

                {/* Statut réel. Cette ligne affichait « Abonnement actif » en dur, y compris sur un
                    compte gratuit qui n'a aucun abonnement. */}
                <div className="flex items-center gap-2 pt-4 border-t border-opacity-20 border-current">
                    {isFreePlan ? (
                        <>
                            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                            <span className="text-sm font-medium opacity-80">Aucun abonnement</span>
                        </>
                    ) : subscriptionActive ? (
                        <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Abonnement actif</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <span className="text-sm font-medium">Abonnement inactif</span>
                        </>
                    )}
                </div>
            </div>

            {/* Bénéfices */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Fonctionnalités incluses:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {info.benefits.map((benefit, idx) => (
                        <div key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legacy direct checkout buttons removed: use the 'Modifier le plan' action instead */}

            {/* Legacy subscription action block removed — use Actions panel on Account page */}
        </div>
    )
}
