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
        //     success_url: `${process.env.CLIENT_URL}/account-setup?success=true`,
        //     cancel_url: `${process.env.CLIENT_URL}/account-setup?canceled=true`,
        //     client_reference_id: userId,
        // })
        // res.json({ sessionId: session.id, url: session.url })

        // MOCK pour développement
        res.json({
            sessionId: 'mock_session_' + Date.now(),
            url: `${process.env.CLIENT_URL}/account-setup?mock_payment=success`,
            message: 'MOCK: Paiement simulé (Stripe non configuré)',
        })
    } catch (error) {
export default router
