import React from 'react'
import { useStore } from '../../store/useStore'
import { LiquidCard, LiquidBadge } from '@/components/ui/LiquidUI'

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
                glow: 'none',
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
                glow: 'cyan',
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
                glow: 'purple',
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
                glow: 'amber',
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
            <LiquidCard glow={info.glow} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-4xl shrink-0">{info.emoji}</span>
                        <div className="min-w-0">
                            <h3 className="text-2xl font-bold flex flex-wrap items-center gap-2 text-white">
                                {info.label}
                                {isAdmin && (
                                    <LiquidBadge variant="danger" size="sm">🛡️ Admin</LiquidBadge>
                                )}
                            </h3>
                            <p className="text-white/50 text-sm">{info.description}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-3xl font-bold text-white">{info.price}</div>
                        <div className="text-sm text-white/50">{info.period}</div>
                    </div>
                </div>

                {/* Statut réel. Cette ligne affichait « Abonnement actif » en dur, y compris sur un
                    compte gratuit qui n'a aucun abonnement. */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    {isFreePlan ? (
                        <>
                            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                            <span className="text-sm font-medium text-white/60">Aucun abonnement</span>
                        </>
                    ) : subscriptionActive ? (
                        <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-white">Abonnement actif</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <span className="text-sm font-medium text-white">Abonnement inactif</span>
                        </>
                    )}
                </div>
            </LiquidCard>

            {/* Bénéfices */}
            <LiquidCard glow="none" padding="md">
                <h4 className="font-semibold mb-3 text-white">Fonctionnalités incluses :</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {info.benefits.map((benefit, idx) => (
                        <div key={idx} className="text-sm text-white/60 flex items-center gap-2">
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>
            </LiquidCard>
        </div>
    )
}
