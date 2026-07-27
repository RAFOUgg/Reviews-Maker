import React, { useEffect, useState } from 'react'
import { Clock, Download, Receipt, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { paymentService } from '../../services/apiService'
import { LiquidCard, LiquidButton, LiquidSelect } from '@/components/ui/LiquidUI'

/**
 * SubscriptionHistory - Affiche l'historique des abonnements et paiements
 * Affiche: Transactions passées, factures, dates de renouvellement
 */
export default function SubscriptionHistory({ subscriptionHistory = [] }) {
    const [history, setHistory] = useState(subscriptionHistory || [])
    const [loading, setLoading] = useState(false)
    const [nextBilling, setNextBilling] = useState(null)
    const [changingPlan, setChangingPlan] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('influenceur')

    useEffect(() => {
        let mounted = true
        const fetchStatus = async () => {
            setLoading(true)
            try {
                const res = await paymentService.status()
                // backend returns { user } with subscriptionStatus etc.
                if (!mounted) return
                if (res?.user?.subscriptionHistory) {
                    setHistory(res.user.subscriptionHistory)
                }
                if (res?.user?.nextBillingDate) setNextBilling(res.user.nextBillingDate)
            } catch (err) {
                // keep empty state if API not available
                console.error('Payment status error', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchStatus()

        return () => { mounted = false }
    }, [])

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'success':
                return 'Payé'
            case 'failed':
                return 'Échoué'
            case 'pending':
                return 'En attente'
            default:
                return 'Inconnu'
        }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'subscription_start':
                return 'Début abonnement'
            case 'subscription_upgrade':
                return 'Upgrade'
            case 'subscription_downgrade':
                return 'Downgrade'
            case 'subscription_cancel':
                return 'Annulation'
            case 'payment':
                return 'Renouvellement'
            case 'refund':
                return 'Remboursement'
            default:
                return type
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleCancel = async () => {
        if (!window.confirm('Confirmer la résiliation de votre abonnement ?')) return
        try {
            setLoading(true)
            const res = await paymentService.cancel()
            // optimistic UI: set nextBilling to null
            setNextBilling(null)
            alert(res?.message || 'Abonnement résilié. Vous recevrez une confirmation par email.')
        } catch (err) {
            console.error('Cancel error', err)
            alert(err.message || 'Échec de la résiliation')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePlan = async (plan) => {
        try {
            setChangingPlan(true)
            // Try to create a checkout session first
            const checkout = await paymentService.createCheckout(plan)
            if (checkout?.checkoutUrl) {
                window.location.href = checkout.checkoutUrl
                return
            }

            // fallback to direct upgrade endpoint
            const res = await paymentService.upgrade(plan, false)
            alert(res?.message || 'Modification de l\'abonnement effectuée.')
            // Optionally refresh status
            const status = await paymentService.status()
            if (status?.user?.nextBillingDate) setNextBilling(status.user.nextBillingDate)
        } catch (err) {
            console.error('Plan change error', err)
            alert(err.message || 'Erreur lors du changement de formule')
        } finally {
            setChangingPlan(false)
        }
    }

    if (loading) {
        return (
            <LiquidCard glow="none" padding="lg" className="text-center">
                <Clock className="w-12 h-12 text-white/30 mx-auto mb-3 animate-spin" />
                <p className="text-white/50">Chargement de l'historique...</p>
            </LiquidCard>
        )
    }

    if ((history || []).length === 0) {
        return (
            <LiquidCard glow="none" padding="lg" className="text-center">
                <Clock className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Aucun historique d'abonnement</p>
                <p className="text-sm text-white/30 mt-1">
                    Vos transactions apparaîtront ici une fois abonné
                </p>
            </LiquidCard>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Historique des paiements
            </h3>

            <LiquidCard glow="none" padding="none">
                <div className="divide-y divide-white/10">
                    {history.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {getStatusIcon(item.status)}
                                    <div className="min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {getTypeLabel(item.type)}
                                            {item.plan && <span className="text-white/40 ml-2">• {item.plan}</span>}
                                        </p>
                                        <p className="text-sm text-white/40">{formatDate(item.date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className={`font-semibold ${item.type === 'refund' ? 'text-green-400' : 'text-white'
                                            }`}>
                                            {item.type === 'refund' ? '+' : ''}{item.amount?.toFixed(2)}€
                                        </p>
                                        <p className={`text-xs ${item.status === 'success' ? 'text-green-400' :
                                            item.status === 'failed' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }`}>
                                            {getStatusLabel(item.status)}
                                        </p>
                                    </div>

                                    {item.invoice && item.status === 'success' && (
                                        <button
                                            onClick={() => {
                                                // TODO: Télécharger la facture
                                                console.log('Download invoice:', item.invoice)
                                            }}
                                            className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Télécharger la facture"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </LiquidCard>

            {/* Informations de renouvellement */}
            <LiquidCard glow="cyan" padding="md">
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-white font-medium">Prochain prélèvement</p>
                        <p className="text-sm text-white/50">
                            {nextBilling ? `${new Date(nextBilling).toLocaleDateString('fr-FR')} • ` : 'Aucun prochain prélèvement enregistré'}
                        </p>
                    </div>
                </div>
            </LiquidCard>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Pas encore de moyen de paiement enregistré côté back — un bouton actif qui ne
                    fait rien serait trompeur (cf. le bug corrigé sur les sessions actives). */}
                <LiquidButton
                    variant="secondary"
                    disabled
                    title="Bientôt disponible"
                    className="flex-1"
                >
                    Modifier le moyen de paiement
                </LiquidButton>
                <LiquidButton
                    variant="outline"
                    glow="red"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Annuler l'abonnement
                </LiquidButton>
            </div>

            {/* Upgrade / Downgrade quick actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <LiquidSelect
                    value={selectedPlan}
                    onChange={setSelectedPlan}
                    wrapperClassName="sm:w-56"
                    options={[
                        { value: 'amateur', label: 'Amateur (gratuit)' },
                        { value: 'influenceur', label: 'Influenceur' },
                        { value: 'producteur', label: 'Producteur' }
                    ]}
                />
                <LiquidButton
                    variant="primary"
                    glow="purple"
                    onClick={() => handleChangePlan(selectedPlan)}
                    disabled={changingPlan}
                >
                    {changingPlan ? 'Traitement...' : 'Changer de formule'}
                </LiquidButton>
            </div>
        </div>
    )
}
