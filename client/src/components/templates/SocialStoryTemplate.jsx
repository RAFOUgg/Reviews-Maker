import PropTypes from 'prop-types';
import {
    asArray,
    extractLabel,
    formatRating,
    extractCategoryRatings,
    colorWithOpacity,
    getResponsiveAdjustments,
    resolveFontStack,
    ensureReadable,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
import { templateSection } from '../../store/exportMakerConstants';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';
import ScoreMetric from './sections/ScoreMetric';
import { GisementSections } from './sections/RegistrySections';
import FitToFill from './frame/FitToFill';

// Phase B du plan de finition Export Maker (2026-08-02) : contrairement aux 3 autres templates
// (rollout complet des 8 groupes gisement), Story reste un format 9:16 très contraint verticalement,
// pensé pour être glanceable — décision actée avec l'utilisateur : UN SEUL groupe pertinent selon le
// type de produit (pas les 8), pour ne pas transformer une story en document dense.
const RELEVANT_GROUP_BY_TYPE = {
    flower: { group: 'harvest', label: 'Récolte', icon: '🌾' },
    hash: { group: 'separation', label: 'Séparation', icon: '🧊' },
    concentrate: { group: 'extraction', label: 'Extraction', icon: '⚗️' },
    edible: { group: 'recipe', label: 'Recette', icon: '🍯' },
};
function normalizeReviewType(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

/**
 * SocialStoryTemplate - Template optimisé pour les stories Instagram/TikTok
 * Format vertical 9:16, design impactant et moderne
 */
export default function SocialStoryTemplate({ config, reviewData }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#111' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>📱 Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;
    const accent = colors.accent || '#a78bfa';
    const bg = colors.background || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';

    // Échelle responsive partagée avec les 4 autres templates — ce template supporte plusieurs
    // ratios (1:1/16:9/9:16, cf. TemplateSelector) mais ignorait jusqu'ici entièrement le ratio
    // choisi (tailles de police et limites de densité en dur, pensées pour 9:16 uniquement).
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { fontSize, limits } = responsive;

    // Pagination adaptative (Phase C du plan de finition Export Maker, 2026-08-03) — même contrat
    // que `DetailedCardTemplate.jsx` (le template pilote).
    const pageModuleIds = config.pageModuleIds
        ? (config.pageModuleIds instanceof Set ? config.pageModuleIds : new Set(config.pageModuleIds))
        : null;
    const isPageOn = (moduleId) => !pageModuleIds || pageModuleIds.has(moduleId);

    // Données
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData).slice(0, limits.maxCategoryRatings);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags);
    const effects = asArray(reviewData.effects).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const { filled, value: ratingValue } = formatRating(reviewData.rating || 0, 5);

    const mainImage = resolveImageUrl(
        reviewData.mainImageUrl || reviewData.imageUrl ||
        (Array.isArray(reviewData.images) && reviewData.images[0])
    );

    const title = reviewData.title || reviewData.holderName || reviewData.productName || reviewData.name || '';
    const cultivar = Array.isArray(reviewData.cultivarsList) && reviewData.cultivarsList.length > 0
        ? reviewData.cultivarsList.map(c => extractLabel(c)).join(' × ')
        : reviewData.cultivar || reviewData.strain || '';
    const farm = reviewData.farm || reviewData.hashmaker || reviewData.producer || '';
    const productType = reviewData.type || reviewData.typeName || '';

    // Couleurs — dérivées de la palette active (`colors.textPrimary`/`textSecondary`) plutôt que du
    // blanc en dur : ce template assumait jusqu'ici toujours un fond sombre, cassant illisible sur
    // la palette claire "minimal" (texte blanc sur fond clair).
    const white = colors.textPrimary || '#ffffff';
    // Surface opaque de référence pour les pastilles posées SUR la photo. `colors.background` peut
    // être un dégradé (valeur par défaut de ce template) : `ensureReadable` attend une couleur
    // solide, on retombe donc sur la teinte sombre du dégradé plutôt que de lui passer une chaîne
    // qu'il ne sait pas interpréter.
    const badgeSurface = /^#|^rgb/.test(String(colors.background || '')) ? colors.background : '#1a1a2e';
    const whiteMuted = colorWithOpacity(colors.textSecondary || white, 70);
    const whiteDim = colorWithOpacity(colors.textSecondary || white, 22);
    const cardBg = colorWithOpacity(colors.textPrimary || white, 8);
    const cardBorder = colorWithOpacity(colors.textPrimary || white, 15);
    // Carte de verre (mêmes calques que `TemplateSection.jsx`/pilote 2026-07-29), appliquée aux
    // deux seuls blocs "panneau" de ce template (THC/CBD, barres de notation) — le hero plein cadre
    // et les tags restent volontairement plats, cohérent avec le pilote (blur réservé aux grandes
    // surfaces, jamais aux petits chips).
    const cardGlassStyle = {
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        boxShadow: `inset 0 1px 1px ${colorWithOpacity(white, 12)}`,
    };

    const renderStars = () => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {[...Array(5)].map((_, i) => (
                <svg key={i} width="22" height="22" viewBox="0 0 24 24"
                    fill={i < filled ? accent : whiteDim}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );

    const renderCategoryBar = (cat) => (
        <ScoreMetric key={cat.key} label={cat.label} value={cat.value} icon={cat.icon} fontSize={fontSize.text} colors={{ textSecondary: colors.textSecondary || white }} compact />
    );

    // Une seule couleur accent pour tous les tags (comme les autres templates), plutôt qu'une
    // teinte en dur différente par catégorie (effets/arômes/goûts) déconnectée de la palette.
    const renderTag = (item, i) => (
        <span key={i} style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: fontSize.small,
            fontWeight: 500,
            color: white,
            background: colorWithOpacity(accent, 25),
            border: `1px solid ${colorWithOpacity(accent, 40)}`,
            whiteSpace: 'nowrap',
        }}>
            {extractLabel(item)}
        </span>
    );

    // Story ne se pagine pas (matrice C4) : `FitToFill` ajuste l'échelle pour occuper la hauteur
    // réelle, comme sur Moderne Compact. Bornes légèrement plus larges — une story est un format
    // d'affiche, la variation de taille y est attendue.
    return (
        <FitToFill min={0.9} max={1.45}>
        <div style={{
            width: '100%', height: '100%',
            background: bg,
            // Repli aligné sur la pile de polices du site (tailwind.config.js > fontFamily.sans).
            fontFamily: resolveFontStack(typography?.fontFamily),
            color: white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* ── HERO IMAGE ── */}
            {/* Bug trouvé 2026-08-03 (Phase B) : le placeholder emoji (branche `else` ci-dessous)
                était rendu inconditionnellement dès que `mainImage` était falsy — y compris quand
                `contentModules.mainImage === false` (page paginée qui exclut délibérément le hero,
                cf. PAGE_TEMPLATES). Résultat observé en vérification : un gros 🌿 esseulé occupant
                38% d'une page par ailleurs quasi vide. Le hero (image OU placeholder) ne se rend
                plus du tout si la page a explicitement désactivé `mainImage`. */}
            {/* id `heroImage` DÉLIBÉRÉMENT distinct de `masthead` (utilisé par DetailedCard/
                ModernCompact pour un bloc COMBINÉ photo+titre+note) : ici le hero n'est QUE la
                photo, sans texte — le forcer dans `ALWAYS_ISOLATE` produisait une page 1 quasi
                vide (photo seule, grand espace en dessous) puisque le titre/note vivent dans le
                module `identity` juste après, qui ne pouvait jamais la rejoindre (bug trouvé en
                vérification Phase C, 2026-08-03). Pas d'isolement forcé ici : `heroImage` peut se
                combiner avec `identity` si le budget de page le permet, recréant une vraie page de
                couverture photo+titre+note. */}
            {!isPageOn('heroImage') ? null : contentModules.mainImage === false ? null : mainImage ? (
                <div data-module="heroImage" style={{
                    position: 'relative', width: '100%', overflow: 'hidden',
                    // Hero ÉLASTIQUE : l'échelle de `FitToFill` est bornée pour préserver la
                    // lisibilité ; quand elle sature (contenu très pauvre — photo + nom seuls),
                    // c'est la photo qui absorbe le reste. `object-fit: cover` la fait grandir
                    // sans déformation, et un hero plus haut sert le format story.
                    // Ni `minHeight` ni `flex-basis` figé : le hero grandit quand le contenu est
                    // pauvre ET cède quand il est dense. Avec un plancher à 38 %, une review dense
                    // débordait à 114 % — sur une carte, ce qui déborde est perdu.
                    flex: '1 1 38%', minHeight: 0,
                }}>
                    <img
                        src={mainImage}
                        alt=""
                        style={{
                            width: '100%', height: '100%',
                            objectFit: image?.objectFit || 'cover',
                            objectPosition: 'center',
                            filter: 'brightness(0.85)',
                        }}
                    />
                    {/* Gradient overlay bottom */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
                    }} />
                    {/* Type badge top-left */}
                    {contentModules.type && productType && (
                        <div style={{
                            position: 'absolute', top: 16, left: 16,
                            padding: '4px 12px', borderRadius: 20,
                            // Pastille SOMBRE + texte accentué, pas l'inverse : du blanc sur
                            // l'accent violet clair à 85 % mesurait 3,04:1 (audit 2026-08-05),
                            // sous le seuil de 4,5:1. Le fond étant une PHOTO, aucune couleur
                            // translucide ne donne de contraste déterministe — d'où une surface
                            // quasi opaque dérivée du fond du canevas, contre laquelle
                            // `ensureReadable` peut garantir le rapport. C'est aussi l'idiome
                            // réel de `LiquidChip` (fond sombre translucide, texte accentué).
                            background: colorWithOpacity(badgeSurface, 88),
                            fontSize: fontSize.small, fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: ensureReadable(accent, badgeSurface),
                        }}>
                            {productType}
                        </div>
                    )}
                    {/* Logo top-right */}
                    {branding?.enabled && branding?.logoUrl && (
                        <img src={branding.logoUrl} alt="Logo" className="export-maker-branding"
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                width: 44, height: 44, objectFit: 'contain',
                                opacity: branding.opacity ? branding.opacity / 100 : 0.9,
                                borderRadius: 8,
                            }} />
                    )}
                </div>
            ) : (
                /* Placeholder si pas d'image */
                <div data-module="heroImage" style={{
                    flex: '0 0 38%',
                    background: colorWithOpacity(accent, 15),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 48, opacity: 0.4 }}>🌿</span>
                </div>
            )}

            {/* ── CONTENT AREA ── */}
            <div style={{
                // `0 0 auto` et NON `flex: 1` : le hero au-dessus est élastique (`1 1 38%`). Tant
                // que les deux grandissaient, ils se partageaient le mou proportionnellement et le
                // vide se logeait SOUS le pied de page — mesuré à 72-78 % de remplissage en 9:16,
                // l'échelle butant déjà sur sa borne haute. En figeant le contenu à sa hauteur
                // naturelle, tout le mou revient au hero : c'est l'image qui absorbe, pas le texte
                // qui grossit. Sur une review dense, le rapport s'inverse — le hero cède
                // (`flex-shrink: 1`, sans plancher) et `FitToFill` réduit l'échelle.
                flex: '0 0 auto', display: 'flex', flexDirection: 'column',
                padding: `${responsive.padding.container}px`, overflow: 'hidden', gap: responsive.spacing.section,
            }}>
                {/* Identité : titre/cultivar/farm + note — un seul `data-module` (pagination
                    adaptative, Phase C). */}
                {isPageOn('identity') && (
                <div data-module="identity" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Title & meta */}
                <div>
                    {contentModules.title && title && (
                        <h1 style={{
                            fontSize: fontSize.title,
                            fontWeight: 800,
                            lineHeight: 1.15,
                            margin: 0,
                            color: colors.title || white,
                        }}>
                            {title}
                        </h1>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                        {cultivar && (
                            <span style={{ fontSize: fontSize.text, color: accent, fontWeight: 600 }}>{cultivar}</span>
                        )}
                        {farm && cultivar && (
                            <span style={{ fontSize: fontSize.text, color: whiteDim }}>·</span>
                        )}
                        {farm && (
                            <span style={{ fontSize: fontSize.text, color: whiteMuted }}>{farm}</span>
                        )}
                    </div>
                </div>

                {/* Rating */}
                {contentModules.rating && reviewData.rating !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {renderStars()}
                        <span style={{
                            fontSize: fontSize.subtitle, fontWeight: 800, color: accent,
                            textShadow: `0 0 20px ${colorWithOpacity(accent, 50)}`,
                        }}>
                            {ratingValue.toFixed(1)}<span style={{ fontSize: fontSize.small, fontWeight: 400, color: whiteMuted }}>/10</span>
                        </span>
                    </div>
                )}
                </div>
                )}

                {/* THC / CBD — id DÉLIBÉRÉMENT distinct de `cannabinoidProfile` (utilisé par
                    DetailedCard/BlogArticle pour la grille complète 8 cannabinoïdes) : ce bloc n'est
                    qu'une paire de mini-cartes, pas la grille dense qui justifie l'isolement forcé
                    de `ALWAYS_ISOLATE` (`adaptivePagination.js`) — réutiliser le même id forçait ce
                    petit bloc seul sur sa propre page, coincé entre `masthead` et le reste, produisant
                    des pages quasi vides (bug trouvé en vérification Phase C, 2026-08-03). */}
                {isPageOn('thcCbdMini') && (contentModules.thcLevel || contentModules.cbdLevel) &&
                    (reviewData.thcLevel || reviewData.cbdLevel || reviewData.thc || reviewData.cbd) && (
                        <div data-module="thcCbdMini" style={{ display: 'flex', gap: 10 }}>
                            {(reviewData.thcLevel || reviewData.thc) && (
                                <div style={{
                                    flex: 1, padding: '8px 12px', borderRadius: 14,
                                    background: cardBg, border: `1px solid ${cardBorder}`,
                                    textAlign: 'center', ...cardGlassStyle,
                                }}>
                                    <div style={{ fontSize: fontSize.small, color: whiteMuted, marginBottom: 2 }}>THC</div>
                                    <div style={{ fontSize: fontSize.text + 4, fontWeight: 800, color: accent }}>
                                        {reviewData.thcLevel || reviewData.thc}%
                                    </div>
                                </div>
                            )}
                            {(reviewData.cbdLevel || reviewData.cbd) && (
                                <div style={{
                                    flex: 1, padding: '8px 12px', borderRadius: 14,
                                    background: cardBg, border: `1px solid ${cardBorder}`,
                                    textAlign: 'center', ...cardGlassStyle,
                                }}>
                                    <div style={{ fontSize: fontSize.small, color: whiteMuted, marginBottom: 2 }}>CBD</div>
                                    <div style={{ fontSize: fontSize.text + 4, fontWeight: 800, color: accent }}>
                                        {reviewData.cbdLevel || reviewData.cbd}%
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {/* Category Rating Bars */}
                {templateSection('socialStory', 'sensory', config.ratio) !== false
                    && isPageOn('sensoryEvaluation') && contentModules.categoryRatings && categoryRatings.length > 0 && (
                    <div data-module="sensoryEvaluation" style={{
                        padding: '10px 14px', borderRadius: 16,
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        ...cardGlassStyle,
                    }}>
                        {categoryRatings.map((cat) => renderCategoryBar(cat))}
                    </div>
                )}

                {/* Labo — résumé compact (texte, pas de grille), gap trouvé en audit 2026-08-02 :
                    aucune donnée labo n'apparaissait sur Story alors qu'un rapport de traçabilité en
                    a besoin même en format court. */}
                {templateSection('socialStory', 'labData', config.ratio) !== false
                    && isPageOn('labData') && (reviewData.labName || reviewData.labMethod || reviewData.labAccredited !== undefined) && (
                    <div data-module="labData" style={{ fontSize: fontSize.small, color: whiteMuted }}>
                        🔬 {[reviewData.labName, reviewData.labAccredited ? 'accrédité' : null].filter(Boolean).join(' · ')}
                    </div>
                )}

                {/* Un seul groupe gisement pertinent selon le type de produit (voir
                    RELEVANT_GROUP_BY_TYPE) — sous-ensemble volontairement réduit, pas le rollout
                    complet des 3 autres templates (format trop contraint pour les 8 groupes). Le
                    groupe varie par type de review, donc son `data-module` (`gisement:<groupe>`)
                    aussi — même vocabulaire que les autres templates. */}
                {(() => {
                    if (templateSection('socialStory', 'gisement', config.ratio) === false) return null;
                    const rel = RELEVANT_GROUP_BY_TYPE[normalizeReviewType(reviewData.type)];
                    if (!rel || !isPageOn(`gisement:${rel.group}`)) return null;
                    const Section = ({ children }) => (
                        <div data-module={`gisement:${rel.group}`}>
                            <div style={{ fontSize: fontSize.small, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {rel.icon} {rel.label}
                            </div>
                            {children}
                        </div>
                    );
                    return (
                        <GisementSections
                            reviewData={reviewData}
                            contentModules={contentModules}
                            groups={[rel.group]}
                            Section={Section}
                            colors={{ accent, textPrimary: white, textSecondary: whiteMuted, title: colors.title || white }}
                            fontSize={fontSize}
                            spacing={responsive.spacing}
                        />
                    );
                })()}

                {/* Effets/arômes/goûts regroupés sous un seul `data-module` (pagination adaptative,
                    Phase C) — même id que les 2 autres templates. */}
                {isPageOn('aromaticProfile') && <div data-module="aromaticProfile" style={{ display: 'flex', flexDirection: 'column', gap: responsive.spacing.element }}>
                {/* Effects */}
                {contentModules.effects && effects.length > 0 && (
                    <div>
                        <div style={{ fontSize: fontSize.small, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ⚡ Effets
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {effects.map((e, i) => renderTag(e, i))}
                        </div>
                    </div>
                )}

                {/* Aromas */}
                {contentModules.aromas && aromas.length > 0 && (
                    <div>
                        <div style={{ fontSize: fontSize.small, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            🌸 Arômes
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {aromas.map((a, i) => renderTag(a, i))}
                        </div>
                    </div>
                )}

                {/* Tastes */}
                {contentModules.tastes !== false && tastes.length > 0 && !aromas.length && (
                    <div>
                        <div style={{ fontSize: fontSize.small, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            👅 Goûts
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {tastes.map((t, i) => renderTag(t, i))}
                        </div>
                    </div>
                )}
                </div>}

                {/* Vue interactive PhenoHunt (généalogie) — se masque elle-même si aucun arbre lié.
                    Format story très contraint verticalement : mode compact, pas de section dédiée. */}
                {contentModules.phenoHuntView !== false && isPageOn('genealogyCanvas') && (
                    <div data-module="genealogyCanvas">
                        <ReadOnlyGenealogyCanvas reviewData={reviewData} height={200} accentColor={accent} titleColor={colors.title || white} textColor={colors.textSecondary || white} />
                    </div>
                )}

                {/* Vue interactive Chaîne de production — même logique de masquage async */}
                {contentModules.productionChainView !== false && isPageOn('productionChainCanvas') && (
                    <div data-module="productionChainCanvas">
                        <ReadOnlyProductionChainCanvas reviewData={reviewData} height={200} accentColor={accent} titleColor={colors.title || white} textColor={colors.textSecondary || white} />
                    </div>
                )}

                {/* Spacer */}
                {/* PAS d'espaceur `flex: 1` ici. Il poussait le pied de page tout en bas, si bien
                    que la mesure de `FitToFill` valait TOUJOURS la hauteur disponible — le
                    composant ne pouvait donc que rétrécir (quand un bloc dépasse), jamais
                    agrandir. Mesuré le 2026-08-05 : `scale=1.000` avec `contenu = avail` sur les
                    4 combinaisons, dont deux à 77-80 % de remplissage. Sans espaceur, le contenu
                    s'empile depuis le haut, la mesure reflète sa hauteur réelle, et l'échelle
                    monte pour occuper la place. */}

                {/* Footer — `data-fit-tail` : il vit hors des `[data-module]`, il doit pourtant
                    entrer dans la mesure de `FitToFill`, sans quoi la hauteur naturelle est
                    sous-estimée et l'échelle surestimée. */}
                <div data-fit-tail style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 10,
                    borderTop: `1px solid ${whiteDim}`,
                }}>
                    {contentModules.author && (
                        <span style={{ fontSize: fontSize.small, color: whiteMuted }}>
                            par <strong style={{ color: accent }}>
                                {reviewData.ownerName ||
                                    (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) ||
                                    'Terpologie'}
                            </strong>
                        </span>
                    )}
                    {/* `whiteDim` est une opacité de 22%, pensée pour des filets décoratifs :
                        appliquée à du texte elle donne 1.71:1, très en dessous du seuil AA. */}
                    <span style={{ fontSize: fontSize.small, color: whiteMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        terpologie.eu
                    </span>
                </div>
            </div>
        </div>
        </FitToFill>
    );
}

SocialStoryTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object,
};
