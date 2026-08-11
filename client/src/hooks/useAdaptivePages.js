import { useEffect, useRef, useState } from 'react';
import { getDefaultPages } from '../store/exportMakerPagesStore';
import { TEMPLATE_PAGINATION } from '../store/exportMakerConstants';
import { shouldAutoLockPagination, getResponsiveAdjustments } from '../utils/exportMakerHelpers';
import { computeAdaptivePages } from '../utils/adaptivePagination';
import { measureDetailedCardModules } from '../components/templates/measureDetailedCardModules';

// Pilote (2026-07-31) : la pagination adaptative a d'abord été câblée sur `detailedCard` seul,
// cohérent avec le reste de la refonte DA "COA v2" qui a commencé par un template pilote avant
// tout rollout. Étendue (Phase C, 2026-08-03) à `modernCompact`/`blogArticle`/`socialStory` — les
// 3 templates statiques restants équipés du même contrat `data-module`/`isPageOn` (voir
// `measureDetailedCardModules.jsx`/`TEMPLATE_COMPONENTS`). `traceabilityReport` reste hors
// pagination (document continu qui défile, jamais paginé — voir `shouldAutoLockPagination`).
// Dérivé du contrat de pagination (matrice C4) plutôt que listé en dur : `modernCompact` et
// `socialStory` en sortent — ce sont des CARTES, elles ne se paginent pas. Mesuré avant cette
// règle : Story produisait 6 pages dont trois remplies à 4,1 %.
const ADAPTIVE_TEMPLATES = new Set(
    Object.entries(TEMPLATE_PAGINATION).filter(([, on]) => on).map(([id]) => id)
);

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
 * @returns {{ pages: Array, isAdaptive: boolean, isMeasuring: boolean }}
 *
 * `isMeasuring` (2026-08-05) : vrai tant que la mesure est en cours. Le hook pose immédiatement
 * un repli STATIQUE (`getDefaultPages`) pour qu'un export déclenché tout de suite ne soit jamais
 * vide — mais ce repli est presque toujours FAUX, et le remplacer ~2 s plus tard produisait un
 * reflow visible : l'aperçu affichait « 1/5 » puis basculait à « 1/8 » avec un contenu différent.
 * Les consommateurs qui AFFICHENT (aperçu Studio) doivent attendre `isMeasuring === false` plutôt
 * que de montrer une mise en page qu'on sait provisoire ; ceux qui EXPORTENT gardent le repli.
 */
export function useAdaptivePages(reviewData, config, { enabled = true } = {}) {
    const [state, setState] = useState(() => ({
        pages: getDefaultPages(reviewData?.type, config?.ratio),
        isAdaptive: false,
        isMeasuring: false,
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

        // NE PAS conditionner la mesure à une heuristique de densité.
        //
        // `shouldAutoLockPagination` devine si une review est « dense » à partir d'indices indirects
        // (au moins 4 catégories de notes, plus de 4 arômes, plus de 5 effets, ou une timeline de
        // pipeline). Ces indices décrivent une FLEUR. Une review Comestible n'a aucune timeline — sa
        // recette n'en est pas une — et porte moins de catégories sensorielles : elle tombait donc
        // sous le seuil, la mesure n'était jamais lancée, et le repli statique la rendait sur UNE
        // page. Mesuré le 2026-08-11 (Comestible dense, Article de Blog, 16:9) : page remplie à
        // 147 %, soit du contenu réellement coupé à l'export — et l'absence de sonde de budget dans
        // la trace d'audit prouvait que `computeAdaptivePages` n'avait jamais été appelée.
        //
        // La seule grandeur qui répond à « faut-il paginer ? » est la hauteur RÉELLE du contenu face
        // au budget de la page. On la mesure donc systématiquement sur les templates paginables (le
        // résultat est mis en cache par review/template/ratio/typo, cf. `getCachedMeasurement`), et
        // c'est `computeAdaptivePages` qui tranche : une seule page en sortie = rien à paginer.
        // Deviner la densité à partir de proxys est précisément le motif d'erreur qui s'est déjà
        // répété six fois dans Export Maker.
        const canAdapt = enabled && reviewData && config
            && ADAPTIVE_TEMPLATES.has(template)
            && !isCustomMode;
        // L'état est posé APRÈS avoir déterminé si une mesure va suivre : sans ça, on annonçait
        // `isMeasuring: false` avec un repli statique pendant deux secondes, exactement le reflow
        // qu'on cherche à supprimer.
        setState({ pages: getDefaultPages(reviewData?.type, ratio), isAdaptive: false, isMeasuring: canAdapt });
        if (!canAdapt) return;

        const cacheKey = `${reviewId}|${template}|${ratio}|${contentModulesSignature}|${JSON.stringify(config.typography || {})}`;
        getCachedMeasurement(cacheKey, reviewData, config)
            .then((heights) => {
                if (requestIdRef.current !== requestId) return; // une mesure plus récente a démarré entre-temps
                const { padding } = getResponsiveAdjustments(ratio, config.typography);
                const adaptivePages = computeAdaptivePages(heights, ratio, padding.container, template);
                if (adaptivePages.length >= 2) {
                    setState({ pages: adaptivePages, isAdaptive: true, isMeasuring: false });
                } else {
                    setState((prev) => ({ ...prev, isMeasuring: false }));
                }
                // Sinon : on garde le repli statique déjà posé plus haut (contenu trop léger pour
                // que la mesure produise plus d'une page, ou mesure vide).
            })
            .catch(() => {
                // Mesure échouée — le repli statique reste en place (jamais d'export vide), mais on
                // libère l'affichage : mieux vaut une mise en page approchée qu'un écran bloqué.
                if (requestIdRef.current === requestId) setState((prev) => ({ ...prev, isMeasuring: false }));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, template, ratio, isCustomMode, contentModulesSignature, enabled]);

    return state;
}

export default useAdaptivePages;
