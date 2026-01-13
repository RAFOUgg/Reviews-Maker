import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
    asArray,
    extractLabel,
    formatRating,
    extractCategoryRatings,
    colorWithOpacity,
} from '../../../utils/orchardHelpers';

/**
 * SocialStoryTemplate - Template optimisé pour les stories Instagram/TikTok
 * Format vertical 9:16, design impactant et moderne
 * Informations essentielles en un coup d'œil
 */
export default function SocialStoryTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br p-8">
                <p className="text-white/70 text-lg">📱 Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;

    // Extraction des données - passer reviewData pour fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, 3);
    const effects = asArray(reviewData.effects).slice(0, 3);
    const { filled, value } = formatRating(reviewData.rating || 0, 5);

    const mainImage = reviewData.mainImageUrl || reviewData.imageUrl ||
        (Array.isArray(reviewData.images) && reviewData.images[0]);

    // Animation variants
    const fadeUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
    };

    const stagger = {
        animate: { transition: { staggerChildren: 0.1 } }
    };

    // Styles
    const glassStyle = {
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
    };

    // Render branding
    const renderBranding = () => {
        if (!branding?.enabled || !branding?.logoUrl) return null;
        return (
            <motion.div
                {...fadeUp}
                transition={{ delay: 0.6 }}
                className="absolute top-6 right-6"
                style={{ opacity: branding.opacity || 0.9 }}
            >
                <img
                    src={branding.logoUrl}
                    alt="Logo"
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                />
            </motion.div>
        );
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden flex flex-col"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
            }}
        >
            {/* Background Image with overlay */}
            {contentModules.image && mainImage && (
                <div className="absolute inset-0">
                    <img
                        src={mainImage}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(180deg, 
                                transparent 0%, 
                                ${colorWithOpacity(colors.accent, 30)} 50%, 
                                ${colors.background} 100%
                            )`
                        }}
                    />
                </div>
            )}

            <motion.div
                className="relative z-10 flex-1 flex flex-col p-6"
                variants={stagger}
                initial="initial"
                animate="animate"
            >
                {/* Header - Type & Category */}
                <motion.div {...fadeUp} className="flex justify-between items-start mb-4">
                    {contentModules.type && reviewData.type && (
                        <span
                            className="px-4 py-2 rounded-full"
                            style={{
                                ...glassStyle,
                                fontSize: `${typography.textSize - 2}px`,
                                color: 'white',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}
                        >
                            {reviewData.type}
                        </span>
                    )}
                </motion.div>

                {/* Main Image */}
                {contentModules.image && mainImage && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.1 }}
                        className="flex-shrink-0 mx-auto mb-6 shadow-2xl"
                        style={{
                            borderRadius: `${image.borderRadius}px`,
                            overflow: 'hidden',
                            width: '85%',
                            aspectRatio: '1',
                            border: '4px solid rgba(255,255,255,0.3)',
                        }}
                    >
                        <img src={mainImage} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                )}

                {/* Title */}
                {contentModules.title && (reviewData.title || reviewData.holderName) && (
                    <motion.h1
                        {...fadeUp}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-4"
                        style={{
                            fontSize: `${typography.titleSize + 4}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.1',
                            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                        }}
                    >
                        {reviewData.title || reviewData.holderName}
                    </motion.h1>
                )}

                {/* Rating - Big and Bold */}
                {contentModules.rating && reviewData.rating !== undefined && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-6"
                    >
                        <div className="flex justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <motion.svg
                                    key={i}
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill={i < filled ? colors.accent : 'rgba(255,255,255,0.3)'}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </motion.svg>
                            ))}
                        </div>
                        <span style={{
                            fontSize: `${typography.titleSize}px`,
                            fontWeight: '800',
                            color: colors.accent,
                            textShadow: `0 0 30px ${colors.accent}`,
                        }}>
                            {value.toFixed(1)}/10
                        </span>
                    </motion.div>
                )}

                {/* Quick Stats */}
                {(contentModules.thcLevel || contentModules.cbdLevel) && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center gap-4 mb-6"
                    >
                        {contentModules.thcLevel && reviewData.thcLevel && (
                            <div
                                className="px-6 py-3 rounded-2xl text-center"
                                style={glassStyle}
                            >
                                <div style={{ fontSize: `${typography.textSize - 2}px`, color: 'rgba(255,255,255,0.7)' }}>THC</div>
                                <div style={{ fontSize: `${typography.textSize + 8}px`, fontWeight: '800', color: colors.accent }}>
                                    {reviewData.thcLevel}%
                                </div>
                            </div>
                        )}
                        {contentModules.cbdLevel && reviewData.cbdLevel && (
                            <div
                                className="px-6 py-3 rounded-2xl text-center"
                                style={glassStyle}
                            >
                                <div style={{ fontSize: `${typography.textSize - 2}px`, color: 'rgba(255,255,255,0.7)' }}>CBD</div>
                                <div style={{ fontSize: `${typography.textSize + 8}px`, fontWeight: '800', color: colors.accent }}>
                                    {reviewData.cbdLevel}%
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Category Ratings (compact) */}
                {contentModules.categoryRatings && categoryRatings.length > 0 && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.45 }}
                        className="flex justify-center gap-6 mb-6"
                    >
                        {categoryRatings.slice(0, 4).map((r, i) => (
                            <div key={i} className="text-center">
                                <div style={{ fontSize: '24px' }}>{r.icon}</div>
                                <div style={{ fontSize: `${typography.textSize}px`, fontWeight: '700', color: colors.accent }}>
                                    {r.value.toFixed(1)}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Effects (compact tags) */}
                {contentModules.effects && effects.length > 0 && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-2 mb-4"
                    >
                        {effects.map((e, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-full"
                                style={{
                                    ...glassStyle,
                                    fontSize: `${typography.textSize - 1}px`,
                                    color: 'white',
                                    fontWeight: '500',
                                }}
                            >
                                ⚡ {extractLabel(e)}
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* Aromas (compact) */}
                {contentModules.aromas && aromas.length > 0 && (
                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.55 }}
                        className="flex flex-wrap justify-center gap-2"
                    >
                        {aromas.map((a, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-full"
                                style={{
                                    backgroundColor: colorWithOpacity(colors.accent, 30),
                                    fontSize: `${typography.textSize - 1}px`,
                                    color: 'white',
                                    fontWeight: '500',
                                }}
                            >
                                🌸 {extractLabel(a)}
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer - Author & Swipe indicator */}
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    {contentModules.author && (
                        <div style={{ fontSize: `${typography.textSize}px`, color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
                            Review par <strong style={{ color: colors.accent }}>
                                {reviewData.ownerName || (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) || 'Anonyme'}
                            </strong>
                        </div>
                    )}

                    {/* Swipe indicator */}
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24px' }}
                    >
                        ↑
                    </motion.div>
                </motion.div>
            </motion.div>

            {renderBranding()}
        </div>
    );
}

SocialStoryTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object,
};
