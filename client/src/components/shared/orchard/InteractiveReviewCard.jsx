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
    extractCategoryRatings, extractPipelines
} from '../../../utils/orchardHelpers';
import InteractivePipelineViewer from '../../gallery/InteractivePipelineViewer';
import { Star, ChevronDown, Eye, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

// ─── Section wrapper with expand/collapse ────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true, badge, compact, sectionKey }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div data-orchard-section={sectionKey || title} data-orchard-label={title} className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between ${compact ? 'px-3 py-2' : 'px-4 py-3'} bg-white/[0.04] hover:bg-white/[0.07] transition-colors`}
            >
                <div className="flex items-center gap-2">
                    <span className={compact ? 'text-sm' : 'text-lg'}>{icon}</span>
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-white`}>{title}</span>
                    {badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white/40`} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className={`${compact ? 'px-3 py-2 space-y-2' : 'px-4 py-3 space-y-3'}`}>{children}</div>
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
    return (
        <div data-orchard-score={label} data-orchard-label={label} className="flex items-center gap-2">
            {icon && <span className={`${compact ? 'text-[10px]' : 'text-xs'} w-4 text-center`}>{icon}</span>}
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-white/60 ${compact ? 'w-20' : 'w-28'} truncate`}>{label}</span>
            <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-white/10 overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                        background: percentage > 70
                            ? 'linear-gradient(90deg, #22c55e, #10b981)'
                            : percentage > 40
                                ? 'linear-gradient(90deg, #eab308, #f59e0b)'
                                : 'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                />
            </div>
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold text-white/80 w-6 text-right`}>{value}</span>
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
        <div className={`bg-white/5 rounded-lg ${compact ? 'p-2' : 'p-3'} border border-white/8`}>
            <span className={`${compact ? 'text-[9px]' : 'text-xs'} text-white/40 block mb-0.5`}>{icon} {label}</span>
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-white`}>
                {typeof value === 'string' || typeof value === 'number' ? value : String(value)}
            </span>
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
function ImageGallery({ images, mainImage, compact }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
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
                <div
                    className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-video'} rounded-xl overflow-hidden border border-white/10 cursor-pointer group`}
                    onClick={() => setLightboxIdx(0)}
                >
                    <img src={allImages[0]} alt="Review" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                    </div>
                    {allImages.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-xs font-medium">
                            1/{allImages.length}
                        </span>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto pb-0.5">
                        {allImages.slice(1, 5).map((img, i) => (
                            <div
                                key={i}
                                className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer hover:border-purple-500/50 transition-colors`}
                                onClick={() => setLightboxIdx(i + 1)}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
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
const RATIO_DIMENSIONS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
};

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT STRATEGIES — per template × ratio combination
// Each entry controls: layout type, font sizes, padding, columns, compactness
// ═══════════════════════════════════════════════════════════════════════════
const FALLBACK_LAYOUT = { layout: 'single', cols: 1, pad: 'p-6', gap: 'space-y-4', headerSize: 'text-2xl', baseFontPx: 16, compact: false, imagePos: 'top' };

const LAYOUT_STRATEGIES = {
    // ── MODERNE COMPACT ──────────────────────────────────────────────────
    modernCompact: {
        '1:1': { layout: 'hero', cols: 1, pad: 'p-6', gap: 'space-y-4', headerSize: 'text-2xl', baseFontPx: 15, compact: true, imagePos: 'hero' },
        '16:9': { layout: 'two-col', cols: 2, pad: 'p-8', gap: 'space-y-4', headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'left', leftWidth: '45%' },
        '9:16': { layout: 'story', cols: 1, pad: 'p-6', gap: 'space-y-3', headerSize: 'text-2xl', baseFontPx: 18, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'two-col', cols: 2, pad: 'p-7', gap: 'space-y-3', headerSize: 'text-2xl', baseFontPx: 16, compact: false, imagePos: 'left', leftWidth: '40%' },
        'A4': { layout: 'single', cols: 1, pad: 'p-10', gap: 'space-y-5', headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'top' },
    },
    // ── FICHE TECHNIQUE DÉTAILLÉE ────────────────────────────────────────
    detailedCard: {
        '1:1': { layout: 'grid', cols: 1, pad: 'p-5', gap: 'space-y-3', headerSize: 'text-xl', baseFontPx: 14, compact: true, imagePos: 'inline' },
        '16:9': { layout: 'two-col', cols: 2, pad: 'p-8', gap: 'space-y-4', headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'left', leftWidth: '38%' },
        '9:16': { layout: 'single', cols: 1, pad: 'p-7', gap: 'space-y-4', headerSize: 'text-2xl', baseFontPx: 18, compact: false, imagePos: 'top' },
        '4:3': { layout: 'two-col', cols: 2, pad: 'p-7', gap: 'space-y-4', headerSize: 'text-2xl', baseFontPx: 17, compact: false, imagePos: 'left', leftWidth: '42%' },
        'A4': { layout: 'single', cols: 1, pad: 'p-10', gap: 'space-y-5', headerSize: 'text-4xl', baseFontPx: 20, compact: false, imagePos: 'top' },
    },
    // ── ARTICLE DE BLOG ──────────────────────────────────────────────────
    blogArticle: {
        '1:1': { layout: 'single', cols: 1, pad: 'p-6', gap: 'space-y-4', headerSize: 'text-2xl', baseFontPx: 15, compact: false, imagePos: 'top' },
        '16:9': { layout: 'two-col', cols: 2, pad: 'p-10', gap: 'space-y-5', headerSize: 'text-4xl', baseFontPx: 20, compact: false, imagePos: 'left', leftWidth: '45%' },
        '9:16': { layout: 'single', cols: 1, pad: 'p-8', gap: 'space-y-5', headerSize: 'text-3xl', baseFontPx: 20, compact: false, imagePos: 'hero' },
        '4:3': { layout: 'two-col', cols: 2, pad: 'p-8', gap: 'space-y-4', headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'left', leftWidth: '40%' },
        'A4': { layout: 'single', cols: 1, pad: 'p-12', gap: 'space-y-6', headerSize: 'text-5xl', baseFontPx: 22, compact: false, imagePos: 'top' },
    },
    // ── STORY SOCIAL MEDIA ───────────────────────────────────────────────
    socialStory: {
        '1:1': { layout: 'hero', cols: 1, pad: 'p-5', gap: 'space-y-3', headerSize: 'text-xl', baseFontPx: 14, compact: true, imagePos: 'hero' },
        '16:9': { layout: 'two-col', cols: 2, pad: 'p-6', gap: 'space-y-3', headerSize: 'text-2xl', baseFontPx: 16, compact: true, imagePos: 'left', leftWidth: '50%' },
        '9:16': { layout: 'story', cols: 1, pad: 'p-5', gap: 'space-y-3', headerSize: 'text-2xl', baseFontPx: 20, compact: true, imagePos: 'hero' },
        '4:3': { layout: 'hero', cols: 1, pad: 'p-6', gap: 'space-y-3', headerSize: 'text-2xl', baseFontPx: 16, compact: true, imagePos: 'hero' },
        'A4': { layout: 'single', cols: 1, pad: 'p-8', gap: 'space-y-4', headerSize: 'text-3xl', baseFontPx: 18, compact: false, imagePos: 'top' },
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
        if (reviewData.consumptionMethod) c.method = reviewData.consumptionMethod;
        if (reviewData.dosage) c.dosage = `${reviewData.dosage}${reviewData.dosageUnit ? ' ' + reviewData.dosageUnit : ' g'}`;
        if (reviewData.effectDuration) c.duration = reviewData.effectDuration;
        if (reviewData.effectOnset) c.onset = reviewData.effectOnset;
        if (reviewData.effectLength) c.length = reviewData.effectLength;
        if (reviewData.preferredUse) c.preferredUse = reviewData.preferredUse;
        const profiles = asArray(reviewData.effectProfiles).map(extractLabel).filter(Boolean);
        if (profiles.length) c.profiles = profiles;
        const sideFx = asArray(reviewData.sideEffects).map(extractLabel).filter(Boolean);
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
        return Object.keys(c).length > 0 ? c : null;
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

    // ── Config & style resolution ────────────────────────────────────────────
    const cm = config?.contentModules || {};
    const colors = config?.colors || {};
    const typo = config?.typography || {};
    const templateId = config?.template || 'modernCompact';
    const tStyle = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.modernCompact;
    const ratio = config?.ratio || '1:1';
    const rDims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    const rStyle = RATIO_STYLES[ratio] || RATIO_STYLES['1:1'];
    const ls = getLayoutStrategy(templateId, ratio); // layout strategy for this template+ratio
    const isExportLike = mode === 'export' || mode === 'preview-export';
    const isCanvasCapture = mode === 'export';
    const isCompact = isExportLike ? ls.compact : tStyle.compact;

    // ── Pagination (export capture mode only: distribute sections across pages) ──
    const measureRef = useRef(null);
    const [pages, setPages] = useState([]);
    const [paginationReady, setPaginationReady] = useState(false);

    // Measure sections and distribute into pages after initial render
    const paginateSections = useCallback(() => {
        if (!isCanvasCapture || !measureRef.current) return;
        const container = measureRef.current;
        const children = Array.from(container.children);
        if (children.length === 0) return;

        const pageH = rDims.height;
        // Use layout strategy numeric values directly
        const padPx = ls.pad * 2;
        const usableH = pageH - padPx;
        const gapPx = ls.gap;

        const result = [[]];
        let currentH = 0;
        let pageIdx = 0;

        children.forEach((child, i) => {
            const h = child.getBoundingClientRect().height;
            const gap = i > 0 ? gapPx : 0;
            if (currentH + h + gap > usableH && result[pageIdx].length > 0) {
                // Start new page
                pageIdx++;
                result.push([]);
                currentH = 0;
            }
            result[pageIdx].push(i);
            currentH += h + gap;
        });

        setPages(result);
        setPaginationReady(true);
    }, [isCanvasCapture, rDims.height, ls.pad, ls.gap]);

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
                        {cultivars.map((c, i) => <TagPill key={i} label={c} color="green" compact={isCompact} />)}
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
            secs.push(<div key="image"><ImageGallery images={images} mainImage={mainImageUrl} compact={isCompact} /></div>);
        }

        // ── ANALYTICS (Cannabinoids) ─────────────────────────────────────
        if (isVisible('analytics') && analytics) {
            const count = Object.keys(analytics).filter(k => k !== 'labUrl').length;
            secs.push(
                <Section key="analytics" title="Analyses & Cannabinoïdes" icon="🧪" defaultOpen={!isCompact} badge={`${count}`} compact={isCompact}>
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
                <Section key="genetics" title="Génétique" icon="🧬" defaultOpen={!isCompact} compact={isCompact}>
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

        // ── CATEGORY RATINGS ─────────────────────────────────────────────
        if (isVisible('categoryRatings') && categoryRatings.length > 0) {
            secs.push(
                <Section key="catRatings" title="Notes par catégorie" icon="📊" badge={`${categoryRatings.length} cat.`} defaultOpen={!isCompact} compact={isCompact}>
                    <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
                        {categoryRatings.map(cat => <CategoryCard key={cat.key} cat={cat} compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── AROMAS ───────────────────────────────────────────────────────
        if (isVisible('aromas') && (aromas.length > 0 || secondaryAromas.length > 0)) {
            secs.push(
                <Section key="aromas" title="Arômes" icon="👃" badge={`${aromas.length + secondaryAromas.length}`} defaultOpen={!isCompact} compact={isCompact}>
                    {aromas.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Notes dominantes</span>
                            <div className="flex flex-wrap gap-1">
                                {aromas.map((a, i) => <TagPill key={i} label={a} color="pink" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                    {secondaryAromas.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Notes secondaires</span>
                            <div className="flex flex-wrap gap-1">
                                {secondaryAromas.map((a, i) => <TagPill key={i} label={a} color="purple" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── TERPENES ─────────────────────────────────────────────────────
        if (isVisible('terpenes') && terpenes.length > 0) {
            secs.push(
                <Section key="terpenes" title="Terpènes" icon="🧬" badge={`${terpenes.length}`} defaultOpen={!isCompact} compact={isCompact}>
                    <div className="flex flex-wrap gap-1">
                        {terpenes.map((t, i) => <TagPill key={i} label={t} color="cyan" compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── TASTES / GOÛTS ───────────────────────────────────────────────
        if (isVisible('tastes') && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0)) {
            secs.push(
                <Section key="tastes" title="Goûts" icon="👅" badge={`${tastes.length + dryPuffNotes.length + inhalationNotes.length + exhalationNotes.length}`} defaultOpen={!isCompact} compact={isCompact}>
                    {dryPuffNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Tirage à sec</span>
                            <div className="flex flex-wrap gap-1">{dryPuffNotes.map((t, i) => <TagPill key={i} label={t} color="amber" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {inhalationNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Inhalation</span>
                            <div className="flex flex-wrap gap-1">{inhalationNotes.map((t, i) => <TagPill key={i} label={t} color="blue" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {exhalationNotes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Expiration / Arrière-goût</span>
                            <div className="flex flex-wrap gap-1">{exhalationNotes.map((t, i) => <TagPill key={i} label={t} color="green" compact={isCompact} />)}</div>
                        </div>
                    )}
                    {tastes.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Saveurs</span>
                            <div className="flex flex-wrap gap-1">{tastes.map((t, i) => <TagPill key={i} label={t} color="amber" compact={isCompact} />)}</div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── EFFECTS ──────────────────────────────────────────────────────
        if (isVisible('effects') && effects.length > 0) {
            secs.push(
                <Section key="effects" title="Effets ressentis" icon="⚡" badge={`${effects.length}`} defaultOpen={!isCompact} compact={isCompact}>
                    <div className="flex flex-wrap gap-1">
                        {effects.map((e, i) => <TagPill key={i} label={e} color="purple" compact={isCompact} />)}
                    </div>
                </Section>
            );
        }

        // ── CONSUMPTION EXPERIENCE ───────────────────────────────────────
        if (isVisible('consumption') && consumption) {
            secs.push(
                <Section key="consumption" title="Expérience de consommation" icon="🔥" defaultOpen={!isCompact} compact={isCompact}>
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
                                {consumption.profiles.map((p, i) => <TagPill key={i} label={p} color="blue" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                    {consumption.sideEffects && consumption.sideEffects.length > 0 && (
                        <div>
                            <span className="text-[10px] text-white/40 mb-1 block">Effets secondaires</span>
                            <div className="flex flex-wrap gap-1">
                                {consumption.sideEffects.map((s, i) => <TagPill key={i} label={s} color="red" compact={isCompact} />)}
                            </div>
                        </div>
                    )}
                </Section>
            );
        }

        // ── CULTURE METADATA (Flower) ────────────────────────────────────
        if (cultureInfo) {
            secs.push(
                <Section key="culture" title="Données de culture" icon="🌱" defaultOpen={false} compact={isCompact}>
                    <div className={`grid ${gridCols} gap-2`}>
                        {cultureInfo.mode && <InfoCard label="Mode" value={cultureInfo.mode} icon="🏠" compact={isCompact} />}
                        {cultureInfo.spaceType && <InfoCard label="Espace" value={cultureInfo.spaceType} icon="📐" compact={isCompact} />}
                        {cultureInfo.dimensions && <InfoCard label="Dimensions" value={cultureInfo.dimensions} icon="📏" compact={isCompact} />}
                        {cultureInfo.substrat && <InfoCard label="Substrat" value={cultureInfo.substrat} icon="🪴" compact={isCompact} />}
                        {cultureInfo.propagation && <InfoCard label="Propagation" value={cultureInfo.propagation} icon="🌱" compact={isCompact} />}
                        {cultureInfo.lightType && <InfoCard label="Lumière" value={cultureInfo.lightType} icon="💡" compact={isCompact} />}
                        {cultureInfo.lightPower && <InfoCard label="Puissance" value={`${cultureInfo.lightPower}W`} icon="⚡" compact={isCompact} />}
                        {cultureInfo.season && <InfoCard label="Saison" value={cultureInfo.season} icon="🌤️" compact={isCompact} />}
                        {cultureInfo.duration && <InfoCard label="Durée" value={cultureInfo.duration} icon="📅" compact={isCompact} />}
                        {cultureInfo.startDate && <InfoCard label="Début" value={formatDate(cultureInfo.startDate)} icon="🗓️" compact={isCompact} />}
                        {cultureInfo.endDate && <InfoCard label="Fin" value={formatDate(cultureInfo.endDate)} icon="🏁" compact={isCompact} />}
                    </div>
                    {/* Harvest sub-section */}
                    {(cultureInfo.poidsBrut || cultureInfo.poidsNet || cultureInfo.rendement || cultureInfo.modeRecolte || cultureInfo.trichomeColor) && (
                        <div className="mt-2">
                            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-white/40 mb-1 block`}>🌿 Récolte</span>
                            <div className={`grid ${gridCols} gap-2`}>
                                {cultureInfo.poidsBrut && <InfoCard label="Poids brut" value={`${cultureInfo.poidsBrut}g`} icon="⚖️" compact={isCompact} />}
                                {cultureInfo.poidsNet && <InfoCard label="Poids net" value={`${cultureInfo.poidsNet}g`} icon="⚖️" compact={isCompact} />}
                                {cultureInfo.rendement && <InfoCard label="Rendement" value={cultureInfo.rendement} icon="📊" compact={isCompact} />}
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
                <Section key="curingInfo" title="Curing & Maturation" icon="🫙" defaultOpen={false} compact={isCompact}>
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
                <Section key="separation" title="Séparation" icon="🔬" defaultOpen={false} compact={isCompact}>
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
                <Section key="extraction" title="Extraction" icon="⚗️" defaultOpen={false} compact={isCompact}>
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
                <Section key="recipe" title="Recette" icon="🍳" defaultOpen={false} compact={isCompact}>
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
                <Section key="pipelines" title="Pipelines" icon="⚗️" badge={`${pipelines.length}`} defaultOpen={!isCompact} compact={isCompact}>
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
                <Section key="description" title="Description" icon="📝" defaultOpen={false} compact={isCompact}>
                    <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-white/70 leading-relaxed whitespace-pre-wrap`}>{reviewData.description}</p>
                </Section>
            );
        }

        // ── CONCLUSION ───────────────────────────────────────────────────
        if (isVisible('conclusion') && reviewData.conclusion) {
            secs.push(
                <Section key="conclusion" title="Conclusion" icon="🏁" defaultOpen={false} compact={isCompact}>
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
        separationInfo, extractionInfo, recipeInfo, isExportLike, isCompact, ls, tStyle,
        ratio, gridCols
    ]);

    // ── Pagination useEffect (must be after allSections definition) ─────────
    useEffect(() => {
        if (!isCanvasCapture) return;
        setPaginationReady(false);
        const timer = setTimeout(paginateSections, 400);
        return () => clearTimeout(timer);
    }, [isCanvasCapture, allSections, paginateSections]);

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
                {/* Watermark */}
                {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                    <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                        {config.branding.watermarkText}
                    </div>
                )}
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

            const renderTwoCol = () => (
                <div
                    id={isCanvasCapture ? 'orchard-template-canvas' : undefined}
                    data-width={rDims.width}
                    data-height={rDims.height}
                    data-ratio={ratio}
                    data-page="1"
                    data-total-pages="1"
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
                    <div style={{ padding: lsPad, display: 'flex', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                        {/* Left column */}
                        <div style={{ flexShrink: 0, width: leftW, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                            {headerSection}
                            {analyticsSection}
                            {imageSection}
                        </div>
                        {/* Right column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                            {dataSections}
                        </div>
                    </div>
                    {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                        <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                            {config.branding.watermarkText}
                        </div>
                    )}
                </div>
            );

            // For preview-export (miniature), identical but no canvas id
            return renderTwoCol();
        }

        // ── HERO layout (large hero image on top, content below — 1:1) ──────
        if (layout === 'hero') {
            const headerSection = allSections.find(s => s.key === 'header');
            const imageSection = allSections.find(s => s.key === 'image');
            const restSections = allSections.filter(s => !['header', 'image'].includes(s.key));

            // Hero mode: image takes ~35% of height, data grid fills the rest
            if (mode === 'preview-export') {
                return (
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
                            contain: 'layout style paint',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                            {headerSection}
                            {imageSection && <div style={{ maxHeight: '30%', overflow: 'hidden', borderRadius: '12px' }}>{imageSection}</div>}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                {restSections}
                            </div>
                        </div>
                        {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                            <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                                {config.branding.watermarkText}
                            </div>
                        )}
                    </div>
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
                return (
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
                            contain: 'layout style paint',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                            {headerSection}
                            {imageSection && <div style={{ maxHeight: '25%', overflow: 'hidden', borderRadius: '10px' }}>{imageSection}</div>}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: lsGap, overflow: 'hidden' }}>
                                {restSections}
                            </div>
                        </div>
                        {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                            <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                                {config.branding.watermarkText}
                            </div>
                        )}
                    </div>
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
                return (
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
                            contain: 'layout style paint',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                            {allSections}
                        </div>
                        {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                            <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                                {config.branding.watermarkText}
                            </div>
                        )}
                    </div>
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
            return (
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
                        contain: 'layout style paint',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ padding: lsPad, display: 'flex', flexDirection: 'column', gap: lsGap, width: '100%', height: '100%', overflow: 'hidden' }}>
                        {allSections}
                    </div>
                    {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                        <div className="absolute bottom-2 left-3 text-[10px] text-white/15 font-medium">
                            {config.branding.watermarkText}
                        </div>
                    )}
                </div>
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
       PREVIEW MODE (fluid, scrollable)
       ══════════════════════════════════════════════════════════════════════════ */
    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar" style={rootStyle}>
            <div className={`${tStyle.maxWidth} mx-auto px-4 py-6 ${tStyle.spacing}`}>
                {allSections}

                {/* Watermark */}
                {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                    <div className="text-center py-3 text-xs text-white/20">
                        {config.branding.watermarkText}
                    </div>
                )}
            </div>
        </div>
    );
}
