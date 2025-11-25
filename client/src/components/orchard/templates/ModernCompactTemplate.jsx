import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function ModernCompactTemplate({ config, reviewData, dimensions }) {
    // Validation des props
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-8">
                <p className="text-red-600 dark:text-red-400">Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules, moduleOrder, image, branding } = config;

    // Helper pour obtenir les modules visibles dans l'ordre
    const getVisibleModules = () => {
        return moduleOrder.filter(moduleName => contentModules[moduleName]);
    };

    // Rendu du rating avec étoiles
    const renderRating = () => {
        if (!contentModules.rating || !reviewData.rating) return null;
        
        const rating = parseFloat(reviewData.rating);
        const stars = [];
        
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating;
            const partial = i === Math.ceil(rating) && rating % 1 !== 0;
            
            stars.push(
                <svg
                    key={i}
                    className="inline-block"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={filled ? colors.accent : 'none'}
                    stroke={colors.accent}
                    strokeWidth="2"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    {partial && (
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"
                            fill={colors.accent}
                        />
                    )}
                </svg>
            );
        }
        
        return (
            <div className="flex items-center gap-2 justify-center">
                <div className="flex gap-1">{stars}</div>
                <span
                    style={{
                        fontFamily: typography.fontFamily,
                        fontSize: `${typography.textSize}px`,
                        fontWeight: typography.textWeight,
                        color: colors.textPrimary
                    }}
                >
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    // Rendu de l'image avec filtres
    const renderImage = () => {
        if (!contentModules.image || !reviewData.imageUrl) return null;
        
        let filterStyle = '';
        switch (image.filter) {
            case 'sepia':
                filterStyle = 'sepia(100%)';
                break;
            case 'grayscale':
                filterStyle = 'grayscale(100%)';
                break;
            case 'blur':
                filterStyle = 'blur(4px)';
                break;
            default:
                filterStyle = 'none';
        }
        
        return (
            <div
                className="w-full overflow-hidden"
                style={{
                    borderRadius: `${image.borderRadius}px`,
                    aspectRatio: image.aspectRatio.replace(':', '/')
                }}
            >
                <img
                    src={reviewData.imageUrl}
                    alt={reviewData.title || 'Review'}
                    className="w-full h-full object-cover"
                    style={{
                        filter: filterStyle,
                        opacity: image.opacity
                    }}
                />
            </div>
        );
    };

    // Rendu des tags
    const renderTags = () => {
        if (!contentModules.tags || !reviewData.tags || reviewData.tags.length === 0) return null;
        
        return (
            <div className="flex flex-wrap gap-2 justify-center">
                {reviewData.tags.slice(0, 5).map((tag, index) => (
                    <span
                        key={index}
                        style={{
                            fontFamily: typography.fontFamily,
                            fontSize: `${typography.textSize - 2}px`,
                            fontWeight: '500',
                            backgroundColor: `${colors.accent}30`,
                            color: colors.accent,
                            padding: '4px 12px',
                            borderRadius: '999px'
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
        );
    };

    // Rendu du logo/filigrane
    const renderBranding = () => {
        if (!branding.enabled || !branding.logoUrl) return null;
        
        const positionStyles = {
            'top-left': { top: '16px', left: '16px' },
            'top-right': { top: '16px', right: '16px' },
            'bottom-left': { bottom: '16px', left: '16px' },
            'bottom-right': { bottom: '16px', right: '16px' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        };
        
        const sizeMap = {
            small: '40px',
            medium: '60px',
            large: '80px'
        };
        
        return (
            <div
                className="absolute"
                style={{
                    pointerEvents: 'none',
                    ...positionStyles[branding.position],
                    opacity: branding.opacity,
                    width: sizeMap[branding.size],
                    height: sizeMap[branding.size]
                }}
            >
                <img
                    src={branding.logoUrl}
                    alt="Logo"
                        className="w-full h-full object-contain orchard-branding"
                />
            </div>
        );
    };

    return (
        <div
            className="relative w-full h-full flex items-center justify-center p-8"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-6"
            >
                {/* Image */}
                {renderImage()}

                {/* Title */}
                {contentModules.title && reviewData.title && (
                    <h1
                        className="text-center line-clamp-2"
                        style={{
                            fontFamily: typography.fontFamily,
                            fontSize: `${typography.titleSize}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.2'
                        }}
                    >
                        {reviewData.title}
                    </h1>
                )}

                {/* Rating */}
                {renderRating()}

                {/* Category */}
                {contentModules.category && reviewData.category && (
                    <div className="text-center">
                        <span
                            style={{
                                fontFamily: typography.fontFamily,
                                fontSize: `${typography.textSize}px`,
                                fontWeight: '600',
                                color: colors.accent,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {reviewData.category}
                        </span>
                    </div>
                )}

                {/* THC/CBD */}
                {(contentModules.thcLevel || contentModules.cbdLevel) && (
                    <div className="flex gap-4 justify-center">
                        {contentModules.thcLevel && reviewData.thcLevel && (
                            <div
                                className="text-center px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: `${colors.accent}20`,
                                    border: `2px solid ${colors.accent}`
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: typography.fontFamily,
                                        fontSize: `${typography.textSize - 2}px`,
                                        fontWeight: '500',
                                        color: colors.textSecondary
                                    }}
                                >
                                    THC
                                </div>
                                <div
                                    style={{
                                        fontFamily: typography.fontFamily,
                                        fontSize: `${typography.textSize + 4}px`,
                                        fontWeight: '700',
                                        color: colors.accent
                                    }}
                                >
                                    {reviewData.thcLevel}%
                                </div>
                            </div>
                        )}
                        
                        {contentModules.cbdLevel && reviewData.cbdLevel && (
                            <div
                                className="text-center px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: `${colors.accent}20`,
                                    border: `2px solid ${colors.accent}`
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: typography.fontFamily,
                                        fontSize: `${typography.textSize - 2}px`,
                                        fontWeight: '500',
                                        color: colors.textSecondary
                                    }}
                                >
                                    CBD
                                </div>
                                <div
                                    style={{
                                        fontFamily: typography.fontFamily,
                                        fontSize: `${typography.textSize + 4}px`,
                                        fontWeight: '700',
                                        color: colors.accent
                                    }}
                                >
                                    {reviewData.cbdLevel}%
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                {contentModules.description && reviewData.description && (
                    <p
                        className="text-center line-clamp-3"
                        style={{
                            fontFamily: typography.fontFamily,
                            fontSize: `${typography.textSize}px`,
                            fontWeight: typography.textWeight,
                            color: colors.textSecondary,
                            lineHeight: '1.6'
                        }}
                    >
                        {reviewData.description}
                    </p>
                )}

                {/* Tags */}
                {renderTags()}

                {/* Author & Date */}
                <div className="flex items-center justify-center gap-4 text-center">
                    {contentModules.author && (function() {
                        const authorName = reviewData.ownerName || (reviewData.author ? (typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author.username || reviewData.author.id)) : null) || 'Anonyme'
                        return (
                            <span
                                style={{
                                    fontFamily: typography.fontFamily,
                                    fontSize: `${typography.textSize - 2}px`,
                                    fontWeight: '500',
                                    color: colors.textSecondary
                                }}
                            >
                                Par {authorName}
                            </span>
                        )
                    })()}
                    
                    {contentModules.date && reviewData.date && (
                        <span
                            style={{
                                fontFamily: typography.fontFamily,
                                fontSize: `${typography.textSize - 2}px`,
                                fontWeight: '400',
                                color: colors.textSecondary
                            }}
                        >
                            {new Date(reviewData.date).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Branding */}
            {renderBranding()}
        </div>
    );
}

ModernCompactTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};
