/**
 * Middleware de vérification légale pour la conformité RDR
 */

const { calculateLegalAge, isCountryAllowed } = require('../config/legal');

/**
 * Vérifie que l'utilisateur a l'âge légal et a donné son consentement RDR
 * Middleware à appliquer sur toutes les routes protégées
 */
function verifyLegalAge(req, res, next) {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const user = req.user;

    // Vérifier que le pays est autorisé
    if (!user.country || !isCountryAllowed(user.country)) {
        return res.status(403).json({
            error: 'country_not_allowed',
            message: 'Votre pays ne permet pas l\'accès à cette plateforme',
            requiredAction: 'update_country',
        });
    }

    // Vérifier que l'utilisateur a renseigné sa date de naissance
    if (!user.birthdate) {
        return res.status(403).json({
            error: 'birthdate_required',
            message: 'Veuillez renseigner votre date de naissance',
            requiredAction: 'update_birthdate',
        });
    }

    // Calculer si l'utilisateur a l'âge légal
    const hasLegalAge = calculateLegalAge(user.birthdate, user.country, user.region);

    if (!hasLegalAge) {
        return res.status(403).json({
            error: 'underage',
            message: 'Vous devez avoir l\'âge légal pour accéder à cette plateforme',
            requiredAction: 'contact_support',
        });
    }

    // Vérifier que l'utilisateur a accepté le consentement RDR
    if (!user.consentRDR) {
        return res.status(403).json({
            error: 'consent_required',
            message: 'Vous devez accepter les conditions de réduction des risques',
            requiredAction: 'accept_consent',
        });
    }

    // Mettre à jour legalAge dans la DB si ce n'est pas déjà fait
    if (!user.legalAge) {
        req.user.legalAge = true;
        // Note: Cette mise à jour sera effectuée par un hook Prisma ou manuellement
    }

    next();
}

/**
 * Middleware optionnel : Vérifie uniquement l'âge (pas le consentement)
 * Utile pour les routes d'onboarding où on collecte le consentement
 */
function checkAgeOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const user = req.user;

    if (!user.birthdate || !user.country) {
        return res.status(403).json({
            error: 'profile_incomplete',
            message: 'Veuillez compléter votre profil (date de naissance et pays)',
            requiredAction: 'complete_profile',
        });
    }

    const hasLegalAge = calculateLegalAge(user.birthdate, user.country, user.region);

    if (!hasLegalAge) {
        return res.status(403).json({
            error: 'underage',
            message: 'Vous devez avoir l\'âge légal pour accéder à cette plateforme',
        });
    }

    next();
}

/**
 * Middleware : Vérifie que l'utilisateur n'est pas banni
 */
function checkBanStatus(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    if (req.user.isBanned) {
        return res.status(403).json({
            error: 'account_banned',
            message: req.user.banReason || 'Votre compte a été suspendu',
            bannedAt: req.user.bannedAt,
        });
    }

    next();
}

module.exports = {
    verifyLegalAge,
    checkAgeOnly,
    checkBanStatus,
};
