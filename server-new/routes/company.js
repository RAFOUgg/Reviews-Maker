/**
 * Sous-comptes employés d'une entreprise (CompanyMember, rattaché au ProducerProfile du titulaire).
 * Chaque employé garde son propre compte (login séparé) — cf. plan
 * account-page-company-hierarchy-plan-2026-07 en mémoire. Rôles : owner (implicite, titulaire du
 * ProducerProfile) > admin > editor > viewer. admin peut inviter/gérer editor/viewer mais pas
 * d'autres admin ; seul owner gère les admin.
 */
import express from 'express'
import crypto from 'crypto'
import { prisma } from '../server.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler, Errors } from '../utils/errorHandler.js'
import { sendCompanyInviteEmail, sendCompanyInviteOwnerEmail } from '../services/email.js'

const router = express.Router()

const ROLES = ['admin', 'editor', 'viewer']

// Résout la relation du caller à une entreprise : soit propriétaire (owner) via son propre
// ProducerProfile, soit membre actif d'une entreprise d'un autre titulaire.
async function resolveCallerCompany(userId) {
    const ownedProfile = await prisma.producerProfile.findUnique({ where: { userId } })
    if (ownedProfile) {
        return { producerProfile: ownedProfile, role: 'owner', membership: null }
    }

    const membership = await prisma.companyMember.findFirst({
        where: { userId, status: 'active' },
        include: { producerProfile: true }
    })
    if (membership) {
        return { producerProfile: membership.producerProfile, role: membership.role, membership }
    }

    return null
}

function canManageMembers(role) {
    return role === 'owner' || role === 'admin'
}

// GET /api/company/me — entreprise du caller (propriétaire ou membre actif), avec la liste des
// membres si le caller peut la voir (owner/admin/editor/viewer : tous les membres actifs voient la liste).
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
    const context = await resolveCallerCompany(req.user.id)
    if (!context) {
        return res.json({ company: null })
    }

    const { producerProfile, role } = context
    const members = await prisma.companyMember.findMany({
        where: { producerProfileId: producerProfile.id, status: { in: ['invited', 'active'] } },
        select: {
            id: true, email: true, role: true, status: true,
            invitedAt: true, joinedAt: true,
            // Double validation : permet d'afficher qui doit encore se prononcer.
            ownerDecision: true, inviteeDecision: true,
            user: { select: { id: true, username: true, avatar: true } }
        },
        orderBy: { invitedAt: 'asc' }
    })

    res.json({
        company: {
            id: producerProfile.id,
            name: producerProfile.companyName,
            businessType: producerProfile.businessType,
            isVerified: producerProfile.isVerified,
        },
        myRole: role,
        canManageMembers: canManageMembers(role),
        members
    })
}))

// POST /api/company/members/invite — { email, role } — owner/admin uniquement.
router.post('/members/invite', requireAuth, asyncHandler(async (req, res) => {
    const context = await resolveCallerCompany(req.user.id)
    if (!context || !canManageMembers(context.role)) {
        throw Errors.FORBIDDEN()
    }

    const { email, role } = req.body
    if (!email || !String(email).trim()) {
        throw Errors.MISSING_FIELD('email')
    }
    if (!ROLES.includes(role)) {
        throw Errors.MISSING_FIELD('role')
    }
    // Seul owner peut créer/gérer des admin — un admin ne peut inviter qu'editor/viewer.
    if (role === 'admin' && context.role !== 'owner') {
        throw Errors.FORBIDDEN()
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const producerProfileId = context.producerProfile.id

    const existing = await prisma.companyMember.findUnique({
        where: { producerProfileId_email: { producerProfileId, email: normalizedEmail } }
    })
    if (existing && existing.status !== 'revoked') {
        return res.status(409).json({ error: 'already_invited', message: 'Cette adresse a déjà une invitation ou un accès actif' })
    }

    // Double validation : un jeton distinct par partie, chacun envoyé à sa propre adresse.
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const ownerToken = crypto.randomBytes(32).toString('hex')

    // Le titulaire de l'entreprise (destinataire de la confirmation) n'est pas forcément le
    // demandeur : un admin peut inviter, c'est bien le titulaire qui valide.
    const ownerUser = await prisma.user.findUnique({
        where: { id: context.producerProfile.userId },
        select: { email: true, locale: true }
    })

    const freshInvite = {
        role,
        status: 'invited',
        inviteToken,
        ownerToken,
        inviteeDecision: null,
        ownerDecision: null,
        inviteeDecidedAt: null,
        ownerDecidedAt: null,
        invitedByUserId: req.user.id,
        invitedAt: new Date(),
        revokedAt: null,
        joinedAt: null,
    }

    const member = existing
        ? await prisma.companyMember.update({ where: { id: existing.id }, data: freshInvite })
        : await prisma.companyMember.create({
            data: { producerProfileId, email: normalizedEmail, ...freshInvite }
        })

    const inviteLink = `${process.env.FRONTEND_URL}/company/invite/${inviteToken}`
    const ownerLink = `${process.env.FRONTEND_URL}/company/invite/${ownerToken}`

    // Un échec d'envoi ne doit pas annuler l'invitation déjà enregistrée : les liens restent
    // valides et peuvent être renvoyés. On remonte cependant l'information au client.
    const delivery = { invitee: true, owner: true }

    try {
        await sendCompanyInviteEmail(normalizedEmail, inviteLink, context.producerProfile.companyName, role, req.user.locale || 'fr')
    } catch (err) {
        delivery.invitee = false
        console.error('sendCompanyInviteEmail failed:', err)
    }

    try {
        if (!ownerUser?.email) throw new Error('titulaire sans adresse email')
        await sendCompanyInviteOwnerEmail(
            ownerUser.email, ownerLink, context.producerProfile.companyName,
            normalizedEmail, role, ownerUser.locale || 'fr'
        )
    } catch (err) {
        delivery.owner = false
        console.error('sendCompanyInviteOwnerEmail failed:', err)
    }

    res.status(201).json({
        id: member.id, email: member.email, role: member.role, status: member.status,
        awaiting: 'both',
        delivery,
    })
}))

/**
 * Retrouve une invitation depuis l'un ou l'autre jeton, et indique quelle partie le présente.
 * @returns {{ member, party: 'invitee'|'owner' } | null}
 */
async function findByAnyToken(token) {
    const asInvitee = await prisma.companyMember.findUnique({
        where: { inviteToken: token },
        include: { producerProfile: { select: { companyName: true, businessType: true, userId: true } } }
    })
    if (asInvitee) return { member: asInvitee, party: 'invitee' }

    const asOwner = await prisma.companyMember.findUnique({
        where: { ownerToken: token },
        include: { producerProfile: { select: { companyName: true, businessType: true, userId: true } } }
    })
    if (asOwner) return { member: asOwner, party: 'owner' }

    return null
}

// GET /api/company/invite/:token — détails, accessible sans être connecté (pour afficher
// "Entreprise X vous invite..." avant login/register). Le jeton détermine la partie concernée.
router.get('/invite/:token', optionalAuth, asyncHandler(async (req, res) => {
    const found = await findByAnyToken(req.params.token)
    if (!found || !['invited', 'active'].includes(found.member.status)) {
        throw Errors.NOT_FOUND('Invitation')
    }

    const { member, party } = found
    const myDecision = party === 'owner' ? member.ownerDecision : member.inviteeDecision
    const otherDecision = party === 'owner' ? member.inviteeDecision : member.ownerDecision

    res.json({
        companyName: member.producerProfile.companyName,
        businessType: member.producerProfile.businessType,
        role: member.role,
        email: member.email,
        // Ce que le client doit afficher : qui je suis dans cette invitation, où en sont les deux
        // décisions, et si le rattachement est déjà effectif.
        party,
        myDecision,
        otherDecision,
        status: member.status,
        // L'invité doit être connecté pour accepter (on rattache son compte) ; le titulaire non,
        // la possession du jeton envoyé à son adresse suffit à confirmer sa propre demande.
        requiresLogin: party === 'invitee',
    })
}))

/**
 * POST /api/company/invite/:token/decide  { decision: 'accept' | 'refuse' }
 *
 * Enregistre la décision de la partie qui présente le jeton. Le rattachement n'est effectué que
 * lorsque les DEUX ont accepté ; un seul refus met fin à la demande.
 */
router.post('/invite/:token/decide', optionalAuth, asyncHandler(async (req, res) => {
    const { decision } = req.body || {}
    if (!['accept', 'refuse'].includes(decision)) {
        throw Errors.MISSING_FIELD('decision')
    }

    const found = await findByAnyToken(req.params.token)
    if (!found || found.member.status !== 'invited') {
        throw Errors.NOT_FOUND('Invitation')
    }

    const { member, party } = found
    const value = decision === 'accept' ? 'accepted' : 'refused'

    // Côté invité, accepter suppose un compte : c'est lui qu'on rattache à l'entreprise.
    if (party === 'invitee' && !req.user) {
        return res.status(401).json({
            error: 'authentication_required',
            message: 'Connectez-vous pour accepter cette invitation'
        })
    }

    if (party === 'invitee' && decision === 'accept') {
        // Un compte ne peut pas être son propre employé.
        const ownProfile = await prisma.producerProfile.findUnique({ where: { userId: req.user.id } })
        if (ownProfile && ownProfile.id === member.producerProfileId) {
            throw Errors.FORBIDDEN()
        }
    }

    const data = party === 'owner'
        ? { ownerDecision: value, ownerDecidedAt: new Date(), ownerToken: null }
        : { inviteeDecision: value, inviteeDecidedAt: new Date(), inviteToken: null, userId: req.user.id }

    // Décisions résultantes après cette écriture.
    const ownerDecision = party === 'owner' ? value : member.ownerDecision
    const inviteeDecision = party === 'invitee' ? value : member.inviteeDecision

    if (value === 'refused') {
        // Un refus suffit à clore la demande ; les deux jetons sont invalidés.
        Object.assign(data, { status: 'refused', inviteToken: null, ownerToken: null })
    } else if (ownerDecision === 'accepted' && inviteeDecision === 'accepted') {
        // Les deux ont accepté : le rattachement devient effectif.
        Object.assign(data, { status: 'active', joinedAt: new Date(), inviteToken: null, ownerToken: null })
    }

    const updated = await prisma.companyMember.update({ where: { id: member.id }, data })

    res.json({
        id: updated.id,
        role: updated.role,
        status: updated.status,
        party,
        myDecision: value,
        otherDecision: party === 'owner' ? updated.inviteeDecision : updated.ownerDecision,
        // `active` = les deux ont accepté ; sinon on attend encore l'autre partie.
        linked: updated.status === 'active',
    })
}))

// PATCH /api/company/members/:id — { role } — owner/admin uniquement, un admin ne peut pas
// modifier un autre admin ni le owner.
router.patch('/members/:id', requireAuth, asyncHandler(async (req, res) => {
    const context = await resolveCallerCompany(req.user.id)
    if (!context || !canManageMembers(context.role)) {
        throw Errors.FORBIDDEN()
    }

    const target = await prisma.companyMember.findFirst({
        where: { id: req.params.id, producerProfileId: context.producerProfile.id }
    })
    if (!target) {
        throw Errors.NOT_FOUND('Member')
    }
    if (target.role === 'admin' && context.role !== 'owner') {
        throw Errors.FORBIDDEN()
    }

    const { role } = req.body
    if (!ROLES.includes(role)) {
        throw Errors.MISSING_FIELD('role')
    }
    if (role === 'admin' && context.role !== 'owner') {
        throw Errors.FORBIDDEN()
    }

    const updated = await prisma.companyMember.update({ where: { id: target.id }, data: { role } })
    res.json({ id: updated.id, role: updated.role })
}))

// DELETE /api/company/members/:id — révoque l'accès (soft delete via status, on garde l'historique).
router.delete('/members/:id', requireAuth, asyncHandler(async (req, res) => {
    const context = await resolveCallerCompany(req.user.id)
    if (!context || !canManageMembers(context.role)) {
        throw Errors.FORBIDDEN()
    }

    const target = await prisma.companyMember.findFirst({
        where: { id: req.params.id, producerProfileId: context.producerProfile.id }
    })
    if (!target) {
        throw Errors.NOT_FOUND('Member')
    }
    if (target.role === 'admin' && context.role !== 'owner') {
        throw Errors.FORBIDDEN()
    }

    await prisma.companyMember.update({ where: { id: target.id }, data: { status: 'revoked', revokedAt: new Date() } })
    res.status(204).end()
}))

// POST /api/company/leave — un membre actif quitte l'entreprise de son propre chef.
router.post('/leave', requireAuth, asyncHandler(async (req, res) => {
    const membership = await prisma.companyMember.findFirst({ where: { userId: req.user.id, status: 'active' } })
    if (!membership) {
        throw Errors.NOT_FOUND('Membership')
    }

    await prisma.companyMember.update({ where: { id: membership.id }, data: { status: 'revoked', revokedAt: new Date() } })
    res.status(204).end()
}))

export default router
