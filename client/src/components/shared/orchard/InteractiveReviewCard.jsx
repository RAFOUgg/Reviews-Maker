/**
 * InteractiveReviewCard — Responsive, interactive HTML review renderer
 * 
 * Replaces the CSS-scaled fixed-pixel template canvas in the OrchardPanel preview.
 * This component renders review data as rich, interactive HTML:
 *   - Expandable sections (click to show/hide details)
 *   - Interactive pipeline viewer (calendar grid + detail panels)
 *   - Hover tooltips, clickable tags
 *   - Responsive layout (adapts to container)
 * 
 * Used in: OrchardPanel preview, public gallery, library
 * Image export still uses TemplateRenderer (only at export time).
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import {
    asArray, extractLabel, formatRating, formatDate,
    extractCategoryRatings, extractPipelines
} from '../../../utils/orchardHelpers';
import InteractivePipelineViewer from '../../gallery/InteractivePipelineViewer';
import { Star, ChevronDown, ChevronUp, Eye, Droplets, Wind, Flame, Sparkles, Leaf, FlaskConical, Info, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Section wrapper with expand/collapse ────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true, badge, accentColor }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-semibold text-white">{title}</span>
                    {badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/40" />
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
                        <div className="px-4 py-3 space-y-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Star rating display ─────────────────────────────────────────────────────
function Stars({ value, max = 10 }) {
    const stars = 5;
    const filled = Math.round((value / max) * stars);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: stars }, (_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < filled ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                />
            ))}
            <span className="ml-1.5 text-sm font-bold text-white">{value}/10</span>
        </div>
    );
}

// ─── Score bar for individual metrics ────────────────────────────────────────
function ScoreBar({ label, value, icon }) {
    const percentage = Math.min(100, (value / 10) * 100);
    return (
        <div className="flex items-center gap-3">
            {icon && <span className="text-xs w-5 text-center">{icon}</span>}
            <span className="text-xs text-white/60 w-28 truncate">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
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
            <span className="text-xs font-semibold text-white/80 w-8 text-right">{value}</span>
        </div>
    );
}

// ─── Tag pill ────────────────────────────────────────────────────────────────
function TagPill({ label, color = 'purple' }) {
    const colorMap = {
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${colorMap[color] || colorMap.purple}`}>
            {label}
        </span>
    );
}

// ─── Image gallery with lightbox ─────────────────────────────────────────────
function ImageGallery({ images, mainImage }) {
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
        <div className="aspect-video rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center">
            <div className="text-center text-white/30">
                <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                <span className="text-sm">Pas d'image</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Main image + thumbnails */}
            <div className="space-y-2">
                <div
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer group"
                    onClick={() => setLightboxIdx(0)}
                >
                    <img src={allImages[0]} alt="Review" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                    </div>
                    {allImages.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-xs font-medium">
                            1/{allImages.length}
                        </span>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {allImages.slice(1, 5).map((img, i) => (
                            <div
                                key={i}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer hover:border-purple-500/50 transition-colors"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center"
                        onClick={() => setLightboxIdx(null)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        {lightboxIdx > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                                className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        {lightboxIdx < allImages.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                                className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                        <img
                            src={allImages[lightboxIdx]}
                            alt=""
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Category rating card with expandable sub-details ────────────────────────
function CategoryCard({ cat }) {
    const [expanded, setExpanded] = useState(false);
    const iconMap = { visual: '👁️', smell: '👃', texture: '✋', taste: '👅', effects: '⚡' };

    return (
        <div
            className={`rounded-xl border transition-all cursor-pointer ${expanded ? 'bg-white/[0.06] border-purple-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'}`}
            onClick={() => cat.subDetails && setExpanded(!expanded)}
        >
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-base">{iconMap[cat.key] || '📊'}</span>
                    <span className="text-sm font-medium text-white">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Stars value={cat.value} />
                    {cat.subDetails && (
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                            <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                        </motion.div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {expanded && cat.subDetails && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-1.5">
                            {cat.subDetails.map(sub => (
                                <ScoreBar key={sub.key} label={sub.label} value={sub.value} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function InteractiveReviewCard({ mode = 'preview' }) {
    const config = useOrchardStore(s => s.config);
    const reviewData = useOrchardStore(s => s.reviewData);

    // Extract data using existing helpers (all guarded for null reviewData)
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

    const cm = config?.contentModules || {};
    const colors = config?.colors || {};
    const typo = config?.typography || {};

    if (!reviewData) return (
        <div className="flex items-center justify-center h-full text-white/30">
            <p>Aucune donnée de review</p>
        </div>
    );

    const title = reviewData.title || reviewData.holderName || reviewData.productName || 'Sans titre';
    const rating = parseFloat(reviewData.rating || reviewData.overallRating || reviewData.note || 0);
    const rawAuthor = reviewData.author || reviewData.ownerName || 'Anonyme';
    const author = (typeof rawAuthor === 'object' && rawAuthor !== null) ? (rawAuthor.username || rawAuthor.name || 'Anonyme') : rawAuthor;
    const type = reviewData.type || reviewData.category || '';
    const typeLabels = { flower: 'Fleurs', hash: 'Hash', concentrate: 'Concentré', edible: 'Comestible' };
    const mainImageUrl = reviewData.mainImageUrl || reviewData.imageUrl;

    // Check module visibility
    const isVisible = (key) => cm[key] !== false;

    return (
        <div
            className="w-full h-full overflow-y-auto custom-scrollbar"
            style={{
                fontFamily: typo.fontFamily || 'Inter, system-ui, sans-serif',
                '--accent': colors.accent || '#a855f7',
            }}
        >
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

                {/* ─── HEADER ─────────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Type badge + title */}
                    {(isVisible('type') || isVisible('category')) && type && (
                        <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider">
                            {typeLabels[type] || type}
                        </span>
                    )}

                    {isVisible('title') && (
                        <h1
                            className="text-2xl font-bold text-white leading-tight"
                            style={{
                                fontFamily: typo.fontFamily,
                                fontWeight: typo.titleWeight || '700',
                                color: typo.titleColor || '#fff',
                            }}
                        >
                            {title}
                        </h1>
                    )}

                    {/* Meta line: author, date, cultivars */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                        {isVisible('author') && author && (
                            <span className="flex items-center gap-1">
                                <Leaf className="w-3.5 h-3.5" /> {author}
                            </span>
                        )}
                        {isVisible('date') && reviewData.createdAt && (
                            <span>· {formatDate(reviewData.createdAt)}</span>
                        )}
                        {isVisible('farm') && reviewData.farm && (
                            <span>· 🌾 {reviewData.farm}</span>
                        )}
                        {isVisible('hashmaker') && reviewData.hashmaker && (
                            <span>· ⚗️ {reviewData.hashmaker}</span>
                        )}
                    </div>

                    {/* Cultivars */}
                    {isVisible('cultivarsList') && cultivars.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {cultivars.map((c, i) => <TagPill key={i} label={c} color="green" />)}
                        </div>
                    )}

                    {/* Overall rating */}
                    {isVisible('rating') && rating > 0 && (
                        <div className="flex items-center gap-3 py-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center">
                                <span className="text-xl font-black text-yellow-400">{rating.toFixed(1)}</span>
                            </div>
                            <div>
                                <Stars value={rating} />
                                <span className="text-xs text-white/40 mt-0.5 block">Note globale</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── IMAGE ──────────────────────────────────────────── */}
                {isVisible('image') && (
                    <ImageGallery images={images} mainImage={mainImageUrl} />
                )}

                {/* ─── CATEGORY RATINGS ────────────────────────────────── */}
                {isVisible('categoryRatings') && categoryRatings.length > 0 && (
                    <Section title="Notes par catégorie" icon="📊" badge={`${categoryRatings.length} cat.`}>
                        <div className="space-y-2">
                            {categoryRatings.map(cat => (
                                <CategoryCard key={cat.key} cat={cat} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* ─── AROMAS / ODEURS ────────────────────────────────── */}
                {isVisible('aromas') && (aromas.length > 0 || secondaryAromas.length > 0) && (
                    <Section title="Arômes" icon="👃" badge={`${aromas.length + secondaryAromas.length}`}>
                        {aromas.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Notes dominantes</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {aromas.map((a, i) => <TagPill key={i} label={a} color="pink" />)}
                                </div>
                            </div>
                        )}
                        {secondaryAromas.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Notes secondaires</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {secondaryAromas.map((a, i) => <TagPill key={i} label={a} color="purple" />)}
                                </div>
                            </div>
                        )}
                    </Section>
                )}

                {/* ─── TERPENES ────────────────────────────────────────── */}
                {isVisible('terpenes') && terpenes.length > 0 && (
                    <Section title="Terpènes" icon="🧬" badge={`${terpenes.length}`}>
                        <div className="flex flex-wrap gap-1.5">
                            {terpenes.map((t, i) => <TagPill key={i} label={t} color="cyan" />)}
                        </div>
                    </Section>
                )}

                {/* ─── TASTES / GOÛTS ─────────────────────────────────── */}
                {(isVisible('tastes') && (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0)) && (
                    <Section title="Goûts" icon="👅" badge={`${tastes.length + dryPuffNotes.length + inhalationNotes.length + exhalationNotes.length}`}>
                        {dryPuffNotes.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Tirage à sec</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {dryPuffNotes.map((t, i) => <TagPill key={i} label={t} color="amber" />)}
                                </div>
                            </div>
                        )}
                        {inhalationNotes.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Inhalation</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {inhalationNotes.map((t, i) => <TagPill key={i} label={t} color="blue" />)}
                                </div>
                            </div>
                        )}
                        {exhalationNotes.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Expiration / Arrière-goût</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {exhalationNotes.map((t, i) => <TagPill key={i} label={t} color="green" />)}
                                </div>
                            </div>
                        )}
                        {tastes.length > 0 && (
                            <div>
                                <span className="text-xs text-white/40 mb-1.5 block">Saveurs</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tastes.map((t, i) => <TagPill key={i} label={t} color="amber" />)}
                                </div>
                            </div>
                        )}
                    </Section>
                )}

                {/* ─── EFFECTS ────────────────────────────────────────── */}
                {isVisible('effects') && effects.length > 0 && (
                    <Section title="Effets ressentis" icon="⚡" badge={`${effects.length}`}>
                        <div className="flex flex-wrap gap-1.5">
                            {effects.map((e, i) => <TagPill key={i} label={e} color="purple" />)}
                        </div>
                    </Section>
                )}

                {/* ─── GENETICS ───────────────────────────────────────── */}
                {(isVisible('breeder') || isVisible('strainType')) && (reviewData.breeder || reviewData.strainType) && (
                    <Section title="Génétique" icon="🧬" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-2">
                            {reviewData.breeder && (
                                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                                    <span className="text-xs text-white/40 block mb-0.5">Breeder</span>
                                    <span className="text-sm font-medium text-white">{reviewData.breeder}</span>
                                </div>
                            )}
                            {reviewData.strainType && (
                                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                                    <span className="text-xs text-white/40 block mb-0.5">Type</span>
                                    <span className="text-sm font-medium text-white">{reviewData.strainType}</span>
                                </div>
                            )}
                            {reviewData.thcLevel && (
                                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                                    <span className="text-xs text-white/40 block mb-0.5">THC</span>
                                    <span className="text-sm font-medium text-green-400">{reviewData.thcLevel}%</span>
                                </div>
                            )}
                            {reviewData.cbdLevel && (
                                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                                    <span className="text-xs text-white/40 block mb-0.5">CBD</span>
                                    <span className="text-sm font-medium text-blue-400">{reviewData.cbdLevel}%</span>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* ─── PIPELINES (Interactive!) ───────────────────────── */}
                {pipelines.length > 0 && (
                    <Section title="Pipelines" icon="⚗️" badge={`${pipelines.length}`}>
                        <div className="space-y-4">
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
                )}

                {/* ─── DESCRIPTION / NOTES ────────────────────────────── */}
                {isVisible('description') && reviewData.description && (
                    <Section title="Description" icon="📝" defaultOpen={false}>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{reviewData.description}</p>
                    </Section>
                )}

                {isVisible('conclusion') && reviewData.conclusion && (
                    <Section title="Conclusion" icon="🏁" defaultOpen={false}>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{reviewData.conclusion}</p>
                    </Section>
                )}

                {/* ─── WATERMARK / BRANDING ────────────────────────────── */}
                {config?.branding?.showWatermark && config?.branding?.watermarkText && (
                    <div className="text-center py-3 text-xs text-white/20">
                        {config.branding.watermarkText}
                    </div>
                )}
            </div>
        </div>
    );
}
