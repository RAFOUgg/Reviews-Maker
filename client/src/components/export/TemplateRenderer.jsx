import PropTypes from 'prop-types';
import { useExportMakerStore } from '../../store/exportMakerStore';
import ModernCompactTemplate from '../templates/ModernCompactTemplate';
import DetailedCardTemplate from '../templates/DetailedCardTemplate';
import BlogArticleTemplate from '../templates/BlogArticleTemplate';
import SocialStoryTemplate from '../templates/SocialStoryTemplate';
import TraceabilityReportTemplate from '../templates/TraceabilityReportTemplate';
import CustomTemplate from '../shared/config/CustomTemplate';
import { buildExportReviewData } from '../../utils/exportDataAdapter';

// Mapping des templates
const TEMPLATES = {
    modernCompact: ModernCompactTemplate,
    detailedCard: DetailedCardTemplate,
    blogArticle: BlogArticleTemplate,
    socialStory: SocialStoryTemplate,
    traceabilityReport: TraceabilityReportTemplate
    ,
    custom: CustomTemplate
};

// Ratios et dimensions
const RATIO_DIMENSIONS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 } // 210mm x 297mm at 210 DPI
};

export default function TemplateRenderer({ config, reviewData, activeModules = null, pageModuleIds = null, pageMode = false, canvasId = 'export-maker-canvas', className = '', allowOverflow = false }) {
    let TemplateComponent = TEMPLATES[config.template];
    const templatesMeta = useExportMakerStore((state) => state.templates);
    const adaptedReviewData = buildExportReviewData(reviewData);

    // If the configured template is a registered custom template (layout=custom) use CustomTemplate
    if (!TemplateComponent && templatesMeta?.[config.template]?.layout === 'custom') {
        // fallback to generic custom template
        TemplateComponent = CustomTemplate;
    }

    // If the stored review explicitly selected a custom layout mode, force the CustomTemplate
    if (reviewData?.exportMakerLayoutMode === 'custom') {
        TemplateComponent = CustomTemplate;
    }

    const dimensions = RATIO_DIMENSIONS[config.ratio] || RATIO_DIMENSIONS['1:1'];

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
            data-height={dimensions.height}
            data-ratio={config.ratio}
            style={{
                width: dimensions.width,
                // `allowOverflow` : la page publique /r/:id est un document vivant qui défile
                // normalement, pas un export figé à taille fixe (PNG/PDF) — un canevas à hauteur
                // bloquée y coupait silencieusement tout contenu dépassant les dimensions du ratio
                // (bug corrigé 2026-07-27). Les consommateurs de capture (ExportModal, MiniPreview)
                // gardent le comportement à hauteur fixe, requis pour produire une image/PDF net.
                height: allowOverflow ? 'auto' : dimensions.height,
                minHeight: allowOverflow ? dimensions.height : undefined,
                overflow: allowOverflow ? 'visible' : 'hidden',
                position: 'relative',
                isolation: 'isolate',
            }}
        >
            <TemplateComponent
                config={filteredConfig}
                reviewData={adaptedReviewData}
                dimensions={dimensions}
                pageMode={pageMode}
            />
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
    allowOverflow: PropTypes.bool
};


