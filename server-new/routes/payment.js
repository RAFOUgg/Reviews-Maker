/**
 * Abonnements pro (Influenceur / Producteur) via PayPal Subscriptions.
 *
 * Règle inviolable : le droit d'accès payant n'est accordé QUE d'après l'état renvoyé par l'API
 * PayPal (appel serveur→serveur) ou par un webhook dont la signature a été vérifiée. Rien de ce que
 * le navigateur envoie n'est cru — le client ne fournit qu'un identifiant d'abonnement à vérifier.
 */
import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { prisma } from '../server.js'
import { changeAccountType, ACCOUNT_TYPES } from '../services/account.js'
import { asyncHandler } from '../utils/errorHandler.js'
import {
    isPaypalConfigured,
    getPaypalEnv,
    getPlanIdForAccountType,
    getAccountTypeForPlanId,
    getSubscription,
    cancelSubscription,
    verifyWebhookSignature,
    isEntitlingStatus,
} from '../services/paypal.js'

const router = express.Router()

// Tarifs affichés (centimes). La facturation réelle est portée par le plan PayPal ; ces valeurs ne
// servent qu'à l'affichage et doivent rester alignées avec les plans configurés côté PayPal.
const PRICES = {
    influencer: 1599, // 15,99 €
    producer: 2999,   // 29,99 €
}

const PAID_TYPES = ['influencer', 'producer']

// Types français acceptés côté client → types internes.
const TYPE_ALIASES = {
    influenceur: 'influencer',
    producteur: 'producer',
    influencer: 'influencer',
    producer: 'producer',
}

function normalizeAccountType(input) {
    return TYPE_ALIASES[String(input || '').toLowerCase()] || null
}

/**
 * Applique l'état PayPal d'un abonnement à l'utilisateur : accorde le tier payant si l'abonnement
 * donne droit, le retire sinon. Idempotent — c'est le seul endroit qui accorde un tier payant.
 */
async function syncSubscriptionState(userId, paypalSub) {
    const accountType = getAccountTypeForPlanId(paypalSub.planId)
    if (!accountType) {
        // Un plan inconnu ne doit jamais accorder de droits : on le trace sans rien accorder.
        console.error(`[paypal] Plan inconnu ${paypalSub.planId} sur l'abonnement ${paypalSub.id}`)
        return { granted: false, reason: 'unknown_plan' }
    }

    const entitled = isEntitlingStatus(paypalSub.status)
    const internalStatus = entitled ? 'active' : 'inactive'

    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            plan: accountType,
            status: internalStatus,
            paypalSubscriptionId: paypalSub.id,
            paypalPlanId: paypalSub.planId,
            paypalPayerEmail: paypalSub.payerEmail,
            paypalStatus: paypalSub.status,
            currentPeriodEnd: paypalSub.nextBillingTime ? new Date(paypalSub.nextBillingTime) : null,
            lastSyncedAt: new Date(),
        },
        update: {
            plan: accountType,
            status: internalStatus,
            paypalSubscriptionId: paypalSub.id,
            paypalPlanId: paypalSub.planId,
            paypalPayerEmail: paypalSub.payerEmail,
            paypalStatus: paypalSub.status,
            currentPeriodEnd: paypalSub.nextBillingTime ? new Date(paypalSub.nextBillingTime) : null,
            canceledAt: paypalSub.status === 'CANCELLED' ? new Date() : undefined,
            lastSyncedAt: new Date(),
        },
    })

    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionStatus: internalStatus,
            subscriptionType: entitled ? accountType : null,
            subscriptionEnd: paypalSub.nextBillingTime ? new Date(paypalSub.nextBillingTime) : null,
        },
    })

    if (entitled) {
        await changeAccountType(userId, accountType, {})
    } else {
        // Abonnement mort (annulé/expiré/suspendu) : retour au tier gratuit. Les données produites
        // restent en base, seul l'accès aux features payantes est retiré.
        await changeAccountType(userId, ACCOUNT_TYPES.CONSUMER, {})
    }

    return { granted: entitled, accountType }
}

/**
 * GET /api/payment/config
 * Ce dont le client a besoin pour afficher le tunnel (jamais le secret).
 */
router.get('/config', (req, res) => {
    res.json({
        provider: 'paypal',
        configured: isPaypalConfigured(),
        environment: getPaypalEnv(),
        clientId: process.env.PAYPAL_CLIENT_ID || null,
        plans: {
            influencer: { planId: getPlanIdForAccountType('influencer'), price: PRICES.influencer },
            producer: { planId: getPlanIdForAccountType('producer'), price: PRICES.producer },
        },
    })
})

/**
 * GET /api/payment/status
 * État d'abonnement de l'utilisateur courant.
 */
router.get('/status', requireAuth, asyncHandler(async (req, res) => {
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } })

    res.json({
        active: subscription?.status === 'active',
        plan: subscription?.plan || null,
        paypalStatus: subscription?.paypalStatus || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    })
}))

/**
 * POST /api/payment/subscription/activate  { subscriptionId }
 * Appelé après approbation dans le popup PayPal. On re-interroge PayPal pour connaître l'état réel
 * et on vérifie que l'abonnement nous appartient bien (custom_id == id utilisateur).
 */
router.post('/subscription/activate', requireAuth, asyncHandler(async (req, res) => {
    if (!isPaypalConfigured()) {
        return res.status(503).json({ error: 'paypal_not_configured', message: 'Paiement indisponible' })
    }

    const { subscriptionId } = req.body || {}
    if (!subscriptionId) {
        return res.status(400).json({ error: 'missing_subscription_id' })
    }

    // Un abonnement déjà rattaché à un autre compte ne peut pas être réutilisé pour s'octroyer
    // des droits (rejeu de l'identifiant d'un tiers).
    const claimedElsewhere = await prisma.subscription.findUnique({
        where: { paypalSubscriptionId: String(subscriptionId) },
    })
    if (claimedElsewhere && claimedElsewhere.userId !== req.user.id) {
        return res.status(409).json({ error: 'subscription_already_claimed' })
    }

    let paypalSub
    try {
        paypalSub = await getSubscription(subscriptionId)
    } catch (error) {
        console.error('[paypal] Lecture abonnement échouée:', error)
        return res.status(502).json({ error: 'paypal_unreachable', message: 'PayPal injoignable, réessayez' })
    }

    // `custom_id` est fixé par le client au moment de la création — on le vérifie quand il est
    // présent, mais l'appartenance repose surtout sur le contrôle d'unicité ci-dessus.
    if (paypalSub.customId && paypalSub.customId !== req.user.id) {
        return res.status(403).json({ error: 'subscription_owner_mismatch' })
    }

    if (!isEntitlingStatus(paypalSub.status)) {
        return res.status(402).json({
            error: 'subscription_not_active',
            message: `Abonnement non actif (état PayPal: ${paypalSub.status})`,
            paypalStatus: paypalSub.status,
        })
    }

    const result = await syncSubscriptionState(req.user.id, paypalSub)
    if (!result.granted) {
        return res.status(400).json({ error: 'plan_not_recognized', message: 'Plan PayPal inconnu' })
    }

    res.json({ success: true, accountType: result.accountType })
}))

/**
 * POST /api/payment/subscription/cancel
 * Annule côté PayPal ; la perte effective des droits est ensuite appliquée par le webhook
 * BILLING.SUBSCRIPTION.CANCELLED (et par le resync ci-dessous en secours).
 */
router.post('/subscription/cancel', requireAuth, asyncHandler(async (req, res) => {
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } })
    if (!subscription?.paypalSubscriptionId) {
        return res.status(404).json({ error: 'no_subscription' })
    }

    try {
        await cancelSubscription(subscription.paypalSubscriptionId)
    } catch (error) {
        console.error('[paypal] Annulation échouée:', error)
        return res.status(502).json({ error: 'paypal_unreachable', message: 'PayPal injoignable, réessayez' })
    }

    const fresh = await getSubscription(subscription.paypalSubscriptionId)
    await syncSubscriptionState(req.user.id, fresh)

    res.json({ success: true, paypalStatus: fresh.status })
}))

/**
 * POST /api/payment/subscription/refresh
 * Resynchronise depuis PayPal. Filet de sécurité si un webhook a été manqué.
 */
router.post('/subscription/refresh', requireAuth, asyncHandler(async (req, res) => {
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } })
    if (!subscription?.paypalSubscriptionId) {
        return res.status(404).json({ error: 'no_subscription' })
    }

    const fresh = await getSubscription(subscription.paypalSubscriptionId)
    const result = await syncSubscriptionState(req.user.id, fresh)

    res.json({ success: true, active: result.granted, paypalStatus: fresh.status })
}))

/**
 * POST /api/payment/webhook
 * Notifications PayPal. `req.body` est un Buffer : le parseur brut est monté sur ce chemin dans
 * server.js, avant express.json(), pour préserver les octets sur lesquels porte la signature.
 */
router.post('/webhook', asyncHandler(async (req, res) => {
    let event
    try {
        event = JSON.parse(req.body.toString('utf8'))
    } catch {
        return res.status(400).json({ error: 'invalid_payload' })
    }

    let verified = false
    try {
        verified = await verifyWebhookSignature(req.headers, event)
    } catch (error) {
        console.error('[paypal] Vérification webhook impossible:', error.message)
        // 500 → PayPal réessaiera ; on préfère un rejeu à l'acceptation d'un événement non vérifié.
        return res.status(500).json({ error: 'verification_failed' })
    }

    if (!verified) {
        console.error('[paypal] Signature de webhook invalide, événement ignoré:', event.event_type)
        return res.status(401).json({ error: 'invalid_signature' })
    }

    const relevant = [
        'BILLING.SUBSCRIPTION.ACTIVATED',
        'BILLING.SUBSCRIPTION.CANCELLED',
        'BILLING.SUBSCRIPTION.SUSPENDED',
        'BILLING.SUBSCRIPTION.EXPIRED',
        'BILLING.SUBSCRIPTION.UPDATED',
        'PAYMENT.SALE.COMPLETED',
    ]

    // Sur les événements d'abonnement, `resource.id` EST l'abonnement ; sur PAYMENT.SALE.COMPLETED
    // (paiement récurrent encaissé), `resource.id` est la vente et l'abonnement est porté par
    // `billing_agreement_id`.
    const subscriptionId = event.event_type === 'PAYMENT.SALE.COMPLETED'
        ? event.resource?.billing_agreement_id
        : event.resource?.id

    if (!relevant.includes(event.event_type) || !subscriptionId) {
        return res.json({ received: true, ignored: true })
    }

    // On retrouve l'utilisateur par l'abonnement déjà enregistré, sinon par `custom_id`.
    const known = await prisma.subscription.findUnique({ where: { paypalSubscriptionId: subscriptionId } })
    const fresh = await getSubscription(subscriptionId)
    const userId = known?.userId || fresh.customId

    if (!userId) {
        console.error(`[paypal] Webhook ${event.event_type} sans utilisateur identifiable (${subscriptionId})`)
        return res.json({ received: true, unmatched: true })
    }

    await syncSubscriptionState(userId, fresh)
    res.json({ received: true })
}))

export default router
