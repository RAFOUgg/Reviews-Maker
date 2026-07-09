/**
 * lotCode.js
 *
 * Identifiant de lot dérivé — répond au constat le plus fondamental de l'étude de marché
 * traçabilité (2026-07-09, cf. mémoire `market-study-traceability-positioning-2026-07`) : aucun
 * identifiant unique de lot/plante n'existe nulle part dans le schéma, alors que c'est la brique de
 * base de tous les systèmes du marché (tag RFID METRC, CPLI GS1, hash blockchain TruTrace).
 *
 * Design "zéro migration, zéro nouveau système" : une review représente déjà, par nature, un lot
 * physique précis — le code est dérivé de façon déterministe depuis `Review.id` (UUID déjà stable
 * et unique), jamais stocké séparément. Recalculable à l'identique à tout moment.
 *
 * ATTENTION : ce code n'a AUCUNE valeur légale/réglementaire (contrairement à un tag METRC/BioTrack)
 * — c'est un identifiant de confort/référence interne à Reviews-Maker. Ne jamais présenter ce code
 * comme un numéro de traçabilité officiel dans l'UI (cf. tooltip systématique dans les usages).
 */

const PREFIX = 'TRP';

// Retire les tirets de l'UUID puis prend les 8 premiers caractères — suffisant pour l'usage
// "référence humaine courte", pas un identifiant cryptographique (l'id complet reste la clé réelle).
export function getLotCode(reviewId) {
    if (!reviewId) return null;
    const compact = String(reviewId).replace(/-/g, '').toUpperCase();
    if (compact.length < 8) return `${PREFIX}-${compact}`;
    return `${PREFIX}-${compact.slice(0, 8)}`;
}

// URL publique vers laquelle le QR code doit pointer — la review elle-même, seule cible stable
// disponible tant que le Chantier 6 (export figé) n'existe pas encore.
export function getLotCodeUrl(reviewId, origin = (typeof window !== 'undefined' ? window.location.origin : '')) {
    if (!reviewId) return null;
    return `${origin}/review/${reviewId}`;
}
