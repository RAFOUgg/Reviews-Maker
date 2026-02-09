/**
 * Routes pour gestion des paiements Stripe (Influenceur/Producteur)
 */
import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { prisma } from '../server.js'
import { changeAccountType } from '../services/account.js'

const router = express.Router()

/**
 * Parse les rôles depuis le champ JSON
 * @param {string} rolesJson - Champ User.roles
 * @returns {Array<string>}
 */
function parseRoles(rolesJson) {
    try {
        // Handle undefined, null, or empty string
        if (!rolesJson || rolesJson === '') {
            return ['consumer'];
        }

        const parsed = JSON.parse(rolesJson);

        // Ensure parsed.roles is an array
        if (parsed && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
            return parsed.roles;
        }

        return ['consumer'];
    } catch (error) {
        return ['consumer'];
    }
}

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

        // Determine client URL: prefer env, fallback to request origin
        const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`

        // Map backend account types to frontend query values (French)
        const clientTypeMap = {
            producer: 'producteur',
            influencer: 'influenceur'
        }

        const clientType = clientTypeMap[accountType] || accountType

        // MOCK pour développement - direct user to the frontend payment handler
        res.json({
            sessionId: 'mock_session_' + Date.now(),
            url: `${clientUrl}/payment?type=${clientType}&mock_payment=success`,
            message: 'MOCK: Paiement simulé (Stripe non configuré)'
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

        // Validation du type de compte (accepte français et anglais)
        const validTypes = ['influenceur', 'producteur', 'influencer', 'producer'];
        if (!validTypes.includes(accountType)) {
            return res.status(400).json({ error: 'Type de compte invalide. Utilisez "influenceur", "producteur", "influencer" ou "producer".' })
        }

        // Mapper vers anglais pour la logique interne
        const typeMap = {
            'influenceur': 'influencer',
            'producteur': 'producer',
            'influencer': 'influencer',
            'producer': 'producer'
        };
        const englishType = typeMap[accountType];

        // Vérifier que le paiement est confirmé
        if (!paymentCompleted) {
            return res.status(400).json({ error: 'Paiement non confirmé' })
        }

        // Récupérer l'utilisateur actuel
        let user = null;
        if (process.env.NODE_ENV === 'development' && userId === 'dev-test-user-id') {
            user = {
                id: 'dev-test-user-id',
                username: 'DevTestUser',
                email: 'test@example.com',
                roles: JSON.stringify({ roles: ['consumer'] })
            };
        } else {
            user = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        // Empêcher le downgrade (producteur ne peut pas devenir influenceur)
        const currentType = parseRoles(user.roles).find(role => ['consumer', 'producer', 'influencer'].includes(role)) || 'consumer';
        if (currentType === 'producer' && englishType === 'influencer') {
            return res.status(400).json({ error: 'Impossible de rétrograder de Producteur vers Influenceur' })
        }

        // Utiliser la logique centralisée pour changer le type de compte
        const updatedUser = await changeAccountType(userId, englishType, {})

        // Mettre à jour le statut d'abonnement dans l'utilisateur/prisma (skip in dev)
        if (!(process.env.NODE_ENV === 'development' && userId === 'dev-test-user-id')) {
            await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'active' } })
        }

        console.log(`✅ Upgrade réussi: ${user.username} → ${englishType}`)

        // Retourner une version simplifiée de l'utilisateur
        res.json({
            success: true,
            message: `Compte mis à niveau vers ${englishType} avec succès!`,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                roles: updatedUser.roles
            }
        })
    } catch (error) {
        console.error('❌ Upgrade error:', error)
        res.status(500).json({ error: 'Erreur lors de la mise à niveau du compte' })
    }
})

export default router
