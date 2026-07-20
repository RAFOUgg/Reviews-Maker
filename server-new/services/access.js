/**
 * Source de vérité unique des droits d'un utilisateur.
 *
 * Trois notions distinctes étaient jusqu'ici confondues (ou simplement absentes) :
 *   1. le TIER  — payant ou non : décide des outils accessibles ;
 *   2. la VÉRIFICATION (SIRET/KYC) — décide du droit de publier publiquement en tant que pro ;
 *   3. le RÔLE dans l'entreprise — décide de ce qu'un employé peut modifier.
 *
 * Un employé d'une entreprise abonnée hérite du tier de celle-ci sans payer lui-même : c'est le
 * principe même des sous-comptes (cf. routes/company.js).
 */
import { prisma } from '../server.js'
import { getUserAccountType, ACCOUNT_TYPES } from './account.js'
import { Errors } from '../utils/errorHandler.js'

// Ce qu'un rôle permet d'écrire au sein de l'entreprise. `owner` = titulaire du ProducerProfile.
const ROLE_CAPABILITIES = {
    owner: { canWrite: true, canManageMembers: true, canManageBilling: true },
    admin: { canWrite: true, canManageMembers: true, canManageBilling: false },
    editor: { canWrite: true, canManageMembers: false, canManageBilling: false },
    viewer: { canWrite: false, canManageMembers: false, canManageBilling: false },
}

const PAID_TIERS = [ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.INFLUENCER]

function capabilitiesFor(role) {
    return ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES.viewer
}

/**
 * Résout le contexte d'accès complet d'un utilisateur.
 *
 * @returns {Promise<{
 *   userId: string,
 *   accountType: string,       // tier effectif (hérité de l'entreprise le cas échéant)
 *   ownAccountType: string,    // tier propre, sans héritage
 *   subscriptionActive: boolean,
 *   isVerifiedPro: boolean,    // entreprise (ou profil) vérifiée SIRET/KYC
 *   canPublish: boolean,
 *   company: null | { id, name, role, inherited, ...capabilities }
 * }>}
 */
export async function resolveAccess(user) {
    if (!user) {
        return {
            userId: null,
            accountType: ACCOUNT_TYPES.CONSUMER,
            ownAccountType: ACCOUNT_TYPES.CONSUMER,
            subscriptionActive: false,
            isVerifiedPro: false,
            canPublish: false,
            company: null,
        }
    }

    const ownAccountType = getUserAccountType(user)

    // En dev l'utilisateur est un mock sans ligne en base : on lui accorde son tier tel quel plutôt
    // que de partir en requêtes qui échoueraient.
    if (process.env.NODE_ENV === 'development' && user.id === 'dev-test-user-id') {
        return {
            userId: user.id,
            accountType: ownAccountType,
            ownAccountType,
            subscriptionActive: true,
            isVerifiedPro: true,
            canPublish: true,
            company: null,
        }
    }

    const [ownProfile, membership, subscription] = await Promise.all([
        prisma.producerProfile.findUnique({ where: { userId: user.id } }),
        prisma.companyMember.findFirst({
            where: { userId: user.id, status: 'active' },
            include: { producerProfile: { include: { user: { select: { id: true, roles: true } } } } },
        }),
        prisma.subscription.findUnique({ where: { userId: user.id } }),
    ])

    const ownSubscriptionActive = subscription?.status === 'active'

    // Un tier payant n'a de valeur que soutenu par un abonnement actif : sans cela on retombe au
    // tier gratuit, même si le rôle est resté inscrit sur le compte (abonnement expiré/annulé).
    let accountType = PAID_TIERS.includes(ownAccountType) && !ownSubscriptionActive
        ? ACCOUNT_TYPES.CONSUMER
        : ownAccountType

    let isVerifiedPro = Boolean(ownProfile?.isVerified)
    let company = null

    if (ownProfile) {
        company = {
            id: ownProfile.id,
            name: ownProfile.companyName,
            role: 'owner',
            inherited: false,
            ...capabilitiesFor('owner'),
        }
    } else if (membership) {
        // Employé : le tier vient de l'entreprise, à condition que le titulaire soit lui-même à jour
        // de son abonnement. Sinon l'employé n'obtient rien de plus qu'un compte gratuit.
        const ownerUser = membership.producerProfile.user
        const ownerSubscription = await prisma.subscription.findUnique({ where: { userId: ownerUser.id } })

        if (ownerSubscription?.status === 'active') {
            const ownerTier = getUserAccountType(ownerUser)
            if (PAID_TIERS.includes(ownerTier)) {
                accountType = ownerTier
            }
        }

        isVerifiedPro = Boolean(membership.producerProfile.isVerified)
        company = {
            id: membership.producerProfile.id,
            name: membership.producerProfile.companyName,
            role: membership.role,
            inherited: true,
            ...capabilitiesFor(membership.role),
        }
    }

    const isPro = PAID_TIERS.includes(accountType)

    return {
        userId: user.id,
        accountType,
        ownAccountType,
        subscriptionActive: ownSubscriptionActive || Boolean(company?.inherited && isPro),
        isVerifiedPro,
        // Un compte gratuit publie librement (avis personnel). Un compte pro engage une identité
        // commerciale : sa vérification SIRET/KYC doit être validée avant toute publication.
        // Un employé en lecture seule ne publie pas non plus.
        canPublish: isPro
            ? isVerifiedPro && (company ? company.canWrite : true)
            : true,
        company,
    }
}

/**
 * Fragment de filtre Prisma pour lire une ressource : la sienne, ou celle de son entreprise.
 *
 * @param {object} access - contexte résolu par resolveAccess
 * @param {string} ownerField - champ portant le créateur ('userId' ou 'authorId' selon le modèle)
 * @returns {object} à étaler dans un `where` : { OR: [...] }
 */
export function companyScopeFilter(access, ownerField = 'userId') {
    const mine = { [ownerField]: access.userId }

    // Sans entreprise, la portée reste strictement personnelle : le comportement historique.
    if (!access.company) return mine

    return {
        OR: [
            mine,
            { producerProfileId: access.company.id },
        ],
    }
}

/**
 * L'entreprise à laquelle rattacher une ressource nouvellement créée. Par défaut tout ce qu'un
 * membre produit appartient à la société — sinon les données partiraient avec l'employé.
 */
export function owningCompanyId(access) {
    return access.company?.id || null
}

/**
 * Peut-on modifier/supprimer cette ressource ?
 *
 * - son créateur : toujours (y compris un lecteur sur ses propres données) ;
 * - une ressource d'entreprise : selon le rôle (un `viewer` consulte sans modifier).
 */
export function canModifyResource(access, resource, ownerField = 'userId') {
    if (!resource) return false
    if (resource[ownerField] === access.userId) return true

    if (resource.producerProfileId && access.company?.id === resource.producerProfileId) {
        return Boolean(access.company.canWrite)
    }

    return false
}

/**
 * Variante de `canModifyResource` prenant la requête : résout et mémorise `req.access` au passage.
 * Conçue pour remplacer en une ligne les gardes historiques `if (x.userId !== req.user.id)`, qui
 * refusaient l'accès à un employé sur une ressource pourtant détenue par son entreprise.
 */
export async function canModifyFor(req, resource, ownerField = 'userId') {
    const access = req.access || (await resolveAccess(req.user))
    req.access = access
    return canModifyResource(access, resource, ownerField)
}

/**
 * Même logique pour la lecture : sa ressource, celle de son entreprise, ou une ressource publique.
 */
export async function canReadFor(req, resource, ownerField = 'userId') {
    if (!resource) return false
    if (resource.isPublic) return true

    const access = req.access || (await resolveAccess(req.user))
    req.access = access

    if (resource[ownerField] === access.userId) return true
    return Boolean(resource.producerProfileId && access.company?.id === resource.producerProfileId)
}

/**
 * Équivalent de `requireOwnershipOrThrow` conscient de l'entreprise, pour les reviews.
 *
 * L'ancien helper comparait `review.authorId` à l'utilisateur courant : un collègue habilité était
 * donc refusé sur une review pourtant détenue par sa société. On lui substitue la même règle que
 * partout ailleurs — créateur, ou membre de l'entreprise propriétaire avec droit d'écriture.
 *
 * @throws {APIError} NOT_OWNER si l'utilisateur n'a pas le droit de modifier
 */
export async function requireReviewWriteOrThrow(req, review) {
    if (!req.user) throw Errors.UNAUTHORIZED()
    if (await canModifyFor(req, review, 'authorId')) return
    throw Errors.NOT_OWNER('review')
}

/**
 * Middleware : expose `req.access`. À monter sur les routes qui décident d'un droit, pour éviter
 * que chaque handler refasse les mêmes requêtes.
 */
export async function attachAccess(req, res, next) {
    try {
        req.access = await resolveAccess(req.user)
        next()
    } catch (error) {
        next(error)
    }
}

/**
 * Les formulaires de review n'envoient pas `isPublic` au même endroit selon le type de produit :
 * Fleur le pose à plat sur le corps multipart, tandis que Hash/Concentré/Comestible l'imbriquent
 * dans le champ JSON `data`. On inspecte donc les deux, sans quoi le contrôle serait contournable
 * en passant simplement par un type de review qui utilise l'autre forme.
 */
function requestWantsPublic(body) {
    if (!body) return false

    const isTrue = (value) => value === true || value === 'true'
    if (isTrue(body.isPublic)) return true

    if (body.data) {
        try {
            const nested = typeof body.data === 'string' ? JSON.parse(body.data) : body.data
            if (isTrue(nested?.isPublic)) return true
        } catch {
            // `data` illisible : le handler le rejettera lui-même, rien à autoriser ici.
        }
    }

    return false
}

/**
 * Middleware : refuse la publication publique à un compte pro non vérifié.
 * Ne s'applique qu'aux requêtes qui demandent effectivement `isPublic: true` — enregistrer ou
 * modifier une review privée reste libre.
 */
export async function requirePublishingAllowed(req, res, next) {
    if (!requestWantsPublic(req.body)) return next()

    try {
        const access = req.access || (await resolveAccess(req.user))
        req.access = access

        if (!access.canPublish) {
            const reason = access.company && !access.company.canWrite
                ? 'Votre rôle dans l’entreprise ne permet pas de publier.'
                : 'Votre entreprise doit être vérifiée (SIRET/KYC) avant de pouvoir publier publiquement.'

            return res.status(403).json({
                error: 'publication_not_allowed',
                message: reason,
                verificationRequired: !access.isVerifiedPro,
            })
        }

        next()
    } catch (error) {
        next(error)
    }
}

/**
 * Middleware : exige un droit d'écriture au sein de l'entreprise (bloque les employés `viewer`).
 */
export async function requireCompanyWrite(req, res, next) {
    try {
        const access = req.access || (await resolveAccess(req.user))
        req.access = access

        if (access.company && !access.company.canWrite) {
            return res.status(403).json({
                error: 'read_only_member',
                message: 'Votre rôle dans l’entreprise est en lecture seule.',
            })
        }

        next()
    } catch (error) {
        next(error)
    }
}
