/**
 * SubscriptionTab - Subscription and plan management
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI'
import { CreditCard, Sparkles, Crown, Building2, Check } from 'lucide-react'
import SubscriptionManager from '../../../components/account/SubscriptionManager'

const SubscriptionTab = ({ user }) => {
    const accountType = user?.accountType || 'Amateur'
    const subscriptionType = user?.subscriptionType || 'free'

    const plans = {
        free: {
            name: 'Amateur',
            price: 'Gratuit',
            glow: 'green',
            icon: Sparkles,
            features: ['Accès basique', 'Export PNG/JPEG', '3 reviews/mois']
        },
        influencer_basic: {
            name: 'Influenceur Basic',
            price: '15.99€/mois',
            glow: 'cyan',
            icon: Crown,
            features: ['Templates avancés', 'Export HD', 'Reviews illimités']
        },
        influencer_pro: {
            name: 'Influenceur Pro',
            price: '19.99€/mois',
            glow: 'purple',
            icon: Crown,
            features: ['Tout Basic +', 'Templates personnalisés', 'Support prioritaire']
        },
        producer: {
            name: 'Producteur',
            price: '29.99€/mois',
            glow: 'amber',
            icon: Building2,
            features: ['Toutes fonctionnalités', 'PipeLines Culture', 'Export CSV/JSON']
        }
    }

    const currentPlan = plans[subscriptionType] || plans.free

    return (
        <div className="space-y-6">
            {/* Current Subscription */}
            <LiquidCard glow={currentPlan.glow} padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5" />
                    Abonnement Actuel
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-white">{currentPlan.name}</p>
                        <p className="text-lg text-white/70 mt-1">{currentPlan.price}</p>
                    </div>
                    <LiquidBadge variant="success" size="lg">
                        Actif
                    </LiquidBadge>
                </div>
            </LiquidCard>

            {/* Available Plans */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Plans Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(plans).map(([key, plan]) => {
                        const Icon = plan.icon
                        const isCurrent = subscriptionType === key
                        return (
                            <LiquidCard
                                key={key}
                                glow={isCurrent ? plan.glow : undefined}
                                padding="lg"
                                className={isCurrent ? 'ring-2 ring-white/30' : ''}
                            >
                                <div className="text-center mb-4">
                                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isCurrent ? 'text-white' : 'text-white/60'}`} />
                                    <p className="font-semibold text-lg text-white">{plan.name}</p>
                                    <p className={`font-bold text-xl mt-1 ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                                        {plan.price}
                                    </p>
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                                            <Check className="w-4 h-4 text-green-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <LiquidButton
                                    disabled={isCurrent}
                                    variant={isCurrent ? 'ghost' : 'primary'}
                                    glow={isCurrent ? undefined : plan.glow}
                                    className="w-full"
                                >
                                    {isCurrent ? 'Plan actuel' : 'Passer à ce plan'}
                                </LiquidButton>
                            </LiquidCard>
                        )
                    })}
                </div>
            </div>

            {/* Billing Information */}
            <LiquidCard glow="blue" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4">Informations de Facturation</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60">Prochaine facturation</span>
                        <span className="text-white font-medium">Bientôt disponible</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60">Mode de paiement</span>
                        <span className="text-white/50">Non configuré</span>
                    </div>
                </div>
            </LiquidCard>

            {/* Inline subscription manager (payment & KYC) */}
            {/* Use a compact manager component instead of navigating away */}
            {/* eslint-disable-next-line react/jsx-pascal-case */}
            <SubscriptionManager user={user} />
        </div>
    )
}

export default SubscriptionTab
