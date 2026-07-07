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

function safeParseArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// Sous-table (flowerData/hashData/concentrateData) → trames à cellules qui peuvent porter des
// médias attachés (cf. PipelineCellMediaPreview.jsx / MediaAttachmentModal.jsx), mêmes clés que
// REVIEW_TYPE_PIPELINES dans chainCellPipelines.js. L'edible n'a pas de timeline (recette only),
// donc pas d'entrée ici.
const PIPELINE_MEDIA_SOURCES = {
    flowerData: [
        { dataKey: 'cultureTimelineData', label: 'Culture' },
        { dataKey: 'curingTimelineData', label: 'Curing' }
    ],
    hashData: [
        { dataKey: 'separationTimelineData', label: 'Séparation' },
        { dataKey: 'curingTimelineData', label: 'Curing' }
    ],
    concentrateData: [
        { dataKey: 'extractionTimelineData', label: 'Extraction' },
        { dataKey: 'curingTimelineData', label: 'Curing' }
    ]
};

/**
 * Médias attachés aux cellules de pipeline (culture/curing/séparation/extraction) d'une review —
 * distinct de `review.images` (photos générales de la fiche). Chaque entrée de timeline porte son
 * propre tableau `media` (cf. entry.media dans PipelineDragDropView.jsx handleDataChange), à plat,
 * pas nichée sous `entry.data`.
 * @param {object} review - Review avec ses sous-tables incluses (flowerData/hashData/concentrateData),
 * comme retourné par GET /api/reviews/:id.
 */
function extractPipelineFiles(review) {
    const label = review.cultivars || review.name || review.holderName || 'Sans nom';
    const reviewType = review.type || review.reviewType;
    const files = [];

    Object.entries(PIPELINE_MEDIA_SOURCES).forEach(([subTableKey, sources]) => {
        const subTable = review[subTableKey];
        if (!subTable) return;

        sources.forEach(({ dataKey, label: pipelineLabel }) => {
            const entries = safeParseArray(subTable[dataKey]);
            entries.forEach((entry, entryIdx) => {
                const media = Array.isArray(entry?.media) ? entry.media : [];
                media.forEach((item, itemIdx) => {
                    if (!item?.url) return;
                    // Contrairement à review.images (filenames bruts nécessitant le préfixage
                    // /images/ de getImageUrl), les médias de pipeline sont déjà des chemins
                    // complets et directement utilisables : /media/xxx (upload frais, cf.
                    // server-new/routes/media-upload.js, servi par server.js sur /media, PAS
                    // /images) ou /images/xxx (photo choisie depuis "Ma bibliothèque", déjà résolue
                    // par ReviewPhotoLibraryPicker). Repasser par getImageUrl() ici double-préfixait
                    // les chemins /media/ en /images//media/xxx — URL cassée, vignette illisible.
                    const url = item.url;
                    files.push({
                        key: `${review.id}-${dataKey}-${entry?.timestamp ?? entryIdx}-${itemIdx}`,
                        reviewId: review.id,
                        reviewType,
                        reviewLabel: `${label} — ${pipelineLabel}`,
                        url,
                        type: item.type === 'video' || isVideoUrl(url) ? 'video' : 'photo'
                    });
                });
            });
        });
    });

    return files;
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

    files.push(...extractPipelineFiles(review));

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
