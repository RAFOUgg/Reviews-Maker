import PropTypes from 'prop-types';
import FieldRenderer from '../../forms/FieldRendererClean';
import { DRAGGABLE_FIELDS } from './ContentPanel';
import {
    asArray,
    extractLabel,
    colorWithOpacity,
} from '../../../utils/orchardHelpers';

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM TEMPLATE — Zone-based drag-drop rendering with quality data display
// ═══════════════════════════════════════════════════════════════════════════════

export default function CustomTemplate({ config, reviewData, dimensions }) {
    const { moduleOrder = [], contentModules = {}, typography = {}, colors = {} } = config;

    const resolveImgUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'object') return img.preview || img.url || img.src || null;
        const s = String(img);
        if (s.startsWith('http') || s.startsWith('/') || s.startsWith('blob:') || s.startsWith('data:')) return s;
        return `/images/${s}`;
    };

    const mainImage = (Array.isArray(reviewData?.images) && reviewData.images.length > 0)
        ? resolveImgUrl(reviewData.images[config.image?.selectedIndex ?? 0] || reviewData.images[0])
        : resolveImgUrl(reviewData?.mainImageUrl || reviewData?.imageUrl);

    // Render a module by key with proper styled output
    const renderModule = (key) => {
        if (!contentModules[key]) return null;
        const val = resolveValue(reviewData, key);

        switch (key) {
            case 'title':
            case 'nomCommercial':
                return (
                    <h1 key={key} className="col-span-12" style={{ color: colors.title, fontSize: `${typography.titleSize || 28}px`, fontWeight: typography.titleWeight || '700', lineHeight: '1.2' }}>
                        {reviewData?.title || reviewData?.holderName || reviewData?.nomCommercial || 'Sans titre'}
                    </h1>
                );

            case 'rating':
            case 'overallRating':
            case 'note': {
                const rating = parseFloat(reviewData?.rating ?? reviewData?.overallRating ?? reviewData?.note) || 0;
                const filledStars = Math.round((rating / 10) * 5);
                return (
                    <div key={key} className="col-span-12 flex items-center gap-3" style={{ flexShrink: 0 }}>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} width="20" height="20" viewBox="0 0 24 24"
                                    fill={i < filledStars ? colors.accent : 'none'}
                                    stroke={colors.accent} strokeWidth={i < filledStars ? '1' : '1.5'}
                                    opacity={i < filledStars ? 1 : 0.3}>
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                        <span style={{ fontSize: `${(typography.titleSize || 28) - 6}px`, fontWeight: '700', color: colors.textPrimary }}>
                            {rating.toFixed(1)}/10
                        </span>
                    </div>
                );
            }

            case 'image':
            case 'mainImage':
            case 'images':
                if (!mainImage) return (
                    <div key={key} className="col-span-6 flex items-center justify-center rounded-xl" style={{ background: colorWithOpacity(colors.accent, 8), border: `1px dashed ${colorWithOpacity(colors.textSecondary, 20)}`, minHeight: '100px' }}>
                        <span style={{ fontSize: '28px', opacity: 0.3 }}>📸</span>
                    </div>
                );
                return (
                    <div key={key} className="col-span-6 overflow-hidden" style={{ borderRadius: `${config.image?.borderRadius ?? 12}px` }}>
                        <img src={mainImage} alt="" className="w-full h-full object-cover" style={{ maxHeight: '300px' }} />
                    </div>
                );

            case 'type':
            case 'category':
                return val ? (
                    <span key={key} className="col-span-6" style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
                        {val}
                    </span>
                ) : null;

            default: {
                // Handle dot-notation fields (e.g. 'visual.density', 'gouts.intensity')
                if (key.includes('.')) {
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal) && numVal > 0) {
                        const label = findFieldDef(key)?.label || key.split('.').pop();
                        return (
                            <div key={key} className="col-span-4" style={{ backgroundColor: colorWithOpacity(colors.accent, 12), borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.textSecondary, marginBottom: '2px' }}>{label}</div>
                                <div style={{ fontSize: `${typography.textSize || 14}px`, fontWeight: '700', color: colors.accent }}>{numVal.toFixed(1)}/10</div>
                            </div>
                        );
                    }
                    // Array-like fields (aromas, effects)
                    const arr = asArray(val);
                    if (arr.length > 0) {
                        const label = findFieldDef(key)?.label || key.split('.').pop();
                        return (
                            <div key={key} className="col-span-12" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.textSecondary }}>{label}</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {arr.slice(0, 8).map((item, i) => (
                                        <span key={i} style={{ fontSize: `${(typography.textSize || 14) - 2}px`, padding: '2px 8px', borderRadius: '12px', backgroundColor: colorWithOpacity(colors.accent, 18), color: colors.accent, fontWeight: '500' }}>
                                            {extractLabel(item)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                }

                // Generic field with value
                if (val !== null && val !== undefined && val !== '') {
                    // Array values
                    const arr = asArray(val);
                    if (Array.isArray(reviewData?.[key]) || arr.length > 1) {
                        const label = findFieldDef(key)?.label || key;
                        return (
                            <div key={key} className="col-span-12" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.textSecondary }}>{label}</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {arr.slice(0, 8).map((item, i) => (
                                        <span key={i} style={{ fontSize: `${(typography.textSize || 14) - 2}px`, padding: '2px 8px', borderRadius: '12px', backgroundColor: colorWithOpacity(colors.accent, 18), color: colors.accent, fontWeight: '500' }}>
                                            {extractLabel(item)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Numeric score values
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal) && numVal >= 0 && numVal <= 10) {
                        const label = findFieldDef(key)?.label || key;
                        return (
                            <div key={key} className="col-span-4" style={{ backgroundColor: colorWithOpacity(colors.accent, 12), borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.textSecondary, marginBottom: '2px' }}>{label}</div>
                                <div style={{ fontSize: `${typography.textSize || 14}px`, fontWeight: '700', color: colors.accent }}>{numVal.toFixed(1)}</div>
                            </div>
                        );
                    }

                    // String values
                    const label = findFieldDef(key)?.label || key;
                    return (
                        <div key={key} className="col-span-6" style={{ backgroundColor: colorWithOpacity(colors.accent, 8), borderRadius: '8px', padding: '8px 12px' }}>
                            <div style={{ fontSize: `${(typography.textSize || 14) - 2}px`, color: colors.textSecondary, marginBottom: '2px' }}>{label}</div>
                            <div style={{ fontSize: `${typography.textSize || 14}px`, fontWeight: '500', color: colors.textPrimary }}>{String(val)}</div>
                        </div>
                    );
                }

                return null;
            }
        }
    };

    return (
        <div style={{ width: dimensions.width, height: dimensions.height, background: colors.background, fontFamily: typography.fontFamily, position: 'relative', overflow: 'hidden' }} className="p-6">
            {/* Module-order based grid rendering */}
            <div className="grid grid-cols-12 gap-3 h-full content-start overflow-hidden">
                {moduleOrder.map((m) => renderModule(m))}
            </div>

            {/* Branding */}
            {config.branding?.enabled && config.branding?.logoUrl && (
                <div className="absolute" style={{ right: 16, bottom: 16, opacity: config.branding.opacity }}>
                    <img src={config.branding.logoUrl} alt="logo" className="w-12 h-12 object-contain orchard-branding" />
                </div>
            )}

            {/* Render custom layout overlays if saved */}
            {renderCustomLayout(reviewData?.orchardCustomLayout, reviewData, colors, typography)}
        </div>
    );
}

// Resolve value from reviewData for a given key (supports dot-notation)
function resolveValue(reviewData, key) {
    if (!reviewData || !key) return null;

    // Dot-notation
    if (key.includes('.')) {
        const [section, field] = key.split('.');
        if (reviewData[section] && typeof reviewData[section] === 'object') {
            return reviewData[section][field] ?? null;
        }
        // Fallback to top-level
        return reviewData[field] ?? null;
    }

    return reviewData[key] ?? null;
}

// Render custom layout overlays (saved zone positions from drag-drop)
function renderCustomLayout(layout, reviewData, colors, typography) {
    if (!layout) return null;

    let parsed = layout;
    try {
        if (typeof layout === 'string') parsed = JSON.parse(layout);
    } catch { parsed = layout; }

    if (!Array.isArray(parsed)) return null;

    const getFieldValue = (field) => {
        if (!reviewData || !field) return null;
        if (field.id && field.id.includes('.')) {
            const parts = field.id.split('.');
            let value = reviewData;
            for (const p of parts) { value = value?.[p]; }
            return value;
        }
        return reviewData[field.id];
    };

    return parsed.map((pl) => {
        if (pl.type === 'zone' || pl.zone === true) {
            return (
                <div key={pl.id} className="absolute" style={{ left: `${pl.position.x}%`, top: `${pl.position.y}%`, width: `${pl.width}%`, height: `${pl.height}%`, transform: `rotate(${pl.rotation || 0}deg)` }}>
                    <div className="w-full h-full flex flex-col items-center justify-center rounded-lg overflow-hidden"
                         style={{ background: colorWithOpacity(colors?.accent || '#A78BFA', 8), border: `1px solid ${colorWithOpacity(colors?.accent || '#A78BFA', 15)}` }}>
                        <div style={{ fontSize: `${(typography?.textSize || 14) - 2}px`, color: colors?.textSecondary || '#94A3B8', marginBottom: '4px', fontWeight: '600' }}>{pl.label || 'Zone'}</div>
                        {(pl.assignedFields || []).map(fid => {
                            const def = findFieldDef(fid);
                            const value = getFieldValue(def);
                            return (
                                <div key={`${pl.id}-${fid}`} className="mb-1 w-full px-2">
                                    <FieldRenderer field={def} value={value} compact />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        const pos = pl.position || { x: 0, y: 0 };
        const width = pl.width || 20;
        const height = pl.height || 10;
        const rotation = pl.rotation || 0;

        return (
            <div key={pl.id} className="absolute"
                 style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${width}%`, height: `${height}%`, transform: `rotate(${rotation}deg)`, pointerEvents: 'none' }}>
                <FieldRenderer field={pl} value={getFieldValue(pl)} compact />
            </div>
        );
    });
}

function findFieldDef(id) {
    for (const k in DRAGGABLE_FIELDS) {
        const arr = DRAGGABLE_FIELDS[k];
        if (!Array.isArray(arr)) continue;
        const found = arr.find(f => f.id === id);
        if (found) return found;
    }
    return { id, label: id, icon: '🔲', type: 'text' };
}

CustomTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};


