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
    filterVisiblePipelines,
    getResponsiveAdjustments,
    TIMELINE_PIPELINES,
    resolveFontStack,
    readableFontSize,
    colorWithOpacity,
    getGlassTokens,
    ACCENT_TEXT_COLORS,
    getImageRenderStyle,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
// Base d'icônes unique — remplace trois copies locales de la même table, dont une incomplète
// (Article de Blog n'avait ni `culture` ni `overflow`).
import { GROUP_ICONS } from '../../utils/fieldIcons';
import { noteWithEmoji } from '../../utils/noteEmoji';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';
import ScoreMetric from './sections/ScoreMetric';
import ScoreBoard from './sections/ScoreBoard';
import { CannabinoidGrid, GisementSections } from './sections/RegistrySections';
import { templateSection } from '../../store/exportMakerConstants';
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid';
import FitToFill from './frame/FitToFill';

// Groupes du gisement (Phase B du plan de finition Export Maker, 2026-08-02) — liste complète
// (comme DetailedCardTemplate.jsx) : aucun de ces groupes n'a de rendu spécifique existant dans ce
// template (contrairement à BlogArticleTemplate, qui garde sa propre section "Substrat" à part).
const GISEMENT_GROUPS = ['harvest', 'culture', 'usage', 'separation', 'extraction', 'purification', 'recipe', 'overflow'];


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
    const glass = getGlassTokens(colors);
    // Variante AA de l'accent pour le TEXTE — l'accent de palette est une couleur de surface
    // (violet-500 par défaut, 4.42:1 sur le fond de l'app, sous le seuil AA en petit texte).
    const accentText = glass.isLight ? ACCENT_TEXT_COLORS.onPaper : ACCENT_TEXT_COLORS.onDark;

    // Pagination adaptative (Phase C du plan de finition Export Maker, 2026-08-03) — même contrat
    // que `DetailedCardTemplate.jsx` (le template pilote) : `config.pageModuleIds` (Set/array d'ids
    // ou absent) restreint quels blocs s'affichent sur CETTE page, orthogonal aux booléens
    // `contentModules` existants. Absent (rendu normal/non paginé/mesure) : tout s'affiche, comme
    // avant ce chantier.
    const pageModuleIds = config.pageModuleIds
        ? (config.pageModuleIds instanceof Set ? config.pageModuleIds : new Set(config.pageModuleIds))
        : null;
    const isPageOn = (moduleId) => !pageModuleIds || pageModuleIds.has(moduleId);

    // Données extraites - passer reviewData pour fallbacks
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const pipelines = filterVisiblePipelines(extractPipelines(reviewData), contentModules);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags);
    const secondaryAromas = asArray(reviewData.secondaryAromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const dryPuffNotes = asArray(reviewData.dryPuffNotes).slice(0, limits.maxTags);
    const inhalationNotes = asArray(reviewData.inhalationNotes).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cultivars = asArray(reviewData.cultivarsList).slice(0, limits.maxTags);

    // Image principale - respect du sélecteur d'index
    const selectedImgIndex = config.image?.selectedIndex ?? 0;
    const mainImage = resolveImageUrl(
        (Array.isArray(reviewData.images) && reviewData.images.length > 0)
            ? (reviewData.images[selectedImgIndex] || reviewData.images[0])
            : (reviewData.mainImageUrl || reviewData.imageUrl || null)
    );

    // Styles dynamiques
    const styles = {
        container: {
            background: colors.background,
            fontFamily: resolveFontStack(typography.fontFamily),
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
            borderRadius: `${isSquare ? 12 : 16}px`,
            padding: `${padding.card}px`,
            border: `1px solid ${colorWithOpacity(colors.accent, 22)}`,
            boxShadow: `inset 0 1px 1px ${colorWithOpacity('#ffffff', 12)}`,
        },
    };

    // Render étoiles - Note sur 10, affichée avec 5 étoiles proportionnelles
    const renderStars = () => {
        if (!contentModules.rating || reviewData.rating == null || isNaN(parseFloat(reviewData.rating))) return null;
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
            <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.gap}px` }}>
                {/* `noteWithEmoji` plutôt que le libellé brut : les formulaires enregistrent des
                    identifiants (`floral-hibiscus`, `anti-depression`) que le rendu affichait tels
                    quels. Il retourne l'emoji ET le vrai libellé issus des mêmes tables que la
                    saisie (`aromasWheel`/`effects`/`tasteNotes`/`odorNotes`). */}
                {items.map((item, i) => (
                    <span key={i} style={styles.tag}>{noteWithEmoji(extractLabel(item))}</span>
                ))}
            </div>
        );
    };

    // Render empty state hint — subtle placeholder when module is enabled but data is missing
    const renderEmptyHint = (icon, text) => (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${spacing.gap}px`,
            padding: `${padding.card * 0.6}px ${padding.card}px`,
            borderRadius: `${isSquare ? 6 : 8}px`,
            border: `1px dashed ${colorWithOpacity(colors.textSecondary, 25)}`,
            backgroundColor: colorWithOpacity(colors.textSecondary, 5),
        }}>
            <span style={{ fontSize: `${fontSize.small}px`, opacity: 0.5 }}>{icon}</span>
            <span style={{ fontSize: `${readableFontSize(fontSize.small * 0.85)}px`, color: colors.textSecondary, opacity: 0.45, fontStyle: 'italic' }}>
                {text}
            </span>
        </div>
    );

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

    // Adaptateur `Section` compatible avec `GisementSections` (RegistrySections.jsx) — reprend le
    // patron "libellé centré + contenu" déjà utilisé partout ailleurs dans ce template (ex. bloc
    // Terpènes juste au-dessus), pour que le gisement de données (Phase B du plan de finition
    // Export Maker) s'intègre sans rien réinventer.
    const Section = ({ title, icon, moduleId, children }) => {
        if (moduleId && !isPageOn(moduleId)) return null;
        return (
            <div data-module={moduleId || undefined} style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, textAlign: 'center' }}>{icon} {title}</div>
                {children}
            </div>
        );
    };

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
                className="absolute pointer-events-none export-maker-branding"
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

    const renderLayout = () => {
        if (isLandscape) {
            // Layout paysage : image à gauche, contenu à droite
            return (
                <div className="flex h-full" style={{ gap: `${spacing.section}px` }}>
                    {/* Image — `data-module="mainImage"` + `isPageOn()` (Phase C, correctif 2026-08-03) :
                        ce bloc n'avait jusqu'ici AUCUN id mesurable et se rendait sans condition sur
                        CHAQUE page adaptative — sa hauteur (jusqu'à 100% de la colonne) n'était donc
                        jamais comptée dans le budget de `computeAdaptivePages`, provoquant un
                        débordement systématique du canevas (contenu réellement plus haut que mesuré)
                        et un nombre de pages gonflé artificiellement (trouvé en vérification sur une
                        review réelle en prod, ratio 1:1). */}
                    {contentModules.mainImage !== false && mainImage && isPageOn('mainImage') && (() => {
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
                                <div data-module="mainImage" className="flex-shrink-0 flex flex-col" style={{ width: '38%', gap: 4 }}>
                                    {reviewData.images.slice(0, 2).map((img, ii) => (
                                        <div key={ii} className="flex-1 overflow-hidden" style={{ /* `image.borderRadius` (le curseur « Coins arrondis ») et non `responsive.image.borderRadius`,
   qui est une constante dérivée du RATIO (8 ou 12px) et écrasait donc silencieusement le réglage :
   régler 40px ne changeait rien au rendu (signalé capture à l'appui le 2026-08-11). */
                                        borderRadius: `${image.borderRadius}px`, ...imageFrameStyle }}>
                                            <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" style={getImageRenderStyle(image)} />
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <div data-module="mainImage" className="flex-shrink-0 w-2/5 h-full">
                                <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${image.borderRadius}px`, ...imageFrameStyle }}>
                                    <img src={mainImage} alt="" className="w-full h-full object-cover" style={getImageRenderStyle(image)} />
                                </div>
                            </div>
                        );
                    })()}

                    {/* Contenu */}
                    <div className="flex-1 flex flex-col overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                        {renderContent()}
                    </div>
                </div>
            );
        }

        // Layout portrait/carré : vertical — adaptatif selon la quantité de contenu.
        // `FitToFill` ajuste l'échelle pour occuper la hauteur réelle : une carte ne se paginant
        // pas, c'est le seul moyen d'atteindre un remplissage constant quel que soit le volume de
        // données (mesuré de 53 % à 98 % selon la combinaison avant ce composant).
        return (
            <FitToFill min={0.9} max={1.35} enabled={!config.__measuring}>
            <div className="flex flex-col h-full overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                {/* Image — `data-module="mainImage"` + `isPageOn()` (Phase C, correctif 2026-08-03) :
                    ce bloc n'avait jusqu'ici AUCUN id mesurable et se rendait sans condition sur
                    CHAQUE page adaptative — sa hauteur (jusqu'à `responsive.image.maxHeight`,
                    souvent une part importante du canevas en 1:1) n'était donc jamais comptée dans
                    le budget de `computeAdaptivePages`, provoquant un débordement systématique
                    (contenu réellement plus haut que mesuré, rendu "scrollable"/coupé) et un nombre
                    de pages gonflé artificiellement (trouvé en vérification sur une review réelle en
                    prod, template Moderne Compact, ratio 1:1). */}
                {/* Bug corrigé 2026-08-04 (vérification par export PNG réel) : cette branche
                    portrait/carré rendait, en l'absence de photo, un placeholder pointillé de 120px
                    PORTANT `data-module="mainImage"`. Or `mainImage` fait partie de `ALWAYS_ISOLATE`
                    (adaptivePagination.js) : ce rectangle vide décrochait donc une PAGE ENTIÈRE dans
                    l'export d'une review sans photo — constaté sur un export réel, page 1 réduite à
                    un cadre vide et une signature. La branche paysage de ce même template exigeait
                    déjà `&& mainImage` ; `SocialStoryTemplate` avait eu exactement ce bug le
                    2026-08-03 (placeholder emoji esseulé) et rend `null`. Cette branche était la
                    dernière occurrence : pas de photo ⇒ pas de module, donc pas de page. */}
                {contentModules.mainImage !== false && mainImage && isPageOn('mainImage') && (() => {
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
                            <div data-module="mainImage" className="w-full flex-shrink-0 flex overflow-hidden" style={{ borderRadius: `${image.borderRadius}px`, maxHeight: responsive.image.maxHeight, gap: 3, ...imageFrameStyle }}>
                                {reviewData.images.slice(0, isSquare ? 2 : 3).map((img, ii) => (
                                    <div key={ii} style={{ flex: ii === 0 ? 2 : 1, overflow: 'hidden' }}>
                                        <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" style={getImageRenderStyle(image)} />
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    // IMAGE ÉLASTIQUE. Cette piste avait été retirée le 2026-08-05 : elle
                    // améliorait 3 combinaisons sur 4 mais faisait déborder Fleur 1:1 à 122,3 %,
                    // soit une perte définitive de contenu sur une carte non paginable.
                    //
                    // Elle est reprise parce que la condition qui la rendait dangereuse a disparu.
                    // `FitToFill` mesurait alors des conteneurs flex étirés et ne pouvait PAS
                    // rétrécir (corrigé le même jour) : rien ne rattrapait un dépassement. Il
                    // mesure désormais le contenu réel et réduit l'échelle en cas de dépassement.
                    // L'image peut donc prendre le mou sans risquer la coupe.
                    //
                    // `maxHeight` CONSERVÉ comme plafond. Le retirer a été essayé et mesuré : la
                    // boîte prend alors sa hauteur naturelle et le carré dense passe de 98 % à
                    // 105,7 % de débordement. Le `flex` gouverne la croissance dans l'espace
                    // disponible, le `maxHeight` empêche l'image de manger la carte.
                    return (
                        <div
                            data-module="mainImage"
                            className="w-full overflow-hidden"
                            style={{
                                // `minHeight: 0` — un plancher à 60 % de la hauteur d'image a été
                                // essayé et mesuré : il empêchait l'image de céder sur une review
                                // dense et ramenait Fleur 1:1 à 105,7 % de débordement. L'image
                                // doit pouvoir grandir ET rétrécir ; `flex-basis: auto` lui garde
                                // sa taille naturelle tant que la place existe.
                                flex: '1 1 auto', minHeight: 0,
                                maxHeight: responsive.image.maxHeight,
                                borderRadius: `${image.borderRadius}px`,
                                ...imageFrameStyle,
                            }}
                        >
                            <img src={mainImage} alt="" className="w-full h-full object-cover" style={getImageRenderStyle(image)} />
                        </div>
                    );
                })()}

                {/* Contenu — pas de justify-center pour éviter l'espace vide en bas */}
                <div className="flex flex-col overflow-hidden" style={{ gap: `${spacing.element}px` }}>
                    {renderContent()}
                </div>
            </div>
            </FitToFill>
        );
    };

    const renderContent = () => (
        <>
            {/* Masthead : titre/type/note/profil cannabinoïde/catégorie/provenance/parentage — un
                seul bloc `data-module="masthead"` (pagination adaptative, Phase C) pour rester
                groupé sur la première page, comme la couverture de `DetailedCardTemplate.jsx`. */}
            {isPageOn('masthead') && (
            <div data-module="masthead" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.element}px`, flexShrink: 0 }}>
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
                <div className="flex justify-center">
                    {reviewData.rating != null && !isNaN(parseFloat(reviewData.rating))
                        ? renderStars()
                        : renderEmptyHint('⭐', 'Note globale')
                    }
                </div>
            )}

            {/* Profil cannabinoïde complet (THC/CBD + THCA/CBDA/CBG/CBC/CBN/THCV si renseignés) —
                remplace les 2 cartes THC/CBD isolées par la grille déjà partagée avec Fiche Détaillée
                (`CannabinoidGrid`, RegistrySections.jsx) plutôt que de ne montrer que 2 valeurs sur 8. */}
            <CannabinoidGrid reviewData={reviewData} contentModules={contentModules} colors={colors} fontSize={fontSize} spacing={spacing} align="center" />
            {contentModules.category && reviewData.category && (
                <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    {renderInfoCard('Catégorie', reviewData.category, '📂')}
                </div>
            )}

            {/* Provenance */}
            {(contentModules.cultivar || contentModules.breeder || contentModules.farm || contentModules.hashmaker || contentModules.phenotypeCode || contentModules.cultivarsList) && (
                <div className="flex flex-wrap justify-center" style={{ gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    {contentModules.cultivar && reviewData.cultivar && renderInfoCard('Cultivar', reviewData.cultivar, '🌱')}
                    {contentModules.breeder && reviewData.breeder && renderInfoCard('Breeder', reviewData.breeder, '🧬')}
                    {contentModules.farm && reviewData.farm && renderInfoCard('Farm', reviewData.farm, '🏡')}
                    {contentModules.hashmaker && reviewData.hashmaker && renderInfoCard('Hash Maker', reviewData.hashmaker, '👨‍🔬')}
                    {contentModules.phenotypeCode && reviewData.phenotypeCode && renderInfoCard('Phénotype', reviewData.phenotypeCode, '🔬')}
                    {contentModules.cultivarsList && cultivars.length > 0 && renderInfoCard('Cultivars', cultivars.map((c) => extractLabel(c)).join(', '), '🧬')}
                </div>
            )}

            {/* Parentage / Lignée */}
            {contentModules.parentage && reviewData.parentage && (() => {
                const p = reviewData.parentage;
                const parentageText = typeof p === 'object'
                    ? [p.female, p.male].filter(Boolean).join(' ♀ × ♂ ')
                    : String(p);
                return parentageText ? (
                    <div style={{ textAlign: 'center', fontSize: `${fontSize.small}px`, color: colors.textSecondary, fontStyle: 'italic', flexShrink: 0 }}>
                        🌿 {parentageText}
                    </div>
                ) : null;
            })()}
            </div>
            )}

            {/* Évaluation sensorielle détaillée — soumise au contrat PAR FORMAT : absente du
                carré, qui n'a pas la hauteur (cf. TEMPLATE_SECTIONS.modernCompact.byFormat). */}
            {templateSection('modernCompact', 'sensory', config.ratio) && isPageOn('sensoryEvaluation') && contentModules.categoryRatings && (
                <div data-module="sensoryEvaluation">
                {/* Synthèse en tête : point fort / point faible. Sans jauge — la note globale est
                    déjà affichée en grand plus haut, et la redire coûte de la hauteur sans rien
                    apprendre (mesuré sur la Fiche Technique : une page entière en A4). */}
                <ScoreBoard
                    categories={categoryRatings}
                    colors={colors}
                    fontSize={fontSize.small}
                    spacing={spacing}
                    compact={isSquare}
                    showDial={false}
                />
                {categoryRatings.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isSquare ? '1fr' : 'repeat(2, 1fr)', gap: `${spacing.element}px`, flexShrink: 0 }}>
                        {categoryRatings.map((r, i) => (
                            <ScoreMetric key={i} label={r.label} value={r.value} icon={r.icon} fontSize={fontSize.small} colors={colors} compact={isSquare} />
                        ))}
                    </div>
                ) : renderEmptyHint('📊', 'Notes par catégorie')}
                </div>
            )}

            {/* Profil aromatique : effets/arômes/goûts/terpènes regroupés sous un seul `data-module`
                (pagination adaptative, Phase C) — même id que `DetailedCardTemplate.jsx`. */}
            {isPageOn('aromaticProfile') && (
            <div data-module="aromaticProfile" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.element}px`, flexShrink: 0 }}>
            {/* Effects */}
            {contentModules.effects && (
                effects.length > 0 ? (
                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>⚡ Effets</div>
                        {renderTags(effects)}
                    </div>
                ) : renderEmptyHint('⚡', 'Effets ressentis')
            )}

            {/* Aromas */}
            {contentModules.aromas && (
                aromas.length > 0 ? (
                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                        <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>🌸 Arômes</div>
                        {renderTags(aromas)}
                    </div>
                ) : renderEmptyHint('🌸', 'Arômes')
            )}

            {/* Secondary Aromas */}
            {contentModules.aromas && secondaryAromas.length > 0 && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>🎶 Arômes secondaires</div>
                    {renderTags(secondaryAromas)}
                </div>
            )}

            {/* Tastes — show dry puff / inhalation if available, else generic */}
            {contentModules.tastes !== false && (dryPuffNotes.length > 0 || inhalationNotes.length > 0 || tastes.length > 0) && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>👅 Goûts</div>
                    {dryPuffNotes.length > 0
                        ? renderTags(dryPuffNotes)
                        : inhalationNotes.length > 0
                            ? renderTags(inhalationNotes)
                            : renderTags(tastes)}
                </div>
            )}

            {/* Terpenes */}
            {contentModules.terpenes && terpenes.length > 0 && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>🧪 Terpènes</div>
                    {renderTags(terpenes)}
                </div>
            )}
            </div>
            )}

            {/* Gisement complémentaire — HORS CONTRAT pour ce template (matrice C4) : Moderne
                Compact est une carte glanceable, pas un dossier technique. Il l'affichait, et
                comme la carte ne se pagine pas, le contenu débordait à 313 % en 1:1. */}
            {templateSection('modernCompact', 'gisement') && <GisementSections
                reviewData={reviewData}
                contentModules={contentModules}
                groups={GISEMENT_GROUPS}
                Section={Section}
                colors={{ accent: colors.accent, textPrimary: colors.textPrimary, textSecondary: colors.textSecondary, title: colors.title }}
                fontSize={fontSize}
                spacing={spacing}
                groupIcons={GROUP_ICONS}
            />}

            {/* Pipelines — riche avec métriques. `pipelines` (déjà filtré par
                `filterVisiblePipelines(extractPipelines(reviewData), contentModules)` ci-dessus,
                clé par clé réelle : fertilizationPipeline/pipelineCuring/pipelineExtraction/...) est
                la seule porte de visibilité pertinente ici — `contentModules.pipelines` n'existe nulle
                part dans `DEFAULT_CONFIG.contentModules` (vérifié 2026-08-02), donc `!== false` était
                toujours vrai : condition redondante/trompeuse, retirée (BlogArticleTemplate.jsx n'a
                d'ailleurs jamais eu cette 2e moitié de condition). */}
            {(() => {
                // Chaque pipeline porte son propre `data-module` (`pipeline:<key>`, même vocabulaire
                // que DetailedCardTemplate.jsx) — la pagination adaptative peut ainsi répartir
                // Culture/Curing/Extraction/Séparation sur des pages différentes selon leur volume
                // réel, au lieu du bloc "Pipelines" monolithique d'avant ce chantier (Phase C).
                if (!templateSection('modernCompact', 'pipelines')) return null;
                // LA grille des formulaires, comme partout ailleurs. On repart de
                // `TIMELINE_PIPELINES` (source unique) et non de `extractPipelines` : la grille a
                // besoin des clés de DONNÉES et de CONFIG brutes, que l'extraction ne conserve pas.
                const actifs = TIMELINE_PIPELINES.filter((t) => reviewData[t.dataKey] && reviewData[t.configKey]);
                const surCettePage = actifs.filter((t) => !pageModuleIds
                    || [...pageModuleIds].some((id) => id === `pipeline:${t.type}` || id.startsWith(`pipeline:${t.type}#`)));
                if (surCettePage.length === 0) return null;
                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.gap}px`, flexShrink: 0 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, textAlign: 'center' }}>⚙️ Pipelines</div>
                    {surCettePage.map((t) => (
                        <PipelineMiniGrid
                            key={t.type}
                            type={t.type}
                            name={t.name}
                            icon={t.icon}
                            timelineData={reviewData[t.dataKey]}
                            timelineConfig={reviewData[t.configKey]}
                            accentColor={colors.accent}
                            moduleId={`pipeline:${t.type}`}
                            isPageOn={isPageOn}
                        />
                    ))}
                </div>
                );
            })()}

            {/* Vue interactive PhenoHunt (généalogie) — se masque elle-même si aucun arbre lié */}
            {templateSection('modernCompact', 'canvases') && contentModules.phenoHuntView !== false && isPageOn('genealogyCanvas') && (
                <div data-module="genealogyCanvas">
                    <ReadOnlyGenealogyCanvas reviewData={reviewData} height={isSquare ? 220 : 260} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />
                </div>
            )}

            {/* Vue interactive Chaîne de production — même logique de masquage async */}
            {templateSection('modernCompact', 'canvases') && contentModules.productionChainView !== false && isPageOn('productionChainCanvas') && (
                <div data-module="productionChainCanvas">
                    <ReadOnlyProductionChainCanvas reviewData={reviewData} height={isSquare ? 220 : 260} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />
                </div>
            )}

            {/* Description */}
            {/* Commentaire — même règle : réservé aux formats qui ont la place. */}
            {templateSection('modernCompact', 'description', config.ratio) && contentModules.description && reviewData.description && isPageOn('description') && (
                <p
                    data-module="description"
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
            {/* `overflow-hidden` inconditionnel, jamais `overflow-y-auto` (corrigé 2026-08-03, retour
                utilisateur sur un export réel en prod, ratio 1:1) : ce fallback datait d'avant la
                pagination adaptative (Phase C) — désormais câblée sur ce template, elle est censée
                éliminer tout débordement en amont. Un scroll interne masquait silencieusement du
                contenu (dont l'image principale, dont la hauteur n'était alors même pas comptée
                dans le budget de pagination — cf. `data-module="mainImage"` ci-dessus) au lieu de le
                répartir sur une page supplémentaire, contraire au principe "aucun rendu ne doit être
                scrollable". */}
            <div className="w-full h-full overflow-hidden">
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




