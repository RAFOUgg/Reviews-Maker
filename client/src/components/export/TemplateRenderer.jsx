import PropTypes from 'prop-types';
import ModernCompactTemplate from '../templates/ModernCompactTemplate';
import DetailedCardTemplate from '../templates/DetailedCardTemplate';
import BlogArticleTemplate from '../templates/BlogArticleTemplate';
import SocialStoryTemplate from '../templates/SocialStoryTemplate';
import TraceabilityReportTemplate from '../templates/TraceabilityReportTemplate';
import { buildExportReviewData } from '../../utils/exportDataAdapter';
import { InteractivityProvider } from './interactive/InteractiveContext';

// Mapping des templates
const TEMPLATES = {
    modernCompact: ModernCompactTemplate,
    detailedCard: DetailedCardTemplate,
    blogArticle: BlogArticleTemplate,
    socialStory: SocialStoryTemplate,
    traceabilityReport: TraceabilityReportTemplate
};

// Ratios et dimensions
const RATIO_DIMENSIONS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 } // 210mm x 297mm at 210 DPI
};

export default function TemplateRenderer({ config, reviewData, activeModules = null, pageModuleIds = null, pageMode = false, canvasId = 'export-maker-canvas', className = '', allowOverflow = false, interactive = true }) {
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
    const filteredConfig = pageModuleIds
        ? { ...config, pageModuleIds }
        : (activeModules && pageMode ? {
            ...config,
            contentModules: Object.fromEntries(
                Object.entries(config.contentModules).map(([key, value]) => [
                    key,
                    activeModules.includes(key) ? value : false
                ])
            )
        } : config);

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

    return (
        <div
            id={canvasId}
            className={className || undefined}
            data-width={dimensions.width}
            data-height={capturedHeight}
            data-ratio={config.ratio}
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
    pageMode: PropTypes.bool,
    canvasId: PropTypes.string,
    className: PropTypes.string,
    allowOverflow: PropTypes.bool,
    /** Faux sur un arbre monté pour la capture ou la mesure : aucune affordance, aucun handler. */
    interactive: PropTypes.bool
};


