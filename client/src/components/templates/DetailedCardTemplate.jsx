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
} from '../../utils/orchardHelpers';

/**
 * DetailedCardTemplate - Template fiche technique complète et professionnelle
 * Affiche TOUTES les informations de la review de manière structurée
 * Optimisé pour l'impression et le partage professionnel
 */
export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
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
    const secondaryAromas = asArray(reviewData.secondaryAromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const dryPuffNotes = asArray(reviewData.dryPuffNotes).slice(0, limits.maxTags);
    const inhalationNotes = asArray(reviewData.inhalationNotes).slice(0, limits.maxTags);
    const exhalationNotes = asArray(reviewData.exhalationNotes).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cultivars = asArray(reviewData.cultivarsList).slice(0, limits.maxTags);
    const substrat = extractSubstrat(reviewData.substratMix);
    const extraData = extractExtraData(reviewData.extraData, reviewData).slice(0, limits.maxInfoCards);

    const selectedImgIndex = config.image?.selectedIndex ?? 0;
    const mainImage = (Array.isArray(reviewData.images) && reviewData.images.length > 0)
        ? (reviewData.images[selectedImgIndex] || reviewData.images[0])
        : (reviewData.mainImageUrl || reviewData.imageUrl || null);

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

    // Render rich step metrics badges
    const renderStepMetrics = (step) => {
        if (!step || typeof step !== 'object') return [];
        const metrics = [];
        const temp = step.temperature ?? step.temp;
        const humidity = step.humidity ?? step.humidite ?? step.hr;
        if (temp != null) metrics.push(`🌡️ ${temp}°C`);
        if (humidity != null) metrics.push(`💧 ${humidity}%`);
        if (step.container || step.recipient) metrics.push(`🫙 ${step.container || step.recipient}`);
        if (step.packaging || step.emballage) metrics.push(`📦 ${step.packaging || step.emballage}`);
        if (step.method || step.methode) metrics.push(`⚙️ ${step.method || step.methode}`);
        if (step.co2) metrics.push(`☁️ ${step.co2}ppm`);
        if (step.ppfd) metrics.push(`☀️ ${step.ppfd}µmol`);
        if (step.volume || step.volumeRecipient) metrics.push(`📐 ${step.volume || step.volumeRecipient}`);
        return metrics;
    };

    // Metric badge inline
    const MetricBadge = ({ icon, value, highlight = false }) => (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            padding: '2px 6px', borderRadius: 5,
            backgroundColor: highlight ? colorWithOpacity(colors.accent, 25) : colorWithOpacity(colors.accent, 12),
            border: `1px solid ${colorWithOpacity(colors.accent, highlight ? 40 : 20)}`,
            fontSize: `${fontSize.small * 0.82}px`,
            color: highlight ? colors.accent : colors.textSecondary,
            fontWeight: highlight ? '600' : '400',
            whiteSpace: 'nowrap',
        }}>
            {icon} {value}
        </span>
    );

    // Rich step card for short pipelines
    const StepCard = ({ step, index, total }) => {
        const label = step.label || step.date || step.semaine || step.phase || step.jour || `${index + 1}`;
        const temp = step.temperature ?? step.temp;
        const humidity = step.humidity ?? step.humidite ?? step.hr;
        const co2 = step.co2;
        const ppfd = step.ppfd;
        const container = step.container || step.recipient;
        const packaging = step.packaging || step.emballage;
        const volume = step.volume || step.volumeRecipient;
        const curingType = step.curingType || step.typeCuring;
        const opacity = step.opacite || step.recipientOpacity;
        const action = step.action || step.event || step.evenement;
        const method = step.method || step.methode;
        const note = step.note || step.comment || step.commentaire;
        const hasMetrics = temp != null || humidity != null || co2 || ppfd || container || packaging;

        return (
            <div style={{
                display: 'flex', gap: isSquare ? 6 : 8, alignItems: 'flex-start',
                padding: `${isSquare ? 6 : 8}px ${isSquare ? 8 : 10}px`,
                backgroundColor: colorWithOpacity(colors.accent, 6 + (index % 2) * 4),
                border: `1px solid ${colorWithOpacity(colors.accent, 20)}`,
                borderLeft: `3px solid ${colorWithOpacity(colors.accent, 50 + Math.min(index * 5, 40))}`,
                borderRadius: `0 ${isSquare ? 6 : 8}px ${isSquare ? 6 : 8}px 0`,
            }}>
                {/* Step label pill */}
                <div style={{
                    flexShrink: 0, minWidth: isSquare ? 32 : 42, textAlign: 'center',
                    padding: `3px ${isSquare ? 5 : 7}px`,
                    backgroundColor: colorWithOpacity(colors.accent, 20),
                    borderRadius: isSquare ? 5 : 7,
                    fontSize: `${fontSize.small * 0.9}px`, fontWeight: '700',
                    color: colors.accent,
                }}>
                    {String(label).slice(0, isSquare ? 4 : 6)}
                </div>

                {/* Metrics + note */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Row 1: env metrics */}
                    {hasMetrics && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {temp != null && <MetricBadge icon="🌡️" value={`${temp}°C`} highlight />}
                            {humidity != null && <MetricBadge icon="💧" value={`${humidity}%`} highlight />}
                            {co2 != null && <MetricBadge icon="☁️" value={`${co2}ppm`} />}
                            {ppfd != null && <MetricBadge icon="☀️" value={`${ppfd}µ`} />}
                            {container && <MetricBadge icon="🫙" value={String(container).slice(0, 14)} />}
                            {packaging && !isSquare && <MetricBadge icon="📦" value={String(packaging).slice(0, 12)} />}
                            {volume && !isSquare && <MetricBadge icon="📐" value={volume} />}
                            {curingType && !isSquare && <MetricBadge icon="❄️" value={curingType} />}
                            {opacity && !isSquare && <MetricBadge icon="🔍" value={opacity} />}
                        </div>
                    )}
                    {/* Row 2: action / method */}
                    {(action || method) && (
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {action && <MetricBadge icon="⚡" value={String(action).slice(0, 20)} highlight />}
                            {method && <MetricBadge icon="⚙️" value={String(method).slice(0, 18)} />}
                        </div>
                    )}
                    {/* Row 3: note */}
                    {note && (
                        <div style={{
                            fontSize: `${fontSize.small * 0.82}px`,
                            color: colors.textSecondary, fontStyle: 'italic',
                            lineHeight: '1.3',
                        }}>
                            💬 {String(note).slice(0, isSquare ? 60 : 100)}{note.length > (isSquare ? 60 : 100) ? '…' : ''}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const PipelineTimeline = ({ pipeline }) => {
        // Prefer rawSteps (objects) over stringified steps
        const rawSteps = pipeline.rawSteps || pipeline.steps.map(s => ({ label: s }));
        const isCompact = rawSteps.length > 10;
        const isMedium = rawSteps.length > 5 && rawSteps.length <= 10;

        return (
            <div style={{ marginBottom: `${spacing.element}px` }}>
                {/* Pipeline Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: spacing.element,
                    marginBottom: spacing.gap + 2,
                    padding: `${isSquare ? 5 : 7}px ${isSquare ? 8 : 12}px`,
                    backgroundColor: colorWithOpacity(colors.accent, 15),
                    borderRadius: isSquare ? 8 : 10,
                }}>
                    <span style={{ fontSize: isSquare ? '16px' : '20px' }}>{pipeline.icon}</span>
                    <span style={{ fontSize: `${fontSize.text}px`, fontWeight: '700', color: colors.textPrimary, flex: 1 }}>
                        {pipeline.name}
                    </span>
                    <span style={{
                        fontSize: `${fontSize.small * 0.88}px`, color: colors.accent,
                        backgroundColor: colorWithOpacity(colors.accent, 20),
                        padding: '2px 7px', borderRadius: 20, fontWeight: '600',
                    }}>
                        {rawSteps.length} étape{rawSteps.length > 1 ? 's' : ''}
                    </span>
                </div>

                {isCompact ? (
                    /* GitHub-style compact grid for >10 steps — show label in each cell, tooltip if metrics exist */
                    <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {rawSteps.map((step, i) => {
                                const label = step.label || step.date || step.semaine || step.phase || step.jour || `${i + 1}`;
                                const temp = step.temperature ?? step.temp;
                                const humidity = step.humidity ?? step.humidite ?? step.hr;
                                const note = step.note || step.comment || step.commentaire || '';
                                const action = step.action || step.event || '';
                                // Build tooltip
                                const tooltipParts = [label];
                                if (temp != null) tooltipParts.push(`🌡️ ${temp}°C`);
                                if (humidity != null) tooltipParts.push(`💧 ${humidity}%`);
                                if (step.container || step.recipient) tooltipParts.push(`🫙 ${step.container || step.recipient}`);
                                if (action) tooltipParts.push(`⚡ ${action}`);
                                if (note) tooltipParts.push(`💬 ${note}`);
                                const cellSize = isSquare ? 28 : 34;
                                // Color intensity based on temperature (if available) or index
                                const intensity = temp != null
                                    ? Math.min(Math.round((temp / 30) * 60) + 15, 75)
                                    : 20 + Math.min(i * 3, 50);
                                return (
                                    <div
                                        key={i}
                                        title={tooltipParts.join(' · ')}
                                        style={{
                                            width: cellSize, height: cellSize, borderRadius: 5,
                                            backgroundColor: colorWithOpacity(colors.accent, intensity),
                                            border: `1px solid ${colorWithOpacity(colors.accent, 35)}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: `${fontSize.small * 0.78}px`, color: colors.textPrimary,
                                            fontWeight: '700', cursor: 'default',
                                        }}
                                    >
                                        {String(label).slice(0, isSquare ? 2 : 3)}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Legend for grid: show key metrics from first and last step */}
                        {rawSteps.length > 0 && (() => {
                            const first = rawSteps[0];
                            const last = rawSteps[rawSteps.length - 1];
                            const firstLabel = first.label || first.date || first.semaine || first.phase || '1';
                            const lastLabel = last.label || last.date || last.semaine || last.phase || String(rawSteps.length);
                            const firstTemp = first.temperature ?? first.temp;
                            const lastTemp = last.temperature ?? last.temp;
                            const firstHumidity = first.humidity ?? first.humidite ?? first.hr;
                            const lastHumidity = last.humidity ?? last.humidite ?? last.hr;
                            const hasEvolution = (firstTemp != null && lastTemp != null) || (firstHumidity != null && lastHumidity != null);
                            if (!hasEvolution) return null;
                            return (
                                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                    {firstTemp != null && lastTemp != null && (
                                        <span style={{ fontSize: `${fontSize.small * 0.82}px`, color: colors.textSecondary }}>
                                            🌡️ {firstLabel}: {firstTemp}°C → {lastLabel}: {lastTemp}°C
                                        </span>
                                    )}
                                    {firstHumidity != null && lastHumidity != null && (
                                        <span style={{ fontSize: `${fontSize.small * 0.82}px`, color: colors.textSecondary }}>
                                            💧 {firstHumidity}% → {lastHumidity}%
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    /* Detailed step cards for ≤10 steps */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {rawSteps.map((step, i) => (
                            <StepCard key={i} step={step} index={i} total={rawSteps.length} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

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
            className={`relative w-full h-full ${isSquare ? 'overflow-auto' : 'overflow-hidden'}`}
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
                    {/* Image — single or gallery */}
                    {contentModules.image && (mainImage || (Array.isArray(reviewData.images) && reviewData.images.length > 0)) && (() => {
                        const showGallery = config.image?.showGallery && Array.isArray(reviewData.images) && reviewData.images.length > 1;
                        const galleryImages = reviewData.images || [];
                        if (showGallery) {
                            return (
                                <div
                                    className="flex-shrink-0 overflow-hidden"
                                    style={{
                                        borderRadius: `${responsive.image.borderRadius}px`,
                                        width: isPortrait || isSquare ? '100%' : responsive.image.maxWidth,
                                        display: 'flex', gap: 4,
                                        height: responsive.image.maxHeight,
                                    }}
                                >
                                    {galleryImages.slice(0, isSquare ? 2 : 4).map((img, ii) => (
                                        <div key={ii} style={{ flex: ii === 0 ? 2 : 1, overflow: 'hidden', borderRadius: `${responsive.image.borderRadius}px` }}>
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return (
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
                        );
                    })()}

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
                        {contentModules.rating && reviewData.rating != null && !isNaN(parseFloat(reviewData.rating)) && (
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

                        {/* Category Ratings bars — with expandable sub-scores */}
                        {contentModules.categoryRatings && categoryRatings.length > 0 && (
                            <div className="space-y-1 mt-4">
                                {categoryRatings.map((r, i) => (
                                    <div key={i}>
                                        <RatingBar label={r.label} value={r.value} icon={r.icon} />
                                        {/* Sub-score bars (individual fields) — skip on tiny square format */}
                                        {r.subDetails && r.subDetails.length > 1 && !isSquare && (
                                            <div style={{ marginLeft: 14, marginTop: 2, marginBottom: `${spacing.gap}px` }}>
                                                {r.subDetails.map((sub, si) => (
                                                    <RatingBar key={si} label={sub.label} value={sub.value} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
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

                {/* Grid layout pour les sections — adapte le nombre de colonnes si l'une est vide */}
                <div
                    className={`grid ${isPortrait || isSquare ? 'grid-cols-1' : 'grid-cols-2'}`}
                    style={{
                        gap: `${spacing.section}px`,
                        flex: isSquare ? 'none' : 1,
                        overflow: isSquare ? 'visible' : 'hidden'
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
                                {contentModules.phenotypeCode && reviewData.phenotypeCode && <InfoCard label="Phénotype" value={reviewData.phenotypeCode} icon="🔬" />}
                            </div>
                            {/* Parentage / Lignée */}
                            {contentModules.parentage && reviewData.parentage && (() => {
                                const p = reviewData.parentage;
                                const parentageText = typeof p === 'object'
                                    ? [p.female, p.male].filter(Boolean).join(' ♀ × ♂ ')
                                    : String(p);
                                return parentageText ? (
                                    <div style={{ marginTop: `${spacing.gap}px`, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `3px solid ${colors.accent || '#a78bfa'}` }}>
                                        <div style={{ fontSize: `${typography.textSize - 1}px`, color: colors.textSecondary || '#9ca3af', marginBottom: '2px' }}>Lignée</div>
                                        <div style={{ fontSize: `${typography.textSize}px`, color: colors.textPrimary || '#fff', fontStyle: 'italic' }}>🌿 {parentageText}</div>
                                    </div>
                                ) : null;
                            })()}
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
                        {((contentModules.aromas && (aromas.length > 0 || secondaryAromas.length > 0)) ||
                            (contentModules.tastes && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0))) && (
                                <Section title="Profil Sensoriel" icon="🌸">
                                    {/* Primary aromas */}
                                    {contentModules.aromas && aromas.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.element}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>Arômes dominants</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {aromas.map((a, i) => <Tag key={i}>{extractLabel(a)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Secondary aromas */}
                                    {contentModules.aromas && secondaryAromas.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.element}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>Arômes secondaires</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {secondaryAromas.map((a, i) => <Tag key={i} variant="subtle">{extractLabel(a)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Dry puff notes */}
                                    {contentModules.tastes && dryPuffNotes.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.gap}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>💨 Tirage à sec</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {dryPuffNotes.map((t, i) => <Tag key={i} variant="subtle">{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inhalation notes */}
                                    {contentModules.tastes && inhalationNotes.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.gap}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>🌬️ Inhalation</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {inhalationNotes.map((t, i) => <Tag key={i}>{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Exhalation notes */}
                                    {contentModules.tastes && exhalationNotes.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>↩️ Expiration / Arrière-goût</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {exhalationNotes.map((t, i) => <Tag key={i} variant="subtle">{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Fallback: generic tastes */}
                                    {contentModules.tastes && tastes.length > 0 && dryPuffNotes.length === 0 && inhalationNotes.length === 0 && (
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

                        {/* Texture — individual sub-score bars */}
                        {contentModules.categoryRatings && (() => {
                            const textureCat = categoryRatings.find(r => r.key === 'texture');
                            if (!textureCat?.subDetails || textureCat.subDetails.length === 0) return null;
                            return (
                                <Section title="Texture" icon="✋">
                                    <div className="space-y-1">
                                        {textureCat.subDetails.map((sub, si) => (
                                            <RatingBar key={si} label={sub.label} value={sub.value} />
                                        ))}
                                    </div>
                                </Section>
                            );
                        })()}
                    </div>
                </div>

                {/* Pipelines (full width) */}
                {(() => {
                    // Determine which pipelines to show based on enabled contentModules
                    const visiblePipelines = pipelines.filter(p => {
                        // If pipelines flag is explicitly true, show all
                        if (contentModules.pipelines === true) return true;
                        // Explicit key match in contentModules
                        if (contentModules[p.key] === true) return true;
                        // Curing-related pipelines
                        if (p.key === 'pipelineCuring' || p.key === 'curingTimeline') return contentModules.curing !== false;
                        // Culture-related pipelines
                        if (p.key === 'pipelineGlobal' || p.key === 'cultureTimeline') return contentModules.fertilizationPipeline !== false;
                        // Explicit pipeline module keys
                        const explicitKeys = ['pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline'];
                        return explicitKeys.some(k => k === p.key && contentModules[k]);
                    });
                    if (visiblePipelines.length === 0) return null;
                    return (
                        <Section title="Processus de Production" icon="⚗️">
                            <div>
                                {visiblePipelines.map((p, i) => <PipelineTimeline key={i} pipeline={p} />)}
                            </div>
                        </Section>
                    );
                })()}

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
                                            <span className="">{key}:</span> {String(displayValue)}
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




