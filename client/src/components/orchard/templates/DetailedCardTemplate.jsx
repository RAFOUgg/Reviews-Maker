import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import React from 'react';
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
 * DetailedCardTemplate - Template fiche technique complète et professionnelle
 * Affiche TOUTES les informations de la review de manière structurée
 * Optimisé pour l'impression et le partage professionnel
 */
export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
    // 🔍 Debug - Afficher les données reçues
    console.log('📋 DetailedCardTemplate - Données reçues:', {
        hasConfig: !!config,
        hasReviewData: !!reviewData,
        reviewDataKeys: reviewData ? Object.keys(reviewData) : [],
        title: reviewData?.title,
        holderName: reviewData?.holderName,
        rating: reviewData?.rating,
        categoryRatings: reviewData?.categoryRatings,
        aromas: reviewData?.aromas,
        effects: reviewData?.effects,
        contentModulesEnabled: config?.contentModules ? 
            Object.entries(config.contentModules).filter(([k, v]) => v).map(([k]) => k) : [],
    });

    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
                <p className="text-gray-400 text-lg">📋 Données manquantes pour la fiche technique</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;
    
    // 🎯 Calcul des ajustements responsifs selon le ratio
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { isSquare, isPortrait, isA4, fontSize, padding, spacing, limits, grid } = responsive;

    // Extraction des données - passer reviewData pour les fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const pipelines = extractPipelines(reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cultivars = asArray(reviewData.cultivarsList).slice(0, limits.maxTags);
    const substrat = extractSubstrat(reviewData.substratMix);
    const extraData = extractExtraData(reviewData.extraData, reviewData).slice(0, limits.maxInfoCards);

    const mainImage = reviewData.mainImageUrl || reviewData.imageUrl || 
        (Array.isArray(reviewData.images) && reviewData.images[0]);

    // Composants réutilisables
    const Section = ({ title, icon, children, className = '' }) => {
        if (!children || (React.Children.count(children) === 0)) return null;
        return (
            <div style={{ marginBottom: `${spacing.section}px` }} className={className}>
                <h3 
                    style={{ 
                        fontSize: `${fontSize.section}px`, 
                        fontWeight: '600', 
                        color: colors.title, 
                        marginBottom: `${spacing.element}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${spacing.gap}px`,
                        borderBottom: `${isSquare ? 1 : 2}px solid ${colorWithOpacity(colors.accent, 30)}`,
                        paddingBottom: `${spacing.gap}px`,
                    }}
                >
                    {icon && <span>{icon}</span>}
                    {title}
                </h3>
                {children}
            </div>
        );
    };

    const InfoCard = ({ label, value, icon, size = 'normal' }) => {
        if (!value) return null;
        const isSmall = size === 'small';
        return (
            <div 
                style={{ 
                    padding: `${padding.card}px`,
                    borderRadius: `${isSquare ? 8 : 12}px`,
                    backgroundColor: colorWithOpacity(colors.accent, 10),
                    border: `1px solid ${colorWithOpacity(colors.accent, 20)}`,
                }}
            >
                <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>
                    {icon && <span className="mr-1">{icon}</span>}{label}
                </div>
                <div style={{ 
                    fontSize: `${isSmall ? fontSize.text : fontSize.text}px`, 
                    fontWeight: '600', 
                    color: colors.accent 
                }}>
                    {value}
                </div>
            </div>
        );
    };

    const Tag = ({ children, variant = 'default' }) => {
        const variants = {
            default: { bg: 20, border: 30 },
            accent: { bg: 25, border: 40 },
            subtle: { bg: 10, border: 15 },
        };
        const v = variants[variant];
        return (
            <span
                style={{
                    display: 'inline-block',
                    fontSize: `${fontSize.small}px`,
                    padding: `${spacing.gap}px ${spacing.element}px`,
                    borderRadius: `${isSquare ? 12 : 20}px`,
                    backgroundColor: colorWithOpacity(colors.accent, v.bg),
                    border: `1px solid ${colorWithOpacity(colors.accent, v.border)}`,
                    color: colors.accent,
                    fontWeight: '500',
                }}
            >
                {children}
            </span>
        );
    };

    const RatingBar = ({ label, value, icon, maxValue = 10 }) => {
        const percentage = (value / maxValue) * 100;
        return (
            <div className="flex items-center gap-2" style={{ marginBottom: `${spacing.gap}px` }}>
                <span style={{ width: isSquare ? '70px' : '90px', fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                    {icon} {label}
                </span>
                <div 
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ 
                        height: isSquare ? '8px' : '12px',
                        backgroundColor: colorWithOpacity(colors.accent, 15) 
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors.accent }}
                    />
                </div>
                <span style={{ width: '40px', fontSize: `${fontSize.small}px`, fontWeight: '600', color: colors.textPrimary, textAlign: 'right' }}>
                    {value.toFixed(1)}
                </span>
            </div>
        );
    };

    const PipelineFlow = ({ pipeline }) => (
        <div 
            className="p-4 rounded-xl mb-3"
            style={{ backgroundColor: colorWithOpacity(colors.accent, 8) }}
        >
            <div style={{ fontSize: `${fontSize.text}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: '10px' }}>
                {pipeline.icon} {pipeline.name}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                {pipeline.steps.map((step, i) => (
                    <React.Fragment key={i}>
                        <span
                            className="px-3 py-1.5 rounded-lg"
                            style={{ 
                                backgroundColor: colorWithOpacity(colors.accent, 20),
                                color: colors.textPrimary,
                                fontSize: `${fontSize.small}px`,
                            }}
                        >
                            {step}
                        </span>
                        {i < pipeline.steps.length - 1 && (
                            <span style={{ color: colors.accent }}>→</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const SubstratChart = ({ data }) => (
        <div className="space-y-2">
            {data.map((s, i) => {
                const pct = s.percentage || (100 / data.length);
                return (
                    <div key={i} className="flex items-center gap-3">
                        <span style={{ width: '120px', fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                            {s.name}
                        </span>
                        <div 
                            className="flex-1 h-4 rounded-full overflow-hidden"
                            style={{ backgroundColor: colorWithOpacity(colors.accent, 10) }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: colors.accent }}
                            />
                        </div>
                        <span style={{ width: '50px', fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: '600' }}>
                            {pct.toFixed(0)}%
                        </span>
                    </div>
                );
            })}
        </div>
    );

    // Render branding
    const renderBranding = () => {
        if (!branding?.enabled || !branding?.logoUrl) return null;
        const positionMap = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        };
        const sizeMap = { small: '50px', medium: '70px', large: '90px' };
        
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

    return (
        <div
            className="relative w-full h-full overflow-hidden"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
                padding: `${padding.container}px`,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex flex-col"
            >
                {/* Header avec image et infos principales */}
                <div 
                    className={`flex ${isSquare ? 'gap-3' : 'gap-6'} ${isSquare ? 'mb-3' : 'mb-6'} ${isPortrait || isSquare ? 'flex-col' : 'flex-row'}`}
                    style={{ flexShrink: 0 }}
                >
                    {/* Image */}
                    {contentModules.image && mainImage && (
                        <div 
                            className="flex-shrink-0 overflow-hidden shadow-lg"
                            style={{ 
                                borderRadius: `${responsive.image.borderRadius}px`,
                                width: isPortrait || isSquare ? '100%' : responsive.image.maxWidth,
                                height: responsive.image.maxHeight,
                            }}
                        >
                            <img src={mainImage} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Infos principales */}
                    <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.element}px` }}>
                        {/* Type badge */}
                        {contentModules.type && reviewData.type && (
                            <span 
                                style={{ 
                                    fontSize: `${fontSize.small}px`, 
                                    color: colors.accent, 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    fontWeight: '600',
                                }}
                            >
                                📦 {reviewData.type}
                            </span>
                        )}

                        {/* Title */}
                        {contentModules.title && (reviewData.title || reviewData.holderName) && (
                            <h1 style={{ fontSize: `${fontSize.title}px`, fontWeight: typography.titleWeight, color: colors.title, lineHeight: '1.2' }}>
                                {reviewData.title || reviewData.holderName}
                            </h1>
                        )}

                        {/* Rating */}
                        {contentModules.rating && reviewData.rating !== undefined && (
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const { filled } = formatRating(reviewData.rating, 5);
                                        return (
                                            <svg key={i} width="28" height="28" viewBox="0 0 24 24" 
                                                fill={i < filled ? colors.accent : 'none'} 
                                                stroke={colors.accent} strokeWidth="1.5"
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        );
                                    })}
                                </div>
                                <span style={{ fontSize: `${fontSize.subtitle}px`, fontWeight: '700', color: colors.textPrimary }}>
                                    {parseFloat(reviewData.rating).toFixed(1)}/10
                                </span>
                            </div>
                        )}

                        {/* Category Ratings bars */}
                        {contentModules.categoryRatings && categoryRatings.length > 0 && (
                            <div className="space-y-1 mt-4">
                                {categoryRatings.map((r, i) => (
                                    <RatingBar key={i} label={r.label} value={r.value} icon={r.icon} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {contentModules.description && reviewData.description && (
                    <div 
                        style={{ 
                            padding: `${padding.card}px`,
                            borderRadius: `${isSquare ? 12 : 16}px`,
                            marginBottom: `${spacing.section}px`,
                            backgroundColor: colorWithOpacity(colors.accent, 5),
                            flexShrink: 0
                        }}
                    >
                        <p 
                            style={{ 
                                fontSize: `${fontSize.small}px`, 
                                color: colors.textSecondary, 
                                lineHeight: isSquare ? '1.4' : '1.6',
                                display: '-webkit-box',
                                WebkitLineClamp: limits.descriptionLines,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Grid layout pour les sections */}
                <div 
                    className={`grid ${isPortrait || isSquare ? 'grid-cols-1' : 'grid-cols-2'}`}
                    style={{ 
                        gap: `${spacing.section}px`,
                        flex: 1,
                        overflow: 'hidden'
                    }}
                >
                    {/* Colonne 1 */}
                    <div>
                        {/* Informations générales */}
                        <Section title="Informations" icon="📋">
                            <div className={`grid grid-cols-2`} style={{ gap: `${spacing.gap}px` }}>
                                {contentModules.category && reviewData.category && <InfoCard label="Catégorie" value={reviewData.category} icon="📂" />}
                                {contentModules.strainType && reviewData.strainType && <InfoCard label="Type de strain" value={reviewData.strainType} icon="🧬" />}
                                {contentModules.indicaRatio && reviewData.indicaRatio !== undefined && <InfoCard label="Ratio Indica" value={`${reviewData.indicaRatio}%`} icon="⚖️" />}
                                {contentModules.thcLevel && reviewData.thcLevel && <InfoCard label="THC" value={`${reviewData.thcLevel}%`} icon="🔬" />}
                                {contentModules.cbdLevel && reviewData.cbdLevel && <InfoCard label="CBD" value={`${reviewData.cbdLevel}%`} icon="💊" />}
                                {contentModules.dureeEffet && reviewData.dureeEffet && <InfoCard label="Durée effets" value={reviewData.dureeEffet} icon="⏱️" />}
                            </div>
                        </Section>

                        {/* Provenance */}
                        <Section title="Provenance" icon="🌱">
                            <div className={`grid grid-cols-2`} style={{ gap: `${spacing.gap}px` }}>
                                {contentModules.cultivar && reviewData.cultivar && <InfoCard label="Cultivar" value={reviewData.cultivar} icon="🌿" />}
                                {contentModules.breeder && reviewData.breeder && <InfoCard label="Breeder" value={reviewData.breeder} icon="🧬" />}
                                {contentModules.farm && reviewData.farm && <InfoCard label="Farm" value={reviewData.farm} icon="🏡" />}
                                {contentModules.hashmaker && reviewData.hashmaker && <InfoCard label="Hash Maker" value={reviewData.hashmaker} icon="👨‍🔬" />}
                            </div>
                        </Section>

                        {/* Cultivars */}
                        {contentModules.cultivarsList && cultivars.length > 0 && (
                            <Section title="Cultivars" icon="🌿">
                                <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                    {cultivars.map((c, i) => (
                                        <Tag key={i} variant="accent">{extractLabel(c)}</Tag>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Effets */}
                        {contentModules.effects && effects.length > 0 && (
                            <Section title="Effets" icon="⚡">
                                <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                    {effects.map((e, i) => <Tag key={i} variant="accent">{extractLabel(e)}</Tag>)}
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Colonne 2 */}
                    <div>
                        {/* Profil sensoriel */}
                        {((contentModules.aromas && aromas.length > 0) || (contentModules.tastes && tastes.length > 0)) && (
                            <Section title="Profil Sensoriel" icon="🌸">
                                {contentModules.aromas && aromas.length > 0 && (
                                    <div style={{ marginBottom: `${spacing.element}px` }}>
                                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>Arômes</div>
                                        <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                            {aromas.map((a, i) => <Tag key={i}>{extractLabel(a)}</Tag>)}
                                        </div>
                                    </div>
                                )}
                                {contentModules.tastes && tastes.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>Goûts</div>
                                        <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                            {tastes.map((t, i) => <Tag key={i}>{extractLabel(t)}</Tag>)}
                                        </div>
                                    </div>
                                )}
                            </Section>
                        )}

                        {/* Terpènes */}
                        {contentModules.terpenes && terpenes.length > 0 && (
                            <Section title="Terpènes" icon="🧪">
                                <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                    {terpenes.map((t, i) => <Tag key={i} variant="subtle">{extractLabel(t)}</Tag>)}
                                </div>
                            </Section>
                        )}

                        {/* Substrat */}
                        {contentModules.substratMix && substrat.length > 0 && (
                            <Section title="Substrat" icon="🪴">
                                <SubstratChart data={substrat} />
                            </Section>
                        )}
                    </div>
                </div>

                {/* Pipelines (full width) */}
                {pipelines.length > 0 && (contentModules.pipelineExtraction || contentModules.pipelineSeparation || contentModules.pipelinePurification || contentModules.fertilizationPipeline) && (
                    <Section title="Processus de Production" icon="⚗️">
                        <div className="space-y-3">
                            {pipelines.map((p, i) => <PipelineFlow key={i} pipeline={p} />)}
                        </div>
                    </Section>
                )}

                {/* Extra Data */}
                {contentModules.extraData && extraData.length > 0 && (
                    <Section title="Caractéristiques Détaillées" icon="📊">
                        <div className={`grid grid-cols-${grid.cols}`} style={{ gap: `${spacing.gap}px` }}>
                            {extraData.map((d, i) => (
                                <InfoCard key={i} label={d.label} value={d.value} icon={d.icon} size="small" />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Footer */}
                <div 
                    className="flex justify-between items-center"
                    style={{ 
                        borderTop: `${isSquare ? 1 : 2}px solid ${colorWithOpacity(colors.accent, 20)}`,
                        paddingTop: `${spacing.element}px`,
                        marginTop: `${spacing.section}px`,
                        flexShrink: 0
                    }}
                >
                    {contentModules.author && (
                        <div style={{ fontSize: `${fontSize.text}px`, color: colors.textSecondary }}>
                            Rédigé par{' '}
                            <span style={{ fontWeight: '600', color: colors.textPrimary }}>
                                {reviewData.ownerName || (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) || 'Anonyme'}
                            </span>
                        </div>
                    )}
                    
                    {contentModules.date && reviewData.date && (
                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                            {formatDate(reviewData.date)}
                        </div>
                    )}
                </div>

                {/* Section Debug - Visible si URL contient ?debug=1 */}
                {typeof window !== 'undefined' && window.location.search.includes('debug=1') && (
                    <div className="mt-8 p-4 bg-black/50 rounded-xl border border-yellow-500/30">
                        <h4 className="text-yellow-400 font-bold mb-2">🔧 Debug - Données disponibles</h4>
                        <div className="text-xs text-gray-300 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(reviewData).map(([key, value]) => {
                                    let displayValue = value;
                                    if (value === null || value === undefined) displayValue = '(vide)';
                                    else if (Array.isArray(value)) displayValue = `[${value.length} items]`;
                                    else if (typeof value === 'object') displayValue = '{...}';
                                    else if (typeof value === 'string' && value.length > 30) displayValue = value.slice(0, 30) + '...';
                                    return (
                                        <div key={key} className={`p-1 rounded ${value && value !== '' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            <span className="text-purple-300">{key}:</span> {String(displayValue)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {renderBranding()}
        </div>
    );
}

DetailedCardTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired,
};
