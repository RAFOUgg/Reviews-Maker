import { useEffect, useRef, useState } from 'react';
import { getDefaultPages } from '../store/exportMakerPagesStore';
import { shouldAutoLockPagination, getResponsiveAdjustments } from '../utils/exportMakerHelpers';
import { computeAdaptivePages } from '../utils/adaptivePagination';
import { measureDetailedCardModules } from '../components/templates/measureDetailedCardModules';

// Pilote (2026-07-31) : la pagination adaptative n'est câblée QUE pour `detailedCard`, cohérent
// avec le reste de la refonte DA "COA v2" qui a commencé par un template pilote avant tout rollout
// éventuel. Les 4 autres templates gardent `PAGE_TEMPLATES` (statique, `getDefaultPages`).
const ADAPTIVE_TEMPLATES = new Set(['detailedCard']);

// Cache partagé de mesure (Chantier D, correctif 2026-07-31) : `ExportMakerPanel.jsx` (aperçu
// Studio) et `ExportModal.jsx` (export standalone/pages hors-écran) montent CHACUN leur propre
// instance de ce hook pour la MÊME review — sans partage, chacune déclenche sa propre mesure hors-
// écran indépendante, et deux mesures indépendantes peuvent légèrement diverger (chargement de
// police/police déjà en cache, timing), produisant un nombre de pages différent entre l'aperçu et
// l'export réellement téléchargé (trouvé en vérification 2026-07-31 : 4 pages en aperçu, 3 PNG
// exportés, contenu différent). Ce cache garantit qu'un seul calcul tourne par combinaison
// (review/template/ratio/typo/contentModules) — tous les appelants concurrents partagent la MÊME
// Promise et convergent donc systématiquement vers le même résultat.
const measureCache = new Map();
const MEASURE_CACHE_MAX = 20;

function getCachedMeasurement(cacheKey, reviewData, config) {
    if (measureCache.has(cacheKey)) return measureCache.get(cacheKey);
    const promise = measureDetailedCardModules(reviewData, config);
    if (measureCache.size >= MEASURE_CACHE_MAX) {
        measureCache.delete(measureCache.keys().next().value); // éviction FIFO simple
    }
    measureCache.set(cacheKey, promise);
    // Une mesure échouée ne doit pas rester en cache indéfiniment (empêcherait tout retry ultérieur).
    promise.catch(() => measureCache.delete(cacheKey));
    return promise;
}

/**
 * Pagination adaptative : mesure réellement la hauteur rendue de chaque bloc du template puis les
 * répartit en pages selon le budget de hauteur du ratio (voir `adaptivePagination.js` +
 * `measureDetailedCardModules.jsx`) — remplace le lookup statique `PAGE_TEMPLATES` pour
 * `detailedCard`. Pendant la mesure (~700ms, images/canevas à stabiliser) et si la mesure
 * échoue/donne un résultat inutilisable, retombe sur `getDefaultPages` (statique) pour ne jamais
 * laisser un export vide/blanc en attendant. Mode Custom explicitement EXEMPT (mise en page déjà
 * choisie à la main par l'utilisateur — un reflow automatique irait à l'encontre de son intention).
 *
 * @param {Object} reviewData - reviewData BRUT (pré-adaptateur, même contrat que shouldAutoLockPagination)
 * @param {Object} config - config Export Maker courante
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - permet à l'appelant de désactiver le calcul (ex. pagination pas active)
 * @returns {{ pages: Array, isAdaptive: boolean }}
 */
export function useAdaptivePages(reviewData, config, { enabled = true } = {}) {
    const [state, setState] = useState(() => ({
        pages: getDefaultPages(reviewData?.type, config?.ratio),
        isAdaptive: false,
    }));
    const requestIdRef = useRef(0);

    const reviewId = reviewData?.id;
    const template = config?.template;
    const ratio = config?.ratio;
    const isCustomMode = !!config?.isCustomMode;
    const contentModulesSignature = config?.contentModules ? JSON.stringify(config.contentModules) : '';

    useEffect(() => {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        setState({ pages: getDefaultPages(reviewData?.type, ratio), isAdaptive: false });

        const canAdapt = enabled && reviewData && config
            && ADAPTIVE_TEMPLATES.has(template)
            && !isCustomMode
            && shouldAutoLockPagination(reviewData, template);
        if (!canAdapt) return;

        const cacheKey = `${reviewId}|${template}|${ratio}|${contentModulesSignature}|${JSON.stringify(config.typography || {})}`;
        getCachedMeasurement(cacheKey, reviewData, config)
            .then((heights) => {
                if (requestIdRef.current !== requestId) return; // une mesure plus récente a démarré entre-temps
                const { padding } = getResponsiveAdjustments(ratio, config.typography);
                const adaptivePages = computeAdaptivePages(heights, ratio, padding.container);
                if (adaptivePages.length >= 2) {
                    setState({ pages: adaptivePages, isAdaptive: true });
                }
                // Sinon : on garde le repli statique déjà posé plus haut (contenu trop léger pour
                // que la mesure produise plus d'une page, ou mesure vide).
            })
            .catch(() => { /* mesure échouée — repli statique déjà posé, pas d'export vide */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, template, ratio, isCustomMode, contentModulesSignature, enabled]);

    return state;
}

export default useAdaptivePages;
