import PropTypes from 'prop-types';
import { useOrchardStore } from '../../store/orchardStore';
import { RATIO_DIMENSIONS } from '../../utils/orchardHelpers';
import ModernCompactTemplate from '../templates/ModernCompactTemplate';
import DetailedCardTemplate from '../templates/DetailedCardTemplate';
import BlogArticleTemplate from '../templates/BlogArticleTemplate';
import SocialStoryTemplate from '../templates/SocialStoryTemplate';
import CustomTemplate from '../shared/config/CustomTemplate';

// Mapping des templates
const TEMPLATES = {
    modernCompact: ModernCompactTemplate,
    detailedCard: DetailedCardTemplate,
    blogArticle: BlogArticleTemplate,
    socialStory: SocialStoryTemplate
    ,
    custom: CustomTemplate
};

export default function TemplateRenderer({ config, reviewData, activeModules = null, pageMode = false }) {
    let TemplateComponent = TEMPLATES[config.template];
    const templatesMeta = useOrchardStore((state) => state.templates);
    // If the configured template is a registered custom template (layout=custom) use CustomTemplate
    if (!TemplateComponent && templatesMeta?.[config.template]?.layout === 'custom') {
        // fallback to generic custom template
        TemplateComponent = CustomTemplate;
    }

    // If the stored review explicitly selected a custom layout mode, force the CustomTemplate
    if (reviewData?.orchardLayoutMode === 'custom') {
        TemplateComponent = CustomTemplate;
    }

    // Filtrer les modules si `activeModules` est fourni (utilisé pour passer les modules pertinents par produit)
    const filteredConfig = activeModules ? {
        ...config,
        contentModules: Object.fromEntries(
            Object.entries(config.contentModules).map(([key, value]) => [
                key,
                activeModules.includes(key) ? value : false
            ])
        )
    } : config;

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

    const dimensions = RATIO_DIMENSIONS[config.ratio] || RATIO_DIMENSIONS['1:1'];

    return (
        // Canvas always rendered at TARGET pixel dimensions (no maxWidth/maxHeight clamping).
        // Preview wrappers (PagedPreviewPane, PreviewPane) apply CSS transform scale-to-fit.
        // html-to-image captures this element at native resolution for full-quality exports.
        <div
            className="orchard-template-container shadow-2xl rounded-xl"
            id="orchard-template-canvas"
            data-width={dimensions.width}
            data-height={dimensions.height}
            data-ratio={config.ratio}
            style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                contain: 'layout style paint',
                overflow: 'hidden',
                position: 'relative',
                isolation: 'isolate',
                flexShrink: 0,
            }}
        >
            <div
                className="orchard-template-inner"
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <TemplateComponent
                    config={filteredConfig}
                    reviewData={reviewData}
                    dimensions={dimensions}
                    pageMode={pageMode}
                />
            </div>
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
    pageMode: PropTypes.bool
};


