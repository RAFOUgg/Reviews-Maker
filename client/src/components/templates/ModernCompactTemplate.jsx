import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
    asArray,
    asObject,
    extractLabel,
    formatRating,
    formatDate,
    extractCategoryRatings,
    extractPipelines,
    extractSubstrat,
    extractExtraData,
    getResponsiveAdjustments,
    colorWithOpacity,
} from '../../utils/orchardHelpers';

/**
 * ModernCompactTemplate - Template moderne et compact
 * Affiche les informations essentielles dans un design épuré et professionnel
 * Adaptatif à tous les formats (1:1, 16:9, 9:16, 4:3, A4)
 */
export default function ModernCompactTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
                <p className="text-gray-400 text-lg">📋 Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;
    
    // 🎯 Calcul des ajustements responsifs selon le ratio
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { isSquare, isPortrait, isLandscape, fontSize, padding, spacing, limits } = responsive;

    // Données extraites - passer reviewData pour fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const pipelines = extractPipelines(reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cultivars = asArray(reviewData.cultivarsList).slice(0, limits.maxTags);
    const substrat = extractSubstrat(reviewData.substratMix);
    const extraData = extractExtraData(reviewData.extraData, reviewData).slice(0, limits.maxInfoCards);

    // Debug log pour voir les données
    console.log('🎨 ModernCompactTemplate render:', {
        rating: reviewData.rating,
        categoryRatingsInput: reviewData.categoryRatings,
        categoryRatingsExtracted: categoryRatings,
        effects: effects,
        aromas: aromas,
        hasImage: !!reviewData.mainImageUrl || !!reviewData.imageUrl,
        contentModulesEnabled: Object.entries(contentModules).filter(([k, v]) => v).map(([k]) => k).slice(0, 10)
    });

    // Image principale
    const mainImage = reviewData.mainImageUrl || reviewData.imageUrl || 
        (Array.isArray(reviewData.images) && reviewData.images[0]);

    // Styles dynamiques
    const styles = {
        container: {
            background: colors.background,
            fontFamily: typography.fontFamily,
            padding: `${padding.container}px`,
        },
        title: {
            fontSize: `${fontSize.title}px`,
            fontWeight: typography.titleWeight,
            color: colors.title,
            lineHeight: '1.2',
        },
        text: {
            fontSize: `${fontSize.text}px`,
            fontWeight: typography.textWeight,
            color: colors.textSecondary,
        },
        accent: {
            color: colors.accent,
        },
        tag: {
            fontSize: `${fontSize.small}px`,
            padding: `${spacing.gap}px ${spacing.element}px`,
            borderRadius: `${isSquare ? 12 : 20}px`,
            backgroundColor: colorWithOpacity(colors.accent, 20),
            color: colors.accent,
            fontWeight: '500',
        },
        infoCard: {
            backgroundColor: colorWithOpacity(colors.accent, 15),
            borderRadius: `${isSquare ? 8 : 12}px`,
            padding: `${padding.card}px`,
        },
    };

    // Render étoiles - Note sur 10, affichée avec 5 étoiles proportionnelles
    const renderStars = () => {
        if (!contentModules.rating || reviewData.rating === undefined) return null;
        const ratingValue = parseFloat(reviewData.rating) || 0;
        // 5 étoiles représentent la note /10 (donc 8/10 = 4 étoiles pleines)
        const starsCount = 5;
        const filledStars = Math.round((ratingValue / 10) * starsCount);
        const emptyStars = starsCount - filledStars;
        
        return (
            <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                    {[...Array(filledStars)].map((_, i) => (
                        <svg key={`f${i}`} width="24" height="24" viewBox="0 0 24 24" fill={colors.accent} stroke={colors.accent} strokeWidth="1">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                    {[...Array(emptyStars)].map((_, i) => (
                        <svg key={`e${i}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.5" opacity="0.4">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                </div>
                <span style={{ fontSize: `${typography.titleSize - 6}px`, fontWeight: '700', color: colors.textPrimary }}>
                    {ratingValue.toFixed(1)}/10
                </span>
            </div>
        );
    };

    // Render tags génériques - pas de maxItems car déjà limité dans les données
    const renderTags = (items) => {
        if (!items || items.length === 0) return null;
        
        return (
            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                {items.map((item, i) => (
                    <span key={i} style={styles.tag}>{extractLabel(item)}</span>
                ))}
            </div>
        );
    };

    // Render info card
    const renderInfoCard = (label, value, icon = '') => (
        <div style={styles.infoCard} className="text-center">
            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>
                {icon && <span className="mr-1">{icon}</span>}{label}
            </div>
            <div style={{ fontSize: `${fontSize.text}px`, fontWeight: '700', color: colors.accent }}>
                {value}
            </div>
        </div>
    );

    // Render branding
    const renderBranding = () => {
        if (!branding?.enabled || !branding?.logoUrl) return null;
        const positionMap = {
            'top-left': { top: '16px', left: '16px' },
            'top-right': { top: '16px', right: '16px' },
            'bottom-left': { bottom: '16px', left: '16px' },
            'bottom-right': { bottom: '16px', right: '16px' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        };
        const sizeMap = { small: '40px', medium: '60px', large: '80px' };
        
        return (
            <div
                className="absolute pointer-events-none"
                style={{
                    ...positionMap[branding.position || 'bottom-right'],
                    opacity: branding.opacity || 0.8,
                    width: sizeMap[branding.size || 'medium'],
                    height: sizeMap[branding.size || 'medium'],
                }}
            >
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
        );
    };

    // Layout adaptatif selon le format
    const renderLayout = () => {
        if (isLandscape) {
            // Layout paysage : image à gauche, contenu à droite
            return (
                <div className="flex h-full" style={{ gap: `${spacing.section}px` }}>
                    {/* Image */}
                    {contentModules.image && mainImage && (
                        <div className="flex-shrink-0 w-2/5 h-full">
                            <div
                                className="w-full h-full overflow-hidden"
                                style={{ borderRadius: `${responsive.image.borderRadius}px` }}
                            >
                                <img src={mainImage} alt="" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                    
                    {/* Contenu */}
                    <div className="flex-1 flex flex-col justify-center overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                        {renderContent()}
                    </div>
                </div>
            );
        }
        
        // Layout portrait/carré : vertical
        return (
            <div className="flex flex-col h-full overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                {/* Image */}
                {contentModules.image && mainImage && (
                    <div
                        className="w-full flex-shrink-0 overflow-hidden"
                        style={{ 
                            borderRadius: `${responsive.image.borderRadius}px`,
                            maxHeight: responsive.image.maxHeight,
                        }}
                    >
                        <img src={mainImage} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                
                {/* Contenu */}
                <div className="flex-1 flex flex-col justify-center overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                    {renderContent()}
                </div>
            </div>
        );
    };

    const renderContent = () => (
        <>
            {/* Titre + Type */}
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                {contentModules.type && reviewData.type && (
                    <span style={{ fontSize: `${fontSize.small}px`, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
                        {reviewData.type}
                    </span>
                )}
                {contentModules.title && (reviewData.title || reviewData.holderName) && (
                    <h1 style={styles.title} className="line-clamp-2">
                        {reviewData.title || reviewData.holderName}
                    </h1>
                )}
            </div>

            {/* Rating */}
            {contentModules.rating && (
                <div className="flex justify-center">{renderStars()}</div>
            )}

            {/* Infos principales (THC, CBD, Category) */}
            {(contentModules.thcLevel || contentModules.cbdLevel || contentModules.category) && (
                <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    {contentModules.thcLevel && reviewData.thcLevel && renderInfoCard('THC', `${reviewData.thcLevel}%`, '🔬')}
                    {contentModules.cbdLevel && reviewData.cbdLevel && renderInfoCard('CBD', `${reviewData.cbdLevel}%`, '💊')}
                    {contentModules.category && reviewData.category && renderInfoCard('Catégorie', reviewData.category, '📂')}
                </div>
            )}

            {/* Provenance */}
            {(contentModules.cultivar || contentModules.breeder || contentModules.farm || contentModules.hashmaker) && (
                <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    {contentModules.cultivar && reviewData.cultivar && renderInfoCard('Cultivar', reviewData.cultivar, '🌱')}
                    {contentModules.breeder && reviewData.breeder && renderInfoCard('Breeder', reviewData.breeder, '🧬')}
                    {contentModules.farm && reviewData.farm && renderInfoCard('Farm', reviewData.farm, '🏡')}
                    {contentModules.hashmaker && reviewData.hashmaker && renderInfoCard('Hash Maker', reviewData.hashmaker, '👨‍🔬')}
                </div>
            )}

            {/* Category Ratings */}
            {contentModules.categoryRatings && categoryRatings.length > 0 && (
                <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.element}px`, flexShrink: 0 }}>
                    {categoryRatings.map((r, i) => (
                        <div key={i} className="text-center">
                            <span style={{ fontSize: isSquare ? '16px' : '20px' }}>{r.icon}</span>
                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>{r.label}</div>
                            <div style={{ fontSize: `${fontSize.text}px`, fontWeight: '700', color: colors.accent }}>{r.value.toFixed(1)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Effects */}
            {contentModules.effects && effects.length > 0 && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>⚡ Effets</div>
                    {renderTags(effects)}
                </div>
            )}

            {/* Aromas */}
            {contentModules.aromas && aromas.length > 0 && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>🌸 Arômes</div>
                    {renderTags(aromas)}
                </div>
            )}

            {/* Terpenes */}
            {contentModules.terpenes && terpenes.length > 0 && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>🧪 Terpènes</div>
                    {renderTags(terpenes)}
                </div>
            )}

            {/* Description */}
            {contentModules.description && reviewData.description && (
                <p 
                    style={{
                        ...styles.text,
                        textAlign: 'center',
                        paddingLeft: `${padding.card}px`,
                        paddingRight: `${padding.card}px`,
                        display: '-webkit-box',
                        WebkitLineClamp: limits.descriptionLines,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}
                >
                    {reviewData.description}
                </p>
            )}

            {/* Footer: Author & Date */}
            <div className="flex items-center justify-center" style={{ gap: `${spacing.element}px`, paddingTop: `${spacing.gap}px`, flexShrink: 0 }}>
                {contentModules.author && (
                    <span style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                        Par <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                            {reviewData.ownerName || (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) || 'Anonyme'}
                        </span>
                    </span>
                )}
                {contentModules.date && reviewData.date && (
                    <span style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                        {formatDate(reviewData.date)}
                    </span>
                )}
            </div>
        </>
    );

    return (
        <div className="relative w-full h-full overflow-hidden" style={styles.container}>
            <div className={`w-full h-full ${isSquare || isPortrait ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                {renderLayout()}
            </div>
            {renderBranding()}
        </div>
    );
}

ModernCompactTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired,
};




