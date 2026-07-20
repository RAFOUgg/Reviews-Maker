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
import { sendCompanyInviteEmail } from '../services/email.js'

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

    const inviteToken = crypto.randomBytes(32).toString('hex')

    const member = existing
        ? await prisma.companyMember.update({
            where: { id: existing.id },
            data: { role, status: 'invited', inviteToken, invitedByUserId: req.user.id, invitedAt: new Date(), revokedAt: null }
        })
        : await prisma.companyMember.create({
            data: {
                producerProfileId, email: normalizedEmail, role,
                invitedByUserId: req.user.id, inviteToken, status: 'invited'
            }
        })

    const inviteLink = `${process.env.FRONTEND_URL}/company/invite/${inviteToken}`
    try {
        await sendCompanyInviteEmail(normalizedEmail, inviteLink, context.producerProfile.companyName, role, req.user.locale || 'fr')
    } catch (err) {
        // L'invitation existe déjà en base (le titulaire peut renvoyer le lien manuellement) —
        // un échec d'envoi ne doit pas faire échouer la création de l'invitation elle-même.
        console.error('sendCompanyInviteEmail failed:', err)
    }

    res.status(201).json({ id: member.id, email: member.email, role: member.role, status: member.status })
}))

// GET /api/company/invite/:token — détails de l'invitation, accessible sans être connecté (pour
// afficher "Entreprise X vous invite..." avant login/register).
router.get('/invite/:token', optionalAuth, asyncHandler(async (req, res) => {
    const member = await prisma.companyMember.findUnique({
        where: { inviteToken: req.params.token },
        include: { producerProfile: { select: { companyName: true, businessType: true } } }
    })

    if (!member || member.status !== 'invited') {
        throw Errors.NOT_FOUND('Invitation')
    }

    res.json({
        companyName: member.producerProfile.companyName,
        businessType: member.producerProfile.businessType,
        role: member.role,
        email: member.email
    })
}))

// POST /api/company/invite/:token/accept — le caller doit être connecté ; le token est la preuve
// de possession de l'invitation (pas de vérification d'égalité d'email, un compte OAuth peut ne
// pas avoir le même email que celui invité).
router.post('/invite/:token/accept', requireAuth, asyncHandler(async (req, res) => {
    const member = await prisma.companyMember.findUnique({ where: { inviteToken: req.params.token } })

    if (!member || member.status !== 'invited') {
        throw Errors.NOT_FOUND('Invitation')
    }

    // Un compte ne peut pas être son propre employé, ni rejoindre s'il possède déjà une entreprise.
    const ownProfile = await prisma.producerProfile.findUnique({ where: { userId: req.user.id } })
    if (ownProfile && ownProfile.id === member.producerProfileId) {
        throw Errors.FORBIDDEN()
    }

    const updated = await prisma.companyMember.update({
        where: { id: member.id },
        data: { userId: req.user.id, status: 'active', joinedAt: new Date(), inviteToken: null }
    })

    res.json({ id: updated.id, role: updated.role, status: updated.status })
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
