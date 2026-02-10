import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Shield, Check, X } from 'lucide-react'
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI'
import ConfirmDialog from '../shared/ConfirmDialog'
import { useToast } from '../shared/ToastContainer'
import { accountService, paymentService } from '../../services/apiService'
import { useStore } from '../../store'

/**
 * SubscriptionManager
 * Composant réutilisable pour gérer le paiement / KYC / abonnement
 */
export default function SubscriptionManager({ user }) {
    const navigate = useNavigate()
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const toast = useToast()
    const { checkAuth } = useStore()

    const confirmCancel = () => setShowCancelDialog(true)

    const doCancel = async () => {
        setShowCancelDialog(false)
        setIsCancelling(true)
        const loadingId = toast.loading('Résiliation en cours...')
        try {
            // Essayer de rétrograder via account service
            const res = await accountService.changeType('amateur')
            toast.remove(loadingId)
            toast.success(res.message || 'Abonnement résilié, compte rétrogradé.')
            if (typeof checkAuth === 'function') await checkAuth()
        } catch (err) {
            // fallback to payment cancel
            try {
                const res2 = await paymentService.cancel()
                toast.remove(loadingId)
                toast.success(res2?.message || 'Abonnement résilié via le service de paiement.')
                if (typeof checkAuth === 'function') await checkAuth()
            } catch (err2) {
                toast.remove(loadingId)
                console.error('Cancel failed', err2)
                toast.error(err2?.message || 'Erreur lors de la résiliation')
            }
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <div className="space-y-4">
            <LiquidCard glow="purple" padding="lg">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" /> État du Compte
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-indigo-500/8 rounded-xl border border-indigo-500/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Type de Compte</p>
                        <p className="text-lg font-bold text-white">{user?.accountType === 'producer' ? '🌱 Producteur' : user?.accountType === 'influencer' ? '⭐ Influenceur' : 'Amateur'}</p>
                    </div>
                    <div className="p-3 bg-green-500/8 rounded-xl border border-green-500/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Abonnement</p>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <p className="text-lg font-bold text-green-400">Actif</p>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-500/8 rounded-xl border border-blue-500/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Vérification KYC</p>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-blue-400" />
                            <p className="text-lg font-bold text-blue-400">Vérifiée</p>
                        </div>
                    </div>
                </div>
            </LiquidCard>

            <LiquidCard glow="default" padding="lg">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" /> Gestion de l'abonnement
                </h4>
                <p className="text-white/50 mb-4">Mettez à jour votre moyen de paiement, changez de plan ou annulez votre abonnement ici (tout reste dans la page Compte).</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <LiquidButton variant="secondary" onClick={() => navigate('/choose-account')}>
                        Changer de Plan
                    </LiquidButton>
                    <LiquidButton variant="outline" onClick={() => setShowPaymentModal(true)} aria-label="Gérer le moyen de paiement">
                        Gérer le moyen de paiement
                    </LiquidButton>
                    <LiquidButton variant="destructive" onClick={confirmCancel} disabled={isCancelling} aria-label="Annuler l'abonnement">
                        {isCancelling ? 'Résiliation...' : 'Annuler l'abonnement'}
                    </LiquidButton>
                </div>

                {/* Payment inline modal (simple placeholder). Replace by modal réutilisable si nécessaire */}
                {showPaymentModal && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/8 relative" role="dialog" aria-label="Gestion du moyen de paiement">
                        <button aria-label="Fermer" className="absolute top-3 right-3 p-1 rounded hover:bg-white/5" onClick={() => setShowPaymentModal(false)}>
                            <X className="w-4 h-4 text-white/60" />
                        </button>
                        <div className="flex items-start justify-between">
                            <div>
                                <h5 className="text-white font-semibold mb-1">Méthode de paiement</h5>
                                <p className="text-sm text-white/60 mb-2">Mode actuel: <strong className="text-white">Non configuré</strong></p>
                                <p className="text-sm text-white/60">Intégration paiement (Stripe/PayPal) à venir — pour l'instant, utilisez la page Paiement complète si nécessaire.</p>
                            </div>
                            <div className="flex gap-2">
                                <LiquidButton variant="ghost" onClick={() => setShowPaymentModal(false)}>Fermer</LiquidButton>
                                <LiquidButton variant="primary" onClick={() => { setShowPaymentModal(false); navigate('/payment') }}>Configurer</LiquidButton>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={showCancelDialog}
                    title="Confirmer la résiliation"
                    description="Voulez-vous vraiment résilier votre abonnement ? Votre contenu restera visible mais vous perdrez l'accès à la création."
                    onCancel={() => setShowCancelDialog(false)}
                    onConfirm={doCancel}
                    confirmText="Résilier"
                    cancelText="Annuler"
                />
            </LiquidCard>
        </div>
    )
}
