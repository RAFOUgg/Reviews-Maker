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
    filterVisiblePipelines,
    extractSubstrat,
    extractExtraData,
    colorWithOpacity,
    getResponsiveAdjustments,
} from '../../utils/orchardHelpers';
import { resolveImageUrl } from '../../utils/orchard/resolveImageUrl';
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import GenealogyMiniView from '../export/interactive/GenealogyMiniView';
import ProductionChainMiniView from '../export/interactive/ProductionChainMiniView';
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid';
import { CannabinoidGrid, GisementSections, getCannabinoidItems } from './sections/RegistrySections';

// Groupes du "gisement" rendus génériquement depuis le registre (jamais affichés avant) :
// récolte, culture, usage, labo, et les procédés propres aux Hash/Concentré/Comestible.
const GISEMENT_GROUPS = ['harvest', 'culture', 'usage', 'lab', 'separation', 'extraction', 'purification', 'recipe', 'overflow'];
const GISEMENT_ICONS = {
    harvest: '🌾', culture: '🌱', usage: '💨', lab: '🧪',
    separation: '🧊', extraction: '⚗️', purification: '💧', recipe: '🍯', overflow: '➕',
};
import { QRCodeSVG } from 'qrcode.react';
import { getLotCode, getLotCodeUrl } from '../../utils/lotCode';

const BUSINESS_TYPE_LABELS = {
    farm: 'Ferme',
    laboratory: 'Laboratoire',
    extractor: 'Extracteur',
    manufacturer: 'Fabricant',
    distributor: 'Distributeur',
    other: 'Producteur',
};

const LAB_METHOD_LABELS = {
    hplc: 'HPLC',
    'gc-ms': 'GC-MS',
    'lc-ms-ms': 'LC-MS/MS',
    nirs: 'NIRS',
    rmn: 'RMN',
    'icp-ms': 'ICP-MS',
    other: 'Autre méthode',
};

const TIMELINE_PIPELINES = [
    { type: 'culture', name: 'Culture', icon: '🌱', dataKey: 'cultureTimelineData', configKey: 'cultureTimelineConfig' },
    { type: 'curing', name: 'Curing & Maturation', icon: '🔥', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
    { type: 'extraction', name: 'Extraction', icon: '⚗️', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
    { type: 'separation', name: 'Séparation', icon: '🔬', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
];

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
    const mainImage = resolveImageUrl(
        (Array.isArray(reviewData.images) && reviewData.images.length > 0)
            ? (reviewData.images[selectedImgIndex] || reviewData.images[0])
            : (reviewData.mainImageUrl || reviewData.imageUrl || null)
    );

    // Visibilité des sections Informations et Provenance (évite les titres vides sur les pages paginées)
    const hasInfoSectionContent =
        (contentModules?.category && reviewData.category) ||
        (contentModules?.strainType && reviewData.strainType) ||
        (contentModules?.indicaRatio && reviewData.indicaRatio !== undefined) ||
        (contentModules?.thcLevel && reviewData.thcLevel) ||
        (contentModules?.cbdLevel && reviewData.cbdLevel) ||
        (contentModules?.dureeEffet && reviewData.dureeEffet);

    const hasProvenanceSectionContent =
        (contentModules?.cultivar && reviewData.cultivar) ||
        (contentModules?.breeder && reviewData.breeder) ||
        (contentModules?.farm && reviewData.farm) ||
        (contentModules?.hashmaker && reviewData.hashmaker) ||
        (contentModules?.phenotypeCode && reviewData.phenotypeCode) ||
        (contentModules?.parentage && reviewData.parentage) ||
        reviewData.producerVerified;

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
        if (step.container ?? step.recipient) metrics.push(`🫙 ${step.container ?? step.recipient}`);
        if (step.packaging ?? step.emballage) metrics.push(`📦 ${step.packaging ?? step.emballage}`);
        if (step.method ?? step.methode) metrics.push(`⚙️ ${step.method ?? step.methode}`);
        if (step.co2) metrics.push(`☁️ ${step.co2}ppm`);
        if (step.ppfd) metrics.push(`☀️ ${step.ppfd}µmol`);
        if (step.volume ?? step.volumeRecipient) metrics.push(`📐 ${step.volume ?? step.volumeRecipient}`);
        return metrics;
    };

    // Metric badge inline — texte complet, jamais tronqué (retour à la ligne si nécessaire) : une
    // fiche technique reste un document à lire, pas une mosaïque de pastilles décoratives.
    const MetricBadge = ({ icon, value, highlight = false }) => (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            padding: '3px 7px', borderRadius: 5,
            backgroundColor: highlight ? colorWithOpacity(colors.accent, 25) : colorWithOpacity(colors.accent, 12),
            border: `1px solid ${colorWithOpacity(colors.accent, highlight ? 40 : 20)}`,
            fontSize: `${fontSize.small}px`,
            color: highlight ? colors.accent : colors.textSecondary,
            fontWeight: highlight ? '600' : '400',
            whiteSpace: 'normal',
        }}>
            {icon} {value}
        </span>
    );

    // Icônes décoratives best-effort par identifiant de champ (couvre les ids les plus courants
    // des *SidebarContent.js) — purement cosmétique : un champ sans icône reconnue s'affiche quand
    // même (repli '•'), il ne disparaît jamais faute d'icône.
    const METRIC_ICONS = {
        temperature: '🌡️', temp: '🌡️', temperatureDay: '🌡️', temperatureNight: '🌡️', temperatureEau: '🌡️',
        humidity: '💧', ambientHumidity: '💧', humidite: '💧', hr: '💧',
        co2: '☁️', co2Ppm: '☁️', vpd: '💨',
        ppfd: '☀️', lightType: '☀️',
        ph: '🧪', ec: '🧪',
        container: '🫙', recipient: '🫙',
        packaging: '📦', emballage: '📦',
        action: '⚡', event: '⚡', evenement: '⚡',
        method: '⚙️', methode: '⚙️', spaceType: '🏠', seedType: '🌱',
    };
    const NOTE_KEYS = new Set(['note', 'comment', 'commentaire']);

    // Carte d'étape — un seul mode d'affichage, toujours détaillé (cf. décision : la fiche
    // s'allonge plutôt que de tronquer/masquer du contenu, quel que soit le nombre d'étapes).
    // Les métriques viennent de `summarizeCellFields` (déjà la logique de référence du canevas
    // Chaîne de production pour lire une cellule de pipeline) plutôt que d'une liste de noms de
    // champs devinés à la main ici — cette dernière ne correspondait pas aux vrais noms enregistrés
    // par les formulaires (`co2Ppm`/`ambientHumidity`/`ph`/`ec`… jamais affichés, bug 2026-07-27).
    const StepCard = ({ step, index, pipelineType }) => {
        const label = step.label || step.date || step.semaine || step.phase || step.jour || `${index + 1}`;
        const fields = summarizeCellFields(pipelineType, step);
        const noteField = fields.find((f) => NOTE_KEYS.has(f.key));
        const metricFields = fields.filter((f) => f !== noteField);

        return (
            <div style={{
                display: 'flex', gap: isSquare ? 6 : 8, alignItems: 'flex-start',
                padding: `${isSquare ? 6 : 8}px ${isSquare ? 8 : 10}px`,
                backgroundColor: colorWithOpacity(colors.accent, 6 + (index % 2) * 4),
                border: `1px solid ${colorWithOpacity(colors.accent, 20)}`,
                borderLeft: `3px solid ${colorWithOpacity(colors.accent, 50 + Math.min(index * 5, 40))}`,
                borderRadius: `0 ${isSquare ? 6 : 8}px ${isSquare ? 6 : 8}px 0`,
            }}>
                {/* Step label pill — texte complet */}
                <div style={{
                    flexShrink: 0, textAlign: 'center',
                    padding: `3px ${isSquare ? 7 : 9}px`,
                    backgroundColor: colorWithOpacity(colors.accent, 20),
                    borderRadius: isSquare ? 5 : 7,
                    fontSize: `${fontSize.small}px`, fontWeight: '700',
                    color: colors.accent, whiteSpace: 'nowrap',
                }}>
                    {String(label)}
                </div>

                {/* Metrics + note */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {metricFields.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {metricFields.map((f) => (
                                <MetricBadge key={f.key} icon={METRIC_ICONS[f.key] || '•'} value={`${f.label} : ${f.value}`} />
                            ))}
                        </div>
                    )}
                    {noteField && (
                        <div style={{
                            fontSize: `${fontSize.small}px`,
                            color: colors.textSecondary, fontStyle: 'italic',
                            lineHeight: '1.4',
                        }}>
                            💬 {noteField.value}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Traduit la clé du pipeline (`extractPipelines`, ex. `pipelineGlobal`) vers l'identifiant de
    // type attendu par `summarizeCellFields`/`FIELD_LOOKUPS` (chainCellPipelines.js). Purification
    // et fertilisation n'ont pas de lookup dédié là-bas : repli sur les clés brutes humanisées par
    // `summarizeCellFields` lui-même (pas d'erreur, juste moins joliment libellé).
    const PIPELINE_TYPE_BY_KEY = {
        pipelineGlobal: 'culture',
        cultureTimeline: 'culture',
        pipelineCuring: 'curing',
        curingTimeline: 'curing',
        pipelineExtraction: 'extraction',
        extractionTimelineData: 'extraction',
        pipelineSeparation: 'separation',
        separationTimelineData: 'separation',
    };

    const PipelineTimeline = ({ pipeline }) => {
        // Prefer rawSteps (objects) over stringified steps
        const rawSteps = pipeline.rawSteps || pipeline.steps.map(s => ({ label: s }));
        const pipelineType = PIPELINE_TYPE_BY_KEY[pipeline.key] || pipeline.key;

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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: `${fontSize.text}px`, fontWeight: '700', color: colors.textPrimary }}>
                            {pipeline.name}
                        </span>
                        {pipeline.configMeta && (
                            <span style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                                {pipeline.configMeta}
                            </span>
                        )}
                    </div>
                    <span style={{
                        fontSize: `${fontSize.small}px`, color: colors.accent,
                        backgroundColor: colorWithOpacity(colors.accent, 20),
                        padding: '2px 7px', borderRadius: 20, fontWeight: '600',
                    }}>
                        {rawSteps.length} étape{rawSteps.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Toutes les étapes, toujours en détail — la fiche s'allonge plutôt que de
                    dégrader en carrés colorés sans texte (illisible, notamment à l'export statique
                    où le survol souris qui portait l'info n'existe pas). */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rawSteps.map((step, i) => (
                        <StepCard key={i} step={step} index={i} pipelineType={pipelineType} />
                    ))}
                </div>
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
                className="absolute pointer-events-none orchard-branding"
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
            className="relative w-full h-full overflow-auto"
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
                    {contentModules.mainImage !== false && (mainImage || (Array.isArray(reviewData.images) && reviewData.images.length > 0)) && (() => {
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

                {/* Grid layout pour les sections — adapte le nombre de colonnes dynamiquement.
                    flex:1 uniquement si au moins une colonne a du contenu réel : sinon, sur une
                    page peu remplie (pagination, review en cours de saisie), ce conteneur vide
                    forçait quand même l'expansion sur toute la hauteur restante du canvas,
                    laissant un grand vide visuel entre le header et le pied de page. */}
                {(() => {
                    const hasCol1 = hasInfoSectionContent || hasProvenanceSectionContent
                        || (contentModules.cultivarsList && cultivars.length > 0)
                        || (contentModules.effects && effects.length > 0);
                    const hasCol2 = (contentModules.aromas && (aromas.length > 0 || secondaryAromas.length > 0))
                        || (contentModules.tastes !== false && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0))
                        || (contentModules.terpenes && terpenes.length > 0)
                        || (contentModules.substratMix && substrat.length > 0);
                    const hasAnyColContent = hasCol1 || hasCol2;
                    return (
                        <div
                            className={`grid ${(isPortrait || isSquare || !hasCol1 || !hasCol2) ? 'grid-cols-1' : 'grid-cols-2'}`}
                            style={{
                                gap: `${spacing.section}px`,
                                flex: (isSquare || !hasAnyColContent) ? 'none' : 1,
                                overflow: isSquare ? 'visible' : 'hidden'
                            }}
                        >
                    {/* Colonne 1 */}
                    <div>
                        {/* Informations générales */}
                        {hasInfoSectionContent && <Section title="Informations" icon="📋">
                            <div className={`grid grid-cols-2`} style={{ gap: `${spacing.gap}px` }}>
                                {contentModules.category && reviewData.category && <InfoCard label="Catégorie" value={reviewData.category} icon="📂" />}
                                {contentModules.strainType && reviewData.strainType && <InfoCard label="Type de strain" value={reviewData.strainType} icon="🧬" />}
                                {contentModules.indicaRatio && reviewData.indicaRatio !== undefined && <InfoCard label="Ratio Indica" value={`${reviewData.indicaRatio}%`} icon="⚖️" />}
                                {contentModules.thcLevel && reviewData.thcLevel && <InfoCard label="THC" value={`${reviewData.thcLevel}%`} icon="🔬" />}
                                {contentModules.cbdLevel && reviewData.cbdLevel && <InfoCard label="CBD" value={`${reviewData.cbdLevel}%`} icon="💊" />}
                                {contentModules.dureeEffet && reviewData.dureeEffet && <InfoCard label="Durée effets" value={reviewData.dureeEffet} icon="⏱️" />}
                            </div>
                            {/* Métadonnées COA — saisies en formulaire (labName/labMethod/labAccredited)
                                mais jamais rendues dans un export avant ce fix (cf. audit traçabilité) */}
                            {(contentModules.thcLevel || contentModules.cbdLevel) && (reviewData.labName || reviewData.labMethod || reviewData.labAccredited) && (
                                <div style={{ marginTop: `${spacing.gap}px`, padding: '6px 10px', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', borderLeft: `3px solid ${colors.accent || '#a78bfa'}`, fontSize: `${typography.textSize - 1}px`, color: colors.textSecondary || '#9ca3af' }}>
                                    🔬 {[
                                        reviewData.labName,
                                        reviewData.labMethod && LAB_METHOD_LABELS[reviewData.labMethod] || reviewData.labMethod,
                                        reviewData.labAccredited && `accrédité${reviewData.labAccreditationStandard ? ` ${reviewData.labAccreditationStandard}` : ''}`,
                                    ].filter(Boolean).join(' · ')}
                                </div>
                            )}
                        </Section>}

                        {/* Provenance */}
                        {hasProvenanceSectionContent && <Section title="Provenance" icon="🌱">
                            <div className={`grid grid-cols-2`} style={{ gap: `${spacing.gap}px` }}>
                                {contentModules.cultivar && reviewData.cultivar && <InfoCard label="Cultivar" value={reviewData.cultivar} icon="🌿" />}
                                {contentModules.breeder && reviewData.breeder && <InfoCard label="Breeder" value={reviewData.breeder} icon="🧬" />}
                                {contentModules.farm && reviewData.farm && <InfoCard label="Farm" value={reviewData.farm} icon="🏡" />}
                                {contentModules.hashmaker && reviewData.hashmaker && <InfoCard label="Hash Maker" value={reviewData.hashmaker} icon="👨‍🔬" />}
                                {contentModules.phenotypeCode && reviewData.phenotypeCode && <InfoCard label="Phénotype" value={reviewData.phenotypeCode} icon="🔬" />}
                            </div>
                            {/* Badge de confiance — ProducerProfile.isVerified/businessType, jusqu'ici
                                jamais affiché en dehors de la page compte de l'auteur (Chantier 5). */}
                            {reviewData.producerVerified && (
                                <div style={{
                                    marginTop: `${spacing.gap}px`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 9px',
                                    borderRadius: '999px',
                                    background: colorWithOpacity('#22c55e', 15),
                                    border: `1px solid ${colorWithOpacity('#22c55e', 35)}`,
                                    fontSize: `${typography.textSize - 2}px`,
                                    color: '#22c55e',
                                    fontWeight: '600',
                                }}>
                                    ✓ Producteur vérifié{BUSINESS_TYPE_LABELS[reviewData.producerBusinessType] ? ` · ${BUSINESS_TYPE_LABELS[reviewData.producerBusinessType]}` : ''}
                                </div>
                            )}
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
                        </Section>}

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
                            (contentModules.tastes !== false && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0))) && (
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
                                    {contentModules.tastes !== false && dryPuffNotes.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.gap}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>💨 Tirage à sec</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {dryPuffNotes.map((t, i) => <Tag key={i} variant="subtle">{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inhalation notes */}
                                    {contentModules.tastes !== false && inhalationNotes.length > 0 && (
                                        <div style={{ marginBottom: `${spacing.gap}px` }}>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>🌬️ Inhalation</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {inhalationNotes.map((t, i) => <Tag key={i}>{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Exhalation notes */}
                                    {contentModules.tastes !== false && exhalationNotes.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, marginBottom: `${spacing.gap}px` }}>↩️ Expiration / Arrière-goût</div>
                                            <div className="flex flex-wrap" style={{ gap: `${spacing.gap}px` }}>
                                                {exhalationNotes.map((t, i) => <Tag key={i} variant="subtle">{extractLabel(t)}</Tag>)}
                                            </div>
                                        </div>
                                    )}
                                    {/* Fallback: generic tastes */}
                                    {contentModules.tastes !== false && tastes.length > 0 && dryPuffNotes.length === 0 && inhalationNotes.length === 0 && (
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
                    );
                })()}

                {/* Cannabinoïdes — grille complète (majeurs + acides + mineurs) via le référentiel */}
                {getCannabinoidItems(reviewData, contentModules).length > 0 && (
                    <Section title="Cannabinoïdes" icon="🔬">
                        <CannabinoidGrid reviewData={reviewData} contentModules={contentModules} colors={colors} fontSize={fontSize} spacing={spacing} />
                    </Section>
                )}

                {/* Gisement complet piloté par le registre (récolte, culture, usage, labo, procédés…) */}
                <GisementSections
                    reviewData={reviewData}
                    contentModules={contentModules}
                    groups={GISEMENT_GROUPS}
                    Section={Section}
                    colors={colors}
                    fontSize={fontSize}
                    spacing={spacing}
                    groupIcons={GISEMENT_ICONS}
                />

                {/* Pipelines (full width) */}
                {(() => {
                    // Filtre partagé avec ModernCompactTemplate/BlogArticleTemplate (orchardHelpers.js)
                    // — nécessaire pour que la pagination répartisse bien un pipeline par page dédiée
                    // au lieu de tout réafficher sur chaque page.
                    const visiblePipelines = filterVisiblePipelines(pipelines, contentModules);
                    if (visiblePipelines.length === 0) return null;
                    return (
                        <Section title="Processus de Production" icon="⚗️">
                            <div>
                                {visiblePipelines.map((p, i) => <PipelineTimeline key={i} pipeline={p} />)}
                            </div>
                        </Section>
                    );
                })()}

                {/* Vue interactive PhenoHunt (généalogie) — le composant gère lui-même son
                    titre et se masque entièrement si aucun arbre n'est lié (évite un
                    titre de section vide pendant/après le fetch async) */}
                {contentModules.phenoHuntView !== false && (
                    <div style={{ marginBottom: `${spacing.section}px` }}>
                        <GenealogyMiniView reviewData={reviewData} compact sectionFontSize={fontSize.section} accentColor={colors.accent} titleColor={colors.title} />
                    </div>
                )}

                {/* Vue interactive Chaîne de production — même logique de masquage async */}
                {contentModules.productionChainView !== false && (
                    <div style={{ marginBottom: `${spacing.section}px` }}>
                        <ProductionChainMiniView reviewData={reviewData} sectionFontSize={fontSize.section} accentColor={colors.accent} titleColor={colors.title} />
                    </div>
                )}

                {/* Vue interactive Pipelines (grilles cliquables) */}
                {contentModules.pipelineInteractiveView !== false && (() => {
                    const activeTimelines = TIMELINE_PIPELINES.filter(t => reviewData[t.dataKey] && reviewData[t.configKey]);
                    if (activeTimelines.length === 0) return null;
                    return (
                        <Section title="Pipelines — vue détaillée" icon="📅">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.section}px` }}>
                                {activeTimelines.map(t => (
                                    <PipelineMiniGrid
                                        key={t.type}
                                        type={t.type}
                                        name={t.name}
                                        icon={t.icon}
                                        timelineData={reviewData[t.dataKey]}
                                        timelineConfig={reviewData[t.configKey]}
                                        accentColor={colors.accent}
                                    />
                                ))}
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

                {/* Identifiant de lot — répond au constat le plus fondamental de l'étude de marché
                    traçabilité (aucun système du marché comparé ne fonctionne sans identifiant
                    unique de lot). Dérivé de l'id de la review, jamais stocké séparément — voir
                    client/src/utils/lotCode.js pour le design et l'avertissement sur sa portée
                    (identifiant de confort interne, pas un tag réglementaire). */}
                {reviewData.id && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: `${spacing.element}px`,
                            paddingTop: `${spacing.element}px`,
                            borderTop: `1px solid ${colorWithOpacity(colors.textSecondary, 15)}`,
                        }}
                        title="Identifiant interne Reviews-Maker — pas un numéro de traçabilité officiel"
                    >
                        <div style={{ background: '#fff', padding: '3px', borderRadius: '4px', lineHeight: 0, flexShrink: 0 }}>
                            <QRCodeSVG value={getLotCodeUrl(reviewData.id)} size={40} level="M" />
                        </div>
                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: '600', color: colors.textPrimary }}>{getLotCode(reviewData.id)}</div>
                            <div style={{ fontSize: `${fontSize.small - 2}px`, opacity: 0.7 }}>Identifiant interne — non réglementaire</div>
                        </div>
                    </div>
                )}

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




