/**
 * Intégration PayPal Subscriptions (abonnements Influenceur / Producteur).
 *
 * Principe de sécurité : le client ne fait qu'approuver l'abonnement dans le popup PayPal et nous
 * renvoyer un `subscriptionID`. Ce service re-interroge systématiquement l'API PayPal pour connaître
 * l'état réel de l'abonnement — aucune donnée de paiement venant du navigateur n'est jamais crue.
 *
 * Configuration requise (.env) :
 *   PAYPAL_ENV                 sandbox | live   (défaut: sandbox)
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_WEBHOOK_ID          id du webhook créé dans le dashboard PayPal
 *   PAYPAL_PLAN_ID_INFLUENCER  id du plan de facturation 15,99 €/mois
 *   PAYPAL_PLAN_ID_PRODUCER    id du plan de facturation 29,99 €/mois
 */

const API_BASE = {
    sandbox: 'https://api-m.sandbox.paypal.com',
    live: 'https://api-m.paypal.com',
}

// Plans PayPal par type de compte interne. Les montants ne sont PAS définis ici : ils vivent dans le
// plan PayPal lui-même (source de vérité pour la facturation), on ne fait que rapprocher les ids.
const PLAN_ENV_KEYS = {
    influencer: 'PAYPAL_PLAN_ID_INFLUENCER',
    producer: 'PAYPAL_PLAN_ID_PRODUCER',
}

export function getPaypalEnv() {
    return process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox'
}

function apiBase() {
    return API_BASE[getPaypalEnv()]
}

/**
 * PayPal est-il exploitable ? Utilisé pour renvoyer une erreur explicite plutôt que de laisser
 * un flux de paiement échouer à mi-parcours (ou pire, réussir sans paiement).
 */
export function isPaypalConfigured() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export function getPlanIdForAccountType(accountType) {
    const key = PLAN_ENV_KEYS[accountType]
    return key ? process.env[key] || null : null
}

/** Type de compte correspondant à un plan PayPal — sert à valider ce que le client prétend acheter. */
export function getAccountTypeForPlanId(planId) {
    if (!planId) return null
    for (const [accountType, envKey] of Object.entries(PLAN_ENV_KEYS)) {
        if (process.env[envKey] && process.env[envKey] === planId) return accountType
    }
    return null
}

// Le token OAuth PayPal est valide ~9h ; on le garde en mémoire avec une marge de sécurité pour
// éviter un aller-retour à chaque appel.
let cachedToken = null

async function getAccessToken() {
    if (!isPaypalConfigured()) {
        throw new Error('PayPal non configuré (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants)')
    }

    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.value
    }

    const credentials = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`PayPal OAuth échoué (${response.status}): ${body}`)
    }

    const data = await response.json()
    cachedToken = {
        value: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    }
    return cachedToken.value
}

async function paypalRequest(path, { method = 'GET', body } = {}) {
    const token = await getAccessToken()
    const response = await fetch(`${apiBase()}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
        throw new Error(`PayPal ${method} ${path} échoué (${response.status}): ${text}`)
    }
    return data
}

/**
 * État réel d'un abonnement côté PayPal.
 * @returns {Promise<{id, status, planId, customId, payerEmail, nextBillingTime, startTime}>}
 */
export async function getSubscription(subscriptionId) {
    const data = await paypalRequest(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`)
    return {
        id: data.id,
        status: data.status, // APPROVAL_PENDING | APPROVED | ACTIVE | SUSPENDED | CANCELLED | EXPIRED
        planId: data.plan_id,
        customId: data.custom_id || null, // on y stocke l'id utilisateur à la création
        payerEmail: data.subscriber?.email_address || null,
        nextBillingTime: data.billing_info?.next_billing_time || null,
        startTime: data.start_time || null,
    }
}

export async function cancelSubscription(subscriptionId, reason = 'Annulé par l’utilisateur') {
    await paypalRequest(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
        method: 'POST',
        body: { reason },
    })
}

/**
 * Vérifie qu'un webhook provient bien de PayPal (signature + certificat), via l'API officielle de
 * vérification. Sans `PAYPAL_WEBHOOK_ID` on refuse : accepter un webhook non vérifié reviendrait à
 * laisser n'importe qui activer un abonnement par une simple requête HTTP.
 *
 * @param {object} headers - en-têtes bruts de la requête
 * @param {object} rawBody - corps du webhook déjà parsé en objet
 */
export async function verifyWebhookSignature(headers, rawBody) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
        throw new Error('PAYPAL_WEBHOOK_ID manquant : impossible de vérifier la signature du webhook')
    }

    const payload = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: rawBody,
    }

    if (Object.values(payload).some((value) => value === undefined || value === null)) {
        return false
    }

    const result = await paypalRequest('/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        body: payload,
    })

    return result?.verification_status === 'SUCCESS'
}

/**
 * Statuts PayPal considérés comme donnant droit aux features payantes.
 * SUSPENDED (paiement en échec) coupe l'accès : c'est le comportement attendu d'un impayé.
 */
export function isEntitlingStatus(status) {
    return status === 'ACTIVE'
}
