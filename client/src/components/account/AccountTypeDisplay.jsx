import React from 'react'
import { useStore } from '../../store/useStore'
import { getAccountTypeLabel, getAccountTypeColor, getAccountTypeEmoji } from '../../hooks/useAccountFeatures'
import { paymentService, accountService } from '../../services/apiService'

/**
 * Composant pour afficher le type de compte actuel
 * Affiche: Type, badge couleur, prix, statut
 */
export default function AccountTypeDisplay({ onUpgradeClick }) {
    const { accountType } = useStore()

    const getSubscriptionInfo = () => {
        const info = {
            amateur: {
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
            producteur: {
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
            influenceur: {
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
        return info[accountType] || info.amateur
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
                            <h3 className="text-2xl font-bold">{info.label}</h3>
                            <p className="opacity-90 text-sm">{info.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{info.price}</div>
                        <div className="text-sm opacity-90">{info.period}</div>
                    </div>
                </div>

                {/* Statut */}
                <div className="flex items-center gap-2 pt-4 border-t border-opacity-20 border-current">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Abonnement actif</span>
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

            {/* Info pour tiers payants */}
            {(accountType === 'producteur' || accountType === 'influenceur') && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                        📅 Votre renouvellement: <span className="font-semibold">15 février 2026</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                // downgrade to influenceur or amateur
                                const target = accountType === 'producteur' ? 'influenceur' : 'amateur'
                                if (!window.confirm(`Confirmer le changement de formule vers ${target} ?`)) return
                                try {
                                    await accountService.changeType(target)
                                    alert('Formule modifiée. Rechargez la page pour voir le changement.')
                                    window.location.reload()
                                } catch (err) {
                                    console.error(err)
                                    alert('Erreur lors du changement de formule')
                                }
                            }}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10"
                        >
                            {accountType === 'producteur' ? '⬇️ Passer à Influenceur' : '⬇️ Rétrograder en Amateur'}
                        </button>

                        <button
                            onClick={async () => {
                                if (!window.confirm('Confirmer la résiliation de votre abonnement ?')) return
                                try {
                                    const res = await paymentService.cancel()
                                    alert(res?.message || 'Abonnement résilié')
                                    window.location.reload()
                                } catch (err) {
                                    console.error(err)
                                    alert('Erreur lors de la résiliation')
                                }
                            }}
                            className="text-sm font-medium text-red-400 bg-white/5 px-3 py-2 rounded-lg hover:bg-red-900/10"
                        >
                            ❌ Résilier l'abonnement
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            if (typeof onUpgradeClick === 'function') {
                                onUpgradeClick()
                                return
                            }
                            window.location.href = '/account/manage'
                        }}
                        className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                        Gérer mon abonnement →
                    </button>
                </div>
            )}
        </div>
    )
}
