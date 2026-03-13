/**
 * InteractiveReviewCard — Responsive, interactive HTML review renderer
 *
 * Three modes:
 *   preview        → fluid scrollable HTML for OrchardPanel preview
 *   export         → fixed pixel dimensions + canvas ID for html-to-image capture
 *   preview-export → fixed pixel dimensions without canvas ID (WYSIWYG preview)
 *
 * Renders ALL review data: analytics, genetics, category ratings, aromas,
 * terpenes, tastes, effects, consumption experience, culture metadata,
 * curing details, separation/extraction, recipe/ingredients, pipelines,
 * description, conclusion, and branding.
 */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import {
    asArray, extractLabel, formatRating, formatDate,
    extractCategoryRatings, extractPipelines, getResponsiveAdjustments,
    RATIO_DIMENSIONS
} from '../../../utils/orchardHelpers';
import InteractivePipelineViewer from '../../gallery/InteractivePipelineViewer';
import GenealogyTree2D from './GenealogyTree2D';
import { Star, ChevronDown, Eye, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

// Size map for per-section fontSize override
const SECTION_FONT_SIZE_MAP = { xs: 10, sm: 12, md: 14, lg: 16, xl: 20 };

// ─── Section wrapper with expand/collapse + per-section style overrides ──────
function Section({ title, icon, children, defaultOpen = true, badge, compact, sectionKey, sectionStyles, forceOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const isOpen = forceOpen || open;
    const ss = sectionStyles?.[sectionKey || title] || {};

    const contentStyle = {};
    if (ss.fontSize) contentStyle.fontSize = `${SECTION_FONT_SIZE_MAP[ss.fontSize] || 14}px`;
    if (ss.fontWeight) contentStyle.fontWeight = ss.fontWeight;
    if (ss.accentColor) contentStyle['--section-accent'] = ss.accentColor;

    const layoutClass = ss.layout === 'grid-2' ? 'grid grid-cols-2 gap-2'
        : ss.layout === 'grid-3' ? 'grid grid-cols-3 gap-2'
            : ss.layout === 'compact' ? 'space-y-1.5'
                : ss.layout === 'expanded' ? 'space-y-4'
                    : compact ? 'space-y-2' : 'space-y-3';

    return (
        <div
            data-orchard-section={sectionKey || title}
            data-orchard-label={title}
            className="overflow-hidden"
            style={{
                borderRadius: ss.borderRadius ? `${ss.borderRadius}px` : forceOpen ? '6px' : compact ? '10px' : '14px',
                border: forceOpen ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.07)',
                background: ss.background || 'rgba(255,255,255,0.025)',
                ...(ss.opacity !== undefined ? { opacity: ss.opacity } : {}),
                ...(ss.padding ? { padding: ss.padding } : {}),
            }}
        >
            {!forceOpen && (
                <button
                    onClick={() => setOpen(!open)}
                    className={`w-full flex items-center justify-between ${compact ? 'px-3 py-1.5' : 'px-4 py-3'} transition-colors`}
                    style={{
                        background: isOpen ? 'rgba(139,92,246,0.08)' : 'transparent',
                        borderBottom: isOpen ? '1px solid rgba(139,92,246,0.12)' : '1px solid transparent',
                    }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className={`${compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-sm'} rounded-lg flex items-center justify-center flex-shrink-0`}
                            style={{ background: 'rgba(139,92,246,0.18)' }}
                        >
                            {icon}
                        </div>
                        <span
                            className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-semibold truncate`}
                            style={{ color: 'rgba(255,255,255,0.88)' }}
                        >
                            {title}
                        </span>
                        {badge && (
                            <span
                                className={`${compact ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'} rounded-full font-semibold flex-shrink-0`}
                                style={{ background: 'rgba(139,92,246,0.22)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}
                            >
                                {badge}
                            </span>
                        )}
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                        <ChevronDown
                            className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`}
                            style={{ color: 'rgba(255,255,255,0.28)' }}
                        />
                    </motion.div>
                </button>
            )}
            {forceOpen && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1`}
                    style={{ background: 'rgba(139,92,246,0.06)', borderBottom: '1px solid rgba(139,92,246,0.10)' }}>
                    <div className="w-4 h-4 text-[9px] rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.15)' }}>{icon}</div>
                    <span className="text-[9px] font-semibold truncate"
                        style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</span>
                    {badge && (
                        <span className="text-[7px] px-1 py-0 rounded-full font-semibold flex-shrink-0"
                            style={{ background: 'rgba(139,92,246,0.20)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}>{badge}</span>
                    )}
                </div>
            )}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={forceOpen ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: forceOpen ? 0 : 0.2 }}
                        className="overflow-hidden"
                    >
                        <div
                            className={`${forceOpen ? 'px-2 py-1' : compact ? 'px-2.5 py-2' : 'px-4 py-3'} ${layoutClass}`}
                            style={contentStyle}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Star rating display ─────────────────────────────────────────────────────
function Stars({ value, max = 10, compact }) {
    const stars = 5;
    const filled = Math.round((value / max) * stars);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: stars }, (_, i) => (
                <Star key={i} className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${i < filled ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
            ))}
            <span className={`ml-1 ${compact ? 'text-[11px]' : 'text-sm'} font-bold text-white`}>{value}/10</span>
        </div>
    );
}

// ─── Score bar for individual metrics ────────────────────────────────────────
function ScoreBar({ label, value, icon, compact }) {
    const percentage = Math.min(100, (value / 10) * 100);
    const barColor = percentage > 70
        ? 'linear-gradient(90deg, #22c55e, #10b981)'
        : percentage > 40
            ? 'linear-gradient(90deg, #eab308, #f59e0b)'
            : 'linear-gradient(90deg, #ef4444, #f87171)';
    return (
        <div data-orchard-score={label} data-orchard-label={label} className="flex items-center gap-2">
            {icon && <span className={`${compact ? 'text-[10px]' : 'text-xs'} w-4 text-center flex-shrink-0`}>{icon}</span>}
            <span
                className={`${compact ? 'text-[10px]' : 'text-xs'} truncate flex-shrink-0`}
                style={{ width: compact ? '72px' : '96px', color: 'rgba(255,255,255,0.5)' }}
            >{label}</span>
            <div
                className={`flex-1 ${compact ? 'h-1.5' : 'h-2'} rounded-full overflow-hidden`}
                style={{ background: 'rgba(255,255,255,0.08)' }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: barColor }}
                />
            </div>
            <span
                className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold w-7 text-right flex-shrink-0`}
                style={{ color: 'rgba(255,255,255,0.72)' }}
            >{value}</span>
        </div>
    );
}

// ─── Tag pill ────────────────────────────────────────────────────────────────
function TagPill({ label, color = 'purple', compact }) {
    const colorMap = {
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        red: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return (
        <span className={`inline-flex items-center ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'} rounded-full border font-medium ${colorMap[color] || colorMap.purple}`}>
            {label}
        </span>
    );
}

// ─── Info card for key/value pairs ───────────────────────────────────────────
function InfoCard({ label, value, icon, compact }) {
    if (!value && value !== 0) return null;
    return (
        <div
            className={`${compact ? 'p-2' : 'p-2.5'} rounded-xl`}
            style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
            <div
                className={`${compact ? 'text-[9px]' : 'text-[10px]'} flex items-center gap-0.5 mb-1`}
                style={{ color: 'rgba(255,255,255,0.38)' }}
            >
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="truncate">{label}</span>
            </div>
            <div
                className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-semibold leading-tight`}
                style={{ color: 'rgba(255,255,255,0.88)' }}
            >
                {typeof value === 'string' || typeof value === 'number' ? value : String(value)}
            </div>
        </div>
    );
}

// ─── Indica / Sativa ratio bar ───────────────────────────────────────────────
function StrainRatioBar({ indica, sativa, compact }) {
    const i = parseFloat(indica) || 0;
    const s = parseFloat(sativa) || (i > 0 ? 100 - i : 0);
    if (i === 0 && s === 0) return null;
    return (
        <div className="space-y-1">
            <div className={`flex justify-between ${compact ? 'text-[10px]' : 'text-xs'} text-white/60`}>
                <span>Indica {i}%</span>
                <span>Sativa {s}%</span>
            </div>
            <div className={`w-full ${compact ? 'h-2' : 'h-2.5'} rounded-full overflow-hidden flex`}>
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-l-full" style={{ width: `${i}%` }} />
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-r-full" style={{ width: `${s}%` }} />
            </div>
        </div>
    );
}

// ─── Image gallery with lightbox ─────────────────────────────────────────────
function ImageGallery({ images, mainImage, compact, imageConfig }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const allImages = useMemo(() => {
        const imgs = [];
        if (mainImage) imgs.push(mainImage);
        if (Array.isArray(images)) {
            images.forEach(img => {
                const url = typeof img === 'string' ? img : img?.url || img?.preview || img?.src;
                if (url && !imgs.includes(url)) imgs.push(url);
            });
        }
        return imgs;
    }, [images, mainImage]);

    // Build CSS filter + opacity + borderRadius from imageConfig
    const imgStyle = useMemo(() => {
        const s = {};
        const ic = imageConfig || {};
        if (ic.borderRadius != null) s.borderRadius = `${ic.borderRadius}px`;
        if (ic.opacity != null) s.opacity = ic.opacity;
        const filterMap = { sepia: 'sepia(100%)', grayscale: 'grayscale(100%)', blur: 'blur(3px)' };
        if (ic.filter && ic.filter !== 'none') s.filter = filterMap[ic.filter] || 'none';
        return s;
    }, [imageConfig]);

    if (!allImages.length) return (
        <div className={`${compact ? 'aspect-[4/3]' : 'aspect-video'} rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center`}>
            <div className="text-center text-white/30">
                <ImageIcon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} mx-auto mb-1`} />
                <span className="text-xs">Pas d'image</span>
            </div>
        </div>
    );

    return (
        <>
            <div className="space-y-1.5">
                {/* Main photo — click opens lightbox */}
                <div
                    className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-video'} overflow-hidden border border-white/10 cursor-pointer group`}
                    style={{ borderRadius: imgStyle.borderRadius || '12px' }}
                    onClick={() => setLightboxIdx(activeIdx)}
                >
                    <motion.img
                        key={activeIdx}
                        src={allImages[activeIdx]} alt="Review"
                        className="w-full h-full object-cover"
                        style={imgStyle}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                    </div>
                    {allImages.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-xs font-medium">
                            {activeIdx + 1}/{allImages.length}
                        </span>
                    )}
                </div>
                {/* Thumbnails — click sets as main photo */}
                {allImages.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto pb-0.5">
                        {allImages.map((img, i) => {
                            if (i === activeIdx) return null;
                            return (
                                <div
                                    key={i}
                                    title="Définir comme photo principale"
                                    className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all hover:border-purple-400 hover:scale-105 active:scale-95`}
                                    style={{ borderRadius: imgStyle.borderRadius || '8px', borderColor: 'rgba(255,255,255,0.15)' }}
                                    onClick={() => setActiveIdx(i)}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" style={imgStyle} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center"
                        onClick={() => setLightboxIdx(null)}
                    >
                        <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><X className="w-6 h-6" /></button>
                        {lightboxIdx > 0 && <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }} className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="w-6 h-6" /></button>}
                        {lightboxIdx < allImages.length - 1 && <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }} className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="w-6 h-6" /></button>}
                        <img src={allImages[lightboxIdx]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Category rating card with expandable sub-details ────────────────────────
function CategoryCard({ cat, compact }) {
    const [expanded, setExpanded] = useState(false);
    const iconMap = { visual: '👁️', smell: '👃', texture: '✋', taste: '👅', effects: '⚡' };
    return (
        <div
            className={`rounded-xl border transition-all cursor-pointer ${expanded ? 'bg-white/[0.06] border-purple-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'}`}
            onClick={() => cat.subDetails && setExpanded(!expanded)}
        >
            <div className={`flex items-center justify-between ${compact ? 'px-2 py-1.5' : 'px-3 py-2.5'}`}>
                <div className="flex items-center gap-1.5">
                    <span className={compact ? 'text-sm' : 'text-base'}>{iconMap[cat.key] || '📊'}</span>
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-white`}>{cat.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Stars value={cat.value} compact={compact} />
                    {cat.subDetails && (
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                            <ChevronDown className="w-3 h-3 text-white/30" />
                        </motion.div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {expanded && cat.subDetails && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className={`${compact ? 'px-2 pb-2' : 'px-3 pb-3'} space-y-1`}>
                            {cat.subDetails.map(sub => (
                                <ScoreBar key={sub.key} label={sub.label} value={sub.value} compact={compact} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Branding / Logo overlay (renders logo image positioned on export pages) ──
function BrandingOverlay({ branding }) {
    if (!branding?.enabled || !branding?.logoUrl) return null;

    const sizeMap = { small: 40, medium: 64, large: 96 };
    const sizePx = sizeMap[branding.size] || 64;

    const posStyle = {};
    const pos = branding.position || 'bottom-right';
    if (pos.includes('top')) posStyle.top = 12;
    if (pos.includes('bottom')) posStyle.bottom = 12;
    if (pos.includes('left')) posStyle.left = 12;
    if (pos.includes('right')) posStyle.right = 12;
    if (pos === 'center') {
        posStyle.top = '50%';
        posStyle.left = '50%';
        posStyle.transform = 'translate(-50%, -50%)';
    }

    return (
        <div className="absolute pointer-events-none" style={{ ...posStyle, zIndex: 5 }}>
            <img
                src={branding.logoUrl}
                alt=""
                style={{
                    width: sizePx,
                    height: sizePx,
                    objectFit: 'contain',
                    opacity: branding.opacity ?? 0.7,
                }}
            />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════════════ */

// Map broad section keys to granular template preset keys
const SECTION_PRESET_MAP = {
    title: ['nomCommercial'],
    image: ['mainImage', 'images'],
    categoryRatings: [
        'visual.colorRating', 'visual.density', 'visual.trichomes', 'visual.mold', 'visual.seeds',
        'visual.transparency', 'visual.viscosity',
        'odeurs.intensity', 'odeurs.complexity', 'odeurs.fidelity',
        'texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness',
        'gouts.intensity', 'gouts.aggressiveness',
        'effets.onset', 'effets.intensity',
    ],
    aromas: ['odeurs.dominantNotes', 'odeurs.secondaryNotes'],
    terpenes: ['analytics.terpeneProfile'],
    tastes: ['gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes'],
    effects: ['effets.effects', 'effets.duration'],
    analytics: ['analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile'],
    genetics: ['breeder', 'strainType', 'genetics'],
    consumption: ['effets.effects', 'effets.duration'],
    curing: ['curing'],
    pipelines: ['curing', 'cultureTimelineData', 'pipelineExtraction', 'pipelineSeparation', 'fertilizationPipeline'],
};

// Template-specific visual style presets
const TEMPLATE_STYLES = {
    modernCompact: { spacing: 'space-y-3', sectionDefault: false, maxWidth: 'max-w-xl', headerSize: 'text-xl', compact: true },
    detailedCard: { spacing: 'space-y-5', sectionDefault: true, maxWidth: 'max-w-3xl', headerSize: 'text-2xl', compact: false },
    blogArticle: { spacing: 'space-y-6', sectionDefault: true, maxWidth: 'max-w-3xl', headerSize: 'text-3xl', compact: false },
    socialStory: { spacing: 'space-y-3', sectionDefault: false, maxWidth: 'max-w-sm mx-auto', headerSize: 'text-lg', compact: true },
};

// Fixed pixel dimensions for export mode
// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT STRATEGIES — per template × ratio combination
// Each entry controls: layout type, font sizes, padding, columns, compactness
// ═══════════════════════════════════════════════════════════════════════════
// pad = container padding in px (each side), gap = gap between sections in px
const FALLBACK_LAYOUT = { layout: 'single', cols: 1, pad: 24, gap: 16, headerSize: 'text-2xl', baseFontPx: 16, compact: false, imagePos: 'top' };

const LAYOUT_STRATEGIES = {
    // ── MODERNE COMPACT ──────────────────────────────────────────────────
    modernCompact: {
        '1:1': { layout: 'hero', cols: 1, pad: 18, gap: 8, headerSize: 'text-xl', baseFontPx: 13, compact: true, imagePos: 'hero' },
        '16:9': { layout: 'two-col', cols: 2, pad: 24, gap: 10, headerSize: 'text-2xl', baseFontPx: 14, compact: true, imagePos: 'left', leftWidth: '38%' },
        '9:16': { layout: 'story', cols: 1, pad: 20, gap: 8, headerSize: 'text-xl', baseFontPx: 14, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'two-col', cols: 2, pad: 22, gap: 10, headerSize: 'text-xl', baseFontPx: 14, compact: true, imagePos: 'left', leftWidth: '36%' },
        'A4': { layout: 'single', cols: 1, pad: 36, gap: 14, headerSize: 'text-2xl', baseFontPx: 16, compact: false, imagePos: 'top' },
    },
    // ── FICHE TECHNIQUE DÉTAILLÉE ────────────────────────────────────────
    detailedCard: {
        '1:1': { layout: 'grid', cols: 1, pad: 16, gap: 6, headerSize: 'text-lg', baseFontPx: 12, compact: true, imagePos: 'inline' },
        '16:9': { layout: 'two-col', cols: 2, pad: 20, gap: 8, headerSize: 'text-xl', baseFontPx: 13, compact: true, imagePos: 'left', leftWidth: '34%' },
        '9:16': { layout: 'story', cols: 1, pad: 20, gap: 8, headerSize: 'text-lg', baseFontPx: 13, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'two-col', cols: 2, pad: 22, gap: 8, headerSize: 'text-xl', baseFontPx: 13, compact: true, imagePos: 'left', leftWidth: '36%' },
        'A4': { layout: 'single', cols: 1, pad: 36, gap: 14, headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'top' },
    },
    // ── ARTICLE DE BLOG ──────────────────────────────────────────────────
    blogArticle: {
        '1:1': { layout: 'single', cols: 1, pad: 20, gap: 10, headerSize: 'text-xl', baseFontPx: 13, compact: true, imagePos: 'top' },
        '16:9': { layout: 'two-col', cols: 2, pad: 28, gap: 12, headerSize: 'text-2xl', baseFontPx: 15, compact: true, imagePos: 'left', leftWidth: '40%' },
        '9:16': { layout: 'single', cols: 1, pad: 24, gap: 12, headerSize: 'text-xl', baseFontPx: 15, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'two-col', cols: 2, pad: 26, gap: 12, headerSize: 'text-2xl', baseFontPx: 15, compact: true, imagePos: 'left', leftWidth: '38%' },
        'A4': { layout: 'single', cols: 1, pad: 40, gap: 16, headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'top' },
    },
    // ── STORY SOCIAL MEDIA ───────────────────────────────────────────────
    socialStory: {
        '1:1': { layout: 'hero', cols: 1, pad: 16, gap: 6, headerSize: 'text-lg', baseFontPx: 12, compact: true, imagePos: 'hero' },
        '16:9': { layout: 'two-col', cols: 2, pad: 20, gap: 8, headerSize: 'text-xl', baseFontPx: 13, compact: true, imagePos: 'left', leftWidth: '44%' },
        '9:16': { layout: 'story', cols: 1, pad: 16, gap: 8, headerSize: 'text-xl', baseFontPx: 15, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'hero', cols: 1, pad: 20, gap: 8, headerSize: 'text-xl', baseFontPx: 14, compact: true, imagePos: 'hero' },
        'A4': { layout: 'single', cols: 1, pad: 28, gap: 12, headerSize: 'text-2xl', baseFontPx: 16, compact: false, imagePos: 'top' },
    },
};

/** Resolve layout strategy for the current template + ratio */
function getLayoutStrategy(templateId, ratio) {
    return LAYOUT_STRATEGIES[templateId]?.[ratio]
        || LAYOUT_STRATEGIES[templateId]?.['1:1']
        || FALLBACK_LAYOUT;
}

// Keep RATIO_STYLES for backward compat (pagination measurement still uses pad/gap)
const RATIO_STYLES = {
    '1:1': { cols: 1, fontSize: 'text-sm', pad: 'p-5', gap: 'space-y-3', headerSize: 'text-xl', compact: true },
    '16:9': { cols: 2, fontSize: 'text-sm', pad: 'p-6', gap: 'space-y-3', headerSize: 'text-2xl', compact: false },
    '9:16': { cols: 1, fontSize: 'text-xs', pad: 'p-4', gap: 'space-y-2', headerSize: 'text-lg', compact: true },
    '4:3': { cols: 2, fontSize: 'text-sm', pad: 'p-5', gap: 'space-y-3', headerSize: 'text-xl', compact: false },
    'A4': { cols: 1, fontSize: 'text-sm', pad: 'p-8', gap: 'space-y-4', headerSize: 'text-2xl', compact: false },
};

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InteractiveReviewCard({ mode = 'preview' }) {
    const config = useOrchardStore(s => s.config);
    const reviewData = useOrchardStore(s => s.reviewData);

    // ── Base data extraction ─────────────────────────────────────────────────
    const categoryRatings = useMemo(() => reviewData ? extractCategoryRatings(reviewData?.categoryRatings, reviewData) : [], [reviewData]);
    const pipelines = useMemo(() => extractPipelines(reviewData), [reviewData]);

    const aromas = useMemo(() => asArray(reviewData?.aromas).map(extractLabel).filter(Boolean), [reviewData]);
    const secondaryAromas = useMemo(() => asArray(reviewData?.secondaryAromas).map(extractLabel).filter(Boolean), [reviewData]);
    const tastes = useMemo(() => asArray(reviewData?.tastes).map(extractLabel).filter(Boolean), [reviewData]);
    const dryPuffNotes = useMemo(() => asArray(reviewData?.dryPuffNotes).map(extractLabel).filter(Boolean), [reviewData]);
    const inhalationNotes = useMemo(() => asArray(reviewData?.inhalationNotes).map(extractLabel).filter(Boolean), [reviewData]);
    const exhalationNotes = useMemo(() => asArray(reviewData?.exhalationNotes).map(extractLabel).filter(Boolean), [reviewData]);
    const effects = useMemo(() => asArray(reviewData?.effects).map(extractLabel).filter(Boolean), [reviewData]);
    const terpenes = useMemo(() => asArray(reviewData?.terpenes).map(extractLabel).filter(Boolean), [reviewData]);
    const cultivars = useMemo(() => asArray(reviewData?.cultivarsList).map(extractLabel).filter(Boolean), [reviewData]);
    const images = useMemo(() => asArray(reviewData?.images), [reviewData]);

    // ── Consumption experience ───────────────────────────────────────────────
    const consumption = useMemo(() => {
        if (!reviewData) return null;
        const c = {};
        const method = reviewData.consumptionMethod || reviewData.methodeConsommation;
        if (method) c.method = method;
        if (reviewData.dosage) c.dosage = `${reviewData.dosage}${reviewData.dosageUnit ? ' ' + reviewData.dosageUnit : ' g'}`;
        const duration = reviewData.effectDuration || reviewData.dureeEffets;
        if (duration) c.duration = duration;
        const onset = reviewData.effectOnset || reviewData.debutEffets;
        if (onset) c.onset = onset;
        const length = reviewData.effectLength || reviewData.longueurEffets;
        if (length) c.length = length;
        const prefUse = reviewData.preferredUse || reviewData.usagePreface || reviewData.usagePrefere;
        if (prefUse) c.preferredUse = prefUse;
        const profiles = asArray(reviewData.effectProfiles).map(extractLabel).filter(Boolean);
        if (profiles.length) c.profiles = profiles;
        const sideFxArr = asArray(reviewData.sideEffects || reviewData.effetsSecondaires);
        const sideFx = sideFxArr.map(extractLabel).filter(Boolean);
        if (sideFx.length) c.sideEffects = sideFx;
        return Object.keys(c).length > 0 ? c : null;
    }, [reviewData]);

    // ── Analytics / Cannabinoids ─────────────────────────────────────────────
    const analytics = useMemo(() => {
        if (!reviewData) return null;
        const a = {};
        if (reviewData.thcLevel || reviewData.thcPercent) a.thc = reviewData.thcLevel || reviewData.thcPercent;
        if (reviewData.cbdLevel || reviewData.cbdPercent) a.cbd = reviewData.cbdLevel || reviewData.cbdPercent;
        if (reviewData.cbgPercent) a.cbg = reviewData.cbgPercent;
        if (reviewData.cbcPercent) a.cbc = reviewData.cbcPercent;
        if (reviewData.cbnPercent) a.cbn = reviewData.cbnPercent;
        if (reviewData.thcvPercent) a.thcv = reviewData.thcvPercent;
        if (reviewData.labReportUrl) a.labUrl = reviewData.labReportUrl;
        return Object.keys(a).length > 0 ? a : null;
    }, [reviewData]);

    // ── Curing specifics ─────────────────────────────────────────────────────
    const curingInfo = useMemo(() => {
        if (!reviewData) return null;
        const c = {};
        if (reviewData.curingTemperature) c.temp = reviewData.curingTemperature;
        if (reviewData.curingHumidity) c.humidity = reviewData.curingHumidity;
        if (reviewData.curingType) c.type = reviewData.curingType;
        if (reviewData.curingDuration) c.duration = reviewData.curingDuration;
        if (reviewData.curingInterval) c.interval = reviewData.curingInterval;
        if (reviewData.curingRecipientType) c.recipientType = reviewData.curingRecipientType;
        if (reviewData.curingEmballage) c.emballage = reviewData.curingEmballage;
        if (reviewData.curingOpacity) c.opacity = reviewData.curingOpacity;
        if (reviewData.curingVolume) c.volume = reviewData.curingVolume;
        return Object.keys(c).length > 0 ? c : null;
    }, [reviewData]);

    // ── Culture metadata ─────────────────────────────────────────────────────
    const cultureInfo = useMemo(() => {
        if (!reviewData) return null;
        const c = {};
        if (reviewData.cultureMode) c.mode = reviewData.cultureMode;
        if (reviewData.cultureSpaceType) c.spaceType = reviewData.cultureSpaceType;
        if (reviewData.cultureSubstrat) c.substrat = reviewData.cultureSubstrat;
        if (reviewData.cultureStartDate) c.startDate = reviewData.cultureStartDate;
        if (reviewData.cultureEndDate) c.endDate = reviewData.cultureEndDate;
        if (reviewData.cultureDuration) c.duration = reviewData.cultureDuration;
        if (reviewData.cultureSeason) c.season = reviewData.cultureSeason;
        if (reviewData.cultureSpaceDimensions) c.dimensions = reviewData.cultureSpaceDimensions;
        if (reviewData.cultureLightType) c.lightType = reviewData.cultureLightType;
        if (reviewData.cultureLightPower) c.lightPower = reviewData.cultureLightPower;
        if (reviewData.propagationTechnique) c.propagation = reviewData.propagationTechnique;
        // Harvest
        if (reviewData.poidsBrut) c.poidsBrut = reviewData.poidsBrut;
        if (reviewData.poidsNet) c.poidsNet = reviewData.poidsNet;
        if (reviewData.rendement) c.rendement = reviewData.rendement;
        if (reviewData.modeRecolte || reviewData.harvestMode) c.modeRecolte = reviewData.modeRecolte || reviewData.harvestMode;
        if (reviewData.trichomeColor) c.trichomeColor = reviewData.trichomeColor;
        // Extended culture fields (environment, irrigation, engrais, light, morphology)
        if (reviewData.temperatureMoyenne) c.tempMoy = reviewData.temperatureMoyenne;
        if (reviewData.humiditeMoyenne) c.humMoy = reviewData.humiditeMoyenne;
        if (reviewData.co2Valeur) c.co2 = reviewData.co2Valeur;
        if (reviewData.systemeIrrigation) c.irrigation = reviewData.systemeIrrigation;
        if (reviewData.typeEngrais) c.engraisType = reviewData.typeEngrais;
        if (reviewData.marqueEngrais) c.engraisMarque = reviewData.marqueEngrais;
        if (reviewData.dli) c.dli = reviewData.dli;
        if (reviewData.ppfd) c.ppfd = reviewData.ppfd;
        if (reviewData.kelvin) c.kelvin = reviewData.kelvin;
        if (reviewData.photoperiode) c.photoperiode = reviewData.photoperiode;
        if (reviewData.methodePalissage) c.palissage = reviewData.methodePalissage;
        if (reviewData.nombrePlantes) c.nbPlantes = reviewData.nombrePlantes;
        if (reviewData.taillePlante) c.taillePlante = reviewData.taillePlante;
        if (reviewData.nombreBuds) c.nbBuds = reviewData.nombreBuds;
        if (reviewData.rendementM2) c.rendementM2 = reviewData.rendementM2;
        if (reviewData.rendementPlante) c.rendementPlante = reviewData.rendementPlante;
        return Object.keys(c).length > 0 ? c : null;
    }, [reviewData]);

    // ── Texture data ─────────────────────────────────────────────────────────
    const textureData = useMemo(() => {
        if (!reviewData) return null;
        const t = {};
        if (reviewData.durete != null || reviewData.hardness != null) t.durete = reviewData.durete ?? reviewData.hardness;
        if (reviewData.densiteTactile != null || reviewData.density != null) t.densiteTactile = reviewData.densiteTactile ?? reviewData.density;
        if (reviewData.elasticite != null || reviewData.elasticity != null) t.elasticite = reviewData.elasticite ?? reviewData.elasticity;
        if (reviewData.collant != null || reviewData.stickiness != null) t.collant = reviewData.collant ?? reviewData.stickiness;
        if (reviewData.friabilite != null || reviewData.friability != null) t.friabilite = reviewData.friabilite ?? reviewData.friability;
        if (reviewData.viscosity != null || reviewData.viscosite != null) t.viscosite = reviewData.viscosity ?? reviewData.viscosite;
        if (reviewData.meltingTexture != null) t.melting = reviewData.meltingTexture;
        return Object.keys(t).length > 0 ? t : null;
    }, [reviewData]);

    // ── Visual/Technical data ────────────────────────────────────────────────
    const visualData = useMemo(() => {
        if (!reviewData) return null;
        const v = {};
        if (reviewData.couleur != null || reviewData.couleurNote != null) v.couleur = reviewData.couleur ?? reviewData.couleurNote;
        if (reviewData.densiteVisuelle != null) v.densiteVisuelle = reviewData.densiteVisuelle;
        if (reviewData.trichomes != null || reviewData.trichome != null) v.trichomes = reviewData.trichomes ?? reviewData.trichome;
        if (reviewData.pistils != null || reviewData.pistil != null) v.pistils = reviewData.pistils ?? reviewData.pistil;
        if (reviewData.manucure != null) v.manucure = reviewData.manucure;
        if (reviewData.moisissure != null) v.moisissure = reviewData.moisissure;
        if (reviewData.graines != null) v.graines = reviewData.graines;
        if (reviewData.pureteVisuelle != null) v.pureteVisuelle = reviewData.pureteVisuelle;
        if (reviewData.couleurTransparence != null) v.transparence = reviewData.couleurTransparence;
        if (reviewData.viscositeVisuelle != null) v.viscosite = reviewData.viscositeVisuelle;
        if (reviewData.melting != null) v.melting = reviewData.melting;
        if (reviewData.residus != null) v.residus = reviewData.residus;
        if (reviewData.selectedColors?.length > 0) v.selectedColors = reviewData.selectedColors;
        return Object.keys(v).length > 0 ? v : null;
    }, [reviewData]);

    // ── Separation details (Hash) ────────────────────────────────────────────
    const separationInfo = useMemo(() => {
        if (!reviewData) return null;
        const s = {};
        if (reviewData.methodeSeparation) s.method = reviewData.methodeSeparation;
        if (reviewData.nombrePasses) s.passes = reviewData.nombrePasses;
        if (reviewData.temperatureEau) s.waterTemp = reviewData.temperatureEau;
        if (reviewData.tailleMailles) s.meshSize = reviewData.tailleMailles;
        if (reviewData.typeMatierePremiere) s.rawMaterial = reviewData.typeMatierePremiere;
        if (reviewData.qualiteMatierePremiere) s.rawQuality = reviewData.qualiteMatierePremiere;
        if (reviewData.rendementEstime) s.yield = reviewData.rendementEstime;
        if (reviewData.tempsSeparation) s.duration = reviewData.tempsSeparation;
        return Object.keys(s).length > 0 ? s : null;
    }, [reviewData]);

    // ── Extraction details (Concentrate) ─────────────────────────────────────
    const extractionInfo = useMemo(() => {
        if (!reviewData) return null;
        const e = {};
        if (reviewData.methodeExtraction) e.method = reviewData.methodeExtraction;
        if (reviewData.solvant) e.solvant = reviewData.solvant;
        if (reviewData.temperatureExtraction) e.temp = reviewData.temperatureExtraction;
        if (reviewData.pressionExtraction) e.pressure = reviewData.pressionExtraction;
        if (reviewData.dureeExtraction) e.duration = reviewData.dureeExtraction;
        return Object.keys(e).length > 0 ? e : null;
    }, [reviewData]);

    // ── Recipe (Edible) ──────────────────────────────────────────────────────
    const recipeInfo = useMemo(() => {
        if (!reviewData) return null;
        const ingredients = asArray(reviewData.ingredients);
        const steps = asArray(reviewData.etapesPreparation || reviewData.preparationSteps);
        if (ingredients.length === 0 && steps.length === 0) return null;
        return { ingredients, steps, typeComestible: reviewData.typeComestible, fabricant: reviewData.fabricant };
    }, [reviewData]);

    // ── Genealogy tree data (PhenoHunt) ──────────────────────────────────────
    const genealogyData = useMemo(() => {
        if (!reviewData) return null;
        const tree = reviewData.geneticTree || reviewData.genealogyTree || reviewData.phenoTree;
        if (!tree) return null;
        const nodes = tree.nodes || [];
        const edges = tree.edges || [];
        if (nodes.length === 0) return null;
        return { nodes, edges, name: tree.name || 'Arbre généalogique' };
    }, [reviewData]);

    // ── Config & style resolution ────────────────────────────────────────────
    const cm = config?.contentModules || {};
    const colors = config?.colors || {};
    const typo = config?.typography || {};
    const secStyles = config?.sectionStyles || {};
    const paginationConfig = config?.pagination || {};
    const templateId = config?.template || 'modernCompact';
    const tStyle = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.modernCompact;
    const ratio = config?.ratio || '1:1';
    const rDims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    const rStyle = RATIO_STYLES[ratio] || RATIO_STYLES['1:1'];
    const ls = getLayoutStrategy(templateId, ratio);
    const isExportLike = mode === 'export' || mode === 'preview-export';
    const isCanvasCapture = mode === 'export';
    const isCompact = isExportLike ? ls.compact : tStyle.compact;

    // ── Responsive limits for export (tag counts, card counts) ──────────
    const responsive = useMemo(() => getResponsiveAdjustments(ratio, config?.typography), [ratio, config?.typography]);
    const maxTags = isExportLike ? responsive.limits.maxTags : Infinity;
    const maxCards = isExportLike ? responsive.limits.maxInfoCards : Infinity;

    // ── Pagination state ─────────────────────────────────────────────────────
    const measureRef = useRef(null);
    const [pages, setPages] = useState([]);
    const [paginationReady, setPaginationReady] = useState(false);
    const [previewPage, setPreviewPage] = useState(0); // For preview mode pagination

    // Right-column pagination (two-col layouts)
    const rightMeasureRef = useRef(null);
    const [rightColPages, setRightColPages] = useState([]);
    const [rightColReady, setRightColReady] = useState(false);

    // Measure sections and distribute into pages after initial render
    const paginateSections = useCallback(() => {
        if (!measureRef.current) return;
        if (!isCanvasCapture && !paginationConfig.enabled) return;
        const container = measureRef.current;
        const children = Array.from(container.children);
        if (children.length === 0) return;

        const pageH = rDims.height;
        const padPx = ls.pad * 2;
        const usableH = pageH - padPx;
        const gapPx = ls.gap;
        const maxPg = Math.min(paginationConfig.maxPages || 9, 9);

        const result = [[]];
        let currentH = 0;
        let pageIdx = 0;

        children.forEach((child, i) => {
            const h = child.getBoundingClientRect().height;
            const gap = i > 0 ? gapPx : 0;
            if (currentH + h + gap > usableH && result[pageIdx].length > 0 && pageIdx < maxPg - 1) {
                pageIdx++;
                result.push([]);
                currentH = 0;
            }
            result[pageIdx].push(i);
            currentH += h + gap;
        });

        setPages(result);
        setPaginationReady(true);
    }, [isCanvasCapture, rDims.height, ls.pad, ls.gap, paginationConfig.enabled, paginationConfig.maxPages]);

    // Measure right-column dataSections and split into pages for two-col export
    const paginateRightCol = useCallback(() => {
        if (!rightMeasureRef.current) return;
        if (!isCanvasCapture && !paginationConfig.enabled) return;
        const children = Array.from(rightMeasureRef.current.children);
        if (children.length === 0) return;

        const availableH = rDims.height - ls.pad * 2;
        const gapPx = ls.gap;
        const maxPg = Math.min(paginationConfig.maxPages || 9, 9);

        const result = [[]];
        let currentH = 0;
        let groupIdx = 0;

        children.forEach((child, i) => {
            const h = child.getBoundingClientRect().height;
            const gap = i > 0 ? gapPx : 0;
            if (currentH + h + gap > availableH && result[groupIdx].length > 0 && groupIdx < maxPg - 1) {
                groupIdx++;
                result.push([]);
                currentH = 0;
            }
            result[groupIdx].push(i);
            currentH += h + gap;
        });

        setRightColPages(result);
        setRightColReady(true);
    }, [isCanvasCapture, rDims.height, ls.pad, ls.gap, paginationConfig.enabled, paginationConfig.maxPages]);

    // ── Resolved primitives (safe for null reviewData) ────────────────────
    const title = reviewData?.title || reviewData?.holderName || reviewData?.productName || reviewData?.nomCommercial || 'Sans titre';
    const rating = parseFloat(reviewData?.rating || reviewData?.overallRating || reviewData?.note || 0);
    const rawAuthor = reviewData?.author || reviewData?.ownerName || 'Anonyme';
    const author = (typeof rawAuthor === 'object' && rawAuthor !== null) ? (rawAuthor.username || rawAuthor.name || 'Anonyme') : rawAuthor;
    const type = reviewData?.type || reviewData?.category || '';
    const typeLabels = { flower: 'Fleurs', hash: 'Hash', concentrate: 'Concentré', edible: 'Comestible' };
    const mainImageUrl = reviewData?.mainImageUrl || reviewData?.imageUrl || reviewData?.mainImage;

    // ── Module visibility check ──────────────────────────────────────────────
    const isVisible = (key) => {
        if (cm[key] === false) return false;
        const mapped = SECTION_PRESET_MAP[key];
        if (mapped && mapped.length > 0) return mapped.some(pk => cm[pk] !== false);
        return true;
    };

    // In export-like modes, force all sections open (no collapsed accordions)
    const sectionForceOpen = isExportLike;

    // ── Grid class helper ────────────────────────────────────────────────────
    const gridCols = isCompact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

    /* ══════════════════════════════════════════════════════════════════════════
       SECTION BUILDERS — collected as an array for potential pagination
       ══════════════════════════════════════════════════════════════════════════ */
    const buildSections = () => {
        if (!reviewData) return [];
        const secs = [];

        // ── HEADER: type badge + title + meta + cultivars + rating ────────
        secs.push(
            <div key="header" className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {(isVisible('type') || isVisible('category')) && type && (
                    <span className={`inline-flex items-center ${isCompact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider`}>
                        {typeLabels[type] || type}
                    </span>
                )}
                {isVisible('title') && (
                    <h1 className={`${isExportLike ? rStyle.headerSize : tStyle.headerSize} font-bold text-white leading-tight`}
                        style={{ fontFamily: typo.fontFamily, fontWeight: typo.titleWeight || '700', color: typo.titleColor || '#fff' }}>
                        {title}
                    </h1>
                )}
                <div className={`flex flex-wrap items-center gap-2 ${isCompact ? 'text-[11px]' : 'text-sm'} text-white/50`}>
                    {isVisible('author') && author && <span>✏️ {author}</span>}
                    {isVisible('date') && reviewData.createdAt && <span>· {formatDate(reviewData.createdAt)}</span>}
                    {isVisible('farm') && reviewData.farm && <span>· 🌾 {reviewData.farm}</span>}
                    {isVisible('hashmaker') && reviewData.hashmaker && <span>· ⚗️ {reviewData.hashmaker}</span>}
                    {reviewData.laboratoire && <span>· 🔬 {reviewData.laboratoire}</span>}
                </div>
                {isVisible('cultivarsList') && cultivars.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {cultivars.slice(0, maxTags).map((c, i) => <TagPill key={i} label={c} color="green" compact={isCompact} />)}
                    </div>
                )}
                {isVisible('rating') && rating > 0 && (
                    <div className="flex items-center gap-2">
                        <div className={`${isCompact ? 'w-10 h-10 rounded-xl' : 'w-14 h-14 rounded-2xl'} bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center`}>
                            <span className={`${isCompact ? 'text-sm' : 'text-xl'} font-black text-yellow-400`}>{rating.toFixed(1)}</span>
                        </div>
                        <div>
                            <Stars value={rating} compact={isCompact} />
                            <span className="text-[10px] text-white/40 mt-0.5 block">Note globale</span>
                        </div>
                    </div>
                )}
            </div>
        );

        // ── IMAGE ────────────────────────────────────────────────────────
        if (isVisible('image')) {
            secs.push(<div key="image"><ImageGallery images={images} mainImage={mainImageUrl} compact={isCompact} imageConfig={config?.image} /></div>);
        }

        // ── ANALYTICS (Cannabinoids) ─────────────────────────────────────
        if (isVisible('analytics') && analytics) {
            const count = Object.keys(analytics).filter(k => k !== 'labUrl').length;
            secs.push(
                <Section key="analytics" title="Analyses & Cannabinoïdes" icon="🧪" defaultOpen={!isCompact} badge={`${count}`} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {analytics.thc && <InfoCard label="THC" value={`${analytics.thc}%`} icon="🟢" compact={isCompact} />}
                        {analytics.cbd && <InfoCard label="CBD" value={`${analytics.cbd}%`} icon="🔵" compact={isCompact} />}
                        {analytics.cbg && <InfoCard label="CBG" value={`${analytics.cbg}%`} icon="🟣" compact={isCompact} />}
                        {analytics.cbc && <InfoCard label="CBC" value={`${analytics.cbc}%`} icon="🟤" compact={isCompact} />}
                        {analytics.cbn && <InfoCard label="CBN" value={`${analytics.cbn}%`} icon="🟠" compact={isCompact} />}
                        {analytics.thcv && <InfoCard label="THCV" value={`${analytics.thcv}%`} icon="🟡" compact={isCompact} />}
                    </div>
                    {analytics.labUrl && (
                        <a href={analytics.labUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 underline mt-1 block">
                            📄 Rapport d'analyse
                        </a>
                    )}
                </Section>
            );
        }

        // ── GENETICS ─────────────────────────────────────────────────────
        if (isVisible('genetics') && (reviewData.breeder || reviewData.strainType || reviewData.indicaRatio !== undefined || reviewData.indicaPercent !== undefined || reviewData.variety || reviewData.phenotypeCode)) {
            secs.push(
                <Section key="genetics" title="Génétique" icon="🧬" defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {reviewData.breeder && <InfoCard label="Breeder" value={reviewData.breeder} icon="🌱" compact={isCompact} />}
                        {reviewData.strainType && <InfoCard label="Type" value={reviewData.strainType} icon="🌿" compact={isCompact} />}
                        {reviewData.variety && <InfoCard label="Variété" value={reviewData.variety} icon="🏷️" compact={isCompact} />}
                        {reviewData.phenotypeCode && <InfoCard label="Phénotype" value={reviewData.phenotypeCode} icon="🔬" compact={isCompact} />}
                    </div>
                    {(reviewData.indicaRatio !== undefined || reviewData.indicaPercent !== undefined) && (
                        <StrainRatioBar indica={reviewData.indicaRatio || reviewData.indicaPercent} sativa={reviewData.sativaPercent} compact={isCompact} />
                    )}
                </Section>
            );
        }

        // ── GENEALOGY TREE (PhenoHunt) ───────────────────────────────────
        if (isVisible('genetics') && genealogyData) {
            secs.push(
                <Section key="genealogy" title={genealogyData.name} icon="🌳" defaultOpen={!isCompact} badge={`${genealogyData.nodes.length}`} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <GenealogyTree2D
                        nodes={genealogyData.nodes}
                        edges={genealogyData.edges}
                        compact={isCompact}
                    />
                </Section>
            );
        }

        // ── CATEGORY RATINGS ─────────────────────────────────────────────
        if (isVisible('categoryRatings') && categoryRatings.length > 0) {
            secs.push(
                <Section key="catRatings" title="Notes par catégorie" icon="📊" badge={`${categoryRatings.length} cat.`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
                        {categoryRatings.map(cat => <CategoryCard key={cat.key} cat={cat} compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── VISUAL / TECHNIQUE ───────────────────────────────────────────
        if (isVisible('categoryRatings') && visualData) {
            const vEntries = [
                visualData.couleur != null && { label: 'Couleur', value: `${visualData.couleur}/10`, icon: '🎨' },
                visualData.densiteVisuelle != null && { label: 'Densité visuelle', value: `${visualData.densiteVisuelle}/10`, icon: '🔍' },
                visualData.trichomes != null && { label: 'Trichomes', value: `${visualData.trichomes}/10`, icon: '✨' },
                visualData.pistils != null && { label: 'Pistils', value: `${visualData.pistils}/10`, icon: '🌾' },
                visualData.manucure != null && { label: 'Manucure', value: `${visualData.manucure}/10`, icon: '✂️' },
                visualData.moisissure != null && { label: 'Moisissure', value: `${visualData.moisissure}/10`, icon: '🦠' },
                visualData.graines != null && { label: 'Graines', value: `${visualData.graines}/10`, icon: '🌰' },
                visualData.pureteVisuelle != null && { label: 'Pureté', value: `${visualData.pureteVisuelle}/10`, icon: '💎' },
                visualData.transparence != null && { label: 'Transparence', value: `${visualData.transparence}/10`, icon: '🔮' },
                visualData.viscosite != null && { label: 'Viscosité', value: `${visualData.viscosite}/10`, icon: '🫗' },
                visualData.melting != null && { label: 'Melting', value: `${visualData.melting}/10`, icon: '🔥' },
                visualData.residus != null && { label: 'Résidus', value: `${visualData.residus}/10`, icon: '💨' },
            ].filter(Boolean);
            if (vEntries.length > 0) {
                secs.push(
                    <Section key="visual" title="Visuel & Technique" icon="👁️" badge={`${vEntries.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                        <div className={`grid ${gridCols} gap-2`}>
                            {vEntries.map((v, i) => <InfoCard key={i} label={v.label} value={v.value} icon={v.icon} compact={isCompact} />)}
                        </div>
                        {visualData.selectedColors?.length > 0 && (
                            <div className="mt-2">
                                <span className="text-[10px] text-white/40 mb-1 block">Couleurs observées</span>
                                <div className="flex gap-1">
                                    {visualData.selectedColors.map((color, i) => (
                                        <div key={i} className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: color }} title={color} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>
                );
            }
        }

        // ── TEXTURE ──────────────────────────────────────────────────────
        if (isVisible('categoryRatings') && textureData) {
            const tEntries = [
                textureData.durete != null && { label: 'Dureté', value: `${textureData.durete}/10`, icon: '💪' },
                textureData.densiteTactile != null && { label: 'Densité tactile', value: `${textureData.densiteTactile}/10`, icon: '🤚' },
                textureData.elasticite != null && { label: 'Élasticité', value: `${textureData.elasticite}/10`, icon: '🔄' },
                textureData.collant != null && { label: 'Collant', value: `${textureData.collant}/10`, icon: '🍯' },
                textureData.friabilite != null && { label: 'Friabilité', value: `${textureData.friabilite}/10`, icon: '🪨' },
                textureData.viscosite != null && { label: 'Viscosité', value: `${textureData.viscosite}/10`, icon: '🫗' },
                textureData.melting != null && { label: 'Melting/Résidus', value: `${textureData.melting}/10`, icon: '♨️' },
            ].filter(Boolean);
            if (tEntries.length > 0) {
                secs.push(
                    <Section key="texture" title="Texture" icon="🤚" badge={`${tEntries.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                        <div className={`grid ${gridCols} gap-2`}>
                            {tEntries.map((t, i) => <InfoCard key={i} label={t.label} value={t.value} icon={t.icon} compact={isCompact} />)}
                        </div>
                    </Section>
                );
            }
        }

        // ── AROMAS ───────────────────────────────────────────────────────
        if (isVisible('aromas') && (aromas.length > 0 || secondaryAromas.length > 0 || reviewData.intensiteOdeur || reviewData.intensiteAromatique || reviewData.fideliteCultivarsOdeur || reviewData.fideliteCultivars)) {
            secs.push(
                <Section key="aromas" title="Arômes" icon="👃" badge={`${aromas.length + secondaryAromas.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    {(reviewData.intensiteOdeur || reviewData.intensiteAromatique || reviewData.fideliteCultivarsOdeur || reviewData.fideliteCultivars) && (
                        <div className={`grid ${gridCols} gap-2 mb-2`}>
                            {(reviewData.intensiteOdeur || reviewData.intensiteAromatique) && (
                                <InfoCard label="Intensité" value={`${reviewData.intensiteOdeur || reviewData.intensiteAromatique}/10`} icon="📊" compact={isCompact} />
                            )}
                            {(reviewData.fideliteCultivarsOdeur || reviewData.fideliteCultivars) && (
                                <InfoCard label="Fidélité cultivar" value={`${reviewData.fideliteCultivarsOdeur || reviewData.fideliteCultivars}/10`} icon="🎯" compact={isCompact} />
                            )}
                        </div>
                    )}
                    {aromas.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Notes dominantes</span>
                            <div className="flex flex-wrap gap-1">
                                {aromas.slice(0, maxTags).map((a, i) => <TagPill key={i} label={a} color="pink" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                    {secondaryAromas.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Notes secondaires</span>
                            <div className="flex flex-wrap gap-1">
                                {secondaryAromas.slice(0, maxTags).map((a, i) => <TagPill key={i} label={a} color="purple" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── TERPENES ─────────────────────────────────────────────────────
        if (isVisible('terpenes') && terpenes.length > 0) {
            secs.push(
                <Section key="terpenes" title="Terpènes" icon="🧬" badge={`${terpenes.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className="flex flex-wrap gap-1">
                        {terpenes.slice(0, maxTags).map((t, i) => <TagPill key={i} label={t} color="cyan" compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── TASTES / GOÛTS ───────────────────────────────────────────────
        if (isVisible('tastes') && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0 || reviewData.intensiteGout || reviewData.intensiteFumee || reviewData.agressivite)) {
            secs.push(
                <Section key="tastes" title="Goûts" icon="👅" badge={`${tastes.length + dryPuffNotes.length + inhalationNotes.length + exhalationNotes.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    {(reviewData.intensiteGout || reviewData.intensiteFumee || reviewData.agressivite) && (
                        <div className={`grid ${gridCols} gap-2 mb-2`}>
                            {(reviewData.intensiteGout || reviewData.intensiteFumee) && (
                                <InfoCard label="Intensité" value={`${reviewData.intensiteGout || reviewData.intensiteFumee}/10`} icon="📊" compact={isCompact} />
                            )}
                            {reviewData.agressivite && (
                                <InfoCard label="Agressivité" value={`${reviewData.agressivite}/10`} icon="🌶️" compact={isCompact} />
                            )}
                        </div>
                    )}
                    {dryPuffNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Tirage à sec</span>
                            <div className="flex flex-wrap gap-1">{dryPuffNotes.slice(0, maxTags).map((t, i) => <TagPill key={i} label={t} color="amber" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {inhalationNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Inhalation</span>
                            <div className="flex flex-wrap gap-1">{inhalationNotes.slice(0, maxTags).map((t, i) => <TagPill key={i} label={t} color="blue" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {exhalationNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Expiration / Arrière-goût</span>
                            <div className="flex flex-wrap gap-1">{exhalationNotes.slice(0, maxTags).map((t, i) => <TagPill key={i} label={t} color="green" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {tastes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Saveurs</span>
                            <div className="flex flex-wrap gap-1">{tastes.slice(0, maxTags).map((t, i) => <TagPill key={i} label={t} color="amber" compact={isCompact} />)}</div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── EFFECTS ──────────────────────────────────────────────────────
        if (isVisible('effects') && (effects.length > 0 || reviewData.montee || reviewData.intensiteEffet || reviewData.intensiteEffets)) {
            secs.push(
                <Section key="effects" title="Effets ressentis" icon="⚡" badge={`${effects.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    {(reviewData.montee || reviewData.intensiteEffet || reviewData.intensiteEffets) && (
                        <div className={`grid ${gridCols} gap-2 mb-2`}>
                            {reviewData.montee && (
                                <InfoCard label="Montée" value={`${reviewData.montee}/10`} icon="🚀" compact={isCompact} />
                            )}
                            {(reviewData.intensiteEffet || reviewData.intensiteEffets) && (
                                <InfoCard label="Intensité" value={`${reviewData.intensiteEffet || reviewData.intensiteEffets}/10`} icon="💥" compact={isCompact} />
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                        {effects.slice(0, maxTags).map((e, i) => <TagPill key={i} label={e} color="purple" compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── CONSUMPTION EXPERIENCE ───────────────────────────────────────
        if (isVisible('consumption') && consumption) {
            secs.push(
                <Section key="consumption" title="Expérience de consommation" icon="🔥" defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {consumption.method && <InfoCard label="Méthode" value={consumption.method} icon="💨" compact={isCompact} />}
                        {consumption.dosage && <InfoCard label="Dosage" value={consumption.dosage} icon="⚖️" compact={isCompact} />}
                        {consumption.duration && <InfoCard label="Durée effets" value={consumption.duration} icon="⏱️" compact={isCompact} />}
                        {consumption.onset && <InfoCard label="Début effets" value={consumption.onset} icon="⚡" compact={isCompact} />}
                        {consumption.length && <InfoCard label="Longueur" value={consumption.length} icon="📏" compact={isCompact} />}
                        {consumption.preferredUse && <InfoCard label="Usage préféré" value={consumption.preferredUse} icon="🎯" compact={isCompact} />}
                    </div>
                    {consumption.profiles && consumption.profiles.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Profils d'effets</span>
                            <div className="flex flex-wrap gap-1">
                                {consumption.profiles.slice(0, maxTags).map((p, i) => <TagPill key={i} label={p} color="blue" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                    {consumption.sideEffects && consumption.sideEffects.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Effets secondaires</span>
                            <div className="flex flex-wrap gap-1">
                                {consumption.sideEffects.slice(0, maxTags).map((s, i) => <TagPill key={i} label={s} color="red" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── CULTURE METADATA (Flower) ────────────────────────────────────
        if (cultureInfo) {
            secs.push(
                <Section key="culture" title="Données de culture" icon="🌱" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {cultureInfo.mode && <InfoCard label="Mode" value={cultureInfo.mode} icon="🏠" compact={isCompact} />}
                        {cultureInfo.spaceType && <InfoCard label="Espace" value={cultureInfo.spaceType} icon="📐" compact={isCompact} />}
                        {cultureInfo.dimensions && <InfoCard label="Dimensions" value={cultureInfo.dimensions} icon="📏" compact={isCompact} />}
                        {cultureInfo.substrat && <InfoCard label="Substrat" value={cultureInfo.substrat} icon="🪴" compact={isCompact} />}
                        {cultureInfo.propagation && <InfoCard label="Propagation" value={cultureInfo.propagation} icon="🌱" compact={isCompact} />}
                        {cultureInfo.nbPlantes && <InfoCard label="Nb plantes" value={cultureInfo.nbPlantes} icon="🌿" compact={isCompact} />}
                        {cultureInfo.lightType && <InfoCard label="Lumière" value={cultureInfo.lightType} icon="💡" compact={isCompact} />}
                        {cultureInfo.lightPower && <InfoCard label="Puissance" value={`${cultureInfo.lightPower}W`} icon="⚡" compact={isCompact} />}
                        {cultureInfo.photoperiode && <InfoCard label="Photopériode" value={cultureInfo.photoperiode} icon="☀️" compact={isCompact} />}
                        {cultureInfo.ppfd && <InfoCard label="PPFD" value={`${cultureInfo.ppfd} µmol/m²/s`} icon="💡" compact={isCompact} />}
                        {cultureInfo.dli && <InfoCard label="DLI" value={`${cultureInfo.dli} mol/m²/j`} icon="🔆" compact={isCompact} />}
                        {cultureInfo.kelvin && <InfoCard label="Kelvin" value={`${cultureInfo.kelvin}K`} icon="🌡️" compact={isCompact} />}
                        {cultureInfo.season && <InfoCard label="Saison" value={cultureInfo.season} icon="🌤️" compact={isCompact} />}
                        {cultureInfo.duration && <InfoCard label="Durée" value={cultureInfo.duration} icon="📅" compact={isCompact} />}
                        {cultureInfo.startDate && <InfoCard label="Début" value={formatDate(cultureInfo.startDate)} icon="🗓️" compact={isCompact} />}
                        {cultureInfo.endDate && <InfoCard label="Fin" value={formatDate(cultureInfo.endDate)} icon="🏁" compact={isCompact} />}
                    </div>
                    {/* Environment sub-section */}
                    {(cultureInfo.tempMoy || cultureInfo.humMoy || cultureInfo.co2 || cultureInfo.irrigation || cultureInfo.engraisType || cultureInfo.palissage) && (
                        <div className="mt-2">
                            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-white/40 mb-1 block`}>🌡️ Environnement</span>
                            <div className={`grid ${gridCols} gap-2`}>
                                {cultureInfo.tempMoy && <InfoCard label="Temp. moy." value={`${cultureInfo.tempMoy}°C`} icon="🌡️" compact={isCompact} />}
                                {cultureInfo.humMoy && <InfoCard label="Humidité moy." value={`${cultureInfo.humMoy}%`} icon="💧" compact={isCompact} />}
                                {cultureInfo.co2 && <InfoCard label="CO₂" value={`${cultureInfo.co2} ppm`} icon="💨" compact={isCompact} />}
                                {cultureInfo.irrigation && <InfoCard label="Irrigation" value={cultureInfo.irrigation} icon="🚿" compact={isCompact} />}
                                {cultureInfo.engraisType && <InfoCard label="Engrais" value={cultureInfo.engraisType} icon="🧪" compact={isCompact} />}
                                {cultureInfo.engraisMarque && <InfoCard label="Marque engrais" value={cultureInfo.engraisMarque} icon="🏷️" compact={isCompact} />}
                                {cultureInfo.palissage && <InfoCard label="Palissage" value={cultureInfo.palissage} icon="🪢" compact={isCompact} />}
                            </div>
                        </div>
                    )}
                    {/* Morphology sub-section */}
                    {(cultureInfo.taillePlante || cultureInfo.nbBuds) && (
                        <div className="mt-2">
                            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-white/40 mb-1 block`}>🌿 Morphologie</span>
                            <div className={`grid ${gridCols} gap-2`}>
                                {cultureInfo.taillePlante && <InfoCard label="Taille" value={cultureInfo.taillePlante} icon="📏" compact={isCompact} />}
                                {cultureInfo.nbBuds && <InfoCard label="Buds" value={cultureInfo.nbBuds} icon="🌸" compact={isCompact} />}
                            </div>
                        </div>
                    )}
                    {/* Harvest sub-section */}
                    {(cultureInfo.poidsBrut || cultureInfo.poidsNet || cultureInfo.rendement || cultureInfo.modeRecolte || cultureInfo.trichomeColor || cultureInfo.rendementM2 || cultureInfo.rendementPlante) && (
                        <div className="mt-2">
                            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-white/40 mb-1 block`}>🌿 Récolte</span>
                            <div className={`grid ${gridCols} gap-2`}>
                                {cultureInfo.poidsBrut && <InfoCard label="Poids brut" value={`${cultureInfo.poidsBrut}g`} icon="⚖️" compact={isCompact} />}
                                {cultureInfo.poidsNet && <InfoCard label="Poids net" value={`${cultureInfo.poidsNet}g`} icon="⚖️" compact={isCompact} />}
                                {cultureInfo.rendement && <InfoCard label="Rendement" value={cultureInfo.rendement} icon="📊" compact={isCompact} />}
                                {cultureInfo.rendementM2 && <InfoCard label="g/m²" value={`${cultureInfo.rendementM2}g/m²`} icon="📊" compact={isCompact} />}
                                {cultureInfo.rendementPlante && <InfoCard label="g/plante" value={`${cultureInfo.rendementPlante}g`} icon="🌿" compact={isCompact} />}
                                {cultureInfo.modeRecolte && <InfoCard label="Mode récolte" value={cultureInfo.modeRecolte} icon="✂️" compact={isCompact} />}
                                {cultureInfo.trichomeColor && <InfoCard label="Trichomes" value={cultureInfo.trichomeColor} icon="🔍" compact={isCompact} />}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── CURING SPECIFICS ─────────────────────────────────────────────
        if (curingInfo) {
            secs.push(
                <Section key="curingInfo" title="Curing & Maturation" icon="🫙" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {curingInfo.type && <InfoCard label="Type" value={curingInfo.type} icon="🌡️" compact={isCompact} />}
                        {curingInfo.temp && <InfoCard label="Température" value={`${curingInfo.temp}°C`} icon="🌡️" compact={isCompact} />}
                        {curingInfo.humidity && <InfoCard label="Humidité" value={`${curingInfo.humidity}%`} icon="💧" compact={isCompact} />}
                        {curingInfo.duration && <InfoCard label="Durée" value={curingInfo.duration} icon="⏱️" compact={isCompact} />}
                        {curingInfo.interval && <InfoCard label="Intervalle" value={curingInfo.interval} icon="📏" compact={isCompact} />}
                        {curingInfo.recipientType && <InfoCard label="Récipient" value={curingInfo.recipientType} icon="🫙" compact={isCompact} />}
                        {curingInfo.emballage && <InfoCard label="Emballage" value={curingInfo.emballage} icon="📦" compact={isCompact} />}
                        {curingInfo.opacity && <InfoCard label="Opacité" value={curingInfo.opacity} icon="🔲" compact={isCompact} />}
                        {curingInfo.volume && <InfoCard label="Volume" value={curingInfo.volume} icon="📐" compact={isCompact} />}
                    </div>
                </Section>
            );
        }

        // ── SEPARATION (Hash) ────────────────────────────────────────────
        if (separationInfo) {
            secs.push(
                <Section key="separation" title="Séparation" icon="🔬" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {separationInfo.method && <InfoCard label="Méthode" value={separationInfo.method} icon="⚙️" compact={isCompact} />}
                        {separationInfo.passes && <InfoCard label="Nb de passes" value={separationInfo.passes} icon="🔄" compact={isCompact} />}
                        {separationInfo.waterTemp && <InfoCard label="Temp. eau" value={`${separationInfo.waterTemp}°C`} icon="🌡️" compact={isCompact} />}
                        {separationInfo.meshSize && <InfoCard label="Mailles" value={`${separationInfo.meshSize}µ`} icon="🕸️" compact={isCompact} />}
                        {separationInfo.rawMaterial && <InfoCard label="Matière première" value={separationInfo.rawMaterial} icon="🌿" compact={isCompact} />}
                        {separationInfo.rawQuality && <InfoCard label="Qualité matière" value={`${separationInfo.rawQuality}/10`} icon="⭐" compact={isCompact} />}
                        {separationInfo.yield && <InfoCard label="Rendement" value={`${separationInfo.yield}%`} icon="📊" compact={isCompact} />}
                        {separationInfo.duration && <InfoCard label="Durée" value={separationInfo.duration} icon="⏱️" compact={isCompact} />}
                    </div>
                </Section>
            );
        }

        // ── EXTRACTION (Concentrate) ─────────────────────────────────────
        if (extractionInfo) {
            secs.push(
                <Section key="extraction" title="Extraction" icon="⚗️" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {extractionInfo.method && <InfoCard label="Méthode" value={extractionInfo.method} icon="⚙️" compact={isCompact} />}
                        {extractionInfo.solvant && <InfoCard label="Solvant" value={extractionInfo.solvant} icon="🧪" compact={isCompact} />}
                        {extractionInfo.temp && <InfoCard label="Température" value={`${extractionInfo.temp}°C`} icon="🌡️" compact={isCompact} />}
                        {extractionInfo.pressure && <InfoCard label="Pression" value={extractionInfo.pressure} icon="🔧" compact={isCompact} />}
                        {extractionInfo.duration && <InfoCard label="Durée" value={extractionInfo.duration} icon="⏱️" compact={isCompact} />}
                    </div>
                </Section>
            );
        }

        // ── RECIPE (Edible) ──────────────────────────────────────────────
        if (recipeInfo) {
            secs.push(
                <Section key="recipe" title="Recette" icon="🍳" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    {(recipeInfo.typeComestible || recipeInfo.fabricant) && (
                        <div className={`grid ${gridCols} gap-2 mb-2`}>
                            {recipeInfo.typeComestible && <InfoCard label="Type" value={recipeInfo.typeComestible} icon="🍰" compact={isCompact} />}
                            {recipeInfo.fabricant && <InfoCard label="Fabricant" value={recipeInfo.fabricant} icon="🏭" compact={isCompact} />}
                        </div>
                    )}
                    {recipeInfo.ingredients.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Ingrédients</span>
                            <div className={`${isCompact ? 'space-y-0.5' : 'space-y-1'}`}>
                                {recipeInfo.ingredients.map((ing, i) => {
                                    const label = typeof ing === 'string' ? ing : (ing.name || ing.label || JSON.stringify(ing));
                                    const qty = typeof ing === 'object' ? `${ing.quantity || ''} ${ing.unit || ''}`.trim() : '';
                                    return (
                                        <div key={i} className={`flex items-center justify-between ${isCompact ? 'text-[11px]' : 'text-xs'} text-white/70`}>
                                            <span>{label}</span>
                                            {qty && <span className="text-white/40">{qty}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {recipeInfo.steps.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Étapes</span>
                            <div className="space-y-1">
                                {recipeInfo.steps.map((step, i) => (
                                    <div key={i} className={`flex gap-2 ${isCompact ? 'text-[11px]' : 'text-xs'} text-white/70`}>
                                        <span className="text-purple-400 font-bold">{i + 1}.</span>
                                        <span>{typeof step === 'string' ? step : (step.description || step.label || JSON.stringify(step))}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── PIPELINES ────────────────────────────────────────────────────
        if (isVisible('pipelines') && pipelines.length > 0) {
            secs.push(
                <Section key="pipelines" title="Pipelines" icon="⚗️" badge={`${pipelines.length}`} defaultOpen={!isCompact} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
                        {pipelines.map((pl, i) => (
                            <InteractivePipelineViewer
                                key={i}
                                pipeline={pl}
                                pipelineName={pl.name || pl.label || `Pipeline ${i + 1}`}
                                pipelineIcon={pl.icon || '⚗️'}
                                config={config}
                            />
                        ))}
                    </div>
                </Section>
            );
        }

        // ── DESCRIPTION ──────────────────────────────────────────────────
        if (isVisible('description') && reviewData.description) {
            secs.push(
                <Section key="description" title="Description" icon="📝" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-white/70 leading-relaxed whitespace-pre-wrap`}>{reviewData.description}</p>
                </Section>
            );
        }

        // ── CONCLUSION ───────────────────────────────────────────────────
        if (isVisible('conclusion') && reviewData.conclusion) {
            secs.push(
                <Section key="conclusion" title="Conclusion" icon="🏁" defaultOpen={false} compact={isCompact} sectionStyles={secStyles} forceOpen={sectionForceOpen}>
                    <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-white/70 leading-relaxed whitespace-pre-wrap`}>{reviewData.conclusion}</p>
                </Section>
            );
        }

        return secs;
    };

    const allSections = useMemo(buildSections, [
        reviewData, config, categoryRatings, pipelines, aromas, secondaryAromas,
        tastes, dryPuffNotes, inhalationNotes, exhalationNotes, effects, terpenes,
        cultivars, images, consumption, analytics, curingInfo, cultureInfo,
        separationInfo, extractionInfo, recipeInfo, genealogyData, textureData, visualData,
        isExportLike, isCompact, ls, tStyle,
        ratio, gridCols, secStyles
    ]);

    // ── Pagination useEffect (must be after allSections definition) ─────────
    // Runs for canvas capture (export) AND for preview-export when pagination is enabled
    const shouldPaginate = isCanvasCapture || (mode === 'preview-export' && paginationConfig.enabled);
    useEffect(() => {
        if (!shouldPaginate) return;
        setPaginationReady(false);
        const timer = setTimeout(paginateSections, 400);
        return () => clearTimeout(timer);
    }, [shouldPaginate, allSections, paginateSections]);

    // ── Right-column pagination useEffect (two-col layouts) ──────────────
    useEffect(() => {
        if (!shouldPaginate) return;
        setRightColReady(false);
        const timer = setTimeout(paginateRightCol, 450);
        return () => clearTimeout(timer);
    }, [shouldPaginate, allSections, paginateRightCol]);

    // ── Early return if no data (after ALL hooks) ────────────────────────────
    if (!reviewData) return (
        <div className="flex items-center justify-center h-full text-white/30">
            <p>Aucune donnée de review</p>
        </div>
    );

    // ── Common style props ───────────────────────────────────────────────────
    const rootStyle = {
        fontFamily: typo.fontFamily || 'Inter, system-ui, sans-serif',
        '--accent': colors.accent || '#a855f7',
        fontSize: isExportLike ? `${ls.baseFontPx}px` : undefined,
    };

    // ── Layout-strategy inline styles (numeric px) ──────────────────────────
    const lsPad = `${ls.pad}px`;
    const lsGap = `${ls.gap}px`;

    // ── Helper: render a single export page ────────────────────────────────
    const renderPage = (sectionIndices, pageNum, totalPgs, extraProps = {}) => {
        const pageSections = sectionIndices.map(i => allSections[i]).filter(Boolean);
        return (
            <div
                key={`page-${pageNum}`}
                id={isCanvasCapture ? `orchard-template-canvas${pageNum === 1 ? '' : `-${pageNum}`}` : undefined}
                data-width={rDims.width}
                data-height={rDims.height}
                data-ratio={ratio}
                data-page={pageNum}
                data-total-pages={totalPgs}
                className="orchard-export-page"
                style={{
                    ...rootStyle,
                    width: `${rDims.width}px`,
                    height: `${rDims.height}px`,
                    overflow: 'hidden',
                    position: 'relative',
                    background: colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
                    contain: 'layout style paint',
                    flexShrink: 0,
                }}
            >
                <div
                    className="w-full h-full overflow-hidden"
                    style={{
                        padding: lsPad,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: lsGap,
                        ...(extraProps.style || {}),
                    }}
                >
                    {extraProps.renderContent ? extraProps.renderContent(pageSections) : pageSections}
                </div>
                {/* Page number indicator */}
                {totalPgs > 1 && (
                    <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white/60 text-[10px] font-mono">
                        {pageNum}/{totalPgs}
                    </div>
                )}
                {/* Branding / Logo overlay */}
                <BrandingOverlay branding={config?.branding} />
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════════════════════
       PAGE NAVIGATION OVERLAY (preview-export paginated mode)
       ══════════════════════════════════════════════════════════════════════════ */
    const PageNavOverlay = ({ totalPages }) => {
        if (totalPages <= 1) return null;
        const safePage = Math.min(previewPage, totalPages - 1);
        return (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-1.5 px-4 bg-black/60 backdrop-blur-sm z-10">
                <button
                    onClick={() => setPreviewPage(Math.max(0, safePage - 1))}
                    disabled={safePage === 0}
                    className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPreviewPage(i)}
                            className={`w-5 h-5 rounded text-[9px] font-medium transition-all ${i === safePage ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setPreviewPage(Math.min(totalPages - 1, safePage + 1))}
                    disabled={safePage >= totalPages - 1}
                    className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════════════════════
       EXPORT LAYOUT — strategy-based branching
       ══════════════════════════════════════════════════════════════════════════ */
    if (isExportLike) {
        const layout = ls.layout; // 'hero' | 'two-col' | 'story' | 'grid' | 'single'

        // ── TWO-COLUMN layout (16:9 / 4:3 wide formats) ────────────────────
        if (layout === 'two-col') {
            const headerSection = allSections.find(s => s.key === 'header');
            const imageSection = allSections.find(s => s.key === 'image');
            const analyticsSection = allSections.find(s => s.key === 'analytics');
            const dataSections = allSections.filter(s => !['header', 'image', 'analytics'].includes(s.key));
            const leftW = ls.leftWidth || '42%';
            const bgColor = colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)';

            // preview-export: paginated two-col — one page at a time with nav
            if (mode === 'preview-export') {
                const totalRightPages = rightColReady && rightColPages.length > 0 ? rightColPages.length : 1;
                const safePage = Math.min(previewPage, totalRightPages - 1);
                const leftWidthFrac = parseFloat(leftW) / 100;
                const rightColWidthPx = Math.floor(rDims.width * (1 - leftWidthFrac) - ls.pad * 2 - ls.gap);
                const currentRightSections = rightColReady && rightColPages[safePage]
                    ? rightColPages[safePage].map(i => dataSections[i])
                    : dataSections;

                return (
                    <>
                        {/* Hidden measure container for right-column pagination */}
                        <div
                            ref={rightMeasureRef}
                            style={{
                                position: 'absolute', left: '-99999px', top: 0,
                                visibility: 'hidden', pointerEvents: 'none',
                                width: `${rightColWidthPx}px`,
                                display: 'flex', flexDirection: 'column', gap: lsGap,
                            }}
                        >
                            {dataSections}
                        </div>
                        <div
                            data-width={rDims.width}
                            data-height={rDims.height}
                            data-ratio={ratio}
                            className="orchard-export-page"
                            style={{
                                ...rootStyle,
                                width: `${rDims.width}px`,
                                height: `${rDims.height}px`,
                                overflow: 'hidden',
                                position: 'relative',
                                background: bgColor,
                                flexShrink: 0,
                            }}
                        >
                            {safePage === 0 ? (
                                /* Page 1: two-col with header/image left + data right */
                                <div style={{ padding: lsPad, display: 'flex', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                                    <div style={{ flexShrink: 0, width: leftW, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                        {headerSection}
                                        {analyticsSection}
                                        {imageSection && <div style={{ maxHeight: '30%', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>{imageSection}</div>}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                        {currentRightSections}
                                    </div>
                                </div>
                            ) : (
                                /* Pages 2+: single-column overflow for remaining right-col sections */
                                <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, height: '100%', overflow: 'hidden' }}>
                                    {currentRightSections}
                                </div>
                            )}
                            {totalRightPages > 1 && (
                                <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white/60 text-[10px] font-mono">
                                    {safePage + 1}/{totalRightPages}
                                </div>
                            )}
                            <BrandingOverlay branding={config?.branding} />
                            <PageNavOverlay totalPages={totalRightPages} />
                        </div>
                    </>
                );
            }

            // export (canvas capture): paginate right column across multiple pages
            const totalPages = rightColReady && rightColPages.length > 0 ? rightColPages.length : 1;
            const leftWidthFrac = parseFloat(leftW) / 100;
            const rightColWidthPx = Math.floor(rDims.width * (1 - leftWidthFrac) - ls.pad * 2 - ls.gap);

            return (
                <>
                    {/* Hidden measure container for right-column sections */}
                    <div
                        ref={rightMeasureRef}
                        style={{
                            position: 'absolute', left: '-99999px', top: 0,
                            visibility: 'hidden', pointerEvents: 'none',
                            width: `${rightColWidthPx}px`,
                            display: 'flex', flexDirection: 'column', gap: lsGap,
                        }}
                    >
                        {dataSections}
                    </div>

                    {/* Page 1: classic two-col */}
                    <div
                        id="orchard-template-canvas"
                        data-width={rDims.width}
                        data-height={rDims.height}
                        data-ratio={ratio}
                        data-page="1"
                        data-total-pages={totalPages}
                        className="orchard-export-page"
                        style={{
                            ...rootStyle,
                            width: `${rDims.width}px`,
                            height: `${rDims.height}px`,
                            overflow: 'hidden',
                            position: 'relative',
                            background: bgColor,
                            contain: 'layout style paint',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ padding: lsPad, display: 'flex', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                            <div style={{ flexShrink: 0, width: leftW, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                {headerSection}
                                {analyticsSection}
                                {imageSection && <div style={{ maxHeight: '30%', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>{imageSection}</div>}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                {rightColReady
                                    ? rightColPages[0]?.map(i => dataSections[i])
                                    : dataSections
                                }
                            </div>
                        </div>
                        {totalPages > 1 && (
                            <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white/60 text-[10px] font-mono">
                                1/{totalPages}
                            </div>
                        )}
                        <BrandingOverlay branding={config?.branding} />
                    </div>

                    {/* Pages 2+: single-column overflow for remaining right-col sections */}
                    {rightColReady && rightColPages.slice(1).map((group, pIdx) => (
                        <div
                            key={`twoCol-p${pIdx + 2}`}
                            id={`orchard-template-canvas-${pIdx + 2}`}
                            data-width={rDims.width}
                            data-height={rDims.height}
                            data-ratio={ratio}
                            data-page={pIdx + 2}
                            data-total-pages={totalPages}
                            className="orchard-export-page"
                            style={{
                                ...rootStyle,
                                width: `${rDims.width}px`,
                                height: `${rDims.height}px`,
                                overflow: 'hidden',
                                position: 'relative',
                                background: bgColor,
                                contain: 'layout style paint',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, height: '100%', overflow: 'hidden' }}>
                                {group.map(i => dataSections[i])}
                            </div>
                            <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white/60 text-[10px] font-mono">
                                {pIdx + 2}/{totalPages}
                            </div>
                            <BrandingOverlay branding={config?.branding} />
                        </div>
                    ))}
                </>
            );
        }

        // ── HERO layout (large hero image on top, content below — 1:1) ──────
        if (layout === 'hero') {
            const headerSection = allSections.find(s => s.key === 'header');
            const imageSection = allSections.find(s => s.key === 'image');
            const restSections = allSections.filter(s => !['header', 'image'].includes(s.key));

            // Hero mode: paginated preview-export — one page at a time
            if (mode === 'preview-export') {
                const totalPgs = paginationReady ? pages.length : 1;
                const safePg = Math.min(previewPage, totalPgs - 1);
                const currentPageSections = paginationReady && pages[safePg]
                    ? pages[safePg].map(i => allSections[i]).filter(Boolean)
                    : allSections;

                return (
                    <>
                        {/* Hidden measure container for page height calculation */}
                        <div
                            ref={measureRef}
                            style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                                {allSections}
                            </div>
                        </div>
                        <div
                            data-width={rDims.width}
                            data-height={rDims.height}
                            data-ratio={ratio}
                            style={{
                                ...rootStyle,
                                width: `${rDims.width}px`,
                                height: `${rDims.height}px`,
                                overflow: 'hidden',
                                position: 'relative',
                                background: colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                                {safePg === 0 && imageSection && <div style={{ maxHeight: '30%', overflow: 'hidden', borderRadius: '12px', flexShrink: 0 }}>{imageSection}</div>}
                                {currentPageSections}
                            </div>
                            <BrandingOverlay branding={config?.branding} />
                            <PageNavOverlay totalPages={totalPgs} />
                        </div>
                    </>
                );
            }

            // Hero mode with pagination (export capture)
            const totalPgs = paginationReady ? pages.length : 1;
            return (
                <>
                    <div
                        ref={measureRef}
                        style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                            {allSections}
                        </div>
                    </div>
                    {paginationReady && pages.length > 0
                        ? pages.map((sectionIndices, pIdx) =>
                            renderPage(sectionIndices, pIdx + 1, totalPgs)
                        )
                        : renderPage(allSections.map((_, i) => i), 1, 1)
                    }
                </>
            );
        }

        // ── STORY layout (vertical story — 9:16, tall & narrow) ──────────────
        if (layout === 'story') {
            const headerSection = allSections.find(s => s.key === 'header');
            const imageSection = allSections.find(s => s.key === 'image');
            const restSections = allSections.filter(s => !['header', 'image'].includes(s.key));

            if (mode === 'preview-export') {
                const totalPgs = paginationReady ? pages.length : 1;
                const safePg = Math.min(previewPage, totalPgs - 1);
                const currentPageSections = paginationReady && pages[safePg]
                    ? pages[safePg].map(i => allSections[i]).filter(Boolean)
                    : allSections;

                return (
                    <>
                        <div
                            ref={measureRef}
                            style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                                {allSections}
                            </div>
                        </div>
                        <div
                            data-width={rDims.width}
                            data-height={rDims.height}
                            data-ratio={ratio}
                            style={{
                                ...rootStyle,
                                width: `${rDims.width}px`,
                                height: `${rDims.height}px`,
                                overflow: 'hidden',
                                position: 'relative',
                                background: colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                                {safePg === 0 && imageSection && <div style={{ maxHeight: '25%', overflow: 'hidden', borderRadius: '10px', flexShrink: 0 }}>{imageSection}</div>}
                                {currentPageSections}
                            </div>
                            <BrandingOverlay branding={config?.branding} />
                            <PageNavOverlay totalPages={totalPgs} />
                        </div>
                    </>
                );
            }

            // Story with pagination
            const totalPgs = paginationReady ? pages.length : 1;
            return (
                <>
                    <div
                        ref={measureRef}
                        style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                            {allSections}
                        </div>
                    </div>
                    {paginationReady && pages.length > 0
                        ? pages.map((sectionIndices, pIdx) =>
                            renderPage(sectionIndices, pIdx + 1, totalPgs)
                        )
                        : renderPage(allSections.map((_, i) => i), 1, 1)
                    }
                </>
            );
        }

        // ── GRID layout (compact dense grid — modernCompact on small/square formats) ──
        if (layout === 'grid') {
            if (mode === 'preview-export') {
                const totalPgs = paginationReady ? pages.length : 1;
                const safePg = Math.min(previewPage, totalPgs - 1);
                const currentPageSections = paginationReady && pages[safePg]
                    ? pages[safePg].map(i => allSections[i]).filter(Boolean)
                    : allSections;

                return (
                    <>
                        <div
                            ref={measureRef}
                            style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                                {allSections}
                            </div>
                        </div>
                        <div
                            data-width={rDims.width}
                            data-height={rDims.height}
                            data-ratio={ratio}
                            style={{
                                ...rootStyle,
                                width: `${rDims.width}px`,
                                height: `${rDims.height}px`,
                                overflow: 'hidden',
                                position: 'relative',
                                background: colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                                {currentPageSections}
                            </div>
                            <BrandingOverlay branding={config?.branding} />
                            <PageNavOverlay totalPages={totalPgs} />
                        </div>
                    </>
                );
            }

            // Grid with pagination
            const totalPgs = paginationReady ? pages.length : 1;
            return (
                <>
                    <div
                        ref={measureRef}
                        style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                            {allSections}
                        </div>
                    </div>
                    {paginationReady && pages.length > 0
                        ? pages.map((sectionIndices, pIdx) =>
                            renderPage(sectionIndices, pIdx + 1, totalPgs)
                        )
                        : renderPage(allSections.map((_, i) => i), 1, 1)
                    }
                </>
            );
        }

        // ── SINGLE layout (default fallback — paginated single column) ──────
        if (mode === 'preview-export') {
            const totalPgs = paginationReady ? pages.length : 1;
            const safePg = Math.min(previewPage, totalPgs - 1);
            const currentPageSections = paginationReady && pages[safePg]
                ? pages[safePg].map(i => allSections[i]).filter(Boolean)
                : allSections;

            return (
                <>
                    <div
                        ref={measureRef}
                        style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                            {allSections}
                        </div>
                    </div>
                    <div
                        data-width={rDims.width}
                        data-height={rDims.height}
                        data-ratio={ratio}
                        style={{
                            ...rootStyle,
                            width: `${rDims.width}px`,
                            height: `${rDims.height}px`,
                            overflow: 'hidden',
                            position: 'relative',
                            background: colors.background || 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                            {currentPageSections}
                        </div>
                        <BrandingOverlay branding={config?.branding} />
                        <PageNavOverlay totalPages={totalPgs} />
                    </div>
                </>
            );
        }

        // Paginated single-column export
        const totalPgs = paginationReady ? pages.length : 1;
        return (
            <>
                <div
                    ref={measureRef}
                    style={{ ...rootStyle, width: `${rDims.width}px`, position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', padding: lsPad }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: lsGap }}>
                        {allSections}
                    </div>
                </div>
                {paginationReady && pages.length > 0
                    ? pages.map((sectionIndices, pIdx) =>
                        renderPage(sectionIndices, pIdx + 1, totalPgs)
                    )
                    : renderPage(allSections.map((_, i) => i), 1, 1)
                }
            </>
        );
    }

    /* ══════════════════════════════════════════════════════════════════════════
       PREVIEW MODE (fluid, scrollable or paginated)
       ══════════════════════════════════════════════════════════════════════════ */
    // Paginated preview: split sections into chunks based on paginationConfig
    if (paginationConfig.enabled && allSections.length > 0) {
        const perPage = Math.max(1, Math.ceil(allSections.length / Math.min(paginationConfig.maxPages || 9, allSections.length)));
        const previewPages = [];
        for (let i = 0; i < allSections.length; i += perPage) {
            previewPages.push(allSections.slice(i, i + perPage));
        }
        const totalPages = Math.min(previewPages.length, paginationConfig.maxPages || 9);
        const safePage = Math.min(previewPage, totalPages - 1);
        const currentSections = previewPages[safePage] || previewPages[0] || [];

        return (
            <div className="w-full h-full flex flex-col" style={rootStyle}>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className={`${tStyle.maxWidth} mx-auto px-4 py-6 ${tStyle.spacing}`}>
                        {currentSections}
                    </div>
                    <div className="relative">
                        <BrandingOverlay branding={config?.branding} />
                    </div>
                </div>
                {/* Pagination nav bar */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-[#0a0a12]/80 backdrop-blur-sm border-t border-white/10">
                        <button
                            onClick={() => setPreviewPage(Math.max(0, safePage - 1))}
                            disabled={safePage === 0}
                            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPreviewPage(i)}
                                    className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${i === safePage ? 'bg-purple-600 text-white shadow-md' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                >
                                    {paginationConfig.showPageNumbers !== false ? i + 1 : ''}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPreviewPage(Math.min(totalPages - 1, safePage + 1))}
                            disabled={safePage >= totalPages - 1}
                            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar" style={rootStyle}>
            <div className={`${tStyle.maxWidth} mx-auto px-4 py-6 ${tStyle.spacing}`}>
                {allSections}
            </div>
            {/* Branding overlay for preview mode */}
            <div className="relative">
                <BrandingOverlay branding={config?.branding} />
            </div>
        </div>
    );
}
