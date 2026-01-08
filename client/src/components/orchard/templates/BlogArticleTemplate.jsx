import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
    asArray,
    extractLabel,
    formatRating,
    formatDate,
    extractCategoryRatings,
    extractPipelines,
    extractSubstrat,
    extractExtraData,
    colorWithOpacity,
    getResponsiveAdjustments,
} from '../../../utils/orchardHelpers';

/**
 * BlogArticleTemplate - Template article de blog professionnel
 * Format long adapté aux blogs, lisible et complet
 * Optimisé pour le partage et la lecture
 */
export default function BlogArticleTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                <p className="text-gray-500 text-lg">📝 Données manquantes pour l'article</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;

    // 🎯 Calcul des ajustements responsifs selon le ratio
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { isSquare, isA4, fontSize, padding, spacing, limits } = responsive;

    // Extraction des données - passer reviewData pour fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const pipelines = extractPipelines(reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags + 2); // Un peu plus pour articles
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags + 2);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags + 2);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cultivars = asArray(reviewData.cultivarsList).slice(0, limits.maxTags);
    const substrat = extractSubstrat(reviewData.substratMix);
    const extraData = extractExtraData(reviewData.extraData, reviewData).slice(0, limits.maxInfoCards);

    const mainImage = reviewData.mainImageUrl || reviewData.imageUrl ||
        (Array.isArray(reviewData.images) && reviewData.images[0]);

    // Styles
    const styles = {
        section: {
            marginBottom: '32px',
        },
        sectionTitle: {
            fontSize: `${typography.titleSize - 6}px`,
            fontWeight: '700',
            color: colors.title,
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${colors.accent}`,
            display: 'inline-block',
        },
        paragraph: {
            fontSize: `${typography.textSize + 1}px`,
            color: colors.textSecondary,
            lineHeight: '1.9',
            marginBottom: '16px',
        },
        tag: {
            display: 'inline-block',
            fontSize: `${typography.textSize - 1}px`,
            padding: '8px 16px',
            borderRadius: '25px',
            backgroundColor: colorWithOpacity(colors.accent, 15),
            color: colors.accent,
            fontWeight: '500',
            margin: '4px',
        },
        infoBox: {
            backgroundColor: colorWithOpacity(colors.accent, 8),
            borderLeft: `4px solid ${colors.accent}`,
            padding: '20px 24px',
            borderRadius: '0 12px 12px 0',
            marginBottom: '24px',
        },
        quote: {
            fontSize: `${typography.textSize + 4}px`,
            fontStyle: 'italic',
            color: colors.textPrimary,
            borderLeft: `4px solid ${colors.accent}`,
            paddingLeft: '20px',
            margin: '32px 0',
        },
    };

    // Render étoiles inline
    const renderStarsInline = () => {
        if (!contentModules.rating || reviewData.rating === undefined) return null;
        const { filled, value } = formatRating(reviewData.rating, 5);
        return (
            <span className="inline-flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} width="20" height="20" viewBox="0 0 24 24"
                        fill={i < filled ? colors.accent : 'none'}
                        stroke={colors.accent} strokeWidth="1.5"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
                <strong style={{ color: colors.accent }}>{value.toFixed(1)}/10</strong>
            </span>
        );
    };

    // Render tags
    const renderTags = (items) => (
        <div className="flex flex-wrap">
            {items.map((item, i) => (
                <span key={i} style={styles.tag}>{extractLabel(item)}</span>
            ))}
        </div>
    );

    // Render branding
    const renderBranding = () => {
        if (!branding?.enabled || !branding?.logoUrl) return null;
        return (
            <div className="flex items-center gap-3 mt-8 pt-6" style={{ borderTop: `1px solid ${colorWithOpacity(colors.accent, 20)}` }}>
                <img src={branding.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', opacity: branding.opacity }} />
                <span style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>Publié sur notre plateforme</span>
            </div>
        );
    };

    return (
        <div
            className={`w-full h-full ${isA4 ? 'overflow-auto' : 'overflow-hidden'}`}
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
                padding: `${padding.container}px`,
            }}
        >
            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <header className="mb-10">
                    {/* Category & Type */}
                    <div className="flex items-center gap-4 mb-4">
                        {contentModules.type && reviewData.type && (
                            <span style={{
                                fontSize: `${typography.textSize - 2}px`,
                                color: colors.accent,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                fontWeight: '600',
                            }}>
                                {reviewData.type}
                            </span>
                        )}
                        {contentModules.category && reviewData.category && (
                            <span style={{
                                fontSize: `${typography.textSize - 2}px`,
                                color: colors.textSecondary,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                backgroundColor: colorWithOpacity(colors.accent, 10),
                            }}>
                                {reviewData.category}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    {contentModules.title && (reviewData.title || reviewData.holderName) && (
                        <h1 style={{
                            fontSize: `${typography.titleSize + 12}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.15',
                            marginBottom: '20px',
                        }}>
                            {reviewData.title || reviewData.holderName}
                        </h1>
                    )}

                    {/* Meta: Author, Date, Rating */}
                    <div className="flex flex-wrap items-center gap-6" style={{ fontSize: `${typography.textSize}px`, color: colors.textSecondary }}>
                        {contentModules.author && (
                            <span>
                                Par <strong style={{ color: colors.textPrimary }}>
                                    {reviewData.ownerName || (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) || 'Anonyme'}
                                </strong>
                            </span>
                        )}
                        {contentModules.date && reviewData.date && (
                            <span>📅 {formatDate(reviewData.date)}</span>
                        )}
                        {contentModules.rating && reviewData.rating !== undefined && renderStarsInline()}
                    </div>
                </header>

                {/* Featured Image */}
                {contentModules.image && mainImage && (
                    <figure className="mb-10">
                        <div
                            className="overflow-hidden shadow-xl"
                            style={{ borderRadius: `${image.borderRadius}px` }}
                        >
                            <img
                                src={mainImage}
                                alt={reviewData.title || 'Image'}
                                className="w-full"
                                style={{ maxHeight: '500px', objectFit: 'cover' }}
                            />
                        </div>
                        {reviewData.cultivar && (
                            <figcaption style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary, marginTop: '12px', textAlign: 'center' }}>
                                Cultivar: {reviewData.cultivar}
                            </figcaption>
                        )}
                    </figure>
                )}

                {/* Introduction / Description */}
                {contentModules.description && reviewData.description && (
                    <div style={styles.section}>
                        <p style={{ ...styles.paragraph, fontSize: `${typography.textSize + 3}px`, fontWeight: '400' }}>
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Quick Facts Box */}
                {(contentModules.thcLevel || contentModules.cbdLevel || contentModules.strainType) && (
                    <div style={styles.infoBox}>
                        <h3 style={{ fontSize: `${typography.textSize + 2}px`, fontWeight: '700', color: colors.title, marginBottom: '16px' }}>
                            📊 Fiche Technique Rapide
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {contentModules.thcLevel && reviewData.thcLevel && (
                                <div>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>THC</div>
                                    <div style={{ fontSize: `${typography.textSize + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.thcLevel}%</div>
                                </div>
                            )}
                            {contentModules.cbdLevel && reviewData.cbdLevel && (
                                <div>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>CBD</div>
                                    <div style={{ fontSize: `${typography.textSize + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.cbdLevel}%</div>
                                </div>
                            )}
                            {contentModules.strainType && reviewData.strainType && (
                                <div>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>Type</div>
                                    <div style={{ fontSize: `${typography.textSize + 2}px`, fontWeight: '600', color: colors.textPrimary }}>{reviewData.strainType}</div>
                                </div>
                            )}
                            {contentModules.indicaRatio && reviewData.indicaRatio !== undefined && (
                                <div>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>Indica</div>
                                    <div style={{ fontSize: `${typography.textSize + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.indicaRatio}%</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Ratings */}
                {contentModules.categoryRatings && categoryRatings.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🎯 Évaluation Détaillée</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {categoryRatings.map((r, i) => (
                                <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: colorWithOpacity(colors.accent, 8) }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{r.icon}</div>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>{r.label}</div>
                                    <div style={{ fontSize: `${typography.textSize + 6}px`, fontWeight: '700', color: colors.accent }}>{r.value.toFixed(1)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Provenance */}
                {(contentModules.cultivar || contentModules.breeder || contentModules.farm || contentModules.hashmaker) && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🌱 Provenance</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {contentModules.cultivar && reviewData.cultivar && (
                                <p style={styles.paragraph}><strong>Cultivar :</strong> {reviewData.cultivar}</p>
                            )}
                            {contentModules.breeder && reviewData.breeder && (
                                <p style={styles.paragraph}><strong>Breeder :</strong> {reviewData.breeder}</p>
                            )}
                            {contentModules.farm && reviewData.farm && (
                                <p style={styles.paragraph}><strong>Farm :</strong> {reviewData.farm}</p>
                            )}
                            {contentModules.hashmaker && reviewData.hashmaker && (
                                <p style={styles.paragraph}><strong>Hash Maker :</strong> {reviewData.hashmaker}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Sensory Profile */}
                {((contentModules.aromas && aromas.length > 0) || (contentModules.tastes && tastes.length > 0)) && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🌸 Profil Sensoriel</h2>
                        {contentModules.aromas && aromas.length > 0 && (
                            <div className="mb-6">
                                <h3 style={{ fontSize: `${typography.textSize + 1}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: '12px' }}>Arômes</h3>
                                {renderTags(aromas)}
                            </div>
                        )}
                        {contentModules.tastes && tastes.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: `${typography.textSize + 1}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: '12px' }}>Goûts</h3>
                                {renderTags(tastes)}
                            </div>
                        )}
                    </div>
                )}

                {/* Effects */}
                {contentModules.effects && effects.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>⚡ Effets Ressentis</h2>
                        {renderTags(effects)}
                        {contentModules.dureeEffet && reviewData.dureeEffet && (
                            <p style={{ ...styles.paragraph, marginTop: '16px' }}>
                                <strong>Durée des effets :</strong> {reviewData.dureeEffet}
                            </p>
                        )}
                    </div>
                )}

                {/* Terpenes */}
                {contentModules.terpenes && terpenes.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🧪 Profil Terpénique</h2>
                        {renderTags(terpenes)}
                    </div>
                )}

                {/* Pipelines */}
                {pipelines.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>⚗️ Processus de Production</h2>
                        {pipelines.map((p, i) => (
                            <div key={i} className="mb-4">
                                <h3 style={{ fontSize: `${typography.textSize + 1}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: '8px' }}>
                                    {p.icon} {p.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    {p.steps.map((step, j) => (
                                        <span key={j}>
                                            <span style={styles.tag}>{step}</span>
                                            {j < p.steps.length - 1 && <span style={{ color: colors.accent, margin: '0 4px' }}>→</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Substrat */}
                {contentModules.substratMix && substrat.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🪴 Composition du Substrat</h2>
                        <div className="space-y-2">
                            {substrat.map((s, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span style={{ width: '150px', fontWeight: '500', color: colors.textPrimary }}>{s.name}</span>
                                    {s.percentage && (
                                        <>
                                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: colorWithOpacity(colors.accent, 15) }}>
                                                <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, backgroundColor: colors.accent }} />
                                            </div>
                                            <span style={{ fontWeight: '600', color: colors.accent }}>{s.percentage}%</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Extra Data */}
                {contentModules.extraData && extraData.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📊 Caractéristiques Avancées</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {extraData.map((d, i) => (
                                <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: colorWithOpacity(colors.accent, 8) }}>
                                    <span style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>{d.icon} {d.label}</span>
                                    <div style={{ fontSize: `${typography.textSize}px`, fontWeight: '600', color: colors.textPrimary }}>{d.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer / Branding */}
                {renderBranding()}
            </motion.article>
        </div>
    );
}

BlogArticleTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object,
};
