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
    resolveFontStack,
    getGlassTokens,
    ACCENT_TEXT_COLORS,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import ScoreMetric from './sections/ScoreMetric';
import { CannabinoidGrid, GisementSections } from './sections/RegistrySections';
import PipelineTimeline from './sections/PipelineTimeline';

// Groupes du gisement (Phase B du plan de finition Export Maker, 2026-08-02) — 'culture' exclu :
// `substratMix` (le seul champ 'culture' déjà affiché ici) a déjà sa propre section riche
// ("Composition du Substrat", barres de progression) plus bas ; le rendu générique en liste de
// GisementSections le dupliquerait dans un style plus pauvre juste à côté. 'overflow' exclu pour la
// même raison : la section "Caractéristiques Avancées" existante couvre déjà ce rôle.
const GISEMENT_GROUPS = ['harvest', 'usage', 'separation', 'extraction', 'purification', 'recipe'];
const GISEMENT_ICONS = { harvest: '🌾', usage: '💨', separation: '🧊', extraction: '⚗️', purification: '💧', recipe: '🍯' };

import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';

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
    const { isSquare, fontSize, padding, spacing, limits } = responsive;
    const glass = getGlassTokens(colors);
    // Variante AA de l'accent pour le TEXTE (l'accent de palette est une couleur de surface).
    const accentText = glass.isLight ? ACCENT_TEXT_COLORS.onPaper : ACCENT_TEXT_COLORS.onDark;

    // Pagination adaptative (Phase C du plan de finition Export Maker, 2026-08-03) — même contrat
    // que `DetailedCardTemplate.jsx` (le template pilote).
    const pageModuleIds = config.pageModuleIds
        ? (config.pageModuleIds instanceof Set ? config.pageModuleIds : new Set(config.pageModuleIds))
        : null;
    const isPageOn = (moduleId) => !pageModuleIds || pageModuleIds.has(moduleId);

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

    // Adaptateur `Section` compatible avec `GisementSections` (RegistrySections.jsx) — reprend
    // exactement le patron `styles.section`/`styles.sectionTitle` déjà utilisé ~10x dans ce fichier,
    // pour que le gisement de données (récolte/culture/usage/procédés/recette/complémentaires,
    // Phase B du plan de finition Export Maker) s'intègre visuellement sans rien réinventer.
    const Section = ({ title, icon, moduleId, children }) => {
        if (moduleId && !isPageOn(moduleId)) return null;
        return (
            <div data-module={moduleId || undefined} style={styles.section}>
                <h2 style={styles.sectionTitle}>{icon} {title}</h2>
                {children}
            </div>
        );
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
            // `overflow-hidden` inconditionnel, jamais `overflow-auto` (corrigé 2026-08-03, retour
            // utilisateur) : la pagination adaptative (Phase C) couvre désormais aussi le ratio A4
            // pour ce template — un scroll interne masquait silencieusement du contenu débordant
            // au lieu de le répartir sur une page supplémentaire.
            className="w-full h-full overflow-hidden"
            style={{
                background: colors.background,
                fontFamily: resolveFontStack(typography.fontFamily),
                padding: `${padding.container}px`,
            }}
        >
            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                {/* Masthead : en-tête + image à la une + introduction, un seul `data-module`
                    (pagination adaptative, Phase C) pour rester groupés sur la première page. */}
                {isPageOn('masthead') && <div data-module="masthead">
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
                </div>}

                {/* Quick Facts Box */}
                {isPageOn('sensoryEvaluation') && (contentModules.strainType || contentModules.indicaRatio) && (
                    <div data-module="sensoryEvaluation" style={styles.infoBox}>
                        <h3 style={{ fontSize: `${fontSize.text + 2}px`, fontWeight: '700', color: colors.title, marginBottom: `${spacing.element * 2}px` }}>
                            📊 Fiche Technique Rapide
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                {/* Profil cannabinoïde complet (THC/CBD + THCA/CBDA/CBG/CBC/CBN/THCV si renseignés) —
                    isolé sur sa propre page comme DetailedCardTemplate.jsx (grille dense). */}
                {isPageOn('cannabinoidProfile') && (
                    <div data-module="cannabinoidProfile">
                        <CannabinoidGrid reviewData={reviewData} contentModules={contentModules} colors={colors} fontSize={fontSize} spacing={spacing} />
                    </div>
                )}

                {/* Category Ratings */}
                {isPageOn('sensoryEvaluation') && contentModules.categoryRatings && categoryRatings.length > 0 && (
                    <div data-module="sensoryEvaluation" style={styles.section}>
                        <h2 style={styles.sectionTitle}>🎯 Évaluation Détaillée</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {categoryRatings.map((r, i) => (
                                <ScoreMetric key={i} label={r.label} value={r.value} icon={r.icon} fontSize={fontSize.text - 1} colors={colors} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Provenance */}
                {isPageOn('provenance') && (contentModules.cultivar || contentModules.breeder || contentModules.farm || contentModules.hashmaker || contentModules.cultivarsList) && (
                    <div data-module="provenance" style={styles.section}>
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
                            {contentModules.cultivarsList && cultivars.length > 0 && (
                                <p style={{ ...styles.paragraph, gridColumn: '1 / -1' }}><strong>Cultivars :</strong> {cultivars.map((c) => extractLabel(c)).join(', ')}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Profil aromatique : sensoriel + effets + terpènes regroupés sous un seul
                    `data-module` (pagination adaptative, Phase C) — même id que
                    `DetailedCardTemplate.jsx`. */}
                {isPageOn('aromaticProfile') && <div data-module="aromaticProfile">
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
                </div>}

                {/* Pipelines — rendus par le composant partagé `sections/PipelineTimeline.jsx`
                    (2026-08-04) : bandeau de conditions constantes + étapes réduites à leurs
                    deltas. Ce template réimplémentait auparavant sa propre boucle, comme 3 autres. */}
                {(() => {
                    // Chaque pipeline porte son propre `data-module` (`pipeline:<key>`, même
                    // vocabulaire que DetailedCardTemplate.jsx) — la pagination adaptative peut
                    // ainsi répartir Culture/Curing/Extraction/Séparation sur des pages différentes
                    // selon leur volume réel (Phase C).
                    const pagePipelines = pipelines.filter((p) => !pageModuleIds || [...pageModuleIds].some((id) => id.startsWith(`pipeline:${p.key}#`)));
                    if (pagePipelines.length === 0) return null;
                    return (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>⚗️ Processus de Production</h2>
                        {pagePipelines.map((p) => (
                            <PipelineTimeline
                                key={p.key}
                                pipeline={p}
                                moduleId={`pipeline:${p.key}`}
                                isPageOn={isPageOn}
                                paged={!!pageModuleIds}
                                fontSize={{ text: fontSize.text + 1, small: fontSize.small }}
                                spacing={{ element: spacing.element, gap: spacing.gap }}
                                colors={{
                                    textPrimary: colors.textPrimary,
                                    textSecondary: colors.textSecondary,
                                    title: colors.textPrimary,
                                    accent: colors.accent,
                                    accentText,
                                    surface: colorWithOpacity(colors.accent, 10),
                                    line: glass.border,
                                }}
                                glass={glass}
                            />
                        ))}
                    </div>
                    );
                })()}

                {/* Gisement complémentaire (récolte, usage, procédés, recette) — absent de ce
                    template jusqu'ici alors que Fiche Détaillée l'affiche déjà via le même
                    composant partagé (`GisementSections`, RegistrySections.jsx). */}
                <GisementSections
                    reviewData={reviewData}
                    contentModules={contentModules}
                    groups={GISEMENT_GROUPS}
                    Section={Section}
                    colors={{ accent: colors.accent, textPrimary: colors.textPrimary, textSecondary: colors.textSecondary, title: colors.title }}
                    fontSize={fontSize}
                    spacing={spacing}
                    groupIcons={GISEMENT_ICONS}
                />

                {/* Substrat */}
                {isPageOn('substrat') && contentModules.substratMix && substrat.length > 0 && (
                    <div data-module="substrat" style={styles.section}>
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
                {isPageOn('extraData') && contentModules.extraData && extraData.length > 0 && (
                    <div data-module="extraData" style={styles.section}>
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
                {contentModules.phenoHuntView !== false && isPageOn('genealogyCanvas') && (
                    <div data-module="genealogyCanvas" style={styles.section}>
                        <ReadOnlyGenealogyCanvas reviewData={reviewData} height={170} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />
                    </div>
                )}

                {/* Vue interactive Chaîne de production — même logique de masquage async */}
                {contentModules.productionChainView !== false && isPageOn('productionChainCanvas') && (
                    <div data-module="productionChainCanvas" style={styles.section}>
                        <ReadOnlyProductionChainCanvas reviewData={reviewData} height={170} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />
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




