import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, X } from 'lucide-react'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import ConfirmDialog from '../shared/ConfirmDialog'
import { useToast } from '../shared/ToastContainer'
import { accountService, paymentService } from '../../services/apiService'
import { useStore } from '../../store'

/**
 * SubscriptionManager
 * Composant réutilisable pour gérer le paiement / abonnement (actions).
 * Le statut (type de compte, abonnement, vérification KYC) vit dans AccountTypeDisplay.jsx —
 * il y était auparavant dupliqué ici, dans un style différent.
 */
export default function SubscriptionManager({ user }) {
    const navigate = useNavigate()
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const toast = useToast()
    const { checkAuth } = useStore()

    // `access` est calculé par le serveur : il tient compte de l'abonnement réel et de l'héritage
    // entreprise, contrairement aux colonnes brutes de `user` qui peuvent être périmées.
    const subscriptionActive = Boolean(user?.access?.subscriptionActive)

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
            <LiquidCard glow="default" padding="lg">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" /> Gestion de l'abonnement
                </h4>
                {/* Sans abonnement en cours, « gérer le moyen de paiement » et « annuler » n'ont
                    rien à opérer : on ne propose que la souscription. */}
                <p className="text-white/50 mb-4">
                    {subscriptionActive
                        ? "Mettez à jour votre moyen de paiement, changez de plan ou résiliez votre abonnement."
                        : "Vous n'avez aucun abonnement en cours. Choisissez une formule pour débloquer les outils professionnels."}
                </p>
                <div className={`grid grid-cols-1 gap-3 ${subscriptionActive ? 'md:grid-cols-3' : ''}`}>
                    <LiquidButton variant={subscriptionActive ? 'secondary' : 'primary'} glow={subscriptionActive ? undefined : 'green'} onClick={() => navigate('/choose-account')}>
                        {subscriptionActive ? 'Changer de Plan' : "Voir les formules"}
                    </LiquidButton>

                    {subscriptionActive && (
                        <>
                            <LiquidButton variant="outline" onClick={() => setShowPaymentModal(true)} aria-label="Gérer le moyen de paiement">
                                Gérer le moyen de paiement
                            </LiquidButton>
                            <LiquidButton variant="danger" onClick={confirmCancel} disabled={isCancelling} aria-label="Annuler l'abonnement">
                                {isCancelling ? 'Résiliation...' : "Annuler l'abonnement"}
                            </LiquidButton>
                        </>
                    )}
                </div>

                {/* Payment inline modal (simple placeholder). Replace by modal réutilisable si nécessaire */}
                {showPaymentModal && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/8 relative" role="dialog" aria-label="Gestion du moyen de paiement">
                        <button aria-label="Fermer" className="absolute top-3 right-3 p-2 rounded hover:bg-white/5" onClick={() => setShowPaymentModal(false)}>
                            <X className="w-4 h-4 text-white/60" />
                        </button>
                        <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                            <div className="min-w-0">
                                <h5 className="text-white font-semibold mb-1">Méthode de paiement</h5>
                                <p className="text-sm text-white/60 mb-2">Mode actuel: <strong className="text-white">Non configuré</strong></p>
                                <p className="text-sm text-white/60">Intégration paiement (Stripe/PayPal) à venir — pour l'instant, utilisez la page Paiement complète si nécessaire.</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
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
