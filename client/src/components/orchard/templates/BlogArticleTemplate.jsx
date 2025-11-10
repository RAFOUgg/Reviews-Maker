import PropTypes from 'prop-types';

// Template simplifié pour l'article de blog
export default function BlogArticleTemplate({ config, reviewData }) {
    // Validation des props
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-8">
                <p className="text-red-600 dark:text-red-400">Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules } = config;

    return (
        <div
            className="w-full h-full overflow-auto p-12"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily
            }}
        >
            <article className="max-w-3xl mx-auto space-y-6">
                {contentModules.title && reviewData.title && (
                    <h1
                        style={{
                            fontSize: `${typography.titleSize + 8}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.2',
                            marginBottom: '24px'
                        }}
                    >
                        {reviewData.title}
                    </h1>
                )}

                {contentModules.image && reviewData.imageUrl && (
                    <img
                        src={reviewData.imageUrl}
                        alt={reviewData.title}
                        className="w-full rounded-xl"
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                    />
                )}

                {contentModules.description && reviewData.description && (
                    <p
                        style={{
                            fontSize: `${typography.textSize + 2}px`,
                            color: colors.textPrimary,
                            lineHeight: '1.8'
                        }}
                    >
                        {reviewData.description}
                    </p>
                )}
            </article>
        </div>
    );
}

BlogArticleTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired
};
