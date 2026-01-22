/**
 * SubscriptionTab - Subscription and plan management
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'

const SubscriptionTab = ({ user }) => {
    const accountType = user?.accountType || 'Amateur'
    const subscriptionType = user?.subscriptionType || 'free'

    const plans = {
        free: {
            name: 'Amateur',
            price: 'Free',
            color: 'text-green-600 bg-green-50'
        },
        influencer_basic: {
            name: 'Influenceur (Basic)',
            price: '€15.99/month',
            color: 'text-blue-600 bg-blue-50'
        },
        influencer_pro: {
            name: 'Influenceur (Pro)',
            price: '€19.99/month',
            color: 'text-purple-600 bg-purple-50'
        },
        producer: {
            name: 'Producteur',
            price: '€29.99/month',
            color: 'text-orange-600 bg-orange-50'
        }
    }

    const currentPlan = plans[subscriptionType] || plans.free

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
                <div className={`p-6 rounded-lg border-2 ${currentPlan.color}`}>
                    <p className="text-sm">Current Plan</p>
                    <p className="text-2xl font-bold mt-2">{currentPlan.name}</p>
                    <p className="text-lg mt-2">{currentPlan.price}</p>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(plans).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`p-6 rounded-lg border-2 ${subscriptionType === key
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary'
                                }`}
                        >
                            <p className="font-semibold text-lg">{plan.name}</p>
                            <p className="text-primary font-bold text-lg mt-2">{plan.price}</p>
                            <button
                                disabled={subscriptionType === key}
                                className="mt-4 w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {subscriptionType === key ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Next billing date:</span>
                        <span>Coming soon</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment method:</span>
                        <span>Not configured</span>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SubscriptionTab
