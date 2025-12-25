/**
 * Service de gestion de la conformité légale
 * Gère la vérification d'âge, le consentement RDR, et la validation par pays
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Valide l'âge minimum requis selon le pays
 * @param {Date} birthDate - Date de naissance
 * @param {string} country - Code pays ISO
 * @returns {{isValid: boolean, message?: string}}
 */
export function validateAge(birthDate, country) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }

    // Âge minimum selon le pays
    const minAge = getMinimumAge(country)

    if (age < minAge) {
        return {
            isValid: false,
            message: `Vous devez avoir au moins ${minAge} ans pour accéder à cette plateforme dans votre pays.`,
        }
    }

    return { isValid: true }
}

/**
 * Retourne l'âge minimum requis pour un pays
 * @param {string} country - Code pays ISO (FR, CA, US, etc.)
 * @returns {number} Âge minimum
 */
export function getMinimumAge(country) {
    const ageRequirements = {
        FR: 18, // France
        CA: 19, // Canada (varie par province, 19 par défaut)
        US: 21, // États-Unis
        GB: 18, // Royaume-Uni
        DE: 18, // Allemagne
        ES: 18, // Espagne
        IT: 18, // Italie
        NL: 18, // Pays-Bas
        BE: 18, // Belgique
        CH: 18, // Suisse
    }

    return ageRequirements[country] || 21 // Par défaut : 21 ans
}

/**
 * Enregistre la vérification d'âge de l'utilisateur
 * @param {number} userId - ID utilisateur
 * @param {Date} birthDate - Date de naissance
 * @param {string} country - Code pays
 * @param {string} ipAddress - Adresse IP
 */
export async function recordAgeVerification(userId, birthDate, country, ipAddress) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            legalAge: true,
            country: country,
            birthDate: birthDate,
        },
    })

    // Log dans l'audit
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'AGE_VERIFICATION',
            details: JSON.stringify({
                country,
                ipAddress,
                verifiedAt: new Date().toISOString(),
            }),
        },
    })
}

/**
 * Enregistre le consentement RDR de l'utilisateur
 * @param {number} userId - ID utilisateur
 * @param {string} ipAddress - Adresse IP
 */
export async function recordRDRConsent(userId, ipAddress) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            consentRDR: true,
            consentDate: new Date(),
            ipAddress: ipAddress,
        },
    })

    // Log dans l'audit
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'RDR_CONSENT',
            details: JSON.stringify({
                ipAddress,
                consentedAt: new Date().toISOString(),
            }),
        },
    })
}

/**
 * Vérifie si un pays est autorisé
 * @param {string} country - Code pays ISO
 * @returns {{allowed: boolean, message?: string}}
 */
export function isCountryAllowed(country) {
    // Liste des pays où le cannabis est illégal ou fortement restreint
    const restrictedCountries = [
        'CN', // Chine
        'JP', // Japon
        'SG', // Singapour
        'ID', // Indonésie
        'MY', // Malaisie
        'TH', // Thaïlande (sauf médical récent)
        'PH', // Philippines
        'AE', // Émirats arabes unis
        'SA', // Arabie Saoudite
    ]

    if (restrictedCountries.includes(country)) {
        return {
            allowed: false,
            message:
                'Désolé, cette plateforme n\'est pas accessible depuis votre pays en raison des lois locales sur le cannabis.',
        }
    }

    return { allowed: true }
}

/**
 * Récupère le statut légal complet d'un utilisateur
 * @param {number} userId - ID utilisateur
 * @returns {Promise<object>} Statut légal
 */
export async function getLegalStatus(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            legalAge: true,
            consentRDR: true,
            consentDate: true,
            country: true,
            ipAddress: true,
        },
    })

    return user
}
