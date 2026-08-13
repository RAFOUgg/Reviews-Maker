import { useRef } from 'react';
import PropTypes from 'prop-types';
import ModernCompactTemplate from '../templates/ModernCompactTemplate';
import DetailedCardTemplate from '../templates/DetailedCardTemplate';
import BlogArticleTemplate from '../templates/BlogArticleTemplate';
import SocialStoryTemplate from '../templates/SocialStoryTemplate';
import TraceabilityReportTemplate from '../templates/TraceabilityReportTemplate';
import { buildExportReviewData } from '../../utils/exportDataAdapter';
import { RATIO_DIMENSIONS } from '../../utils/exportMakerHelpers';
import { InteractivityProvider } from './interactive/InteractiveContext';
import BlockZoomOverlay from './interactive/BlockZoomOverlay';
import BlockDragOverlay from './interactive/BlockDragOverlay';

// Mapping des templates
const TEMPLATES = {
    modernCompact: ModernCompactTemplate,
    detailedCard: DetailedCardTemplate,
    blogArticle: BlogArticleTemplate,
    socialStory: SocialStoryTemplate,
    traceabilityReport: TraceabilityReportTemplate
};

// Les dimensions viennent de `exportMakerHelpers` — ce fichier en gardait une copie littérale, ce
// qui rendait impossible d'ajouter un format sans le déclarer à deux endroits (et le projet a déjà
// payé six fois le prix d'un vocabulaire dupliqué, cf. CLAUDE.md).

export default function TemplateRenderer({ config, reviewData, activeModules = null, pageModuleIds = null, pageStretch = null, pageColumns = null, pageGap = null, transparentBackground = false, pageMode = false, canvasId = 'export-maker-canvas', className = '', allowOverflow = false, interactive = true, onReorderBlocks = null }) {
    const canvasRef = useRef(null);
    let TemplateComponent = TEMPLATES[config.template];
    const adaptedReviewData = buildExportReviewData(reviewData);

    // Mode Custom (glisser-déposer libre) retiré du produit (2026-08-02) — une review sauvegardée
    // avant ce retrait (config.template === 'custom' ou exportMakerLayoutMode === 'custom') retombe
    // sur Fiche Détaillée plutôt que sur l'écran d'erreur générique "Template non trouvé" ci-dessous,
    // qui reste lui réservé à un véritable id de template inconnu/invalide.
    // Le repli ne s'applique QUE si aucun template valide n'est sélectionné. Il était auparavant
    // déclenché par `exportMakerLayoutMode === 'custom'` seul : toute review sauvegardée du temps du
    // Mode Custom voyait donc son choix de template ÉCRASÉ vers Fiche Technique, silencieusement et
    // définitivement — le sélecteur affichait bien Moderne Compact, le rendu montrait autre chose.
    // Un choix explicite et valide de l'utilisateur prime toujours sur un drapeau hérité.
    if (!TemplateComponent && (config.template === 'custom' || reviewData?.exportMakerLayoutMode === 'custom')) {
        TemplateComponent = TEMPLATES.detailedCard;
    }

    const dimensions = RATIO_DIMENSIONS[config.ratio] || RATIO_DIMENSIONS['1:1'];

    // `traceabilityReport` est un rapport continu (Sections non filtrées par page, cf.
    // `shouldAutoLockPagination`) — toujours traité comme un document qui grandit avec son contenu,
    // quel que soit l'appelant, plutôt qu'un canevas à hauteur fixe qui couperait silencieusement
    // tout ce qui dépasse (même bug de fond que celui corrigé 2026-07-27 sur /r/:id).
    const effectiveAllowOverflow = allowOverflow || config.template === 'traceabilityReport';

    // Filtrer les modules si on est en mode page. `pageModuleIds` (pagination adaptative, Chantier D
    // 2026-07-31) est un mécanisme DISTINCT et prioritaire des anciens `activeModules` : les ids
    // adaptatifs (`masthead`, `pipeline:xxx`, `gisement:xxx`...) ne correspondent pas au vocabulaire
    // `contentModules` filtré ci-dessous — leur appliquer le même filtrage forcerait à `false` tout
    // champ non nommé identiquement (title/image/rating/...), cassant l'affichage. Pour une page
    // adaptative, `contentModules` reste donc intact (les réglages utilisateur globaux) et c'est
    // `DetailedCardTemplate`'s `isPageOn()` (piloté par `pageModuleIds`) qui restreint le contenu.
    // `pageColumns` : une page dont le contenu tient dans une seule colonne se rend en une colonne
    // (cf. `computeAdaptivePages`) — sinon `column-fill: balance` la coupe en deux moitiés côte à
    // côte et laisse le bas de page vide. Décidé au packing, où l'on connaît les hauteurs mesurées ;
    // le template ne fait que l'appliquer.
    // `pageColumns` s'applique QUE la page soit filtrée ou non : un rendu à page unique reçoit lui
    // aussi le nombre de colonnes décidé par la mesure. Il était auparavant imbriqué dans la branche
    // `pageModuleIds`, donc silencieusement perdu sur ce chemin-là.
    const pageOverrides = pageColumns ? { pageColumns } : {};
    const filteredConfig = pageModuleIds
        ? { ...config, pageModuleIds, ...pageOverrides }
        : (activeModules && pageMode ? {
            ...config,
            contentModules: Object.fromEntries(
                Object.entries(config.contentModules).map(([key, value]) => [
                    key,
                    activeModules.includes(key) ? value : false
                ])
            ),
            ...pageOverrides,
        } : { ...config, ...pageOverrides });

    // `allowOverflow` : pas de hauteur fixe à annoncer via `data-height` — `ExportModal.jsx`'s
    // `prepareCapture()` lit `dataset.height` en PRIORITÉ sur la vraie hauteur mesurée
    // (`offsetHeight`) ; `undefined` fait omettre l'attribut par React, pour que ce repli s'applique
    // et capture toute la hauteur réellement grandie plutôt qu'un cadre à la taille nominale du
    // ratio qui laissait ~46% d'espace vide (ou aurait coupé le contenu sur une review plus dense) —
    // trouvé en vérification 2026-08-02 sur le rapport de traçabilité.
    const capturedHeight = effectiveAllowOverflow ? undefined : dimensions.height;

    if (!TemplateComponent) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl p-8">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-600 dark:text-red-400 font-medium">
                        Template non trouvé: {config.template}
                    </p>
                </div>
            </div>
        );
    }

    // ÉTIREMENT DES BLOCS ÉLASTIQUES — résorption de l'espace vide d'une page.
    //
    // `computeAdaptivePages` calcule, page par page, le reliquat de hauteur inoccupé et le répartit
    // sur les blocs qui savent grandir (photo, canevas, graphiques — cf. `ELASTIC_MODULES`). On
    // l'applique ici en CSS plutôt que dans chaque template : les blocs portent déjà leur
    // `data-module`, une règle suffit donc à couvrir les CINQ templates sans dupliquer la logique
    // dans chacun — et sans toucher au corps des templates, dont c'est justement l'absence de
    // contrat commun qui a laissé 9 réglages sur 12 dériver.
    const stretchCss = pageStretch && Object.keys(pageStretch).length > 0
        ? Object.entries(pageStretch)
            // Les ids contiennent `:` et `#` (`pipeline:culture#0`) — à échapper dans un sélecteur.
            .map(([id, cible]) => `#${canvasId} [data-module="${id.replace(/"/g, '\\"')}"]{min-height:${cible}px}`)
            .join('')
        : '';

    // AÉRATION d'une page à une colonne dont aucun bloc ne peut s'étirer (cf. `computeAdaptivePages`) :
    // le vide part dans les intervalles plutôt qu'en bas de page. `:last-child` exclu — une marge
    // sous le dernier bloc rallongerait la page sans rien aérer.
    const gapCss = pageGap
        ? `#${canvasId} [data-module]:not(:last-child){margin-bottom:${pageGap}px}`
        : '';

    // FOND TRANSPARENT (option PNG de la modale d'export). Elle passait `backgroundColor:
    // 'transparent'` à la capture — ce qui ne décide que du fond DERRIÈRE le nœud capturé, jamais
    // du fond que le template peint lui-même sur sa racine. Vérifié sur un PNG réellement
    // téléchargé le 2026-08-12 : alpha 255 dans le coin, soit une option strictement inerte.
    // On neutralise donc le fond à la source, sur la racine du template — le seul élément qui le
    // porte. Le `<style>` vit dans le canevas, donc il est sérialisé avec lui par html-to-image.
    const transparentCss = transparentBackground
        ? `#${canvasId} > *{background:transparent !important}`
        : '';

    return (
        <div
            ref={canvasRef}
            id={canvasId}
            className={className || undefined}
            data-width={dimensions.width}
            data-height={capturedHeight}
            data-ratio={config.ratio}
            data-stretch={stretchCss ? Object.keys(pageStretch).length : undefined}
            data-gap={pageGap || undefined}
            style={{
                width: dimensions.width,
                // `allowOverflow` : la page publique /r/:id est un document vivant qui défile
                // normalement, pas un export figé à taille fixe (PNG/PDF) — un canevas à hauteur
                // bloquée y coupait silencieusement tout contenu dépassant les dimensions du ratio
                // (bug corrigé 2026-07-27). Les consommateurs de capture (ExportModal, MiniPreview)
                // gardent le comportement à hauteur fixe, requis pour produire une image/PDF net.
                height: effectiveAllowOverflow ? 'auto' : dimensions.height,
                minHeight: effectiveAllowOverflow ? dimensions.height : undefined,
                overflow: effectiveAllowOverflow ? 'visible' : 'hidden',
                position: 'relative',
                isolation: 'isolate',
            }}
        >
            {/* Règle d'étirement de la page courante. Une balise `<style>` locale au canevas plutôt
                qu'une feuille globale : deux pages montées simultanément (export multi-pages
                hors-écran) portent chacune la sienne, sans se marcher dessus. */}
            {(stretchCss || gapCss || transparentCss) && <style>{stretchCss + gapCss + transparentCss}</style>}
            {/* `interactive` (phase 7.1) : vrai à l'écran, faux sur les arbres montés pour la
                capture (ExportModal monte les siens hors-écran) et pour la mesure de pagination.
                Les composants interactifs le lisent via `useIsInteractive()` et n'attachent alors
                ni handler ni affordance visuelle — un PNG ne se clique pas. */}
            <InteractivityProvider interactive={interactive}>
                <TemplateComponent
                    config={filteredConfig}
                    reviewData={adaptedReviewData}
                    dimensions={dimensions}
                    pageMode={pageMode}
                />
            </InteractivityProvider>
            {/* Zoom au clic — additif et strictement lié à `interactive` : jamais monté sur un
                arbre de capture ni de mesure, donc invisible pour un export. */}
            <BlockZoomOverlay containerRef={canvasRef} enabled={interactive} />
            {/* Glisser-déposer des blocs — seulement là où un ordre PEUT être écrit, c'est-à-dire
                quand l'appelant fournit `onReorderBlocks` (le Studio). Une page publique montre le
                rendu, elle ne le compose pas : sans ce prop, la surcouche n'est pas montée. */}
            <BlockDragOverlay containerRef={canvasRef} enabled={interactive && Boolean(onReorderBlocks)} onReorder={onReorderBlocks || (() => {})} />
        </div>
    );
}

TemplateRenderer.propTypes = {
    config: PropTypes.shape({
        template: PropTypes.string.isRequired,
        ratio: PropTypes.string.isRequired,
        typography: PropTypes.object,
        colors: PropTypes.object,
        contentModules: PropTypes.object,
        moduleOrder: PropTypes.array,
        image: PropTypes.object,
        branding: PropTypes.object
    }).isRequired,
    reviewData: PropTypes.object.isRequired,
    activeModules: PropTypes.arrayOf(PropTypes.string),
    pageModuleIds: PropTypes.arrayOf(PropTypes.string),
    pageStretch: PropTypes.object,
    /** Nombre de colonnes imposé à CETTE page (1 sur une page légère) — voir computeAdaptivePages. */
    pageColumns: PropTypes.number,
    /** Espace supplémentaire entre blocs, pour aérer une page qu'aucun bloc élastique ne remplit. */
    pageGap: PropTypes.number,
    /** Neutralise le fond peint par le template — option « fond transparent » de l'export PNG. */
    transparentBackground: PropTypes.bool,
    pageMode: PropTypes.bool,
    canvasId: PropTypes.string,
    className: PropTypes.string,
    allowOverflow: PropTypes.bool,
    /** Faux sur un arbre monté pour la capture ou la mesure : aucune affordance, aucun handler. */
    interactive: PropTypes.bool,
    /** `(ordre: string[]) => void` — active le glisser-déposer des blocs sur le rendu. */
    onReorderBlocks: PropTypes.func
};


