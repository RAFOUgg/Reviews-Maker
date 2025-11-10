import PropTypes from 'prop-types';

// Template simplifié pour les stories (format vertical 9:16)
export default function SocialStoryTemplate({ config, reviewData }) {
    const { typography, colors, contentModules } = config;

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-8"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily
            }}
        >
            <div className="space-y-6 text-center">
                {contentModules.image && reviewData.imageUrl && (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden">
                        <img
                            src={reviewData.imageUrl}
                            alt={reviewData.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {contentModules.title && reviewData.title && (
                    <h1
                        style={{
                            fontSize: `${typography.titleSize}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.2'
                        }}
                    >
                        {reviewData.title}
                    </h1>
                )}

                {contentModules.rating && reviewData.rating && (
                    <div
                        style={{
                            fontSize: `${typography.titleSize + 12}px`,
                            fontWeight: '900',
                            color: colors.accent
                        }}
                    >
                        {parseFloat(reviewData.rating).toFixed(1)}★
                    </div>
                )}
            </div>
        </div>
    );
}

SocialStoryTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired
};
