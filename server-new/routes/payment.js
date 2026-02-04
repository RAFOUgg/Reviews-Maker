/**
 * Routes pour gestion des paiements Stripe (Influenceur/Producteur)
 */
import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { prisma } from '../server.js'

const router = express.Router()

// Prix des abonnements (en centimes)
const PRICES = {
    influencer: 1599, // 15.99€
    producer: 2999,   // 29.99€
}

/**
 * POST /api/payment/create-checkout
 * Créer une session Stripe Checkout
 */
router.post('/create-checkout', requireAuth, async (req, res) => {
    try {
        const { accountType } = req.body
        const userId = req.user.id

        // Validation
        if (!['influencer', 'producer'].includes(accountType)) {
            return res.status(400).json({ message: 'Type de compte invalide' })
        }

        // Récupération utilisateur
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' })
        }

        // TODO: Intégration Stripe SDK
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],
        //     line_items: [{
        //         price_data: {
        //             currency: 'eur',
        //             product_data: { name: `Abonnement ${accountType}` },
        //             unit_amount: PRICES[accountType],
        //         },
        //         quantity: 1,
        //     }],
        //     mode: 'subscription',
        //     success_url: `${process.env.CLIENT_URL}/payment?success=true`,
        //     cancel_url: `${process.env.CLIENT_URL}/payment?canceled=true`,
        //     client_reference_id: userId,
        // })
        // res.json({ sessionId: session.id, url: session.url })

        // MOCK pour développement
        res.json({
            sessionId: 'mock_session_' + Date.now(),
            url: `${process.env.CLIENT_URL}/payment?mock_payment=success`,
            message: 'MOCK: Paiement simulé (Stripe non configuré)',
        })
    } catch (error) {
        console.error('❌ Payment error:', error)
        res.status(500).json({ message: 'Erreur lors de la création du paiement' })
    }
})

/**
 * POST /api/payment/webhook
 * Webhook Stripe pour valider les paiements
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // TODO: Vérifier signature Stripe
        // const sig = req.headers['stripe-signature']
        // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

        // MOCK pour développement
        console.log('📨 Webhook reçu (MOCK)')
        res.json({ received: true })
    } catch (error) {
        console.error('❌ Webhook error:', error)
        res.status(400).json({ message: 'Webhook invalide' })
    }
})

/**
 * GET /api/payment/status
 * Vérifier le statut d'abonnement
 */
router.get('/status', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                accountType: true,
                subscriptionStatus: true,
                kycStatus: true,
            },
        })

        res.json({ user })
    } catch (error) {
        console.error('❌ Status error:', error)
        res.status(500).json({ message: 'Erreur lors de la récupération du statut' })
    }
})

/**
 * POST /api/subscription/upgrade
 * Upgrade un compte existant vers influenceur ou producteur
 * (Appelé après paiement simulé ou réel)
 */
router.post('/upgrade', requireAuth, async (req, res) => {
    try {
        const { accountType, paymentCompleted } = req.body
        const userId = req.user.id

        // Validation du type de compte (en français)
        if (!['influenceur', 'producteur'].includes(accountType)) {
            return res.status(400).json({ error: 'Type de compte invalide. Utilisez "influenceur" ou "producteur".' })
        }

        // Vérifier que le paiement est confirmé
        if (!paymentCompleted) {
            return res.status(400).json({ error: 'Paiement non confirmé' })
        }

        // Récupérer l'utilisateur actuel
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' })
        }

        // Empêcher le downgrade (producteur ne peut pas devenir influenceur)
        if (user.accountType === 'producteur' && accountType === 'influenceur') {
            return res.status(400).json({ error: 'Impossible de rétrograder de Producteur vers Influenceur' })
        }

        // Mettre à jour le compte
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                accountType: accountType,
                subscriptionStatus: 'active',
                // Enregistrer la date de mise à niveau
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                subscriptionStatus: true,
                roles: true,
            }
        })

        console.log(`✅ Upgrade réussi: ${user.username} → ${accountType}`)

        res.json({
            success: true,
            message: `Compte mis à niveau vers ${accountType} avec succès!`,
            user: updatedUser
        })
    } catch (error) {
        console.error('❌ Upgrade error:', error)
        res.status(500).json({ error: 'Erreur lors de la mise à niveau du compte' })
    }
})

export default router
