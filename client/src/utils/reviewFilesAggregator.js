/**
 * reviewFilesAggregator.js
 *
 * Extrait la liste des fichiers (photos, vidéos, certificats PDF) d'une ou plusieurs reviews déjà
 * chargées (via /api/reviews/my ou /api/reviews/:id) — réutilisé par le sélecteur de médias du
 * canvas "Chaîne de production" (fichiers des reviews du canvas courant) et par l'onglet
 * "Fichiers" de ProductAddSidebar (fichiers de toutes les reviews de l'utilisateur). Ne fait
 * jamais de requête réseau elle-même : les appelants passent déjà les objets review chargés.
 */

import { getImageUrl } from './imageUtils';

function isVideoUrl(url) {
    return /\.(mp4|webm|mov|avi|m4v)(\?|$)/i.test(url || '');
}

/**
 * @param {object} review - Review déjà flattenée par le backend (formatReview) : `images` déjà
 * fusionné depuis la bonne sous-table, `labReportUrl`/`terpeneFileUrl` remontés à la racine.
 * @returns {Array<{key, reviewId, reviewType, reviewLabel, url, type, label}>}
 */
export function extractReviewFiles(review) {
    if (!review) return [];
    const label = review.cultivars || review.name || review.holderName || 'Sans nom';
    const reviewType = review.type || review.reviewType;
    const files = [];

    const images = Array.isArray(review.images) ? review.images : [];
    images.forEach((img, index) => {
        const raw = typeof img === 'string' ? img : (img?.url || img?.preview || '');
        if (!raw) return;
        const url = getImageUrl(raw);
        files.push({
            key: `${review.id}-media-${index}`,
            reviewId: review.id,
            reviewType,
            reviewLabel: label,
            url,
            type: isVideoUrl(url) ? 'video' : 'photo'
        });
    });

    if (review.labReportUrl) {
        files.push({
            key: `${review.id}-coa`,
            reviewId: review.id,
            reviewType,
            reviewLabel: label,
            url: getImageUrl(review.labReportUrl),
            type: 'pdf',
            label: 'Certificat d\'analyse (COA)'
        });
    }
    if (review.terpeneFileUrl) {
        files.push({
            key: `${review.id}-terp`,
            reviewId: review.id,
            reviewType,
            reviewLabel: label,
            url: getImageUrl(review.terpeneFileUrl),
            type: 'pdf',
            label: 'Certificat terpènes'
        });
    }

    return files;
}

/** Agrège les fichiers de plusieurs reviews déjà chargées (ex: liste /api/reviews/my). */
export function extractFilesFromReviews(reviews) {
    return (Array.isArray(reviews) ? reviews : []).flatMap(extractReviewFiles);
}

/**
 * Charge le détail complet (labReportUrl/terpeneFileUrl inclus, absents de la liste /my) pour un
 * ensemble précis de reviewIds — utilisé par le sélecteur scopé au canvas (peu de reviews, un
 * fetch par nœud est acceptable ; contrairement à l'onglet "Fichiers" qui réutilise directement
 * la liste /api/reviews/my déjà chargée, désormais enrichie côté backend, cf. reviewFormatter.js).
 */
export async function fetchReviewFilesFor(reviewIds) {
    const uniqueIds = [...new Set((reviewIds || []).filter(Boolean))];
    const results = await Promise.all(uniqueIds.map(id =>
        fetch(`/api/reviews/${id}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
    ));
    return results.filter(Boolean).flatMap(extractReviewFiles);
}
