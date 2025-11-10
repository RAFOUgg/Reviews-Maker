import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
    const { typography, colors, contentModules, image, branding } = config;

    return (
        <div
            className="relative w-full h-full overflow-auto"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
                padding: '48px'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* En-tête avec image et infos principales */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Image */}
                    {contentModules.image && reviewData.imageUrl && (
                        <div
                            className="overflow-hidden"
                            style={{
                                borderRadius: `${image.borderRadius}px`,
                                aspectRatio: '1/1'
                            }}
                        >
                            <img
                                src={reviewData.imageUrl}
                                alt={reviewData.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Informations principales */}
                    <div className="space-y-6">
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
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            width="28"
                                            height="28"
                                            viewBox="0 0 24 24"
                                            fill={i < Math.floor(reviewData.rating) ? colors.accent : 'none'}
                                            stroke={colors.accent}
                                            strokeWidth="2"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <span
                                    style={{
                                        fontSize: `${typography.titleSize - 8}px`,
                                        fontWeight: '700',
                                        color: colors.textPrimary
                                    }}
                                >
                                    {parseFloat(reviewData.rating).toFixed(1)}/5
                                </span>
                            </div>
                        )}

                        {/* Grille d'infos */}
                        <div className="grid grid-cols-2 gap-4">
                            {contentModules.category && reviewData.category && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Catégorie
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.category}
                                    </div>
                                </div>
                            )}

                            {contentModules.thcLevel && reviewData.thcLevel && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        THC
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.thcLevel}%
                                    </div>
                                </div>
                            )}

                            {contentModules.cbdLevel && reviewData.cbdLevel && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        CBD
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.cbdLevel}%
                                    </div>
                                </div>
                            )}

                            {contentModules.cultivar && reviewData.cultivar && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Cultivar
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.cultivar}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description détaillée */}
                {contentModules.description && reviewData.description && (
                    <div>
                        <h2
                            style={{
                                fontSize: `${typography.titleSize - 8}px`,
                                fontWeight: '700',
                                color: colors.title,
                                marginBottom: '16px'
                            }}
                        >
                            Description
                        </h2>
                        <p
                            style={{
                                fontSize: `${typography.textSize}px`,
                                color: colors.textSecondary,
                                lineHeight: '1.8'
                            }}
                        >
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Effets et Arômes */}
                <div className="grid grid-cols-2 gap-8">
                    {contentModules.effects && reviewData.effects && reviewData.effects.length > 0 && (
                        <div>
                            <h3
                                style={{
                                    fontSize: `${typography.titleSize - 12}px`,
                                    fontWeight: '600',
                                    color: colors.title,
                                    marginBottom: '12px'
                                }}
                            >
                                Effets
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {reviewData.effects.map((effect, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: `${colors.accent}20`,
                                            color: colors.accent,
                                            fontWeight: '500'
                                        }}
                                    >
                                        {effect}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {contentModules.aromas && reviewData.aromas && reviewData.aromas.length > 0 && (
                        <div>
                            <h3
                                style={{
                                    fontSize: `${typography.titleSize - 12}px`,
                                    fontWeight: '600',
                                    color: colors.title,
                                    marginBottom: '12px'
                                }}
                            >
                                Arômes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {reviewData.aromas.map((aroma, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: `${colors.accent}20`,
                                            color: colors.accent,
                                            fontWeight: '500'
                                        }}
                                    >
                                        {aroma}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex justify-between items-center pt-6"
                    style={{
                        borderTop: `2px solid ${colors.accent}30`
                    }}
                >
                    {contentModules.author && reviewData.author && (
                        <div
                            style={{
                                fontSize: `${typography.textSize}px`,
                                color: colors.textSecondary
                            }}
                        >
                            Par <span style={{ fontWeight: '600', color: colors.textPrimary }}>{reviewData.author}</span>
                        </div>
                    )}
                    
                    {contentModules.date && reviewData.date && (
                        <div
                            style={{
                                fontSize: `${typography.textSize - 2}px`,
                                color: colors.textSecondary
                            }}
                        >
                            {new Date(reviewData.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Branding */}
            {branding.enabled && branding.logoUrl && (
                <div
                    className="absolute"
                    style={{
                        bottom: '24px',
                        right: '24px',
                        opacity: branding.opacity,
                        width: '80px',
                        height: '80px'
                    }}
                >
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
            )}
        </div>
    );
}

DetailedCardTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};
