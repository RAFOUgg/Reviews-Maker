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
    // L'ordre des blocs fait partie de la clé : le packing est SÉQUENTIEL (cf. `computeAdaptivePages`),
    // donc deux ordres différents produisent une répartition en pages différente à hauteurs
    // identiques. Sans cette part de clé, réordonner un bloc laissait l'ancienne pagination en cache.
    const moduleOrderSignature = Array.isArray(config?.moduleOrder) ? config.moduleOrder.join('>') : '';

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

        const cacheKey = `${reviewId}|${template}|${ratio}|${contentModulesSignature}|${moduleOrderSignature}|${JSON.stringify(config.typography || {})}`;
        getCachedMeasurement(cacheKey, reviewData, config)
            .then((heights) => {
                if (requestIdRef.current !== requestId) return; // une mesure plus récente a démarré entre-temps
                const { padding } = getResponsiveAdjustments(ratio, config.typography);
                const adaptivePages = computeAdaptivePages(heights, ratio, padding.container, template);
                // UNE page mesurée vaut mieux que le repli statique.
                //
                // Le seuil était `>= 2` : dès que le contenu tenait sur une seule page, tout le
                // résultat de la mesure était JETÉ au profit du gabarit statique. Or une page
                // adaptative ne dit pas seulement « quels modules » : elle porte aussi son
                // étirement élastique, son nombre de colonnes et son aération (cf.
                // `computeAdaptivePages`). Les jeter revenait à priver de toute résorption
                // exactement les rendus qui en ont le plus besoin — ceux d'une review peu fournie.
                // Mesuré le 2026-08-12 sur la matrice complète : Fiche Technique 4:3 à 34 %,
                // Rapport de Traçabilité A4 à 17,7 %, une vingtaine de pages sous les 65 %.
                //
                // Une page mesurée VIDE reste écartée : ce serait une mesure ratée, pas un rendu.
                if (adaptivePages.length >= 1 && adaptivePages[0]?.modules?.length > 0) {
                    setState({ pages: adaptivePages, isAdaptive: true, isMeasuring: false });
                } else {
                    setState((prev) => ({ ...prev, isMeasuring: false }));
                }
            })
            .catch(() => {
                // Mesure échouée — le repli statique reste en place (jamais d'export vide), mais on
                // libère l'affichage : mieux vaut une mise en page approchée qu'un écran bloqué.
                if (requestIdRef.current === requestId) setState((prev) => ({ ...prev, isMeasuring: false }));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, template, ratio, isCustomMode, contentModulesSignature, moduleOrderSignature, enabled]);

    return state;
}

/**
 * Ids des blocs que le template rend RÉELLEMENT pour cette review, dans leur ordre courant.
 *
 * Source unique : la mesure hors-écran (`measureDetailedCardModules`), qui monte le template complet
 * et relève ses `[data-module]` dans l'ordre du DOM — donc l'ordre de lecture effectif, pas une
 * liste tenue à la main quelque part. Toute autre méthode (énumérer ce qu'un template « devrait »
 * rendre) serait un septième vocabulaire deviné.
 *
 * Partage le cache de `useAdaptivePages` : appelé sur la même review/config, il ne déclenche aucune
 * mesure supplémentaire.
 */
export function useTemplateModuleIds(reviewData, config, { enabled = true } = {}) {
    const [ids, setIds] = useState([]);
    const requestIdRef = useRef(0);

    const reviewId = reviewData?.id;
    const template = config?.template;
    const ratio = config?.ratio;
    const contentModulesSignature = config?.contentModules ? JSON.stringify(config.contentModules) : '';
    const moduleOrderSignature = Array.isArray(config?.moduleOrder) ? config.moduleOrder.join('>') : '';

    useEffect(() => {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;
        if (!enabled || !reviewData || !config || !template) { setIds([]); return; }

        // Débounce : ce hook vit dans le panneau Contenu, à côté d'une centaine d'interrupteurs.
        // Chaque bascule change `contentModules`, donc la clé de mesure. Sur les templates non
        // paginés (Moderne Compact, Story), aucune autre mesure ne tourne pour partager le résultat :
        // cocher dix cases enchaînerait dix montages hors-écran d'un template complet, canevas et
        // requêtes réseau compris. On attend que la rafale se termine.
        const timer = setTimeout(() => {
            const cacheKey = `${reviewId}|${template}|${ratio}|${contentModulesSignature}|${moduleOrderSignature}|${JSON.stringify(config.typography || {})}`;
            getCachedMeasurement(cacheKey, reviewData, config)
                .then((heights) => {
                    if (requestIdRef.current !== requestId) return;
                    setIds([...heights.keys()]);
                })
                .catch(() => { if (requestIdRef.current === requestId) setIds([]); });
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, template, ratio, contentModulesSignature, moduleOrderSignature, enabled]);

    return ids;
}

export default useAdaptivePages;
