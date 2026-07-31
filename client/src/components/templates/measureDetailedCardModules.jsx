import { createRoot } from 'react-dom/client';
import DetailedCardTemplate from './DetailedCardTemplate';
import { RATIO_DIMENSIONS } from '../../utils/exportMakerHelpers';

// Délai de stabilisation avant mesure — même ordre de grandeur que le délai déjà utilisé ailleurs
// dans Export Maker pour laisser React Flow terminer son `fitView()` avant capture
// (`ProductionChainCanvas.handleExportSVG`) ; couvre aussi le chargement de l'image principale et
// le premier paint de Recharts (`CultureStatsChart`).
const STABILIZE_DELAY_MS = 700;

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

/**
 * Mesure réellement la hauteur rendue de chaque bloc `data-module` de `DetailedCardTemplate` — un
 * mécanisme qui n'existait nulle part dans le code avant ce chantier (`getResponsiveAdjustments` ne
 * fait que redimensionner en place, jamais mesurer). Monte un rendu complet (tous les modules
 * activés, `pageModuleIds` désactivé) dans un conteneur hors-écran à la largeur réelle du ratio
 * ciblé, attend la stabilisation, lit `getBoundingClientRect()` sur chaque `[data-module]`, puis
 * démonte et nettoie.
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
            root.render(<DetailedCardTemplate config={measureConfig} reviewData={reviewData} dimensions={dims} />);
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
