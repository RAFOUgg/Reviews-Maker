/**
 * Configuration Stripe pour les abonnements
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// IDs des produits Stripe (à configurer via Dashboard Stripe)
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Consommateur',
    price: 0,
    priceId: null,
    features: [
      'Créer et gérer vos reviews',
      'Accès galerie publique',
      'Stats basiques',
      'Exports simples',
    ],
  },
  influencer_basic: {
    name: 'Influenceur Basic',
    price: 7.99,
    priceId: process.env.STRIPE_PRICE_ID_INFLUENCER_BASIC,
    features: [
      'Tout du plan Consommateur',
      'Mode Orchard (branding personnel)',
      'Exports HD avec logo',
      'Templates personnalisés',
      'Stats avancées',
    ],
  },
  influencer_pro: {
    name: 'Influenceur Pro',
    price: 15.99,
    priceId: process.env.STRIPE_PRICE_ID_INFLUENCER_PRO,
    features: [
      'Tout du plan Influenceur Basic',
      'Galerie privée illimitée',
      'Exports 4K',
      'Watermark personnalisé',
      'API access',
      'Support prioritaire',
    ],
  },
  producer: {
    name: 'Producteur',
    price: 29.99,
    priceId: process.env.STRIPE_PRICE_ID_PRODUCER,
    features: [
      'Profil entreprise vérifié',
      'Dashboard analytics avancé',
      'Gestion équipe (5 membres)',
      'White-label exports',
      'Support dédié',
    ],
  },
  merchant: {
    name: 'Dispensaire',
    price: 25.99,
    priceId: process.env.STRIPE_PRICE_ID_MERCHANT,
    features: [
      'Point de vente intégré',
      'Gestion inventaire',
      'QR codes produits',
      'Analytics clients',
      'Support 24/7',
    ],
  },
};

/**
 * Crée une session de checkout Stripe
 * @param {string} userId - ID utilisateur Prisma
 * @param {string} plan - Plan d'abonnement (influencer_basic, influencer_pro, producer, merchant)
 * @param {string} successUrl - URL de retour succès
 * @param {string} cancelUrl - URL de retour annulation
 * @returns {Promise<Object>} Session Stripe
 */
async function createCheckoutSession(userId, plan, successUrl, cancelUrl) {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  
  if (!planConfig || !planConfig.priceId) {
    throw new Error(`Plan invalide ou non configuré : ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
      plan,
    },
  });

  return session;
}

/**
 * Crée un portail client Stripe pour gérer l'abonnement
 * @param {string} stripeCustomerId - ID client Stripe
 * @param {string} returnUrl - URL de retour
 * @returns {Promise<Object>} Session portail
 */
async function createPortalSession(stripeCustomerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Récupère une subscription Stripe
 * @param {string} subscriptionId - ID subscription Stripe
 * @returns {Promise<Object>} Subscription Stripe
 */
async function getSubscription(subscriptionId) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Annule une subscription Stripe
 * @param {string} subscriptionId - ID subscription Stripe
 * @returns {Promise<Object>} Subscription annulée
 */
async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Vérifie la signature d'un webhook Stripe
 * @param {string} payload - Corps de la requête brute
 * @param {string} signature - Header stripe-signature
 * @returns {Object} Event Stripe validé
 */
function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET non configuré');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

module.exports = {
  stripe,
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  verifyWebhookSignature,
};
