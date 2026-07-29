import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
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
    getGlassTokens,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import GenealogyMiniView from '../export/interactive/GenealogyMiniView';

// Traduit la clé du pipeline (`extractPipelines`, ex. `pipelineGlobal`) vers l'identifiant de type
// attendu par `summarizeCellFields` (chainCellPipelines.js) — même mapping que ModernCompactTemplate
// / DetailedCardTemplate.
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
const NOTE_KEYS = new Set(['note', 'comment', 'commentaire']);
import ProductionChainMiniView from '../export/interactive/ProductionChainMiniView';

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
    const glass = getGlassTokens(colors);

    // Extraction des données - passer reviewData pour fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const pipelines = filterVisiblePipelines(extractPipelines(reviewData), contentModules);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags + 2); // Un peu plus pour articles
    const secondaryAromas = asArray(reviewData.secondaryAromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags + 2);
    const dryPuffNotes = asArray(reviewData.dryPuffNotes).slice(0, limits.maxTags);
    const inhalationNotes = asArray(reviewData.inhalationNotes).slice(0, limits.maxTags);
    const exhalationNotes = asArray(reviewData.exhalationNotes).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags + 2);
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

    // Styles — espacements dérivés de `spacing`/`padding` (responsive par ratio) plutôt que des
    // marges fixes identiques quel que soit le format choisi (bug d'incohérence trouvé 2026-07-29 :
    // ce template était le seul, avec SocialStory, à ignorer l'échelle d'espacement partagée).
    // Les multiplicateurs visent à préserver la respiration généreuse déjà en place (format long
    // adapté à la lecture), pas des valeurs identiques pixel pour pixel.
    const styles = {
        section: {
            marginBottom: `${spacing.section * 1.6}px`,
        },
        sectionTitle: {
            fontSize: `${fontSize.title - 6}px`,
            fontWeight: '700',
            color: colors.title,
            marginBottom: `${spacing.element * 2}px`,
            paddingBottom: `${spacing.gap}px`,
            borderBottom: `3px solid ${colors.accent}`,
            display: 'inline-block',
        },
        paragraph: {
            fontSize: `${fontSize.text + 1}px`,
            color: colors.textSecondary,
            lineHeight: '1.9',
            marginBottom: `${spacing.element * 2}px`,
        },
        tag: {
            display: 'inline-block',
            fontSize: `${fontSize.text - 1}px`,
            padding: `${spacing.gap}px ${spacing.element * 2}px`,
            borderRadius: '25px',
            backgroundColor: colorWithOpacity(colors.accent, 15),
            color: colors.accent,
            fontWeight: '500',
            margin: `${spacing.gap * 0.7}px`,
        },
        infoBox: {
            background: glass.background,
            border: `1px solid ${glass.border}`,
            borderLeft: `4px solid ${colors.accent}`,
            padding: `${padding.card}px ${padding.card * 1.2}px`,
            borderRadius: '0 20px 20px 0',
            marginBottom: `${spacing.section * 1.2}px`,
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            boxShadow: [
                `0 4px 24px -4px ${glass.shadow}`,
                `inset 0 1px 1px ${glass.borderHighlight}`,
            ].join(', '),
        },
        quote: {
            fontSize: `${fontSize.text + 4}px`,
            fontStyle: 'italic',
            color: colors.textPrimary,
            borderLeft: `4px solid ${colors.accent}`,
            paddingLeft: `${spacing.element * 2.5}px`,
            margin: `${spacing.section * 1.6}px 0`,
        },
    };

    // Render étoiles inline
    const renderStarsInline = () => {
        if (!contentModules.rating || reviewData.rating == null || isNaN(parseFloat(reviewData.rating))) return null;
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
            <div className="flex items-center gap-3 mt-8 pt-6 export-maker-branding" style={{ borderTop: `1px solid ${colorWithOpacity(colors.accent, 20)}` }}>
                <img src={branding.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', opacity: branding.opacity }} />
                <span style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>Publié sur notre plateforme</span>
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
                                fontSize: `${fontSize.text - 2}px`,
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
                                fontSize: `${fontSize.text - 2}px`,
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
                            fontSize: `${fontSize.title + 12}px`,
                            fontWeight: typography.titleWeight,
                            color: colors.title,
                            lineHeight: '1.15',
                            marginBottom: '20px',
                        }}>
                            {reviewData.title || reviewData.holderName}
                        </h1>
                    )}

                    {/* Meta: Author, Date, Rating */}
                    <div className="flex flex-wrap items-center gap-6" style={{ fontSize: `${fontSize.text}px`, color: colors.textSecondary }}>
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
                        {contentModules.rating && reviewData.rating != null && !isNaN(parseFloat(reviewData.rating)) && renderStarsInline()}
                    </div>
                </header>

                {/* Featured Image — or gallery */}
                {contentModules.mainImage !== false && (mainImage || (Array.isArray(reviewData.images) && reviewData.images.length > 0)) && (() => {
                    const showGallery = config.image?.showGallery && Array.isArray(reviewData.images) && reviewData.images.length > 1;
                    const imageFrameStyle = {
                        border: `1px solid ${colorWithOpacity('#ffffff', 15)}`,
                        boxShadow: [
                            '0 4px 24px -4px rgba(0,0,0,0.4)',
                            '0 12px 48px -12px rgba(0,0,0,0.5)',
                            `inset 0 1px 1px ${colorWithOpacity('#ffffff', 20)}`,
                        ].join(', '),
                    };
                    if (showGallery) {
                        return (
                            <figure className="mb-10">
                                <div className="grid overflow-hidden" style={{ borderRadius: `${image.borderRadius}px`, gridTemplateColumns: reviewData.images.length >= 3 ? '2fr 1fr 1fr' : reviewData.images.length === 2 ? '1fr 1fr' : '1fr', gap: 4, maxHeight: '420px', ...imageFrameStyle }}>
                                    {reviewData.images.slice(0, 4).map((img, ii) => (
                                        <img key={ii} src={img} alt="" className="w-full h-full object-cover" style={{ maxHeight: ii === 0 ? '420px' : '208px' }} />
                                    ))}
                                </div>
                            </figure>
                        );
                    }
                    return (
                        <figure className="mb-10">
                            <div className="overflow-hidden" style={{ borderRadius: `${image.borderRadius}px`, ...imageFrameStyle }}>
                                <img src={mainImage} alt={reviewData.title || 'Image'} className="w-full" style={{ maxHeight: '500px', objectFit: 'cover' }} />
                            </div>
                            {reviewData.cultivar && (
                                <figcaption style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary, marginTop: '12px', textAlign: 'center' }}>
                                    Cultivar: {reviewData.cultivar}
                                </figcaption>
                            )}
                        </figure>
                    );
                })()}

                {/* Introduction / Description */}
                {contentModules.description && reviewData.description && (
                    <div style={styles.section}>
                        <p style={{ ...styles.paragraph, fontSize: `${fontSize.text + 3}px`, fontWeight: '400' }}>
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Quick Facts Box */}
                {(contentModules.thcLevel || contentModules.cbdLevel || contentModules.strainType) && (
                    <div style={styles.infoBox}>
                        <h3 style={{ fontSize: `${fontSize.text + 2}px`, fontWeight: '700', color: colors.title, marginBottom: `${spacing.element * 2}px` }}>
                            📊 Fiche Technique Rapide
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {contentModules.thcLevel && reviewData.thcLevel && (
                                <div>
                                    <div style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>THC</div>
                                    <div style={{ fontSize: `${fontSize.text + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.thcLevel}%</div>
                                </div>
                            )}
                            {contentModules.cbdLevel && reviewData.cbdLevel && (
                                <div>
                                    <div style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>CBD</div>
                                    <div style={{ fontSize: `${fontSize.text + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.cbdLevel}%</div>
                                </div>
                            )}
                            {contentModules.strainType && reviewData.strainType && (
                                <div>
                                    <div style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>Type</div>
                                    <div style={{ fontSize: `${fontSize.text + 2}px`, fontWeight: '600', color: colors.textPrimary }}>{reviewData.strainType}</div>
                                </div>
                            )}
                            {contentModules.indicaRatio && reviewData.indicaRatio !== undefined && (
                                <div>
                                    <div style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>Indica</div>
                                    <div style={{ fontSize: `${fontSize.text + 4}px`, fontWeight: '700', color: colors.accent }}>{reviewData.indicaRatio}%</div>
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
                                <div key={i} className="text-center p-4 rounded-2xl" style={{
                                    backgroundColor: colorWithOpacity(colors.accent, 8),
                                    border: `1px solid ${colorWithOpacity(colors.accent, 20)}`,
                                    boxShadow: `inset 0 1px 1px ${colorWithOpacity('#ffffff', 12)}`,
                                }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{r.icon}</div>
                                    <div style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>{r.label}</div>
                                    <div style={{ fontSize: `${fontSize.text + 6}px`, fontWeight: '700', color: colors.accent }}>{r.value.toFixed(1)}</div>
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
                {((contentModules.aromas && (aromas.length > 0 || secondaryAromas.length > 0)) || (contentModules.tastes !== false && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0))) && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🌸 Profil Sensoriel</h2>
                        {contentModules.aromas && aromas.length > 0 && (
                            <div className="mb-6">
                                <h3 style={{ fontSize: `${fontSize.text + 1}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: `${spacing.element}px` }}>Arômes dominants</h3>
                                {renderTags(aromas)}
                            </div>
                        )}
                        {contentModules.aromas && secondaryAromas.length > 0 && (
                            <div className="mb-6">
                                <h3 style={{ fontSize: `${fontSize.text}px`, fontWeight: '500', color: colors.textSecondary, marginBottom: '8px' }}>Arômes secondaires</h3>
                                {renderTags(secondaryAromas)}
                            </div>
                        )}
                        {contentModules.tastes !== false && dryPuffNotes.length > 0 && (
                            <div className="mb-4">
                                <h3 style={{ fontSize: `${fontSize.text}px`, fontWeight: '500', color: colors.textSecondary, marginBottom: '8px' }}>💨 Tirage à sec</h3>
                                {renderTags(dryPuffNotes)}
                            </div>
                        )}
                        {contentModules.tastes !== false && inhalationNotes.length > 0 && (
                            <div className="mb-4">
                                <h3 style={{ fontSize: `${fontSize.text}px`, fontWeight: '500', color: colors.textSecondary, marginBottom: '8px' }}>🌬️ Inhalation</h3>
                                {renderTags(inhalationNotes)}
                            </div>
                        )}
                        {contentModules.tastes !== false && exhalationNotes.length > 0 && (
                            <div className="mb-4">
                                <h3 style={{ fontSize: `${fontSize.text}px`, fontWeight: '500', color: colors.textSecondary, marginBottom: '8px' }}>↩️ Expiration / Arrière-goût</h3>
                                {renderTags(exhalationNotes)}
                            </div>
                        )}
                        {contentModules.tastes !== false && tastes.length > 0 && dryPuffNotes.length === 0 && inhalationNotes.length === 0 && (
                            <div>
                                <h3 style={{ fontSize: `${fontSize.text + 1}px`, fontWeight: '600', color: colors.textPrimary, marginBottom: `${spacing.element}px` }}>Goûts</h3>
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
                            <p style={{ ...styles.paragraph, marginTop: `${spacing.element * 2}px` }}>
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

                {/* Pipelines — toutes les étapes, toujours en détail (pas de mode compact en
                    carrés sans texte, pas de troncature de libellé) ; champs résumés via
                    `summarizeCellFields` (même logique que le canevas Chaîne de production)
                    plutôt que des noms de champs devinés qui ne correspondaient pas aux vrais
                    noms enregistrés par les formulaires (co2Ppm/ambientHumidity/ph/ec…). */}
                {pipelines.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>⚗️ Processus de Production</h2>
                        {pipelines.map((p, pi) => {
                            const rawSteps = p.rawSteps || p.steps.map(s => ({ label: s }));
                            const pipelineType = PIPELINE_TYPE_BY_KEY[p.key] || p.key;
                            return (
                                <div key={pi} className="mb-6">
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                                        padding: '10px 16px',
                                        background: glass.background,
                                        border: `1px solid ${glass.border}`,
                                        borderRadius: 16,
                                        backdropFilter: 'blur(24px) saturate(150%)',
                                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                                        boxShadow: [
                                            `0 4px 24px -4px ${glass.shadow}`,
                                            `inset 0 1px 1px ${glass.borderHighlight}`,
                                        ].join(', '),
                                    }}>
                                        <span style={{ fontSize: '20px' }}>{p.icon}</span>
                                        <h3 style={{ fontSize: `${fontSize.text + 1}px`, fontWeight: '700', color: colors.textPrimary, flex: 1 }}>{p.name}</h3>
                                        <span style={{ fontSize: `${fontSize.text - 2}px`, color: colors.accent, fontWeight: '600', padding: '2px 8px', backgroundColor: colorWithOpacity(colors.accent, 20), borderRadius: 20 }}>
                                            {rawSteps.length} étapes
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {rawSteps.map((step, j) => {
                                            const label = step.label || step.date || step.semaine || step.phase || step.jour || `Étape ${j + 1}`;
                                            const fields = summarizeCellFields(pipelineType, step);
                                            const noteField = fields.find((f) => NOTE_KEYS.has(f.key));
                                            const metricFields = fields.filter((f) => f !== noteField);
                                            return (
                                                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 10px', backgroundColor: colorWithOpacity(colors.accent, j % 2 === 0 ? 6 : 10), borderLeft: `3px solid ${colorWithOpacity(colors.accent, 50 + Math.min(j * 4, 35))}`, borderRadius: '0 8px 8px 0' }}>
                                                    <span style={{ flexShrink: 0, padding: '3px 7px', backgroundColor: colorWithOpacity(colors.accent, 22), borderRadius: 6, fontSize: '12px', fontWeight: '700', color: colors.accent, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                        {String(label)}
                                                    </span>
                                                    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                                                        {metricFields.map((f) => (
                                                            <span key={f.key} style={{ padding: '2px 6px', borderRadius: 4, backgroundColor: colorWithOpacity(colors.accent, 12), fontSize: '11px', color: colors.textSecondary }}>
                                                                {f.label} : {f.value}
                                                            </span>
                                                        ))}
                                                        {noteField && <div style={{ flex: '1 0 100%', fontSize: '11px', color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 }}>💬 {noteField.value}</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
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
                                <div key={i} className="p-3 rounded-xl" style={{
                                    backgroundColor: colorWithOpacity(colors.accent, 8),
                                    border: `1px solid ${colorWithOpacity(colors.accent, 20)}`,
                                    boxShadow: `inset 0 1px 1px ${colorWithOpacity('#ffffff', 12)}`,
                                }}>
                                    <span style={{ fontSize: `${fontSize.text - 2}px`, color: colors.textSecondary }}>{d.icon} {d.label}</span>
                                    <div style={{ fontSize: `${fontSize.text}px`, fontWeight: '600', color: colors.textPrimary }}>{d.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vue interactive PhenoHunt (généalogie) — se masque elle-même si aucun arbre lié */}
                {contentModules.phenoHuntView !== false && (
                    <div style={styles.section}>
                        <GenealogyMiniView reviewData={reviewData} compact={false} sectionFontSize={fontSize.text + 1} accentColor={colors.accent} titleColor={colors.title} />
                    </div>
                )}

                {/* Vue interactive Chaîne de production — même logique de masquage async */}
                {contentModules.productionChainView !== false && (
                    <div style={styles.section}>
                        <ProductionChainMiniView reviewData={reviewData} sectionFontSize={fontSize.text + 1} accentColor={colors.accent} titleColor={colors.title} />
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




