import { createRoot } from 'react-dom/client';
import DetailedCardTemplate from './DetailedCardTemplate';
import ModernCompactTemplate from './ModernCompactTemplate';
import BlogArticleTemplate from './BlogArticleTemplate';
import SocialStoryTemplate from './SocialStoryTemplate';
import { RATIO_DIMENSIONS } from '../../utils/exportMakerHelpers';
import { buildExportReviewData } from '../../utils/exportDataAdapter';
import { InteractivityProvider } from '../export/interactive/InteractiveContext';

// Délai de stabilisation avant mesure — couvre le chargement de l'image principale, le premier
// paint de Recharts (`CultureStatsChart`) et React Flow qui termine son `fitView()`.
// Durci 700ms → 1500ms (Phase C, rollout à 3 templates supplémentaires, 2026-08-03) :
// `ReadOnlyGenealogyCanvas`/`ReadOnlyProductionChainCanvas` font CHACUN jusqu'à 2 fetch réseau
// séquentiels (liste puis détail) avant de poser leurs données en state et se rendre — tant que ces
// fetch n'ont pas résolu, le composant rend `null` (hauteur mesurée nulle), et `computeAdaptivePages`
// exclut silencieusement tout module dont la hauteur mesurée est ~0 (`entries.filter(h > 4)`), le
// pire des modes de défaillance déjà documenté sur ce chantier (disparition, pas débordement). Trouvé
// en vérification (Story Social Media, ratio 1:1) : "Chaîne de production" absent de tout export
// alors que présent en 9:16 pour la même review — course perdue entre les 2 fetch et le délai de
// stabilisation. 700ms ne laissait pas de marge pour 2 aller-retours réseau séquentiels.
const STABILIZE_DELAY_MS = 1500;

// `document.fonts.ready` (Font Loading API, tous navigateurs évergreens) — la Fiche Technique
// Détaillée charge Space Grotesk/JetBrains Mono via Google Fonts (`client/index.html`, correctif
// #10). Mesurer AVANT que ces polices soient prêtes lit les hauteurs de texte rendues avec la
// police système de repli (FOUT) — largeur/interlignage différents de la police réelle, donc un
// nombre de lignes (et une hauteur) potentiellement plus petits que ce que produira le rendu final
// une fois les polices chargées. Trouvé en vérification 2026-07-31 : la section "Commentaire"
// débordait du canevas exporté alors que la mesure l'avait placée comme tenant dans la page —
// écart mesure/rendu final cohérent avec une police de repli plus étroite au moment de la mesure.
function waitForFonts() {
    if (typeof document === 'undefined' || !document.fonts?.ready) return Promise.resolve();
    return document.fonts.ready.catch(() => {});
}

// Registre des composants de template mesurables (Phase C du plan de finition Export Maker,
// 2026-08-03) — `measureTemplateModules` était jusqu'ici câblé en dur sur `DetailedCardTemplate`
// (pilote de la pagination adaptative). Généralisé pour accepter n'importe quel template déjà
// équipé du même contrat (`data-module` sur ses blocs + `isPageOn(pageModuleIds)`), sans dupliquer
// la logique de montage hors-écran/mesure/nettoyage ci-dessous pour chacun.
const TEMPLATE_COMPONENTS = {
    detailedCard: DetailedCardTemplate,
    modernCompact: ModernCompactTemplate,
    blogArticle: BlogArticleTemplate,
    socialStory: SocialStoryTemplate,
};

export function registerMeasurableTemplate(id, Component) {
    TEMPLATE_COMPONENTS[id] = Component;
}

/**
 * Mesure réellement la hauteur rendue de chaque bloc `data-module` du template ciblé
 * (`config.template`) — un mécanisme qui n'existait nulle part dans le code avant ce chantier
 * (`getResponsiveAdjustments` ne fait que redimensionner en place, jamais mesurer). Monte un rendu
 * complet (tous les modules activés, `pageModuleIds` désactivé) dans un conteneur hors-écran à la
 * largeur réelle du ratio ciblé, attend la stabilisation, lit `getBoundingClientRect()` sur chaque
 * `[data-module]`, puis démonte et nettoie.
 *
 * @param {Object} reviewData
 * @param {Object} config - config Export Maker (template/ratio/typography/colors/contentModules...)
 * @returns {Promise<Map<string, number>>} id de module → hauteur mesurée en px
 */
export function measureDetailedCardModules(reviewData, config) {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            resolve(new Map());
            return;
        }
        const TemplateComponent = TEMPLATE_COMPONENTS[config?.template] || DetailedCardTemplate;
        const dims = RATIO_DIMENSIONS[config?.ratio] || RATIO_DIMENSIONS['1:1'];

        const host = document.createElement('div');
        host.setAttribute('data-adaptive-pagination-measure', 'true');
        host.style.cssText = `position:fixed; left:-99999px; top:0; width:${dims.width}px; height:auto; opacity:0; pointer-events:none; overflow:visible; z-index:-1;`;
        document.body.appendChild(host);

        const cleanup = () => {
            try { root.unmount(); } catch { /* déjà démonté */ }
            if (host.parentNode) host.parentNode.removeChild(host);
        };

        let root;
        try {
            root = createRoot(host);
            // `pageModuleIds: null` explicite : tout doit être visible pour être mesuré, quel que
            // soit un éventuel appel imbriqué avec une pagination déjà active sur `config`.
            const measureConfig = { ...config, pageModuleIds: null };
            // `buildExportReviewData` (même adaptateur que `TemplateRenderer.jsx`) — sans lui,
            // `extractPipelines()` ne trouve jamais `pipelineGlobal`/`pipelineCuring`/... (des clés
            // SYNTHÉTISÉES par l'adaptateur, absentes du `reviewData` brut) : le module pipeline
            // mesure une hauteur nulle/absente, donc `pageModuleIds` ne le contient jamais, et
            // "Processus de production"/"Statistiques de culture" disparaissent silencieusement de
            // l'aperçu Studio (mesuré) même s'ils s'affichent très bien via le bouton "Exporter"
            // autonome (qui, lui, applique déjà l'adaptateur) — bug trouvé en vérification 2026-08-02.
            const adaptedReviewData = buildExportReviewData(reviewData);
            // `interactive={false}` : cet arbre sert à MESURER les hauteurs qui pilotent la
            // pagination. Il doit être strictement identique à l'arbre exporté, jamais à l'arbre
            // affiché — sinon la pagination serait calculée sur un rendu qui n'est pas celui du PNG.
            root.render(
                <InteractivityProvider interactive={false}>
                    <TemplateComponent config={measureConfig} reviewData={adaptedReviewData} dimensions={dims} />
                </InteractivityProvider>
            );
        } catch (err) {
            if (host.parentNode) host.parentNode.removeChild(host);
            reject(err);
            return;
        }

        const delay = new Promise((r) => setTimeout(r, STABILIZE_DELAY_MS));
        Promise.all([delay, waitForFonts()]).then(() => {
            try {
                const heights = new Map();
                host.querySelectorAll('[data-module]').forEach((el) => {
                    const id = el.getAttribute('data-module');
                    if (!id) return;
                    const rect = el.getBoundingClientRect();
                    const marginBottom = parseFloat(getComputedStyle(el).marginBottom) || 0;
                    const height = rect.height + marginBottom;
                    heights.set(id, Math.max(heights.get(id) || 0, height));
                });
                cleanup();
                resolve(heights);
            } catch (err) {
                cleanup();
                reject(err);
            }
        });
    });
}

export default measureDetailedCardModules;
