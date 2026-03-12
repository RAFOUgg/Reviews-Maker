import PropTypes from 'prop-types';
import {
    asArray,
    extractLabel,
    formatRating,
    extractCategoryRatings,
    colorWithOpacity,
} from '../../utils/orchardHelpers';

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

    // Données
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, 4);
    const effects = asArray(reviewData.effects).slice(0, 4);
    const tastes = asArray(reviewData.tastes).slice(0, 3);
    const { filled, value: ratingValue } = formatRating(reviewData.rating || 0, 5);

    const mainImage = reviewData.mainImageUrl || reviewData.imageUrl ||
        (Array.isArray(reviewData.images) && reviewData.images[0]);

    const title = reviewData.title || reviewData.holderName || reviewData.productName || reviewData.name || '';
    const cultivar = Array.isArray(reviewData.cultivarsList) && reviewData.cultivarsList.length > 0
        ? reviewData.cultivarsList.map(c => extractLabel(c)).join(' × ')
        : reviewData.cultivar || reviewData.strain || '';
    const farm = reviewData.farm || reviewData.hashmaker || reviewData.producer || '';
    const productType = reviewData.type || reviewData.typeName || '';

    // Couleurs
    const white = '#ffffff';
    const whiteMuted = 'rgba(255,255,255,0.65)';
    const whiteDim = 'rgba(255,255,255,0.2)';
    const cardBg = 'rgba(255,255,255,0.08)';
    const cardBorder = 'rgba(255,255,255,0.15)';

    // Catégorie → couleur accent distinct
    const catColors = ['#a78bfa', '#34d399', '#fb923c', '#60a5fa', '#f472b6'];

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

    const renderCategoryBar = (cat, idx) => {
        const pct = Math.min(100, (cat.value / 10) * 100);
        const color = catColors[idx % catColors.length];
        return (
            <div key={cat.key} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: whiteMuted, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>{cat.icon}</span>
                        <span style={{ fontWeight: 500 }}>{cat.label}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: color }}>
                        {cat.value.toFixed(1)}
                    </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: whiteDim, overflow: 'hidden' }}>
                    <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${colorWithOpacity(color, 80)}, ${color})`,
                        borderRadius: 3,
                        transition: 'width 0.6s ease'
                    }} />
                </div>
            </div>
        );
    };

    const renderTag = (item, i, tagAccent) => (
        <span key={i} style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            color: white,
            background: colorWithOpacity(tagAccent, 25),
            border: `1px solid ${colorWithOpacity(tagAccent, 40)}`,
            whiteSpace: 'nowrap',
        }}>
            {extractLabel(item)}
        </span>
    );

    return (
        <div style={{
            width: '100%', height: '100%',
            background: bg,
            fontFamily: typography?.fontFamily || 'Inter, sans-serif',
            color: white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* ── HERO IMAGE ── */}
            {contentModules.image && mainImage ? (
                <div style={{ position: 'relative', width: '100%', flex: '0 0 38%', overflow: 'hidden' }}>
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
                            background: colorWithOpacity(accent, 85),
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: white,
                        }}>
                            {productType}
                        </div>
                    )}
                    {/* Logo top-right */}
                    {branding?.enabled && branding?.logoUrl && (
                        <img src={branding.logoUrl} alt="Logo"
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
                <div style={{
                    flex: '0 0 38%',
                    background: colorWithOpacity(accent, 15),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 48, opacity: 0.4 }}>🌿</span>
                </div>
            )}

            {/* ── CONTENT AREA ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                padding: '16px 20px 14px', overflow: 'hidden', gap: 12,
            }}>
                {/* Title & meta */}
                <div>
                    {contentModules.title && title && (
                        <h1 style={{
                            fontSize: Math.min(typography?.titleSize || 28, 28),
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
                            <span style={{ fontSize: 13, color: accent, fontWeight: 600 }}>{cultivar}</span>
                        )}
                        {farm && cultivar && (
                            <span style={{ fontSize: 13, color: whiteDim }}>·</span>
                        )}
                        {farm && (
                            <span style={{ fontSize: 13, color: whiteMuted }}>{farm}</span>
                        )}
                    </div>
                </div>

                {/* Rating */}
                {contentModules.rating && reviewData.rating !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {renderStars()}
                        <span style={{
                            fontSize: 22, fontWeight: 800, color: accent,
                            textShadow: `0 0 20px ${colorWithOpacity(accent, 50)}`,
                        }}>
                            {ratingValue.toFixed(1)}<span style={{ fontSize: 13, fontWeight: 400, color: whiteMuted }}>/10</span>
                        </span>
                    </div>
                )}

                {/* THC / CBD */}
                {(contentModules.thcLevel || contentModules.cbdLevel) &&
                    (reviewData.thcLevel || reviewData.cbdLevel || reviewData.thc || reviewData.cbd) && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            {(reviewData.thcLevel || reviewData.thc) && (
                                <div style={{
                                    flex: 1, padding: '8px 12px', borderRadius: 10,
                                    background: cardBg, border: `1px solid ${cardBorder}`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 10, color: whiteMuted, marginBottom: 2 }}>THC</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}>
                                        {reviewData.thcLevel || reviewData.thc}%
                                    </div>
                                </div>
                            )}
                            {(reviewData.cbdLevel || reviewData.cbd) && (
                                <div style={{
                                    flex: 1, padding: '8px 12px', borderRadius: 10,
                                    background: cardBg, border: `1px solid ${cardBorder}`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 10, color: whiteMuted, marginBottom: 2 }}>CBD</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>
                                        {reviewData.cbdLevel || reviewData.cbd}%
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {/* Category Rating Bars */}
                {contentModules.categoryRatings && categoryRatings.length > 0 && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 12,
                        background: cardBg, border: `1px solid ${cardBorder}`,
                    }}>
                        {categoryRatings.slice(0, 4).map((cat, i) => renderCategoryBar(cat, i))}
                    </div>
                )}

                {/* Effects */}
                {contentModules.effects && effects.length > 0 && (
                    <div>
                        <div style={{ fontSize: 11, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ⚡ Effets
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {effects.map((e, i) => renderTag(e, i, '#a78bfa'))}
                        </div>
                    </div>
                )}

                {/* Aromas */}
                {contentModules.aromas && aromas.length > 0 && (
                    <div>
                        <div style={{ fontSize: 11, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            🌸 Arômes
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {aromas.map((a, i) => renderTag(a, i, '#34d399'))}
                        </div>
                    </div>
                )}

                {/* Tastes */}
                {contentModules.tastes && tastes.length > 0 && !aromas.length && (
                    <div>
                        <div style={{ fontSize: 11, color: whiteMuted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            👅 Goûts
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {tastes.map((t, i) => renderTag(t, i, '#fb923c'))}
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Footer */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 10,
                    borderTop: `1px solid ${whiteDim}`,
                }}>
                    {contentModules.author && (
                        <span style={{ fontSize: 12, color: whiteMuted }}>
                            par <strong style={{ color: accent }}>
                                {reviewData.ownerName ||
                                    (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) ||
                                    'Terpologie'}
                            </strong>
                        </span>
                    )}
                    <span style={{ fontSize: 10, color: whiteDim, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        terpologie.eu
                    </span>
                </div>
            </div>
        </div>
    );
}

SocialStoryTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object,
};