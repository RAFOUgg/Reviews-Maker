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
// Accepte l'id OU la review : si la review porte un vrai code de lot stocké (`shareCode`, créé
// à la demande via POST /api/reviews/:id/share-code — L16, 2026-10-28), c'est lui qui est affiché
// et imprimé. Sinon, repli sur le code dérivé historique (aucune fiche existante ne change).
export function getLotCode(reviewOrId) {
    if (reviewOrId && typeof reviewOrId === 'object' && reviewOrId.shareCode) return reviewOrId.shareCode;
    const reviewId = reviewOrId && typeof reviewOrId === 'object' ? reviewOrId.id : reviewOrId;
    if (!reviewId) return null;
    const compact = String(reviewId).replace(/-/g, '').toUpperCase();
    if (compact.length < 8) return `${PREFIX}-${compact}`;
    return `${PREFIX}-${compact.slice(0, 8)}`;
}

// URL publique vers laquelle le QR code doit pointer — le lien HTML vivant (Chantier B de la
// finalisation Export Maker, `/r/:id`) plutôt que `/review/:id` : page sans chrome ni boutons
// d'édition, pensée pour être scannée/partagée, qui re-rend toujours les données actuelles.
// Avec un shareCode : lien court `/l/:code` (court = QR moins dense, lisible même petit sur un
// sachet ; et le code survit à un changement d'URL de la fiche). Sinon `/r/:id` comme avant.
export function getLotCodeUrl(reviewOrId, origin = (typeof window !== 'undefined' ? window.location.origin : '')) {
    if (reviewOrId && typeof reviewOrId === 'object' && reviewOrId.shareCode) return `${origin}/l/${reviewOrId.shareCode}`;
    const reviewId = reviewOrId && typeof reviewOrId === 'object' ? reviewOrId.id : reviewOrId;
    if (!reviewId) return null;
    return `${origin}/r/${reviewId}`;
}
